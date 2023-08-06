import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

import SpotifyWebApi from 'spotify-web-api-node';
import { useSession } from "next-auth/react";

// credentials are optional

export default async function (req: NextApiRequest, res: NextApiResponse) {

    var spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID as string,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
        redirectUri: 'https://abplaylist.com'
    });

    const {data: session} = useSession();
    const nowWithNoHours = new Date();
    nowWithNoHours.setHours(0, 0, 0, 0);
    const testId = req.query.testId;
    const test = await prisma.test.findUnique({
        where: {
            id: testId as string,
        },
        include: {
            TestHistory: {
                orderBy: {
                    date: "desc",
                }
            },
        },
    });

    if (!test) {
        return res.status(404).json({ message: "Test not found" });
    }


    await spotifyApi.setAccessToken(session?.accessToken as string);
    await spotifyApi.setRefreshToken(session?.refreshToken as string);
    const playlist = await spotifyApi.getPlaylist(test.playlistId);
    const followers = playlist.body.followers.total;

    const mostRecentHistory = test.TestHistory[0];
    const followerDiff = followers - (mostRecentHistory?.totalFollowers || 0);
    const previousTitleIndex = mostRecentHistory?.titleIndex || 0;
    const newTitleIndex = (previousTitleIndex + 1) % test.titles.length;

    const newTitle = test.titles[newTitleIndex];

    //set title
    const didSetTitle = await spotifyApi.changePlaylistDetails(test.playlistId, {
        name: newTitle,
    });

    const newHistory = await prisma.testHistory.create({
        data: {
            testId: test.id,
            totalFollowers: followers,
            followedGained: followerDiff,
            titleIndex: newTitleIndex,
            date: nowWithNoHours
        },
    });


    return res.status(200).json({
        didSetTitle,
        newHistory,
    });

}