import { AccessToken } from 'livekit-server-sdk';

export interface GenerateTokenParams {
    roomName: string;
    identity: string;
    metadata?: string;
}

export function generateLiveKitToken(params: GenerateTokenParams): string {
    const at = new AccessToken(
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!,
        {
            identity: params.identity,
            ttl: '10m', // Token expires in 10 minutes
        }
    );

    at.addGrant({
        roomJoin: true,
        room: params.roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
    });

    if (params.metadata) {
        at.metadata = params.metadata;
    }

    return at.toJwt();
}

export const LIVEKIT_URL = process.env.LIVEKIT_URL!;
