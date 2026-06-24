# ================================================
# STUDYQUEST - AI Integration (Python)
# File: backend/studyquest_ai.py
# Purpose: Connect StudyQuest to Claude AI API
# Author: Limpo Mwenya Musonda
# ================================================

# Import the Anthropic library (Claude AI)
import anthropic

# Import json to handle data in JSON format
import json

# Import os to read environment variables (.env file)
import os

# Import dotenv to load the .env file automatically
from dotenv import load_dotenv

# Load the .env file so we can use the API key
load_dotenv()

# ===== DEBUG: Check if the API key is loading =====
api_key = os.getenv('CLAUDE_API_KEY')
if api_key:
    print(f"✅ API Key loaded! First 10 chars: {api_key[:10]}... (Length: {len(api_key)})")
    print(f"   Does it start with 'sk-ant-api'? {api_key.startswith('sk-ant-api')}")
else:
    print("❌ API Key NOT loaded! Check:")
    print("   - Is the .env file in the right folder?")
    print("   - Does it have CLAUDE_API_KEY=... inside?")
    print(f"   - Current working directory: {os.getcwd()}")
    print(f"   - Does .env exist? {os.path.exists('.env')}")
# ===== END DEBUG =====

# ================================================
# SETUP: Create the AI client
# This connects our code to the Claude API
# ================================================
client = anthropic.Anthropic(
    api_key=api_key  # Use the variable we just checked
)

# Which Claude model to use for all requests below.
# Defined once here so you only need to update it in one place
# when a newer model is available.
MODEL_NAME = 'claude-sonnet-4-6'

# ================================================
# SYSTEM PROMPT
# This tells the AI who it is and what it should do
# Think of it as giving instructions to a new employee
# ================================================
SYSTEM_PROMPT = '''
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
'''


# ================================================
# FUNCTION 1: ask_study_bot
# This is the main chat function
# Parameters:
#   user_message - what the student typed
#   history - previous messages in the conversation
# Returns: dictionary with success flag and AI response
# ================================================
def ask_study_bot(user_message, history=None):
    # SECURITY/CORRECTNESS NOTE: never use a mutable default
    # argument like history=[]. Python creates that list ONCE
    # when the function is defined, and every call that doesn't
    # pass its own history would share (and silently grow) the
    # same list. We default to None and create a fresh list
    # inside the function instead.
    if history is None:
        history = []

    # Print what the student asked (for testing/debugging)
    print(f'Student asked: {user_message}')

    # Build the messages list
    # History contains previous messages
    # We add the new message at the end
    messages = history + [
        {'role': 'user', 'content': user_message}
    ]

    # Try to call the Claude API
    # 'try' means: attempt this, but if it fails
    # go to 'except' instead of crashing
    try:
        # Send the request to Claude API
        response = client.messages.create(
            # Which Claude model to use
            model=MODEL_NAME,
            # Maximum tokens in the response
            max_tokens=1024,
            # Give Claude its instructions
            system=SYSTEM_PROMPT,
            # Send the conversation
            messages=messages
        )

        # Extract the text from the response
        # response.content is a list
        # [0] gets the first item
        # .text gets the text content
        answer = response.content[0].text

        # Return success with the answer
        return {
            'success': True,
            'message': answer,
            'tokens_used': response.usage.output_tokens
        }

    # If something goes wrong catch the error
    except Exception as error:
        print(f'AI Error: {error}')
        return {
            'success': False,
            'error': str(error)
        }


# ================================================
# FUNCTION 2: generate_quiz_question
# Uses AI to create a quiz question automatically
# Parameters:
#   course - e.g. 'Database Systems'
#   topic - e.g. 'SQL Joins'
#   difficulty - 'easy', 'medium', or 'hard'
# Returns: dictionary containing the question data
# ================================================
def generate_quiz_question(course, topic, difficulty='medium'):

    # Build a detailed prompt for the AI
    # We tell it exactly what format we want
    prompt = f'''
Generate exactly one multiple choice question for:
Course: {course}
Topic: {topic}
Difficulty: {difficulty}
Return ONLY a JSON object with these exact keys:
{{
    "question": "the question text here",
    "options": [
        "A: first option",
        "B: second option",
        "C: third option",
        "D: fourth option"
    ],
    "answer": "A: correct option here",
    "explanation": "why this answer is correct"
}}
Do not include any text before or after the JSON.
    '''

    try:
        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=512,
            messages=[{'role': 'user', 'content': prompt}]
        )

        # Get the raw text response
        raw_text = response.content[0].text

        # Clean up the text
        # Sometimes AI wraps JSON in ```json ... ```
        # We remove those markers
        clean_text = raw_text.replace('```json', '')
        clean_text = clean_text.replace('```', '').strip()

        # Convert the text string into a Python dictionary
        try:
            question_data = json.loads(clean_text)
        except json.JSONDecodeError as parse_error:
            # If the AI returned something that isn't valid JSON
            # (it happens occasionally), fail clearly instead of
            # crashing the whole request.
            print(f'Could not parse AI response as JSON: {parse_error}')
            return {
                'success': False,
                'error': 'AI returned an unexpected format. Please try again.'
            }

        print(f'Generated: {question_data["question"][:50]}...')
        return {'success': True, 'question': question_data}

    except Exception as error:
        return {'success': False, 'error': str(error)}


