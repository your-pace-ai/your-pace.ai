import { useState } from "react"
import "./LearningSection.css"

export const LearningSection = () => {
    const [searchTerm, setSearchTerm] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
    }

    return (
        <>
            <div className="learning-section">
                <h2 className="section-title">
                    What do you want to learn?
                </h2>
                <div className="upload-options">
                    <div className="upload-card">
                        <span>UPLOAD FILE</span>
                    </div>
                    <div className="upload-card">
                        <span>UPLOAD YOUTUBE LINK</span>
                    </div>
                </div>

                <form className="search-container" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Learn anything"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </form>
            </div>
        </>
    )
}
