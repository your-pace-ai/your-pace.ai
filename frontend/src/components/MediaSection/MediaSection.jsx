import { Chapters } from "./Chapters.jsx"
import { VideoPlayer } from "./VideoPlayer.jsx"
import "./MediaSection.css"
import { useState } from "react"

export const MediaSection = () => {
    // using dummy url for now
    const [url, setUrl] = useState("https://youtu.be/_K-eupuDVEc")

    return (
        <>
            <div className="media-section">
                <div className="media-section-yt-modal">
                    <VideoPlayer url={url}></VideoPlayer>
                </div>
                <Chapters></Chapters>
            </div>
        </>
    )
}
