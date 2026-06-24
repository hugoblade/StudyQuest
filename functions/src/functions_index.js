// ================================================
// STUDYQUEST - AI Agent (Firebase Cloud Function)
// File: functions/index.js
// Purpose: Single secure endpoint that holds the
// Claude API key server-side and routes to one of
// three behaviors based on `mode`.
//
// This is the deployed JS port of studyquest_ai.py.
// Keep studyquest_ai.py as your documented reference
// implementation for your project report.
// ================================================

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const Anthropic = require('@anthropic-ai/sdk');

// Secret defined in Firebase, set via:
//   firebase functions:secrets:set CLAUDE_API_KEY
// Never hardcode the key here.
const CLAUDE_API_KEY = defineSecret('CLAUDE_API_KEY');

const MODEL_NAME = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `
You are StudyBot, an AI study assistant for StudyQuest.
StudyQuest is a gamified study platform for BSE students
at Zambia University of Technology (ZUT).
Your job is to help students understand:
- Database Systems and SQL
- Data Structures and Algorithms with C++
- Multimedia Technologies
- Software Engineering concepts
Rules:
- Keep explanations simple and clear
- Always give practical examples
- Be encouraging and patient
- Never give answers to assignment questions directly
- Always guide students to think for themselves
`;

// ================================================
// MODE 1: chat — general StudyBot Q&A
// ================================================
async function handleChat(client, payload) {
  const { message, history = [] } = payload;
  if (!message) {
    throw new HttpsError('invalid-argument', 'message is required for chat mode');
  }

  const messages = [...history, { role: 'user', content: message }];

  const response = await client.messages.create({
    model: MODEL_NAME,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages
  });

  return {
    success: true,
    message: response.content[0].text,
    tokensUsed: response.usage.output_tokens
  };
}

// ================================================
// MODE 2: quiz — generate one quiz question
// ================================================
async function handleQuiz(client, payload) {
  const { course, topic, difficulty = 'medium' } = payload;
  if (!course || !topic) {
    throw new HttpsError('invalid-argument', 'course and topic are required for quiz mode');
  }

  const prompt = `
Generate exactly one multiple choice question for:
Course: ${course}
Topic: ${topic}
Difficulty: ${difficulty}
Return ONLY a JSON object with these exact keys:
{
  "question": "the question text here",
  "options": ["A: first option", "B: second option", "C: third option", "D: fourth option"],
  "answer": "A: correct option here",
  "explanation": "why this answer is correct"
}
Do not include any text before or after the JSON.
  `;

  const response = await client.messages.create({
    model: MODEL_NAME,
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }]
  });

  const rawText = response.content[0].text;
  const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

  let questionData;
  try {
    questionData = JSON.parse(cleanText);
  } catch (parseError) {
    // Mirrors the JSONDecodeError handling in studyquest_ai.py —
    // fail clearly instead of crashing the whole request.
    return {
      success: false,
      error: 'AI returned an unexpected format. Please try again.'
    };
  }

  return { success: true, question: questionData };
}

// ================================================
// MODE 3: recommend — study recommendation
// ================================================
async function handleRecommend(client, payload) {
  const { student } = payload;
  if (!student) {
    throw new HttpsError('invalid-argument', 'student profile is required for recommend mode');
  }

  const prompt = `
Analyze this BSE student's study profile:
Name: ${student.name}
Current Level: ${student.level}
Total XP: ${student.xp}
Study Sessions Logged: ${student.sessions}
Quizzes Completed: ${student.quizzes}
Current Study Streak: ${student.streak} days
Courses: Database Systems, DSA with C++, Multimedia
Give one specific topic to study next and explain why.
Also give one practical study tip.
Keep response under 100 words. Be warm and encouraging.
  `;

  const response = await client.messages.create({
    model: MODEL_NAME,
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  });

  return { success: true, recommendation: response.content[0].text };
}

// ================================================
// MAIN ENTRY POINT
// Called from React as: askStudyBot({ mode, ...payload })
// ================================================
exports.askStudyBot = onCall(
  { secrets: [CLAUDE_API_KEY] },
  async (request) => {
    // Require the caller to be logged in via Firebase Auth.
    // request.auth is only present for authenticated calls.
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be logged in to use StudyBot.');
    }

    const client = new Anthropic({ apiKey: CLAUDE_API_KEY.value() });
    const { mode } = request.data;

    try {
      switch (mode) {
        case 'chat':
          return await handleChat(client, request.data);
        case 'quiz':
          return await handleQuiz(client, request.data);
        case 'recommend':
          return await handleRecommend(client, request.data);
        default:
          throw new HttpsError('invalid-argument', `Unknown mode: ${mode}`);
      }
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error('AI Error:', error);
      throw new HttpsError('internal', error.message || 'AI request failed');
    }
  }
);
