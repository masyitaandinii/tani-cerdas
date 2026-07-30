import { NextResponse } from 'next/server';
import { CHAT_LIMITS } from '../../lib/constants';

const ALLOWED_KEYWORDS = [
    "beras", "gabah", "padi", "panen", "tani", "petani", 
    "tengkulak", "pupuk", "hama", "cuaca", "harga", "jual", 
    "beli", "sawah", "pertanian", "irigasi"
];

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message } = body;

        if (!message || typeof message !== 'string' || message.length > CHAT_LIMITS.MAX_MESSAGE_LENGTH) {
            return NextResponse.json({ 
                error: `Message is required and must be under ${CHAT_LIMITS.MAX_MESSAGE_LENGTH} characters`,
                details: null 
            }, { status: 400 });
        }

        const lowerMessage = message.toLowerCase();
        
        // Pre-validation Guard
        const isAllowed = ALLOWED_KEYWORDS.some(keyword => lowerMessage.includes(keyword));

        if (!isAllowed) {
            return NextResponse.json({
                role: 'ai',
                content: 'Maaf, TaniBot hanya bisa menjawab seputar harga dan pertanian.'
            });
        }

        // Mock LLM call integration
        return NextResponse.json({
            role: 'ai',
            content: `Informasi mengenai "${message}" sedang diproses oleh sistem TaniBot AI (Backend Terhubung).`
        });

    } catch (error) {
        console.error('POST /api/chat error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: null }, { status: 500 });
    }
}
