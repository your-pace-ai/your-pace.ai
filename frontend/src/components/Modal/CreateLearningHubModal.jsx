import { createLearningHub } from "../../api/api"
import "./CreateLearningHubModal.css"
import { useState, useEffect } from "react"

export const Modal = ({visible, onClose}) => {
    const [LearningHub, setLearningHub] = useState("")

    if (!visible) return null

    const handleSubmit = async(e) => {
        e.preventDefault()
        await createLearningHub(LearningHub)
        closeModal()
        onClose()
    }

    return (
        <>
            <div className="create-learning-hub-modal" onClick={onClose}>
                <div className="create-learning-hub-modal-content" onClick={e =>e.stopPropagation()}>
                    <span className="close" onClick={onClose}>&times;</span>
                    <h3 className="create-learning-hub-modal-header">Ready to create your learning hub?</h3>
                    <form className="create-learning-hub-modal-form" onSubmit={handleSubmit}>
                            <input type="text"
                                   value={LearningHub}
                                   onChange={e => setLearningHub(e.target.value)}
                                   placeholder="Enter a name for your learning hub"
                            />
                        <button type="submit" className="create-learning-hub-modal-button">Create</button>
                    </form>
                </div>
            </div>
        </>
    )
}
