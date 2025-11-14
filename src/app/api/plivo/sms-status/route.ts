import { NextRequest, NextResponse } from 'next/server';
import { updateSmsStatus } from '@/lib/repositories/sms';
import { SmsStatus } from '@prisma/client';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const messageUuid = formData.get('MessageUUID') as string;
        const status = formData.get('Status') as string;
        const from = formData.get('From') as string;
        const to = formData.get('To') as string;

        logger.info('Received SMS status callback', { messageUuid, status, from, to });

        if (!messageUuid || !status) {
            logger.warn('Missing required fields in status callback', { messageUuid, status });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Map Plivo status to our enum
        let smsStatus: SmsStatus;
        switch (status.toLowerCase()) {
            case 'queued':
                smsStatus = SmsStatus.QUEUED;
                break;
            case 'sent':
                smsStatus = SmsStatus.SENT;
                break;
            case 'delivered':
                smsStatus = SmsStatus.DELIVERED;
                break;
            case 'failed':
                smsStatus = SmsStatus.FAILED;
                break;
            case 'undelivered':
                smsStatus = SmsStatus.UNDELIVERED;
                break;
            default:
                logger.warn('Unknown SMS status', { status });
                smsStatus = SmsStatus.QUEUED;
        }

        // Update SMS receipt status
        await updateSmsStatus(messageUuid, smsStatus);

        return NextResponse.json({ success: true });

    } catch (error) {
        logger.error('Error handling SMS status callback', error);
        // Return 200 to prevent Plivo retries for application errors
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 200 }
        );
    }
}
