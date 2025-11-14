'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { RoomCard } from '@/components/agent/RoomCard';
import { VideoRoom } from '@/components/agent/VideoRoom';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface WaitingRoom {
    roomId: string;
    customerPhone: string;
    status: string;
    createdAt: string;
    expiresAt: string;
    participants: Array<{ identity: string; role: string }>;
    lastSms: { text: string } | null;
}

export default function AgentConsole() {
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [agentId] = useState(() => `agent_${Date.now()}`);

    const { data, error, isLoading, mutate } = useSWR<{ rooms: WaitingRoom[] }>(
        '/api/rooms/waiting',
        fetcher,
        { refreshInterval: 5000 } // Poll every 5 seconds
    );

    const handleJoinRoom = (roomId: string) => {
        setSelectedRoomId(roomId);
    };

    const handleLeaveRoom = () => {
        setSelectedRoomId(null);
        mutate(); // Refresh the room list
    };

    if (selectedRoomId) {
        return (
            <VideoRoom
                roomId={selectedRoomId}
                agentId={agentId}
                onLeave={handleLeaveRoom}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Agent Console</h1>
                    <p className="text-gray-400">
                        Support video rooms waiting for assistance
                    </p>
                </header>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
                        <p className="text-red-200">Error loading rooms: {error.message}</p>
                    </div>
                )}

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                )}

                {data && data.rooms && data.rooms.length === 0 && (
                    <div className="text-center py-12 bg-gray-800 rounded-lg">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-600 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                        <h3 className="text-xl font-medium text-gray-400 mb-2">
                            No waiting rooms
                        </h3>
                        <p className="text-gray-500">
                            Rooms will appear here when customers request support
                        </p>
                    </div>
                )}

                {data && data.rooms && data.rooms.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.rooms.map((room) => (
                            <RoomCard
                                key={room.roomId}
                                room={room}
                                onJoin={() => handleJoinRoom(room.roomId)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
