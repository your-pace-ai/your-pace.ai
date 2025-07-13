import "./Flashcards.css"
import { useState, useEffect } from "react"
import { getFlashCardsFromDB } from "../../api/api.js"

export const Flashcards = ({ url, hubId }) => {
    const [flashcards, setFlashcards] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [flipped, setFlipped] = useState(false)

    const fetchFlashcards = async () => {
        try {
            if (hubId || url) {
                // Use database-first approach with both hubId and url
                const response = await getFlashCardsFromDB(url, hubId)
                const formattedCards = Object.entries(response).map(([id, card], index) => ({
                    id: index + 1,
                    question: card.front,
                    answer: card.back
                }))
                setFlashcards(formattedCards);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (hubId || url) {
            fetchFlashcards()
        }
    }, [hubId, url])

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setFlipped(false);
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
            setFlipped(false)
        }
    }

    const handleFlip = () => {
        setFlipped(!flipped)
    }

    if (loading) {
        return <div className="flashcards-container">Loading flashcards...</div>
    }

    if (flashcards.length === 0) {
        return <div className="flashcards-container">No flashcards available.</div>
    }

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
    )
}
