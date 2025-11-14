import { prisma } from '../prisma';
import { RecordingStatus } from '@prisma/client';
import { logger } from '../logger';

export interface CreateRecordingParams {
    roomId: string;
    egressId: string;
}

export async function createRecording(params: CreateRecordingParams) {
    const room = await prisma.room.findUnique({ where: { roomId: params.roomId } });
    if (!room) throw new Error('Room not found');

    const recording = await prisma.recording.create({
        data: {
            roomId: room.id,
            egressId: params.egressId,
            status: RecordingStatus.STARTING,
        },
    });

    logger.info('Recording created', { roomId: params.roomId, egressId: params.egressId });

    return recording;
}

export async function updateRecording(
    egressId: string,
    data: {
        status?: RecordingStatus;
        url?: string;
        duration?: number;
        endedAt?: Date;
    }
) {
    const recording = await prisma.recording.update({
        where: { egressId },
        data,
    });

    logger.info('Recording updated', { egressId, status: data.status });

    return recording;
}

export async function getRecordingsByRoomId(roomId: string) {
    const room = await prisma.room.findUnique({
        where: { roomId },
        include: { recordings: true },
    });

    return room?.recordings || [];
}
