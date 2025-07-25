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

   // Ensure minimum display time of 1.5 seconds for better UX
   const startTime = Date.now()
   const minDisplayTime = 1500 // 1.5 seconds

    try {
      // backend generate smart content from chapters
      await shareSubHub(props.id)

      // Show success feedback
      if (props.onShare) {
        props.onShare()
      }
    } catch (error) {
      // throw new Error("Failed to share subhub")
    } finally {
      // shows the "Sharing..." text for at least the minimum time
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, minDisplayTime - elapsed)

      setTimeout(() => {
        setIsSharing(false)
      }, remainingTime)
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
    <div className="subhub-card highlight-effect">
      <Link
        to="/subhub"
        state={{
          youtubeUrl: props.youtubeUrl,
          hubName: props.name,
          hubId: props.id,
        }}
        className="cursor-pointer"
      >
        <h4 className="subhub-title cursor-pointer">{props.name}</h4>
      </Link>
      <div className="subhub-actions">
        <button
          className="subhub-action-btn click-effect cursor-pointer"
          onClick={handleShare}
          disabled={isSharing}
          title="Share this learning hub"
        >
          {isSharing ? 'Sharing...' : 'Share'}
        </button>
        <button
          className="subhub-action-btn delete click-effect cursor-pointer"
          onClick={handleDelete}
          title="Delete this learning hub"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
