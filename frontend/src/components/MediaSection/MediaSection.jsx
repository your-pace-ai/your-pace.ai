import { Chapters } from "./Chapters.jsx"
import { VideoPlayer } from "./VideoPlayer.jsx"
import "./MediaSection.css"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"

export const MediaSection = () => {
   const [url, setUrl] = useState("")
   const location = useLocation()

   useEffect(() => {
       if (location.state && location.state.youtubeUrl) setUrl(location.state.youtubeUrl)
   }, [location.state])

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
