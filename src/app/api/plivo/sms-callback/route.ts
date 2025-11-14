import { NextRequest, NextResponse } from 'next/server';
import { createRoom } from '@/lib/repositories/rooms';
import { sendSms } from '@/lib/plivo';
import { generateLiveKitToken } from '@/lib/livekit';
import { createSmsReceipt } from '@/lib/repositories/sms';
import { SmsDirection } from '@prisma/client';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const from = formData.get('From') as string;
        const to = formData.get('To') as string;
        const text = formData.get('Text') as string;
        const messageUuid = formData.get('MessageUUID') as string;

        logger.info('Received inbound SMS', { from, to, text: text?.substring(0, 50) });

        // Check if message contains "HELP" (case-insensitive)
        if (!text || !text.toLowerCase().includes('help')) {
            logger.info('SMS does not contain HELP keyword', { from });
            return NextResponse.json(
                { message: 'Message received but does not contain HELP keyword' },
                { status: 200 }
            );
        }

        // Create a new LiveKit room
        const room = await createRoom({
            customerPhone: from,
            ttlMinutes: 60,
        });

        // Generate customer token
        const customerToken = await generateLiveKitToken({
            roomName: room.roomId,
            identity: `customer_${from}`,
            metadata: JSON.stringify({ phone: from, role: 'customer' }),
        });

        // Build the magic link
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const magicLink = `${appUrl}/r/${room.roomId}?t=${customerToken}`;

        // Send SMS reply with the link
        const statusCallbackUrl = `${appUrl}/api/plivo/sms-status`;
        const replyText = `Hi! Join our support video call: ${magicLink}`;

        const smsResponse = await sendSms({
            to: from,
            text: replyText,
            url: statusCallbackUrl,
        });

        // Log outbound SMS receipt
        await createSmsReceipt({
            roomId: room.roomId,
            messageUuid: smsResponse.messageUuid,
            from: smsResponse.from,
            to: smsResponse.to,
            text: replyText,
            direction: SmsDirection.OUTBOUND,
        });

        // Log inbound SMS receipt
        if (messageUuid) {
            await createSmsReceipt({
                roomId: room.roomId,
                messageUuid,
                from,
                to,
                text,
                direction: SmsDirection.INBOUND,
            });
        }

        logger.info('SMS reply sent with video link', {
            roomId: room.roomId,
            messageUuid: smsResponse.messageUuid
        });

        return NextResponse.json({
            success: true,
            roomId: room.roomId,
            messageUuid: smsResponse.messageUuid,
        });

    } catch (error) {
        logger.error('Error handling inbound SMS', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
