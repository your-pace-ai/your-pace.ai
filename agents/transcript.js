import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube"

export const getTranscript = async (videoUrl) => {
    console.log("videoUrl", videoUrl)
    const loader = YoutubeLoader.createFromUrl(videoUrl, {
        language: "en",
        addVideoInfo: false,
    })
    const docs = await loader.load()
    return docs[0].pageContent
}
