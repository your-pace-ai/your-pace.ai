import "./Quizzes.css"
import { useState, useEffect } from "react"
import { getQuizFromDB, getQuizFromDBPublic } from "../../api/api.js"
import { QuizSkeleton} from "../Skeleton"

export const Quizzes = ({ url,hubId }) => {
    const [quizzes, setQuizzes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [difficulty, setDifficulty] = useState("easy")
    const [currentQuiz, setCurrentQuiz] = useState(0)
    const [selectedOption, setSelectedOption] = useState(null)
    const [showResult, setShowResult] = useState(false)
    const [score, setScore] = useState(0)


   const fetchQuizzes = async () => {
       try {
           setLoading(true)
           if (hubId) {
               // Try public API first (works for any user's content)
               try {
                   const publicResponse = await getQuizFromDBPublic(hubId)
                   if (publicResponse && (publicResponse.easy?.length > 0 || publicResponse.medium?.length > 0 || publicResponse.hard?.length > 0)) {
                       setQuizzes(publicResponse)
                       setLoading(false)
                       return
                   }
               } catch (publicError) {
               }
                   // If public API fails, try private API (user's own content)
                   try {
                       const data = await getQuizFromDB(url, hubId)
                       setQuizzes(data)
                       setLoading(false)
                       return
                   } catch (privateError) {
                   }

           } else if (url) {
               try {
                   const data = await getQuizFromDB(url, null)
                   setQuizzes(data)
               } catch (error) {
               }
           }
           setLoading(false)
        } catch (err) {
            setError("Failed to load quizzes")
            setLoading(false)
        }
    }
    useEffect(() => {
        if (hubId || url) {
            fetchQuizzes()
        }
    }, [hubId, url])

    const currentQuizzes = quizzes[difficulty] || []

    const handleOptionSelect = (optionKey) => {
        setSelectedOption(optionKey)
    }

    const handleSubmit = () => {
        if (selectedOption !== null) {
            const currentQuizItem = currentQuizzes[currentQuiz];
            if (selectedOption === currentQuizItem.ans) {
                setScore(score + 1)
            }

            if (currentQuiz < currentQuizzes.length - 1) {
                setCurrentQuiz(currentQuiz + 1)
                setSelectedOption(null)
            } else {
                setShowResult(true)
            }
        }
    }

    const handleReset = () => {
        setCurrentQuiz(0)
        setSelectedOption(null)
        setShowResult(false)
        setScore(0)
    }

    const handleDifficultyChange = (level) => {
        setDifficulty(level)
        setCurrentQuiz(0)
        setSelectedOption(null)
        setShowResult(false)
        setScore(0)
    }

    if (loading) return <QuizSkeleton />
    if (error) return <div className="quizzes-container">Error: {error}</div>
    if (!quizzes || Object.keys(quizzes).length === 0) {
        return <div className="quizzes-container">No quizzes available.</div>
    }

    return (
        <div className="quizzes-container">
            <h4>Quizzes</h4>

            <div className="difficulty-selector">
                <button
                    className={`difficulty-button ${difficulty === 'easy' ? 'active' : ''}`}
                    onClick={() => handleDifficultyChange('easy')}
                >
                    Easy
                </button>
                <button
                    className={`difficulty-button ${difficulty === 'medium' ? 'active' : ''}`}
                    onClick={() => handleDifficultyChange('medium')}
                >
                    Medium
                </button>
                <button
                    className={`difficulty-button ${difficulty === 'hard' ? 'active' : ''}`}
                    onClick={() => handleDifficultyChange('hard')}
                >
                    Hard
                </button>
            </div>

            {!showResult && currentQuizzes.length > 0 ? (
                <div className="quiz-card">
                    <h5>Question {currentQuiz + 1} of {currentQuizzes.length}</h5>
                    <p className="quiz-question">{currentQuizzes[currentQuiz].question}</p>

                    <div className="quiz-options">
                        {Object.entries(currentQuizzes[currentQuiz].options).map(([key, option]) => (
                            <div
                                key={key}
                                className={`quiz-option ${selectedOption === key ? 'selected' : ''}`}
                                onClick={() => handleOptionSelect(key)}
                            >
                                {key}: {option}
                            </div>
                        ))}
                    </div>

                    <button
                        className="quiz-button"
                        onClick={handleSubmit}
                        disabled={selectedOption === null}
                    >
                        {currentQuiz === currentQuizzes.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            ) : (
                <div className="quiz-result">
                    <h5>Quiz Completed!</h5>
                    <p>Your score: {score} out of {currentQuizzes.length}</p>
                    <button className="quiz-button" onClick={handleReset}>Try Again</button>
                </div>
            )}
        </div>
    )
}
