import "./CreateLearningHubModal.css"
import { useState } from "react"
import { createSubHub } from "../../api/api"

const CATEGORIES = [
    { value: 'EDUCATION', label: 'Education' },
    { value: 'SCIENCE_TECH', label: 'Science & Technology' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'MUSIC', label: 'Music' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'HEALTH_FITNESS', label: 'Health & Fitness' },
    { value: 'COOKING', label: 'Cooking' },
    { value: 'LANGUAGE', label: 'Language' },
    { value: 'ARTS_CRAFTS', label: 'Arts & Crafts' },
    { value: 'OTHER', label: 'Other' }
]

export const YouTubeUploadModal = ({visible, onClose, onSubHubCreated, selectedLearningHub}) => {
   const [youtubeUrl, setYoutubeUrl] = useState("")
   const [subhubName, setSubhubName] = useState("")
   const [category, setCategory] = useState("OTHER")
   const [isLoading, setIsLoading] = useState(false)

   if (!visible) return null

   const handleSubmit = async(e) => {
       e.preventDefault()
       if (youtubeUrl.trim() && subhubName.trim()) {
           setIsLoading(true)
           try {
               const newSubHub = await createSubHub(
                   subhubName.trim(), 
                   youtubeUrl.trim(), 
                   selectedLearningHub?.id,
                   category
               )
               if (onSubHubCreated) onSubHubCreated(newSubHub)

               setYoutubeUrl("")
               setSubhubName("")
               setCategory("OTHER")
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
                       <select
                           value={category}
                           onChange={e => setCategory(e.target.value)}
                           required
                           disabled={isLoading}
                           style={{
                               width: '100%',
                               padding: '10px',
                               marginBottom: '10px',
                               border: '1px solid #ddd',
                               borderRadius: '4px',
                               fontSize: '16px',
                               backgroundColor: '#fff'
                           }}
                       >
                           <option value="">Select a category</option>
                           {CATEGORIES.map(cat => (
                               <option key={cat.value} value={cat.value}>
                                   {cat.label}
                               </option>
                           ))}
                       </select>
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
