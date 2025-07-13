import { Tabs } from "./Tabs"
import { Chatbox } from "../Chatbox/Chatbox"
import { Quizzes } from "../MediaSection/Quizzes"
import { Flashcards } from "../MediaSection/Flashcards"
import "./MainPanel.css"
import { useState, useRef, useEffect } from "react"

export const MainPanel = ({ url }) => {
    const [activeTab, setActiveTab] = useState("Comment")
    const tabs = ["Comment", "FlashCards", "Quizzes", "Summary", "Notes"]
    const contentRef = useRef(null)

    // ensures the content container maintains a fixed height
    useEffect(() => {
        if (contentRef.current) {
            const height = contentRef.current.offsetHeight
            contentRef.current.style.minHeight = `${height}px`
        }
    }, [activeTab])

    return (
        <>
        <div className="main-panel">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}></Tabs>
            <div className="panel-content" ref={contentRef}>
                {activeTab === "Comment" && <p>Comments section coming soon...</p>}
                {activeTab === "FlashCards" && <Flashcards url={url}/>}
                {activeTab === "Quizzes" && <Quizzes url={url} />}
                {activeTab === "Summary" && <p>Summary section coming soon...</p>}
                {activeTab === "Notes" && <p>Notes section coming soon...</p>}
            </div>
            <Chatbox></Chatbox>
        </div>
        </>
    )
}
