import './SubHubCard.css'

export const SubHubCard = (props) => {
  const handleShare = () => {}
  const handleDelete = () => {}

  return (
    <div className="subhub-card">
      <h4 className="subhub-title">{props.name}</h4>
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
