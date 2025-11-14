import { NextRequest, NextResponse } from 'next/server';
import { getRoomByRoomId, updateRoomStatus } from '@/lib/repositories/rooms';
import { createCallSummary } from '@/lib/repositories/callSummary';
import { RoomStatus } from '@prisma/client';
import { logger } from '@/lib/logger';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const { roomId } = await params;
        const body = await request.json();
        const { duration, connectionQuality, notes } = body;

        const room = await getRoomByRoomId(roomId);

        if (!room) {
            return NextResponse.json(
                { error: 'Room not found' },
                { status: 404 }
            );
        }

        // Get recording URLs
        const recordingUrls = room.recordings
            .filter((r) => r.url !== null)
            .map((r) => r.url as string);        // Create call summary
        const summary = await createCallSummary({
            roomId: room.roomId,
            duration: duration || 0,
            participantCount: room.participants.length,
            connectionQuality,
            recordingUrls,
            notes,
        });

        // Update room status to ENDED
        await updateRoomStatus(room.roomId, RoomStatus.ENDED);

        logger.info('Call summary created', { roomId: room.roomId });

        return NextResponse.json({
            success: true,
            summary: {
                id: summary.id,
                duration: summary.duration,
                participantCount: summary.participantCount,
                recordingUrls: summary.recordingUrls,
            },
        });

    } catch (error) {
        logger.error('Error creating call summary', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
