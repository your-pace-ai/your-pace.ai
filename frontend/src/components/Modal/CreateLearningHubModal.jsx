import { createLearningHub } from "../../api/api"
import "./CreateLearningHubModal.css"
import { useState } from "react"

export const Modal = ({visible, onClose, onLearningHubCreated}) => {
   const [LearningHub, setLearningHub] = useState("")

   if (!visible) return null

   const handleSubmit = async(e) => {
       e.preventDefault()
       try {
           await createLearningHub(LearningHub)
           if (onLearningHubCreated) onLearningHubCreated()
           setLearningHub("")
           onClose()
       } catch (error) {
           throw new Error("Failed to create learning hub:", error)
       }
   }

   return (
       <>
           <div className="create-learning-hub-modal" onClick={onClose}>
               <div className="create-learning-hub-modal-content" onClick={e =>e.stopPropagation()}>
                   <span className="close" onClick={onClose}>&times;</span>
                   <h3 className="create-learning-hub-modal-header">Ready to create your learning hub?</h3>
                   <form className="create-learning-hub-modal-form" onSubmit={handleSubmit}>
                           <input type="text"
                                  value={LearningHub}
                                  onChange={e => setLearningHub(e.target.value)}
                                  placeholder="Enter a name for your learning hub"
                           />
                       <button type="submit" className="create-learning-hub-modal-button">Create</button>
                   </form>
               </div>
           </div>
       </>
   )
}
