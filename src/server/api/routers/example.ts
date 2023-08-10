import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import SpotifyWebApi from 'spotify-web-api-node';
import util from 'util';
import { generateNewTitles, geyKeywords } from "~/utils/ai";
import { prisma } from "~/server/db";

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID as string,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
  redirectUri: 'https://abplaylist.com'
});


export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input, ctx }) => {
      spotifyApi.setAccessToken(ctx.session?.accessToken as string);

      // const playlistsBase = await spotifyApi.getPlaylist('3JlA5O26bZWFhRrEIdDgMI');
      // const playlist = playlistsBase.body;
      // const array = [playlist];
      const playlists = await spotifyApi.getUserPlaylists();
      console.log(util.inspect(playlists.body, false, null, true /* enable colors */));
      const array = playlists.body.items;
      return {
        playlists: array
      };
    }),

  updateTitle: publicProcedure
    .input(z.object({ text: z.string(), id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      //spotify api update title of playlist
      await spotifyApi.setAccessToken(ctx.session?.accessToken as string);
      await spotifyApi.setRefreshToken(ctx.session?.refreshToken as string);
      await spotifyApi.changePlaylistDetails(input.id, {
        name: input.text,

      });
      return {
        text: input.text,
        id: input.id
      };
    }),

  getPlaylist: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      //spotify api update title of playlist
      await spotifyApi.setAccessToken(ctx.session?.accessToken as string);
      await spotifyApi.setRefreshToken(ctx.session?.refreshToken as string);
      const playlist = await spotifyApi.getPlaylist(input.id);
      return {
        playlist: playlist.body,
        followers: playlist.body.followers.total
      };
    }),


  getKeywords: publicProcedure
  .input(z.array(z.object({ title: z.string(), followersGained: z.number() })))
  .query(async ({ input, ctx }) => {
    // hit openai and ask to summarize keywords as an array
    // return array of keywords

    //check for followersGained above 0 
    //if not, return empty array
    const anyFollowersGained = input.some((item) => item.followersGained > 0);
    if (!anyFollowersGained) {
      return {
        keywords: []
      };
    }

    const keywords = await geyKeywords(input);
    return {
      keywords: keywords
    };
  }),

  createTitleTest: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      //spotify api update title of playlist
      await spotifyApi.setAccessToken(ctx.session?.accessToken as string);
      await spotifyApi.setRefreshToken(ctx.session?.refreshToken as string);
      const playlist = await spotifyApi.getPlaylist(input.id);
      const playlistName = playlist.body.name;
      const playlistDescription = playlist.body.description || '';
      //songs
      const playlistTracks = await spotifyApi.getPlaylistTracks(input.id);
      const playlistTracksArray = playlistTracks.body.items;
      //gpt-3
      console.log('sending, ', playlistName, playlistDescription, playlistTracksArray.map((track) => track.track?.name || '').join(', '));
      const newTitles = await generateNewTitles(playlistName, playlistDescription, playlistTracksArray.map((track) => track.track?.name || '').join(', '));
      const nowWithNoHours = new Date();
      nowWithNoHours.setHours(0, 0, 0, 0);
      const newTest = await prisma.test.create({
        data: {
          playlistId: input.id,
          titles: newTitles,
          startDate: nowWithNoHours
        }
      });

      return {
        test: newTest
      };
    }),

  getTest: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {

      const test = await prisma.test.findUnique({
        where: {
          id: input.id
        },
        include: {
          TestHistory: {
            orderBy: {
              date: 'desc'
            }
          }
        }
      });

      return {
        test: test
      };
    }),

  getRecs: publicProcedure
    .input(z.object({
      data: z.array(z.object({
        title: z.string(),
        followersGained: z.number(),
      }))
    }))
    .mutation(async ({ input, ctx }) => {
      
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
