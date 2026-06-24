import React, { useState } from 'react';
import QuizCard from '../components/QuizCard';
import { addXP } from '../firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { generateQuizQuestion } from '../utils/aiService';

// ================================
// 📚 COURSE & TOPIC CONFIGURATION
// Add or remove courses and topics here!
// ================================
const COURSE_TOPICS = {
  'Database Systems': [
    'SQL Joins',
    'Normalization',
    'ER Diagrams',
    'Transactions & ACID',
    'Indexing',
    'Subqueries'
  ],
  'Data Structures and Algorithms': [
    'Arrays & Linked Lists',
    'Stacks & Queues',
    'Trees & Binary Trees',
    'Graphs',
    'Sorting Algorithms',
    'Searching Algorithms',
    'Big O Notation'
  ],
  'Multimedia Technologies': [
    'Audio Compression',
    'Video Codecs',
    'Image Formats (JPEG, PNG)',
    'Streaming Protocols',
    'Digital Signal Processing'
  ],
  'Software Engineering': [
    'SDLC Models',
    'Agile & Scrum',
    'UML Diagrams',
    'Design Patterns',
    'Software Testing',
    'Requirements Gathering',
    'Version Control (Git)'
  ],
  'Cyber Security': [
    'Network Security',
    'Cryptography',
    'Authentication & Authorization',
    'Security Protocols (SSL/TLS)',
    'Threat Modeling',
    'Malware Analysis',
    'Security Best Practices'
  ],
  'Networking': [
    'OSI Model',
    'TCP/IP Protocol Suite',
    'Routing & Switching',
    'IP Addressing & Subnetting',
    'DNS & DHCP',
    'Network Topologies',
    'Firewalls & NAT'
  ],
  'Ethical Hacking': [
    'Penetration Testing',
    'Vulnerability Assessment',
    'Social Engineering',
    'Web Application Security',
    'Network Scanning',
    'Wireless Security',
    'Reverse Engineering'
  ],
  'Cloud Computing': [
    'Cloud Service Models (IaaS, PaaS, SaaS)',
    'AWS Services',
    'Azure Fundamentals',
    'Cloud Security',
    'Virtualization',
    'Serverless Architecture'
  ],
  // ================================
  // 🆕 NEW COURSES ADDED HERE
  // ================================
  'Artificial Intelligence': [
    'Machine Learning Basics',
    'Neural Networks',
    'Natural Language Processing',
    'Computer Vision',
    'Reinforcement Learning'
  ],
  'DevOps': [
    'CI/CD Pipelines',
    'Docker & Containers',
    'Kubernetes',
    'Infrastructure as Code',
    'Monitoring & Logging'
  ],
  'Mobile Development': [
    'Android Basics',
    'iOS Development',
    'React Native',
    'Flutter',
    'Mobile UI/UX'
  ]
};

// ================================
// 📝 SAMPLE QUESTIONS (fallback)
// ================================
const sampleQuestions = [
  {
    question: 'What is React?',
    options: ['A library for UI', 'A framework', 'A language', 'A database'],
    correct: 'A library for UI'
  },
  {
    question: 'What is JSX?',
    options: ['JavaScript XML', 'Java Extension', 'JSON Syntax', 'JSX is not real'],
    correct: 'JavaScript XML'
  }
];

const Quiz = () => {
  const { currentUser } = useAuth();

  // Quiz state
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [questions, setQuestions] = useState(sampleQuestions);

  // AI generation state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('Database Systems');
  const [selectedTopic, setSelectedTopic] = useState('SQL Joins');

  // ================================
  // Helper: Get topics for selected course
  // ================================
  const getTopicsForCourse = (course) => {
    return COURSE_TOPICS[course] || ['General'];
  };

  // ================================
  // Generate an AI question
  // ================================
  const loadAIQuestion = async () => {
    setLoading(true);
    setError('');

    const result = await generateQuizQuestion(
      selectedCourse,
      selectedTopic,
      'medium'
    );

    if (result.success) {
      setQuestions([{
        question: result.question.question,
        options: result.question.options,
        correct: result.question.answer
      }]);
      setCurrent(0);
      setScore(0);
      setFinished(false);
    } else {
      setError(result.error || 'Failed to generate AI question. Try again.');
    }

    setLoading(false);
  };

  // ================================
  // Reset to sample questions
  // ================================
  const resetToSampleQuestions = () => {
    setQuestions(sampleQuestions);
    setCurrent(0);
    setScore(0);
    setFinished(false);
    setError('');
  };

  // ================================
  // Handle answer and XP
  // ================================
  const handleAnswer = (isCorrect) => {
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    if (current + 1 < questions.length) {
      setCurrent(prev => prev + 1);
    } else {
      const earnedXP = newScore * 10;
      addXP(currentUser.uid, earnedXP);
      setFinished(true);
    }
  };

  // ================================
  // Render: Quiz Finished
  // ================================
  if (finished) {
    return (
      <div className="quiz-summary">
        <h2>🎉 Quiz Completed!</h2>
        <p>Score: {score} / {questions.length}</p>
        <p>Earned {score * 10} XP</p>
        <div className="quiz-actions">
          <button onClick={resetToSampleQuestions}>📚 Sample Questions</button>
          <button onClick={loadAIQuestion} disabled={loading}>
            {loading ? '⏳ Generating...' : '✨ New AI Question'}
          </button>
        </div>
      </div>
    );
  }

  // ================================
  // Render: Quiz Active
  // ================================
  return (
    <div className="quiz-page">
      {/* AI Controls */}
      <div className="quiz-ai-controls">
        <div className="control-group">
          <label>Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => {
              const newCourse = e.target.value;
              setSelectedCourse(newCourse);
              const topics = getTopicsForCourse(newCourse);
              setSelectedTopic(topics[0] || 'General');
            }}
            disabled={loading}
          >
            {Object.keys(COURSE_TOPICS).map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Topic:</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={loading}
          >
            {getTopicsForCourse(selectedCourse).map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        <button onClick={loadAIQuestion} disabled={loading}>
          {loading ? '⏳ Generating...' : '🚀 Generate AI Question'}
        </button>
      </div>

      {error && <div className="quiz-error">⚠️ {error}</div>}

      {/* Quiz Card */}
      {questions.length > 0 && (
        <QuizCard
          question={questions[current].question}
          options={questions[current].options}
          correct={questions[current].correct}
          onAnswer={handleAnswer}
          currentIndex={current}
          total={questions.length}
        />
      )}
    </div>
  );
};

export default Quiz;
