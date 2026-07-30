import { describe, it, expect } from 'vitest';
import { POST } from '../app/api/chat/route';

const mockRequest = (body: any) => {
    return {
        json: async () => body
    } as Request;
};

describe('Chat API', () => {
    it('should reject off-topic questions without calling AI', async () => {
        const req = mockRequest({ message: 'Cara merakit PC gaming' });
        const res = await POST(req);
        
        expect(res.status).toBe(200);
        const data = await res.json();
        
        expect(data.role).toBe('ai');
        expect(data.content).toBe('Maaf, TaniBot hanya bisa menjawab seputar harga dan pertanian.');
    });

    it('should allow valid agricultural questions', async () => {
        const req = mockRequest({ message: 'Berapa harga gabah hari ini?' });
        const res = await POST(req);
        
        expect(res.status).toBe(200);
        const data = await res.json();
        
        expect(data.role).toBe('ai');
        expect(data.content).toContain('Backend Terhubung');
    });

    it('should handle missing message', async () => {
        const req = mockRequest({});
        const res = await POST(req);
        
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('Message is required');
    });
});
