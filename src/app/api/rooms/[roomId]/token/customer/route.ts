import { NextRequest, NextResponse } from 'next/server';
import { getRoomByRoomId, addParticipant } from '@/lib/repositories/rooms';
import { generateLiveKitToken } from '@/lib/livekit';
import { ParticipantRole } from '@prisma/client';
import { logger } from '@/lib/logger';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const { roomId } = await params;

        const room = await getRoomByRoomId(roomId);

        if (!room) {
            return NextResponse.json(
                { error: 'Room not found' },
                { status: 404 }
            );
        }

        // Check if room has expired
        if (new Date() > room.expiresAt) {
            return NextResponse.json(
                { error: 'Room has expired' },
                { status: 410 }
            );
        }

        // Generate new customer token
        const token = generateLiveKitToken({
            roomName: room.roomId,
            identity: `customer_${room.customerPhone}_${Date.now()}`,
            metadata: JSON.stringify({
                phone: room.customerPhone,
                role: 'customer'
            }),
        });

        // Add participant record
        await addParticipant(
            room.roomId,
            `customer_${room.customerPhone}`,
            ParticipantRole.CUSTOMER
        );

        logger.info('Customer token generated', { roomId: room.roomId });

        return NextResponse.json({
            token,
            livekitUrl: process.env.LIVEKIT_URL,
        });

    } catch (error) {
        logger.error('Error generating customer token', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
