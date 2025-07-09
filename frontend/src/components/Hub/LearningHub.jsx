import "./LearningHub.css"
import { SubHubCard } from "./SubHubCard.jsx"
import { useState, useEffect } from "react"
import { getSubHubsForLearningHub } from "../../api/api.js"

export const LearningHub = ({ refreshTrigger, selectedLearningHub }) => {
    const [subhubs, setSubhubs] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchSubHubs = async () => {
        if (!selectedLearningHub) {
            setSubhubs([])
            setLoading(false)
            return
        }
        setLoading(true)
        try {
            const subHubs = await getSubHubsForLearningHub(selectedLearningHub.id)
            setSubhubs(subHubs)
        } catch (error) {
            setSubhubs([])
            throw new Error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubHubDelete = (deletedSubHubId) => {
        setSubhubs(prev => prev.filter(hub => hub.id !== deletedSubHubId))
    }

    useEffect(() => {
        fetchSubHubs()
    }, [refreshTrigger, selectedLearningHub])

    if (!selectedLearningHub) {
        return (
            <div className="learning-hub">
                <div className="hubs-container">
                    <p>Select a learning hub to view its content</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="learning-hub">
                <div className="hubs-container">
                    <p>Loading subhubs for {selectedLearningHub.name}...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="learning-hub">
                <h3 className="learning-hub-title">{selectedLearningHub.name}</h3>
                <div className="hubs-container">
                    {subhubs.length == 0 ? (
                        <p>No content yet!. Upload a Youtube video to get started</p>
                    ) : (
                        subhubs.map((hub) => (
                            <SubHubCard
                                key={hub.id}
                                name={hub.name}
                                youtubeUrl={hub.youtubeUrl}
                                id={hub.id}
                                onDelete={handleSubHubDelete}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    )
}
