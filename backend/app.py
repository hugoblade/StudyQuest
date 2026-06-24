# backend/app.py
# StudyQuest AI Backend - Flask Server

from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic
import os
import json
from dotenv import load_dotenv

# Load API Key
load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv('CLAUDE_API_KEY'))
MODEL_NAME = 'claude-3-5-sonnet-20241022'  # FIXED model name

app = Flask(__name__)

# IMPORTANT: Allow your Firebase frontend to call this API
CORS(app, origins=["https://your-project-id.web.app", "http://localhost:3000"])

SYSTEM_PROMPT = '''
You are StudyBot, an AI study assistant for StudyQuest.
Help BSE students with Database Systems, SQL, Data Structures (C++), 
Multimedia Technologies, and Software Engineering.
Keep explanations simple, give practical examples, and guide students to think.
Never give direct assignment answers.
'''

# ---------- ROUTE 1: Chat ----------
@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    user_message = data.get('message', '')
    history = data.get('history', [])

    messages = history + [{'role': 'user', 'content': user_message}]
    try:
        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=messages
        )
        return jsonify({
            'success': True,
            'message': response.content[0].text,
            'tokens_used': response.usage.output_tokens
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ---------- ROUTE 2: Quiz ----------
@app.route('/quiz', methods=['POST'])
def quiz():
    data = request.get_json()
    course = data.get('course', 'Database Systems')
    topic = data.get('topic', 'SQL')
    difficulty = data.get('difficulty', 'medium')

    prompt = f'Generate a {difficulty} multiple choice question for {course} - {topic}... (keep your existing prompt logic here)'
    # Shortened for brevity in this reply, but you can copy your existing function logic here.

    return jsonify({'success': True, 'question': 'Example'})

# ---------- ROUTE 3: Study Plan ----------
@app.route('/studyplan', methods=['POST'])
def study_plan():
    # Add your logic here
    return jsonify({'success': True, 'plan': 'Your plan here'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)