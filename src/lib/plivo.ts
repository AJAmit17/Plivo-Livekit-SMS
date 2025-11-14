import plivo from 'plivo';

const client = new plivo.Client(
    process.env.PLIVO_AUTH_ID!,
    process.env.PLIVO_AUTH_TOKEN!
);

export interface SendSmsParams {
    to: string;
    text: string;
    url?: string;
}

export interface SendSmsResponse {
    messageUuid: string;
    from: string;
    to: string;
}

export async function sendSms(params: SendSmsParams): Promise<SendSmsResponse> {
    const optionalParams = params.url ? { url: params.url } : undefined;
    
    const response = await client.messages.create(
        process.env.PLIVO_PHONE_NUMBER!,
        params.to,
        params.text,
        optionalParams
    );

    return {
        messageUuid: response.messageUuid[0],
        from: process.env.PLIVO_PHONE_NUMBER!,
        to: params.to,
    };
}

export { client as plivoClient };
