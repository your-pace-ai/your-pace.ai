import { Tabs } from "./Tabs"
import { Chatbox } from "../Chatbox/Chatbox"
import "./MainPanel.css"

export const MainPanel = () => {
    const [activeTab, setActiveTab] = useState("Comment")
    const tabs = ["Comment", "FlashCards", "Quizzes", "Summary", "Notes"]

    return (
        <>
        <div className="main-panel">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}></Tabs>
            <div className="panel-content">
                <p>Learn here</p>
            </div>
            <Chatbox></Chatbox>
        </div>
        </>
    )
}
