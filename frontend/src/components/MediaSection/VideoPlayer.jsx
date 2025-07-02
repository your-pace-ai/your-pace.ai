import "./VideoPlayer.css"
import { extractId } from "../../utils/utils.js"

export const VideoPlayer = ({url}) => {
    const videoId = extractId(url)

    return (
        <>
            <div className="yt-wrapper">
                <iframe src={`https://www.youtube.com/embed/${videoId}`}
                        title="Youtube player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        >
                </iframe>
            </div>
        </>
    )
}
