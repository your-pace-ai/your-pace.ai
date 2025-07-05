import { Link } from 'react-router-dom'
import './SubHubCard.css'
import { deleteSubHub } from '../../api/api'

export const SubHubCard = (props) => {
  const handleShare = () => {}

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
        <button className="subhub-action-btn" onClick={handleShare}>
          share
        </button>
        <button className="subhub-action-btn delete" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  )
}
