import { NextRequest, NextResponse } from 'next/server';
import { getRoomByRoomId, addParticipant, updateRoomStatus } from '@/lib/repositories/rooms';
import { generateLiveKitToken } from '@/lib/livekit';
import { ParticipantRole, RoomStatus } from '@prisma/client';
import { logger } from '@/lib/logger';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const { roomId } = await params;
        const body = await request.json();
        const { agentId } = body;

        if (!agentId) {
            return NextResponse.json(
                { error: 'Agent ID is required' },
                { status: 400 }
            );
        }

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

        // Generate agent token with longer TTL
        const token = generateLiveKitToken({
            roomName: room.roomId,
            identity: `agent_${agentId}`,
            metadata: JSON.stringify({
                agentId,
                role: 'agent'
            }),
        });

        // Add participant record
        await addParticipant(
            room.roomId,
            `agent_${agentId}`,
            ParticipantRole.AGENT
        );

        // Update room status to ACTIVE
        if (room.status === RoomStatus.WAITING) {
            await updateRoomStatus(room.roomId, RoomStatus.ACTIVE);
        }

        logger.info('Agent token generated', { roomId: room.roomId, agentId });

        return NextResponse.json({
            token,
            livekitUrl: process.env.LIVEKIT_URL,
            room: {
                roomId: room.roomId,
                customerPhone: room.customerPhone,
                status: room.status,
            },
        });

    } catch (error) {
        logger.error('Error generating agent token', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
