import { Link } from 'react-router-dom'
import './SubHubCard.css'
import { deleteSubHub, shareSubHub } from '../../api/api'
import { useState } from 'react'

export const SubHubCard = (props) => {
  const [isSharing, setIsSharing] = useState(false)
  
  const handleShare = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isSharing) return
    
    setIsSharing(true)
    try {
      // Let the backend generate smart content from chapters
      await shareSubHub(props.id)
      
      // Show success feedback
      if (props.onShare) {
        props.onShare()
      }
    } catch (error) {
      // Error handling could be improved with a toast notification system
    } finally {
      setIsSharing(false)
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await deleteSubHub(props.id)
      if (props.onDelete) {
        props.onDelete(props.id)
      }
    } catch (error) {
      throw new Error("Failed to delete subhub")
    }
  }
  
  return (
    <div className="subhub-card">
      <Link
        to="/subhub"
        state={{
          youtubeUrl: props.youtubeUrl,
          hubName: props.name,
          hubId: props.id,
        }}
      >
        <h4 className="subhub-title">{props.name}</h4>
      </Link>
      <div className="subhub-actions">
        <button 
          className="subhub-action-btn" 
          onClick={handleShare}
          disabled={isSharing}
        >
          {isSharing ? 'Sharing...' : 'Share'}
        </button>
        <button className="subhub-action-btn delete" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  )
}
