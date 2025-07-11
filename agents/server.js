import express, { response } from "express"
import { json } from "express"
import dotenv from "dotenv"
import { GoogleGenAI } from "@google/genai"
import cors from "cors"
import { getTranscript } from "./transcript.js"

dotenv.config()

const app = express()
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})
const PORT = process.env.PORT

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
const QUIZ_PROMPT = `
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
    try {
        inputString = inputString.replace(/"""|\\n/g, '')
        try {
            return JSON.parse(inputString)
        } catch (error) {
            // if direct parsing fails, try to extract JSON
            let startIndex = inputString.indexOf('{')
            let endIndex = inputString.lastIndexOf('}')

            if (startIndex === -1 || endIndex === -1) {
                throw new Error("Could not find valid JSON in the response")
            }

            let jsonData = inputString.substring(startIndex, endIndex + 1)
            jsonData = jsonData.replace(/\\"/g, '"')
            return JSON.parse(jsonData)
        }
    } catch (error) {
        throw new Error("Failed to transform input string")
    }
}

app.use(json())
app.use(cors())

app.post("/api/chapters", async (req, res) => {
    const { body: { youtubeUrl } } = req
    const context = await getTranscript(youtubeUrl)
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: `This is the content ${context}. Do this: ${CHAPTERS_PROMPT}`
    })
    const transformedRes = transformToJson(response.text)
    res.json(transformedRes)
})

app.post("/api/flash-cards", async (req, res) => {
    const { body: { youtubeUrl } } = req
    const context = await getTranscript(youtubeUrl)
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: `This is the content ${context}. Do this: ${FLASHCARD_PROMPT}`
    })
    const transformedRes = transformToJson(response.text)
    res.json(transformedRes)
})

app.post("/api/quiz", async (req, res) => {
    const { body: { youtubeUrl } } = req
    const context = await getTranscript(youtubeUrl)
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: `This is the content ${context}. Do this: ${QUIZ_PROMPT}`
    })
    const transformedRes = transformToJson(response.text)
    res.json(transformedRes)
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
