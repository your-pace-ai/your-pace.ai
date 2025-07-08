import "./Quizzes.css"
import { useState } from "react"

export const Quizzes = () => {
    // Dummy quiz data
    const [quizzes] = useState([
        {
            id: 1,
            question: "What is the main purpose of React hooks?",
            options: [
                "To replace class components with functional components",
                "To add state to functional components",
                "To improve performance of React applications",
                "All of the above"
            ],
            correctAnswer: 3
        },
        {
            id: 2,
            question: "Which hook is used for side effects in React?",
            options: [
                "useState",
                "useEffect",
                "useContext",
                "useReducer"
            ],
            correctAnswer: 1
        },
        {
            id: 3,
            question: "What does JSX stand for?",
            options: [
                "JavaScript XML",
                "JavaScript Extension",
                "JavaScript Syntax",
                "JavaScript eXecution"
            ],
            correctAnswer: 0
        },
        {
            id: 4,
            question: "Which method is NOT part of React component lifecycle?",
            options: [
                "componentDidMount",
                "componentWillUpdate",
                "componentDidRender",
                "componentWillUnmount"
            ],
            correctAnswer: 2
        },
        {
            id: 5,
            question: "What is the virtual DOM in React?",
            options: [
                "A direct copy of the real DOM",
                "A lightweight copy of the real DOM in memory",
                "A browser feature used by React",
                "A third-party library used with React"
            ],
            correctAnswer: 1
        }
    ]);

    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);

    const handleOptionSelect = (optionIndex) => {
        setSelectedOption(optionIndex);
    };

    const handleSubmit = () => {
        if (selectedOption !== null) {
            if (selectedOption === quizzes[currentQuiz].correctAnswer) {
                setScore(score + 1);
            }

            if (currentQuiz < quizzes.length - 1) {
                setCurrentQuiz(currentQuiz + 1);
                setSelectedOption(null);
            } else {
                setShowResult(true);
            }
        }
    };

    const handleReset = () => {
        setCurrentQuiz(0);
        setSelectedOption(null);
        setShowResult(false);
        setScore(0);
    };

    return (
        <div className="quizzes-container">
            <h4>Quizzes</h4>

            {!showResult ? (
                <div className="quiz-card">
                    <h5>Question {currentQuiz + 1} of {quizzes.length}</h5>
                    <p className="quiz-question">{quizzes[currentQuiz].question}</p>

                    <div className="quiz-options">
                        {quizzes[currentQuiz].options.map((option, index) => (
                            <div
                                key={index}
                                className={`quiz-option ${selectedOption === index ? 'selected' : ''}`}
                                onClick={() => handleOptionSelect(index)}
                            >
                                {option}
                            </div>
                        ))}
                    </div>

                    <button
                        className="quiz-button"
                        onClick={handleSubmit}
                        disabled={selectedOption === null}
                    >
                        {currentQuiz === quizzes.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            ) : (
                <div className="quiz-result">
                    <h5>Quiz Completed!</h5>
                    <p>Your score: {score} out of {quizzes.length}</p>
                    <button className="quiz-button" onClick={handleReset}>Try Again</button>
                </div>
            )}
        </div>
    );
};
