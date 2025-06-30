import { createLearningHub } from "../../api/api"
import "./Modal.css"
import { useState, useEffect } from "react"

export const Modal = () => {
    const [LearningHub, setLearningHub] = useState("")
    const [modal, setModal] = useState("")

    useEffect(() => {
        setModal(document.getElementsByClassName("modal")[0])
    })

    const closeModal = () => {
        modal.style.display = "none"
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        await createLearningHub(LearningHub)
        closeModal()
    }

    return (
        <>
            <div className="modal">
                <div className="modal-content">
                    <span className="close" onClick={closeModal}>&times;</span>
                    <h3 className="modal-header">Ready to create your learning hub?</h3>
                    <form className="modal-form" onSubmit={handleSubmit}>
                            <input type="text"
                                   value={LearningHub}
                                   onChange={e => setLearningHub(e.target.value)}
                                   placeholder="Enter a name for your learning hub"
                            />
                        <button type="submit" className="modal-button">Create</button>
                    </form>
                </div>
            </div>
        </>
    )
}
