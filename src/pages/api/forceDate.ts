import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

import SpotifyWebApi from 'spotify-web-api-node';
import { useSession } from "next-auth/react";

// credentials are optional

export default async function (req: NextApiRequest, res: NextApiResponse) {

    const forceDate = req.body.forceDate as string;
    const testId = req.body.testId as string;
    const totalFollowers = req.body.totalFollowers as number;


    const test = await prisma.test.findUnique({
        where: {
            id: testId,
        },
        include: {
            TestHistory: {
                orderBy: {
                    date: "desc",
                }
            },
        },
    });

    if(!test) {
        return res.status(404).json({ message: "Test not found" });
    }

    const mostRecentHistory = test.TestHistory[0];
    const followers = totalFollowers;
    const followerDiff = followers - (mostRecentHistory?.totalFollowers || 0);
    const previousTitleIndex = mostRecentHistory?.titleIndex || 0;
    const newTitleIndex = (previousTitleIndex + 1) % test.titles.length;

    const newTitle = test.titles[newTitleIndex];

    const newhistory = await prisma.testHistory.create({
        data: {
            testId: testId,
            totalFollowers: totalFollowers,
            followedGained: followerDiff,
            date: forceDate ? new Date(forceDate) : new Date(),
            titleIndex: newTitleIndex,
        }
    });


    return res.status(200).json({
        newhistory
    });

}