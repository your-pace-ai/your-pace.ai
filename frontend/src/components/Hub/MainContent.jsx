import { useState, useEffect } from 'react'
import './MainContent.css'
import { LearningSection } from './LearningSection'
import { UserHub } from './UserHub'
import { LearningHub } from './LearningHub'
import { YouTubeUploadModal } from '../Modal/YoutubeUploadModal'
import { currentUser } from '../../api/api'
import { useNavigate } from 'react-router-dom'


export const MainContent = ({ selectedLearningHub, onLearningHubSelect, onLearningHubCreated }) => {
 const [user, setUser] = useState(null)
 const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
 const [refreshTrigger, setRefreshTrigger] = useState(0)
 const navigate = useNavigate()


 useEffect(() => {
     (
         async () => {
             const currUser = await currentUser()
             setUser(currUser)
         }
     )()
 }, [navigate])


 const handleSubHubCreated = (newSubHub) => {
   setRefreshTrigger(prev => prev + 1)

   if (onLearningHubCreated) {
     onLearningHubCreated()
   }
 }

 return (
   <div className="main-content">
     <div className="page-title">
       {user ? <h1>Welcome</h1> : <h1>Please login</h1>}
     </div>
       <LearningSection onOpenUploadModal={() => setIsUploadModalOpen(true)} />
       <UserHub />
       <LearningHub refreshTrigger={refreshTrigger} selectedLearningHub={selectedLearningHub} />
       <YouTubeUploadModal
         visible={isUploadModalOpen}
         onClose={() => setIsUploadModalOpen(false)}
         onSubHubCreated={handleSubHubCreated}
         selectedLearningHub={selectedLearningHub}
       />
   </div>
 )
}
