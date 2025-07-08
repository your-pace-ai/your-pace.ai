import { Tabs } from "./Tabs"
import { Chatbox } from "../Chatbox/Chatbox"
import { Quizzes } from "../MediaSection/Quizzes"
import { Flashcards } from "../MediaSection/Flashcards"
import "./MainPanel.css"
import { useState } from "react"

export const MainPanel = () => {
    const [activeTab, setActiveTab] = useState("Comment")
    const tabs = ["Comment", "FlashCards", "Quizzes", "Summary", "Notes"]

    return (
        <>
        <div className="main-panel">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}></Tabs>
            <div className="panel-content">
                {activeTab === "Comment" && <p>Comments section coming soon...</p>}
                {activeTab === "FlashCards" && <Flashcards />}
                {activeTab === "Quizzes" && <Quizzes />}
                {activeTab === "Summary" && <p>Summary section coming soon...</p>}
                {activeTab === "Notes" && <p>Notes section coming soon...</p>}
            </div>
            <Chatbox></Chatbox>

        </div>
        </>
    )
}
