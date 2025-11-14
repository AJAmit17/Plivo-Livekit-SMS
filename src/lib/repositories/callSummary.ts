import { prisma } from '../prisma';
import { logger } from '../logger';

export interface CreateCallSummaryParams {
    roomId: string;
    duration: number;
    participantCount: number;
    connectionQuality?: object;
    recordingUrls?: string[];
    notes?: string;
}

export async function createCallSummary(params: CreateCallSummaryParams) {
    const room = await prisma.room.findUnique({ where: { roomId: params.roomId } });
    if (!room) throw new Error('Room not found');

    const summary = await prisma.callSummary.create({
        data: {
            roomId: room.id,
            duration: params.duration,
            participantCount: params.participantCount,
            connectionQuality: params.connectionQuality ? JSON.stringify(params.connectionQuality) : null,
            recordingUrls: params.recordingUrls || [],
            notes: params.notes,
        },
    });

    logger.info('Call summary created', { roomId: params.roomId, duration: params.duration });

    return summary;
}

export async function getCallSummaryByRoomId(roomId: string) {
    const room = await prisma.room.findUnique({
        where: { roomId },
        include: { callSummary: true },
    });

    return room?.callSummary;
}
