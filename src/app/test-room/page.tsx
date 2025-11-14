'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TestRoomPage() {
    const [customerPhone, setCustomerPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [roomLink, setRoomLink] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const generateRoomLink = async () => {
        if (!customerPhone.trim()) {
            setError('Please enter a customer phone number');
            return;
        }

        setLoading(true);
        setError('');
        setRoomLink('');
        setCopied(false);

        try {
            // Create room
            const createResponse = await fetch('/api/rooms/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerPhone: customerPhone.trim(),
                    ttlMinutes: 60,
                }),
            });

            if (!createResponse.ok) {
                throw new Error('Failed to create room');
            }

            const { roomId } = await createResponse.json();

            // Get customer token
            const tokenResponse = await fetch(`/api/rooms/${roomId}/token/customer`);
            
            if (!tokenResponse.ok) {
                throw new Error('Failed to generate token');
            }

            const { token } = await tokenResponse.json();

            // Build the link
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
            const link = `${appUrl}/r/${roomId}?t=${token}`;

            setRoomLink(link);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate room link');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(roomLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sendViaSMS = async () => {
        if (!roomLink || !customerPhone) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/test/send-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: customerPhone.trim(),
                    link: roomLink,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send SMS');
            }

            alert('SMS sent successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send SMS');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full">
                <h1 className="text-3xl font-bold text-white mb-2">Test Room Generator</h1>
                <p className="text-gray-400 mb-6">Generate a customer video room link for testing</p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                            Customer Phone Number
                        </label>
                        <input
                            type="text"
                            id="phone"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+1234567890"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Use format: +1234567890 (for SMS) or any identifier (for testing)
                        </p>
                    </div>

                    <button
                        onClick={generateRoomLink}
                        disabled={loading || !customerPhone.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Generate Room Link
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    {roomLink && (
                        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Customer Room Link
                                </label>
                                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 break-all">
                                    <code className="text-green-400 text-sm">{roomLink}</code>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copy Link
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={sendViaSMS}
                                    disabled={loading}
                                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    Send via SMS
                                </button>
                            </div>

                            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
                                <p className="text-blue-200 text-sm">
                                    <strong>Instructions:</strong> Share this link with the customer. They can click it to join the video room directly. You can join from the <a href="/agent" className="underline hover:text-blue-100">Agent Console</a>.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="border-t border-gray-700 pt-4 mt-6">
                        <h2 className="text-lg font-semibold text-white mb-2">Quick Links</h2>
                        <div className="flex gap-2">
                            <a
                                href="/agent"
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
                            >
                                Agent Console
                            </a>
                            <Link
                                href="/"
                                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
                            >
                                Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
