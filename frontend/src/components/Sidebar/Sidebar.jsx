import "./Sidebar.css"
import { useNavigate } from "react-router-dom"
import { logout, getLearningHubs, deleteLearningHub } from "../../api/api.js"
import { useState, useEffect } from "react"


export const Sidebar = ({onOpenModal, selectedLearningHub, onLearningHubSelect, refreshLearningHubs}) => {
   const navigate = useNavigate()
   const [learningHubs, setLearningHubs] = useState([])
   const [expandedHubs, setExpandedHubs] = useState(new Set())


   const signOut = async () => {
       await logout()
       navigate("/login")
   }


   const fetchLearningHubs = async () => {
       try {
           const hubs = await getLearningHubs()
           setLearningHubs(hubs)

           // auto-select the most recent hub if none selected
           if (!selectedLearningHub && hubs.length > 0) {
               const mostRecent = hubs[hubs.length - 1]
               onLearningHubSelect(mostRecent)
           }
       } catch (error) {
           throw new Error("Failed to fetch learning hubs:", error)
       }
   }


   useEffect(() => {
       fetchLearningHubs()
   }, [refreshLearningHubs])


   const toggleHub = (hub) => {
       const newExpanded = new Set(expandedHubs)
       if (newExpanded.has(hub.id)) {
           newExpanded.delete(hub.id)
       } else {
           newExpanded.add(hub.id)
       }
       setExpandedHubs(newExpanded)
       onLearningHubSelect(hub)
   }


   const handleDeleteLearningHub = async (hubId, hubName, e) => {
       e.stopPropagation()
           try {
               await deleteLearningHub(hubId)
               if (selectedLearningHub?.id === hubId) onLearningHubSelect(null)
               fetchLearningHubs()
           } catch (error) {
               throw new Error("Failed to delete learning hub:", error)
           }
   }

   return (
       <>
           <div className="sidebar">
               <div className="sidebar-header">
                   <div className="back-button">
                       <span>=</span>
                       <span>your-pace.com</span>
                   </div>
               </div>


               <div className="sidebar-content">
                   <button className="sidebar-btn primary">+ Add Content</button>
                   <button className="sidebar-btn">Recent</button>
                   <button className="sidebar-btn" onClick={onOpenModal}>+ Create Hub</button>

                   <div className="spaces-section">
                       <h3>Spaces</h3>
                       {learningHubs.map((hub) => (
                           <div key={hub.id} className="learning-hub-item">
                               <div
                                   className={`hub-header ${selectedLearningHub?.id === hub.id ? 'selected' : ''}`}
                                   onClick={() => toggleHub(hub)}
                               >
                                   <span className="hub-icon">📦</span>
                                   <span className="hub-name">{hub.name}</span>
                                   <div className="hub-actions">
                                       <button
                                           className="delete-btn"
                                           onClick={(e) => handleDeleteLearningHub(hub.id, hub.name, e)}
                                           title="Delete learning hub"
                                       >
                                           🗑️
                                       </button>
                                       <span className="expand-icon">
                                           {expandedHubs.has(hub.id) ? '▼' : '▶'}
                                       </span>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>

                   <button className="sidebar-btn" onClick={() => navigate('/community')}>Community</button>
                   <button className="sidebar-btn sign-out" onClick={signOut}>Sign Out</button>
               </div>
           </div>
       </>
   )
}
