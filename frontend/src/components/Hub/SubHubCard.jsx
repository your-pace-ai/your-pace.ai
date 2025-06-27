import './SubHubCard.css'

export const SubHubCard = ({ hub }) => {
  const handleShare = () => {}
  const handleDelete = () => {}

  return (
    <div className="subhub-card">
      <h4 className="subhub-title">{hub.name}</h4>
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
