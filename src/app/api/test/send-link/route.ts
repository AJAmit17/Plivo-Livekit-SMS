import { NextRequest, NextResponse } from 'next/server';
import { sendSms } from '@/lib/plivo';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const { to, link } = await request.json();

        if (!to || !link) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const text = `Hi! Join our support video call: ${link}`;

        const response = await sendSms({
            to,
            text,
        });

        logger.info('Test SMS sent', { to, messageUuid: response.messageUuid });

        return NextResponse.json({
            success: true,
            messageUuid: response.messageUuid,
        });
    } catch (error) {
        logger.error('Failed to send test SMS', { error });
        return NextResponse.json(
            { error: 'Failed to send SMS' },
            { status: 500 }
        );
    }
}
