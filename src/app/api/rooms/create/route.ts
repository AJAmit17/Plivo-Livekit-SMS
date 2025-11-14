import { NextRequest, NextResponse } from 'next/server';
import { createRoom } from '@/lib/repositories/rooms';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customerPhone, ttlMinutes = 60 } = body;

        if (!customerPhone) {
            return NextResponse.json(
                { error: 'Customer phone number is required' },
                { status: 400 }
            );
        }

        const room = await createRoom({
            customerPhone,
            ttlMinutes,
        });

        logger.info('Room created', { roomId: room.roomId, customerPhone });

        return NextResponse.json({
            roomId: room.roomId,
            expiresAt: room.expiresAt,
            customerPhone: room.customerPhone,
        });
    } catch (error) {
        logger.error('Failed to create room', { error });
        return NextResponse.json(
            { error: 'Failed to create room' },
            { status: 500 }
        );
    }
}
