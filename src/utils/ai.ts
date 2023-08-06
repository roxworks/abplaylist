import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const generateNewTitles = async (title: string, description: string, songs: string) => {
    const response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [{
            role: "system",
            content: `
        I currently have this playlist title: "${title}", and I want to generate better titles for it.
        The playlist description is: "${description}", and the songs are: ${songs}
        I want to generate 5 new titles for this playlist.
        Please make the titles funny, use gen z speak as much as possible, and use words like vibes.
        `
        },
        {
            role: "system",
            content: "System MUST REPLY in array syntax, with an array of strings representing the titles. Each title must be surrounded with quotes."
        },],
        max_tokens: 500,
        temperature: 0,
    });

    const arrayStr = response.data.choices[0]?.message?.content as string;
    const array = JSON.parse(arrayStr) as string[];
    return array
}