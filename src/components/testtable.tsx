import { Test, TestHistory } from '@prisma/client';
import React from 'react';
import { api } from '~/utils/api';
import { BarChart, Card } from "@tremor/react";


function ABTesterComponent({ testData }: {
    testData: Test & {
        TestHistory: TestHistory[]
    }
}) {


    const dataPoints = testData.titles.map((title, index) => {
        const datesShown = (testData.TestHistory || []).filter(h => h.titleIndex === index).map(h => h.date.toDateString()).join(', ');
        const followersGained = (testData.TestHistory || []).filter(h => h.titleIndex === index).map(h => h.followedGained).reduce((a, b) => a + b, 0);
        return {
            title,
            datesShown,
            followersGained
        }
    });

    const keywordsRes = api.example.getKeywords.useQuery(dataPoints, {
        refetchOnWindowFocus: false,
    });

    const keywords = keywordsRes.data?.keywords || [];

    return (
        <div className="bg-gray-100 p-5 rounded-md shadow-md w-full h-full min-h-screen">
            <h2 className="text-xl font-bold mb-4">A/B Test ID: {testData.id}</h2>
            <p className="mb-2">Playlist ID: {testData.playlistId}</p>
            <p className="mb-4">Start Date: {new Date(testData.startDate).toLocaleDateString()}</p>

            <h3 className="text-lg font-semibold mb-2">Titles:</h3>
            <div className="space-y-3">
                {testData.titles.map((title, index) => {
                    const datesShown = (testData.TestHistory || []).filter(h => h.titleIndex === index).map(h => h.date.toDateString()).join(', ');
                    const followersGained = (testData.TestHistory || []).filter(h => h.titleIndex === index).map(h => h.followedGained).reduce((a, b) => a + b, 0);
                    return (<div key={index} className="p-3 bg-white rounded-md shadow">
                        <h4 className="text-md font-semibold mb-2">{title}</h4>
                        <p>Dates Shown: {datesShown}</p>
                        <p>Followers Gained: {followersGained}</p>
                    </div>)
                })}
            </div>


            {/* graph of dates vs followers gained */}
            <Card className="mt-5 text-white">
                <BarChart
                    data={dataPoints}
                    // x="title"
                    index="title"
                    categories={["followersGained"]}
                    colors={["blue"]}
                    title="Followers Gained"
                    // subtitle="by Title"
                />
            </Card>

            {keywords.length > 0 && <div className="mt-5">
                <h3 className="text-lg font-semibold mb-2">Keywords:</h3>
                <div className="space-y-3">
                    {keywords.map((keyword, index) => {
                        return (<div key={index} className="p-3 bg-white rounded-md shadow">
                            <h4 className="text-md font-semibold mb-2">{keyword}</h4>
                        </div>)
                    })}
                </div>
            </div>}


        </div>
    );
}

export default ABTesterComponent;