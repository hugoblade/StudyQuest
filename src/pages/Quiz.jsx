import React, { useState } from 'react';
import QuizCard from '../components/QuizCard';
import { addXP } from '../firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { generateQuizQuestion } from '../utils/aiService';

const sampleQuestions = [
  {
    question: 'What is React?',
    options: ['A library for UI', 'B framework', 'C language', 'D database'],
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

  // Existing quiz-taking state
  const [current, setCurrent]   = useState(0);
  const [score, setScore]       = useState(0);
  const [finished, setFinished] = useState(false);

  // Question source — starts with the static sample list,
  // can be replaced by an AI-generated set
  const [questions, setQuestions] = useState(sampleQuestions);

  // AI generation state
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [selectedCourse, setSelectedCourse] = useState('Database Systems');

  // ================================
  // Generate a fresh AI question and
  // restart the quiz using just that one
  // ================================
  const loadAIQuestion = async () => {
    setLoading(true);
    setError('');

    const result = await generateQuizQuestion(selectedCourse, 'general', 'medium');

    if (result.success) {
      // AI returns { question, options, answer, explanation }
      // Map it to the { question, options, correct } shape
      // that QuizCard and handleAnswer already expect
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
  // Reset back to the original static sample questions
  // ================================
  const resetToSampleQuestions = () => {
    setQuestions(sampleQuestions);
    setCurrent(0);
    setScore(0);
    setFinished(false);
    setError('');
  };

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

  if (finished) {
    return (
      <div className="quiz-summary">
        <h2>Quiz Completed! 🎉</h2>
        <p>Your score: {score} / {questions.length}</p>
        <p>You earned {score * 10} XP</p>
        <button onClick={resetToSampleQuestions}>Try Sample Questions</button>
        <button onClick={loadAIQuestion} disabled={loading}>
          {loading ? 'Generating...' : 'Try an AI Question'}
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-page">

      {/* AI question controls */}
      <div className="quiz-ai-controls">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          disabled={loading}
        >
          <option value="Database Systems">Database Systems</option>
          <option value="Data Structures and Algorithms">Data Structures and Algorithms</option>
          <option value="Multimedia Technologies">Multimedia Technologies</option>
        </select>

        <button onClick={loadAIQuestion} disabled={loading}>
          {loading ? 'Generating...' : 'Generate AI Question ✨'}
        </button>
      </div>

      {error && <div className="quiz-error">{error}</div>}

      <QuizCard
        question={questions[current].question}
        options={questions[current].options}
        correct={questions[current].correct}
        onAnswer={handleAnswer}
        currentIndex={current}
        total={questions.length}
      />
    </div>
  );
};

export default Quiz;
