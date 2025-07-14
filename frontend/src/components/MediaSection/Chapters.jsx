import "./Chapters.css"
import { getChapters, getChaptersFromDB } from "../../api/api.js"
import { useState, useEffect } from "react"
import { ChapterSkeleton} from "../Skeleton"

export const Chapters = ({ url, hubId }) => {
    const [chapters, setChapters] = useState({})
    const [loading, setLoading] = useState(true)

    const getChaptersData = async () => {
        try {
            if (hubId) {
                // Use database-first approach with SubHub ID
                const chaptersArray = await getChaptersFromDB(hubId)

                if (chaptersArray.length > 0) {
                    // Chapters exist in database, use them
                    const chaptersData = {}
                    chaptersArray.forEach(chapter => {
                        chaptersData[chapter.title] = chapter.summary
                    })
                    setChapters(chaptersData)
                } else if (url) {
                    // No chapters in DB, generate them using the smart endpoint
                    try {
                        const response = await fetch(`http://localhost:3000/api/chapters/smart-get`, {
                            method: "POST",
                            credentials: "include",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ youtubeUrl: url })
                        })

                        if (response.ok) {
                            const data = await response.json()
                            setChapters(data)
                        } else {
                        }
                    } catch (genError) {

                    }
                }
            } else if (url) {
                // Fallback to direct API call if no hubId ( this shouldn't happen in normal flow)
                const data = await getChapters(url)
                setChapters(data)
            }
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (hubId || url) getChaptersData()
    },[url, hubId])

    if (loading) {
        return <ChapterSkeleton />
    }

    return (
        <>
            <div className="all-chapters">
                <h4>Chapters</h4>
                {Object.entries(chapters).map(([title, summary], index) => (
                    <div key={index} className="chapter">
                        <h5>{title}</h5>
                        <p>{summary}</p>
                    </div>
                ))}
                    <span></span>
            </div>
        </>
    )
}
