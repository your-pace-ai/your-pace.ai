import "./Flashcards.css"
import { useState } from "react"

export const Flashcards = () => {
    // Placeholder flashcard data - will be replaced with AI-generated content
    const [flashcards] = useState([
        {
            id: 1,
            question: "What is React?",
            answer: "React is a JavaScript library for building user interfaces, particularly single-page applications. It's used for handling the view layer in web and mobile apps."
        },
        {
            id: 2,
            question: "What are React components?",
            answer: "Components are the building blocks of React applications. They are reusable pieces of code that return React elements describing what should appear on the screen."
        },
        {
            id: 3,
            question: "What is JSX?",
            answer: "JSX is a syntax extension for JavaScript that looks similar to HTML. It allows you to write HTML-like code in your JavaScript files, making it easier to describe what the UI should look like."
        },
        {
            id: 4,
            question: "What is the virtual DOM?",
            answer: "The virtual DOM is a lightweight copy of the real DOM in memory. React uses it to improve performance by minimizing direct manipulation of the actual DOM."
        },
        {
            id: 5,
            question: "What are React hooks?",
            answer: "Hooks are functions that let you use state and other React features in functional components. Examples include useState, useEffect, useContext, and useReducer."
        }
    ]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setFlipped(false);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setFlipped(false);
        }
    };

    const handleFlip = () => {
        setFlipped(!flipped);
    };

    return (
        <div className="flashcards-container">
            <h4>Flashcards</h4>

            {loading ? (
                <div className="flashcards-container">Loading flashcards...</div>
            ) : flashcards.length === 0 ? (
                <div className="flashcards-container">No flashcards available.</div>
            ) : (
                <>
                    <div className="flashcard-wrapper">
                        <div
                            className={`flashcard ${flipped ? 'flipped' : ''}`}
                            onClick={handleFlip}
                        >
                            <div className="flashcard-front">
                                <p>{flashcards[currentIndex].question}</p>
                                <span className="flip-hint">Click to flip</span>
                            </div>
                            <div className="flashcard-back">
                                <p>{flashcards[currentIndex].answer}</p>
                                <span className="flip-hint">Click to flip back</span>
                            </div>
                        </div>
                    </div>

                    <div className="flashcard-controls">
                        <button
                            className="flashcard-button"
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                        >
                            Previous
                        </button>
                        <span className="flashcard-counter">
                            {currentIndex + 1} / {flashcards.length}
                        </span>
                        <button
                            className="flashcard-button"
                            onClick={handleNext}
                            disabled={currentIndex === flashcards.length - 1}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
