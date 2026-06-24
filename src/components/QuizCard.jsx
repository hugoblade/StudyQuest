import React, { useState } from 'react';

const QuizCard = ({ question, options, correct, onAnswer, currentIndex, total }) => {
    const [selected, setSelected] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const handleSelect = (option) => {
        if (showResult) return;
        setSelected(option);
        const isCorrect = option === correct;
        setShowResult(true);

        setTimeout(() => {
            setSelected(null);
            setShowResult(false);
            onAnswer(isCorrect);
        }, 1500);
    };

    return (
        <div className="quiz-card">
            <div className="quiz-header">
                <span>Question {currentIndex + 1} of {total}</span>
            </div>
            <h3>{question}</h3>
            <div className="quiz-options">
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        className={`quiz-option ${
                            selected === opt
                                ? opt === correct ? 'correct' : 'wrong'
                                : selected && opt === correct ? 'correct' : ''
                        }`}
                        onClick={() => handleSelect(opt)}
                        disabled={showResult}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            {showResult && (
                <div className="quiz-feedback">
                    {selected === correct ? '✅ Correct!' : `❌ Wrong! The correct answer is ${correct}.`}
                </div>
            )}
        </div>
    );
};

export default QuizCard;
