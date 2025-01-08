import { FastifyReply } from 'fastify';
import crypto from 'node:crypto';

const createSessionId = (response: FastifyReply) => {
    let sessionId = crypto.randomUUID();
    response.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days to expire
    })

    return response;
}

export default createSessionId;