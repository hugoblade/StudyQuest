from flask import Flask, request, jsonify
from flask_cors import CORS
import studyquest_ai as ai

app = Flask(__name__)

# ✅ Correct CORS
CORS(app, origins=[
    "http://localhost:3000",
    "https://studyquest-42ead.web.app",
    "https://studyquest-42ead.firebaseapp.com"
])

@app.route('/')
def health():
    return jsonify({'status': 'StudyQuest AI is running!'})

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    user_message = data.get('message', '')
    history = data.get('history', [])
    result = ai.ask_study_bot(user_message, history)
    return jsonify(result)

@app.route('/quiz', methods=['POST'])
def quiz():
    data = request.get_json()
    course = data.get('course', 'Database Systems')
    topic = data.get('topic', 'SQL')
    difficulty = data.get('difficulty', 'medium')
    result = ai.generate_quiz_question(course, topic, difficulty)
    return jsonify(result)

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    student = data.get('student', {})
    result = ai.get_study_recommendation(student)
    return jsonify(result)

@app.route('/studyplan', methods=['POST'])
def studyplan():
    data = request.get_json()
    name = data.get('name', 'Student')
    weeks = data.get('weeks', 4)
    subjects = data.get('subjects', [])
    result = ai.generate_study_plan(name, weeks, subjects)
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
