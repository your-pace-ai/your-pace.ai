import "./CreateLearningHubModal.css"
import { useState } from "react"
import { createSubHub } from "../../api/api"

export const YouTubeUploadModal = ({visible, onClose, onSubHubCreated, selectedLearningHub}) => {
   const [youtubeUrl, setYoutubeUrl] = useState("")
   const [subhubName, setSubhubName] = useState("")
   const [isLoading, setIsLoading] = useState(false)

   if (!visible) return null

   const handleSubmit = async(e) => {
       e.preventDefault()
       if (youtubeUrl.trim() && subhubName.trim()) {
           setIsLoading(true)
           try {
               const newSubHub = await createSubHub(subhubName.trim(), youtubeUrl.trim(), selectedLearningHub?.id)
               if (onSubHubCreated) onSubHubCreated(newSubHub)

               setYoutubeUrl("")
               setSubhubName("")
               onClose()
           } catch (error) {
               throw Error("Failed to create subhub:", error)
           } finally {
               setIsLoading(false)
           }
       }
   }

   return (
       <>
           <div className="create-learning-hub-modal" onClick={onClose}>
               <div className="create-learning-hub-modal-content" onClick={e =>e.stopPropagation()}>
                   <span className="close" onClick={onClose}>&times;</span>
                   <h3 className="create-learning-hub-modal-header">Upload YouTube Video</h3>
                   <form className="create-learning-hub-modal-form" onSubmit={handleSubmit}>
                       <input
                           type="text"
                           value={subhubName}
                           onChange={e => setSubhubName(e.target.value)}
                           placeholder="Enter a name for your subhub"
                           required
                           disabled={isLoading}
                       />
                       <input
                           type="url"
                           value={youtubeUrl}
                           onChange={e => setYoutubeUrl(e.target.value)}
                           placeholder="Paste YouTube URL here..."
                           required
                           disabled={isLoading}
                       />
                       <button
                           type="submit"
                           className="create-learning-hub-modal-button"
                           disabled={isLoading}
                       >
                           {isLoading ? "Creating..." : "Create SubHub"}
                       </button>
                   </form>
               </div>
           </div>
       </>
   )
}
