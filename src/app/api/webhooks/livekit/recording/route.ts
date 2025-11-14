import { NextRequest, NextResponse } from 'next/server';
import { createRecording, updateRecording } from '@/lib/repositories/recordings';
import { RecordingStatus } from '@prisma/client';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { event, egress_id, room_name, file_url, duration } = body;

        logger.info('Received recording webhook', { event, egress_id, room_name });

        if (!egress_id || !room_name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Handle different egress events
        switch (event) {
            case 'egress_started':
                await createRecording({
                    roomId: room_name,
                    egressId: egress_id,
                });
                break;

            case 'egress_updated':
                await updateRecording(egress_id, {
                    status: RecordingStatus.ACTIVE,
                });
                break;

            case 'egress_ended':
                await updateRecording(egress_id, {
                    status: RecordingStatus.ENDED,
                    url: file_url,
                    duration: duration ? Math.floor(duration / 1000) : undefined,
                    endedAt: new Date(),
                });
                break;

            default:
                logger.warn('Unknown egress event', { event });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        logger.error('Error handling recording webhook', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 200 }
        );
    }
}
