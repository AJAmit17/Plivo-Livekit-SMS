import { formatDistance } from '@/lib/utils';

interface Room {
    roomId: string;
    customerPhone: string;
    status: string;
    createdAt: string;
    expiresAt: string;
    participants: Array<{ identity: string; role: string }>;
    lastSms: { text: string } | null;
}

interface RoomCardProps {
    room: Room;
    onJoin: () => void;
}

export function RoomCard({ room, onJoin }: RoomCardProps) {
    const createdDate = new Date(room.createdAt);
    const expiresDate = new Date(room.expiresAt);
    const now = new Date();
    const timeRemaining = Math.max(0, Math.floor((expiresDate.getTime() - now.getTime()) / 1000 / 60));

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                        New Support Request
                    </h3>
                    <p className="text-sm text-gray-400">
                        {formatDistance(createdDate)}
                    </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-300 border border-yellow-700">
                    Waiting
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                    <svg
                        className="w-4 h-4 mr-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                    </svg>
                    <span className="text-gray-300">{room.customerPhone}</span>
                </div>

                <div className="flex items-center text-sm">
                    <svg
                        className="w-4 h-4 mr-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span className="text-gray-300">
                        Expires in {timeRemaining} min
                    </span>
                </div>

                {room.participants.length > 0 && (
                    <div className="flex items-center text-sm">
                        <svg
                            className="w-4 h-4 mr-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                        <span className="text-gray-300">
                            {room.participants.length} participant(s)
                        </span>
                    </div>
                )}
            </div>

            {room.lastSms && (
                <div className="bg-gray-700/50 rounded p-3 mb-4">
                    <p className="text-xs text-gray-400 mb-1">Last message:</p>
                    <p className="text-sm text-gray-200 line-clamp-2">
                        {room.lastSms.text}
                    </p>
                </div>
            )}

            <button
                onClick={onJoin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                </svg>
                Join as Agent
            </button>
        </div>
    );
}
