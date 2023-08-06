import { Test, TestHistory } from '@prisma/client';
import React from 'react';

function ABTesterComponent({ testData }: { testData: Test & {
    TestHistory: TestHistory[]
}}) {
    return (
        <div className="bg-gray-100 p-5 rounded-md shadow-md w-full h-full min-h-screen">
            <h2 className="text-xl font-bold mb-4">A/B Test ID: {testData.id}</h2>
            <p className="mb-2">Playlist ID: {testData.playlistId}</p>
            <p className="mb-4">Start Date: {new Date(testData.startDate).toLocaleDateString()}</p>

            <h3 className="text-lg font-semibold mb-2">Titles:</h3>
            <div className="space-y-3">
                {testData.titles.map((title, index) => (
                    <div key={index} className="p-3 bg-white rounded-md shadow">
                        <h4 className="text-md font-semibold mb-2">{title}</h4>
                        <p>Dates Shown: {(testData.TestHistory || []).filter(h => h.titleIndex === index).map(h => h.date.toDateString()).join(', ')}</p>
                        <p>Followers Gained: {(testData.TestHistory || []).filter(h => h.titleIndex === index).map(h => h.followedGained).reduce((a, b) => a + b, 0)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ABTesterComponent;