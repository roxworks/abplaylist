import { useRouter } from 'next/router';
import React from 'react';
import Swal from 'sweetalert2';
import { api } from '~/utils/api';
import useBreakpoint from 'use-breakpoint'
const BREAKPOINTS = { mobile: 0, tablet: 768, desktop: 1280 }


const PlaylistTable = ({ playlists }: { playlists: any[] }) => {
    //changeTitle
    const { mutateAsync: createTitleTest } = api.example.createTitleTest.useMutation();
    const router = useRouter();
    const { breakpoint, maxWidth, minWidth } = useBreakpoint(
        BREAKPOINTS,
        'mobile'
    )

    const showMoreDetails = breakpoint === 'desktop';

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="w-1/6 py-2 px-4">Image</th>
                        <th className="w-1/6 py-2 px-4">Name</th>
                        {showMoreDetails && <th className="w-1/6 py-2 px-4">Description</th>}
                        <th className="w-1/6 py-2 px-4">Owner</th>
                        {showMoreDetails && <th className="w-1/6 py-2 px-4">Tracks</th>}
                        {showMoreDetails && <th className="w-1/6 py-2 px-4">Link</th>}
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {playlists.map((playlist, index) => (
                        <tr className={(index % 2 === 0 ? 'bg-gray-100 ' : ' ') + 'hover:bg-gray-300 hover:cursor-pointer'}
                            onClick={() => {
                                Swal.fire({
                                    title: playlist.name,
                                    text: playlist.description,
                                    imageUrl: playlist.images[0]?.url || '',
                                    imageWidth: 400,
                                    imageHeight: 400,
                                    imageAlt: 'Playlist Image',
                                    confirmButtonText: 'Generate A/B Test',
                                    showCancelButton: true,
                                    // input: 'text',
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        Swal.fire({
                                            title: 'Generating A/B Test',
                                            text: 'Please wait while we generate your A/B test',
                                            icon: 'info',
                                            didOpen: () => {
                                                Swal.showLoading();
                                            }
                                        })
                                        createTitleTest({ id: playlist.id as string }).then((test) => {
                                            Swal.fire({
                                                title: 'Success!',
                                                text: 'Your A/B test has been generated',
                                                icon: 'success',
                                                confirmButtonText: 'Cool',
                                            });
                                            router.push(`/tests/${test.test.id}`);
                                        });
                                    }
                                })
                            }}
                        >
                            <td className="py-2 px-4">
                                <img src={playlist.images[0]?.url || ''} alt="Playlist" className="w-16 h-16 rounded-full" />
                            </td>
                            <td className="py-2 px-4">{playlist.name}</td>
                            {showMoreDetails && <td className="py-2 px-4">{playlist.description}</td>}
                            <td className="py-2 px-4">{playlist.owner.display_name}</td>
                            {showMoreDetails && <td className="py-2 px-4">{playlist.tracks.total}</td>}
                            {showMoreDetails && <td className="py-2 px-4">
                                <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    View on Spotify
                                </a>
                            </td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PlaylistTable;
