import "./Chapters.css"
import { getChapters } from "../../api/api.js"
import { useState, useEffect } from "react"

export const Chapters = ({ url }) => {
    const [chapters, setChapters] = useState({})

    const getChaptersData = async () => {
        const data = await getChapters(url)
        setChapters(data)
    }

    useEffect(() => {
        getChaptersData()
    },[url])

    return (
        <>
            <div className="all-chapters">
                <h4>Chapters</h4>
                {Object.entries(chapters).map(([title, summary]) => (
                    <div className="chapter">
                        <h5>{title}</h5>
                        <p>{summary}</p>
                    </div>
                ))}
                    <span></span>
            </div>
        </>
    )
}
