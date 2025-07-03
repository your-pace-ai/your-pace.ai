import express, { response } from "express"
import { json } from "express"
import dotenv from "dotenv"
import { GoogleGenAI } from "@google/genai"
import cors from "cors"

dotenv.config()

const app = express()
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})

const CHAPTERS_PROMPT = `
    Generate chapter summaries(6 to 10 depending on transcript length)
    based on the transcript provided. return a json in the form
    {
        chapter1: "summary....",
        chapter2: "summary...,
        ...
    }
`
const FLASHCARD_PROMPT = `
    Generate active recall flashcards based on the context given.(create 15 flashcards)
    the response should be a json in the form:
    {
        flashcard1 : {
            front: "",
            back:""
        }
    }
`
const QUIZ_PROMP = `
    Generate 30 Quizzes split into 3 categories(easy, medium, hard). It should be based on the context
    the response should be a json in the form:
    {
        easy: {
            question: "",
            options: {
                A: "",
                B: "",
                C: "",
                D: ""
            },
            ans: (right answer),
            explanation: ""
        },
        medium:,
        hard:
    }
`

const transformToJson = (inputString) => {
    inputString = inputString.replace(/"""|\\n/g, '')

    let startIndex = inputString.indexOf('{')
    let endIndex = inputString.lastIndexOf('}')
    let jsonData = inputString.substring(startIndex, endIndex + 1)

    jsonData = jsonData.replace(/\\"/g, '"')
    return JSON.parse(jsonData)
}



app.use(json())
app.use(cors())

app.get("/api/chapters", async (req, res) => {
    const { body: { context } } = req
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: `This is the content ${context}. Do this: ${CHAPTERS_PROMPT}`
    })
    const transformedRes = transformToJson(response.text)
    res.json(transformedRes)
})

app.get("/api/flash-cards", async (req, res) => {
    const { body: { context } } = req
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: `This is the content ${context}. Do this: ${FLASHCARD_PROMPT}`
    })
    const transformedRes = transformToJson(response.text)
    res.json(transformedRes)
})

app.get("/api/quiz", async (req, res) => {
    const { body: { context } } = req
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: `This is the content ${context}. Do this: ${QUIZ_PROMP}`
    })
    const transformedRes = transformToJson(response.text)
    res.json(transformedRes)
})

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`)
})
