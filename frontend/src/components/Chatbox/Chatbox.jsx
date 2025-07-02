import "./Chatbox.css"

export const Chatbox = () => {
    const [input, setInput] = useState("")
    const handleSubmit = (e) => {
        e.preventDefault()
        // input to backend
        setInput("")
    }

    return (
        <>
            <form className="chat-box" onSubmit={handleSubmit}>
                <input type="text"
                placeholder="Ask anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                />
                <button type="submit" className="primary-btn small">
                    Submit
                </button>
            </form>
        </>
    )
}
