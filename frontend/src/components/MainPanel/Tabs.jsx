import "./Tabs.css"

export const Tabs = ({tabs, activeTab, onChange}) => {
    return (
        <>
            <div className="tabs">
                {tabs.map((t) => (
                    <button
                        key={t}
                        className={`tab-btn ${t === activeTab ? "active" : ""}`}
                        onClick={() => onChange(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>
        </>
    )
}
