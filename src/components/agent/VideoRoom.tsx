'use client';

import { useEffect, useState, useRef } from 'react';
import {
    LiveKitRoom,
    VideoConference,
    RoomAudioRenderer,
    useConnectionQualityIndicator,
} from '@livekit/components-react'; 

// function ConnectionQuality() {
//     const quality = useConnectionQualityIndicator();
//     const qualityStr = quality?.quality || 'unknown';

//     const getQualityColor = () => {
//         switch (qualityStr) {
//             case 'excellent':
//                 return 'bg-green-500';
//             case 'good':
//                 return 'bg-blue-500';
//             case 'poor':
//                 return 'bg-yellow-500';
//             default:
//                 return 'bg-red-500';
//         }
//     };

//     return (
//         <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/60 px-3 py-2 rounded-lg text-white text-sm">
//             <div className={`w-3 h-3 rounded-full ${getQualityColor()}`}></div>
//             <span className="capitalize">{qualityStr}</span>
//         </div>
//     );
// }

function CallTimer({ startTime }: { startTime: number }) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="absolute top-4 left-4 z-10 bg-black/60 px-3 py-2 rounded-lg text-white text-sm font-mono">
            {formatTime(elapsed)}
        </div>
    );
}

interface VideoRoomProps {
    roomId: string;
    agentId: string;
    onLeave: () => void;
}

export function VideoRoom({ roomId, agentId, onLeave }: VideoRoomProps) {
    const [token, setToken] = useState<string | null>(null);
    const [livekitUrl, setLivekitUrl] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [joinTime, setJoinTime] = useState<number | null>(null);
    const [roomInfo, setRoomInfo] = useState<{ customerPhone: string } | null>(null);
    const hasJoined = useRef(false);

    useEffect(() => {
        // Fetch agent token
        fetch(`/api/rooms/${roomId}/token/agent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId }),
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to get access token');
                }
                return res.json();
            })
            .then(data => {
                setToken(data.token);
                setLivekitUrl(data.livekitUrl);
                setRoomInfo(data.room);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    }, [roomId, agentId]);

    const handleConnected = () => {
        if (!hasJoined.current) {
            setJoinTime(Date.now());
            hasJoined.current = true;
        }
    };

    const handleDisconnected = async () => {
        if (joinTime) {
            const duration = Math.floor((Date.now() - joinTime) / 1000);

            // Send call summary
            try {
                await fetch(`/api/rooms/${roomId}/summary`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        duration,
                        notes: `Agent ${agentId} handled the call`,
                    }),
                });
            } catch (err) {
                console.error('Failed to save call summary:', err);
            }
        }

        onLeave();
    };

    const handleEndCall = () => {
        handleDisconnected();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">Joining room...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 max-w-md">
                    <h1 className="text-white text-xl font-bold mb-2">Error</h1>
                    <p className="text-red-200 mb-4">{error}</p>
                    <button
                        onClick={onLeave}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                    >
                        Back to Console
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-gray-900 relative">
            {roomInfo && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/60 px-4 py-2 rounded-lg text-white text-sm">
                    <p>Customer: {roomInfo.customerPhone}</p>
                </div>
            )}

            <button
                onClick={handleEndCall}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
                End Call
            </button>

            {token && livekitUrl && (
                <div data-lk-theme="default" className="h-full">
                    <LiveKitRoom
                        token={token}
                        serverUrl={livekitUrl}
                        connect={true}
                        onConnected={handleConnected}
                        onDisconnected={handleDisconnected}
                        audio={true}
                        video={true}
                        className="h-full"
                        options={{
                            adaptiveStream: true,
                            dynacast: true,
                        }}
                    >
                        {joinTime && <CallTimer startTime={joinTime} />}
                    {/* <ConnectionQuality /> */}
                        <VideoConference />
                        <RoomAudioRenderer />
                    </LiveKitRoom>
                </div>
            )}
        </div>
    );
}
