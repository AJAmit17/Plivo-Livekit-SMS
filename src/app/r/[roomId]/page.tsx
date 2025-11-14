'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';

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

export default function RoomPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const roomId = params.roomId as string;
    const token = searchParams.get('t');

    const [livekitUrl] = useState<string>(process.env.NEXT_PUBLIC_LIVEKIT_URL || '');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(!token);
    const [joinTime, setJoinTime] = useState<number | null>(null);
    const hasJoined = useRef(false);

    useEffect(() => {
        if (!token) {
            // If no token in URL, fetch a new one
            fetch(`/api/rooms/${roomId}/token/customer`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Failed to get access token');
                    }
                    return res.json();
                })
                .then(data => {
                    // Redirect with token
                    window.location.href = `/r/${roomId}?t=${data.token}`;
                })
                .catch(err => {
                    setError(err.message);
                    setIsLoading(false);
                });
        }
    }, [roomId, token]);

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
                    body: JSON.stringify({ duration }),
                });
            } catch (err) {
                console.error('Failed to save call summary:', err);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading video room...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 max-w-md">
                    <h1 className="text-white text-xl font-bold mb-2">Error</h1>
                    <p className="text-red-200">{error}</p>
                </div>
            </div>
        );
    }

    if (!token || !livekitUrl) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center text-white">
                    <p className="text-lg">Invalid room link</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-gray-900" data-lk-theme="default">
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
                <VideoConference />
                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
}
