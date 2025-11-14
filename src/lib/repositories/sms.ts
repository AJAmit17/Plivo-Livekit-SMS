import { prisma } from '../prisma';
import { SmsStatus, SmsDirection } from '@prisma/client';
import { logger } from '../logger';

export interface CreateSmsReceiptParams {
    roomId: string;
    messageUuid: string;
    from: string;
    to: string;
    text: string;
    direction: SmsDirection;
}

export async function createSmsReceipt(params: CreateSmsReceiptParams) {
    const room = await prisma.room.findUnique({ where: { roomId: params.roomId } });
    if (!room) throw new Error('Room not found');

    const receipt = await prisma.smsReceipt.create({
        data: {
            roomId: room.id,
            messageUuid: params.messageUuid,
            from: params.from,
            to: params.to,
            text: params.text,
            direction: params.direction,
            status: SmsStatus.QUEUED,
        },
    });

    logger.info('SMS receipt created', {
        messageUuid: params.messageUuid,
        direction: params.direction
    });

    return receipt;
}

export async function updateSmsStatus(messageUuid: string, status: SmsStatus, deliveredAt?: Date) {
    const receipt = await prisma.smsReceipt.update({
        where: { messageUuid },
        data: {
            status,
            deliveredAt: deliveredAt || (status === SmsStatus.DELIVERED ? new Date() : undefined),
        },
    });

    logger.info('SMS status updated', { messageUuid, status });

    return receipt;
}

export async function getSmsReceiptByUuid(messageUuid: string) {
    return prisma.smsReceipt.findUnique({
        where: { messageUuid },
        include: {
            room: true,
        },
    });
}
