import { NextResponse } from 'next/server';
import { getWaitingRooms, expireOldRooms } from '@/lib/repositories/rooms';
import { logger } from '@/lib/logger';

export async function GET() {
    try {
        // First, expire old rooms
        await expireOldRooms();

        // Get waiting rooms
        const rooms = await getWaitingRooms();

        logger.debug('Fetched waiting rooms', { count: rooms.length });

        return NextResponse.json({
            rooms: rooms.map(room => ({
                roomId: room.roomId,
                customerPhone: room.customerPhone,
                status: room.status,
                createdAt: room.createdAt,
                expiresAt: room.expiresAt,
                participants: room.participants,
                lastSms: room.smsReceipts[0] || null,
            })),
        });

    } catch (error) {
        logger.error('Error fetching waiting rooms', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
