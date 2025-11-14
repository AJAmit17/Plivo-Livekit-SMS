import { prisma } from '../prisma';
import { RoomStatus, ParticipantRole } from '@prisma/client';
import { logger } from '../logger';

export interface CreateRoomParams {
    customerPhone: string;
    ttlMinutes?: number;
}

export async function createRoom(params: CreateRoomParams) {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const ttlMinutes = params.ttlMinutes || 60;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const room = await prisma.room.create({
        data: {
            roomId,
            customerPhone: params.customerPhone,
            status: RoomStatus.WAITING,
            ttlMinutes,
            expiresAt,
        },
    });

    logger.info('Room created', { roomId: room.roomId, customerPhone: params.customerPhone });

    return room;
}

export async function getRoomByRoomId(roomId: string) {
    return prisma.room.findUnique({
        where: { roomId },
        include: {
            participants: true,
            smsReceipts: true,
            callSummary: true,
            recordings: true,
        },
    });
}

export async function getWaitingRooms() {
    const now = new Date();
    return prisma.room.findMany({
        where: {
            status: RoomStatus.WAITING,
            expiresAt: {
                gt: now,
            },
        },
        include: {
            participants: true,
            smsReceipts: {
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

export async function updateRoomStatus(roomId: string, status: RoomStatus) {
    return prisma.room.update({
        where: { roomId },
        data: { status },
    });
}

export async function addParticipant(roomId: string, identity: string, role: ParticipantRole) {
    const room = await prisma.room.findUnique({ where: { roomId } });
    if (!room) throw new Error('Room not found');

    return prisma.participant.create({
        data: {
            roomId: room.id,
            identity,
            role,
        },
    });
}

export async function expireOldRooms() {
    const now = new Date();
    const result = await prisma.room.updateMany({
        where: {
            expiresAt: {
                lt: now,
            },
            status: {
                in: [RoomStatus.WAITING, RoomStatus.ACTIVE],
            },
        },
        data: {
            status: RoomStatus.EXPIRED,
        },
    });

    if (result.count > 0) {
        logger.info('Expired old rooms', { count: result.count });
    }

    return result;
}
