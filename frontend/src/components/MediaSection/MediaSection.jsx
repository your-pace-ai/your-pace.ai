import { Chapters } from "./Chapters.jsx"
import { VideoPlayer } from "./VideoPlayer.jsx"
import "./MediaSection.css"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { MainPanel } from "../MainPanel/MainPanel.jsx"

export const MediaSection = () => {
   const [url, setUrl] = useState("")
   const [hubId, setHubId] = useState(null)
   const location = useLocation()

   useEffect(() => {
       if (location.state) {
           if (location.state.youtubeUrl) setUrl(location.state.youtubeUrl)
           if (location.state.hubId) setHubId(location.state.hubId)
       }
   }, [location.state])

    return (
        <>
            <div className="media-section">
                <div className="media-section-yt-modal">
                    <VideoPlayer url={url}></VideoPlayer>
                </div>
                <Chapters url={url} hubId={hubId}></Chapters>
            </div>
            <MainPanel url={url} hubId={hubId}/>
        </>
    )
}
