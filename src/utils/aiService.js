// ================================================
// STUDYQUEST - AI Service (Frontend)
// File: src/utils/aiService.js
// Purpose: Call the askStudyBot Cloud Function.
// This file never touches the Claude API key directly —
// the key stays server-side in functions/index.js.
// ================================================

import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase/config';

const functions = getFunctions(app);
const askStudyBotFn = httpsCallable(functions, 'askStudyBot');

// ================================================
// CHAT — ask StudyBot a question
// ================================================
export const askStudyBot = async (message, history = []) => {
  try {
    const result = await askStudyBotFn({ mode: 'chat', message, history });
    return result.data;
  } catch (error) {
    console.error('StudyBot chat error:', error);
    return { success: false, error: error.message };
  }
};

// ================================================
// QUIZ GENERATOR — create one AI quiz question
// ================================================
export const generateQuizQuestion = async (course, topic, difficulty = 'medium') => {
  try {
    const result = await askStudyBotFn({ mode: 'quiz', course, topic, difficulty });
    return result.data;
  } catch (error) {
    console.error('Quiz generation error:', error);
    return { success: false, error: error.message };
  }
};

// ================================================
// STUDY RECOMMENDATION — personalized next-topic advice
// ================================================
export const getStudyRecommendation = async (student) => {
  try {
    const result = await askStudyBotFn({ mode: 'recommend', student });
    return result.data;
  } catch (error) {
    console.error('Study recommendation error:', error);
    return { success: false, error: error.message };
  }
};
