import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const generateNewTitles2 = async (title: string, description: string, songs: string) => {

}

export const geyKeywords = async (dataPoints: { title: string, followersGained: number }[]) => {

    console.log('dataPoints', dataPoints);
    // hit openai and ask to summarize keywords as an array
    // return array of keywords
    const response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [{
            role: "system",
            content: `
            I am analyzing an A/B test of playlist titles.
            Please return an array of the most succesful keywords, based on which title gained the most followers.
            Only return keywords that gained the MOST followers.
            Return exactly the array as JSON, with each keyword surrounded by quotes.
            ${JSON.stringify(dataPoints)}
            `
        }
    ],
    });

    const arrayStr = response.data.choices[0]?.message?.content as string;
    console.log('arrayStr', arrayStr);
    const array = JSON.parse(arrayStr) as string[];
    return array;
}

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