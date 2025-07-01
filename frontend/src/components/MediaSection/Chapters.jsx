import "./Chapters.css"

export const Chapters = () => {
    // dummy data
    const chapters = [
        {
            id: 1,
            name: "Chapter 1",
            content: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolor, inventore soluta? Possimus recusandae minima dolores excepturi id voluptatibus voluptates quia natus saepe nihil quisquam, dolor at consectetur non aut perferendis.",
        },
        {
            id: 2,
            name: "Chapter 2",
            content: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolor, inventore soluta? Possimus recusandae minima dolores excepturi id voluptatibus voluptates quia natus saepe nihil quisquam, dolor at consectetur non aut perferendis.",
        },
        {
            id: 3,
            name: "Chapter 3",
            content: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolor, inventore soluta? Possimus recusandae minima dolores excepturi id voluptatibus voluptates quia natus saepe nihil quisquam, dolor at consectetur non aut perferendis.",
        }
    ]

    return (
        <>
            <div className="all-chapters">
                <h4>Chapters</h4>
                {chapters.map(chapter => (
                    <div className="chapter" key={chapter.id}>
                        <h5>{chapter.name}</h5>
                        <p>{chapter.content}</p>
                    </div>
                ))}
                    <span></span>
            </div>
        </>
    )
}