# ================================================
# FUNCTION 3: get_study_recommendation
# Analyzes a student profile and suggests
# what to study next
# Parameters:
#   student - dictionary with student info
# Returns: personalized study recommendation
# ================================================
def get_study_recommendation(student):

    # Build prompt using student data
    prompt = f'''
Analyze this BSE student's study profile:
Name: {student['name']}
Current Level: {student['level']}
Total XP: {student['xp']}
Study Sessions Logged: {student['sessions']}
Quizzes Completed: {student['quizzes']}
Current Study Streak: {student['streak']} days
Courses: Database Systems, DSA with C++, Multimedia
Give one specific topic to study next and explain why.
Also give one practical study tip.
Keep response under 100 words. Be warm and encouraging.
    '''

    try:
        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=300,
            messages=[{'role': 'user', 'content': prompt}]
        )

        recommendation = response.content[0].text
        return {'success': True, 'recommendation': recommendation}

    except Exception as error:
        return {'success': False, 'error': str(error)}


# ================================================
# FUNCTION 4: generate_study_plan
# Creates a personalized weekly study plan
# Parameters:
#   student_name - student's name
#   weeks_until_exam - how many weeks left
#   weak_subjects - list of subjects to focus on
# ================================================
def generate_study_plan(student_name, weeks_until_exam, weak_subjects):

    subjects_list = ', '.join(weak_subjects)

    prompt = f'''
Create a simple weekly study plan for a BSE student:
Student: {student_name}
Weeks until exam: {weeks_until_exam}
Subjects needing focus: {subjects_list}
Available study time: 45 minutes per day
Rest day: Sunday
Create a clear week-by-week plan.
Format each week as: Week N: focus on X, Y tasks.
Keep it realistic and encouraging.
Maximum 150 words.
    '''

    try:
        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=400,
            messages=[{'role': 'user', 'content': prompt}]
        )

        plan = response.content[0].text
        return {'success': True, 'plan': plan}

    except Exception as error:
        return {'success': False, 'error': str(error)}


# ================================================
# MAIN SECTION
# This runs when you execute: python studyquest_ai.py
# It tests all four functions
# ================================================
if __name__ == '__main__':
    print('=' * 50)
    print('   StudyQuest AI Backend - Python')
    print('=' * 50)
    print()

    # ---- TEST 1: StudyBot Chat ----
    print('TEST 1: Asking StudyBot a question...')
    print('-' * 40)
    result = ask_study_bot(
        'Explain what a primary key is in simple terms'
    )
    if result['success']:
        print(result['message'])
    else:
        print(f'Error: {result["error"]}')
    print()

    # ---- TEST 2: Generate Quiz Question ----
    print('TEST 2: Generating a quiz question...')
    print('-' * 40)
    quiz_result = generate_quiz_question(
        course='Database Systems',
        topic='SQL Joins',
        difficulty='easy'
    )
    if quiz_result['success']:
        q = quiz_result['question']
        print(f'Question: {q["question"]}')
        print('Options:')
        for option in q['options']:
            print(f'  {option}')
        print(f'Answer: {q["answer"]}')
        print(f'Explanation: {q["explanation"]}')
    else:
        print(f'Error: {quiz_result["error"]}')
    print()

    # ---- TEST 3: Study Recommendation ----
    print('TEST 3: Getting study recommendation...')
    print('-' * 40)
    student_profile = {
        'name': 'Limpo Musonda',
        'level': 3,
        'xp': 350,
        'sessions': 12,
        'quizzes': 8,
        'streak': 5
    }
    rec = get_study_recommendation(student_profile)
    if rec['success']:
        print(rec['recommendation'])
    else:
        print(f'Error: {rec["error"]}')
    print()

    # ---- TEST 4: Study Plan ----
    print('TEST 4: Generating study plan...')
    print('-' * 40)
    plan = generate_study_plan(
        student_name='Limpo',
        weeks_until_exam=8,
        weak_subjects=['Database Systems', 'DSA with C++']
    )
    if plan['success']:
        print(plan['plan'])
    else:
        print(f'Error: {plan["error"]}')
