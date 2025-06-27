import "./UserHub.css"

export const UserHub = () => {
    const handleViewResult = () => {}
    const handleCreateExam = () => {}

    return (
        <>
            <div className="user-hub">
                <div className="hub-header">
                    <h3>User's Hub</h3>
                    <div className="hub-actions">
                        <button className="hub-btn" onClick={handleCreateExam}>
                            Create Exam
                        </button>
                        <button className="hub-btn" onClick={handleViewResult}>
                            View Results
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
