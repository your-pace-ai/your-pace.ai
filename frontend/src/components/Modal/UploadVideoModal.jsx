import { createLearningHub } from "../../api/api.js"
import "./CreateLearningHubModal.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export const UploadVideoModal = ({visible, onClose}) => {
   const [youtubeUrl, setYoutubeUrl] = useState("")
   const [subhubName, setSubhubName] = useState("")
   const navigate = useNavigate()

   if (!visible) return null

   const handleSubmit = async(e) => {
       e.preventDefault()
       if (youtubeUrl.trim() && subhubName.trim()) {
           await createLearningHub(subhubName)
           navigate('/subhub', {
               state: {
                   youtubeUrl: youtubeUrl.trim(),
                   hubName: subhubName.trim()
               }
           })
           setYoutubeUrl("")
           setSubhubName("")
           onClose()
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
                           placeholder="Enter a name for your learning hub"
                           required
                       />
                       <input
                           type="url"
                           value={youtubeUrl}
                           onChange={e => setYoutubeUrl(e.target.value)}
                           placeholder="Paste YouTube URL here..."
                           required
                       />
                       <button type="submit" className="create-learning-hub-modal-button">Create Hub with Video</button>
                   </form>
               </div>
           </div>
       </>
   )
}
