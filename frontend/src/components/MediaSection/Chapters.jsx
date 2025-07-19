import "./Chapters.css"
import { getChapters, getChaptersFromDB, getChaptersFromDBPublic } from "../../api/api.js"
import { useState, useEffect } from "react"
import { ChapterSkeleton} from "../Skeleton"

export const Chapters = ({ url, hubId }) => {
    const [chapters, setChapters] = useState({})
    const [loading, setLoading] = useState(true)

    const getChaptersData = async () => {
       try {
           if (hubId) {
               // Try public API first (works for any user's content)
               try {
                   const publicResponse = await getChaptersFromDBPublic(hubId)
                   if (publicResponse.chapters && publicResponse.chapters.length > 0) {
                       const chaptersData = {}
                       publicResponse.chapters.forEach(chapter => {
                           chaptersData[chapter.title] = chapter.summary
                       })
                       setChapters(chaptersData)
                       return
                   }
               } catch (publicError) {
                   // If public API fails, try private API (user's own content)
                   try {
                       const chaptersArray = await getChaptersFromDB(hubId)
                       if (chaptersArray.length > 0) {
                           const chaptersData = {}
                           chaptersArray.forEach(chapter => {
                               chaptersData[chapter.title] = chapter.summary
                           })
                           setChapters(chaptersData)
                           return
                       }
                   } catch (privateError) {
                   }
               }
               // If no chapters found in DB and URL available, generate them
               if (url) {
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
