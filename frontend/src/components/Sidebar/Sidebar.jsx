import "./Sidebar.css"

export const Sidebar = () => {
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
                    <button className="sidebar-btn">+ Create Hub</button>
                    <button className="sidebar-btn">Community</button>
                    <button className="sidebar-btn sign-out">Sign Out</button>
                </div>
            </div>
        </>
    )
}
