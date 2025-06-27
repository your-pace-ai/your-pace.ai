import "./LearningHub.css"
import { SubHubCard } from "./SubHubCard.jsx"

export const LearningHub = () => {
    const hubs = [
        {
            id : 1,
            name : "Hub 1",
        },
        {
            id : 2,
            name : "Hub 2",
        }
    ]

    return (
        <>
            <div className="learning-hub">
                <div className="hubs-container">
                    {hubs.map((hub) => {
                        <SubHubCard key={hub.id} name={hub.name}></SubHubCard>
                    })}
                </div>
            </div>
        </>
    )
}
