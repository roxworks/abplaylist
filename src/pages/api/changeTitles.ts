import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

const newTitles = ["Hustle Hype Tracks", "CEO Vibes Only", "Billionaire Dreams & Meme Themes", "Start-Up Bops & Epic Fails", "Gen Z's Guilty Pleasure Grind"];
export default async function ChangeTitles(req: NextApiRequest, res: NextApiResponse) {
    const testId = req.query.testId as string;

    const test = await prisma.test.update({
        where: {
            id: testId,
        },
        data: {
            titles: newTitles,
        },
    });

    res.send(test);
}