import { FastifyReply, FastifyRequest } from "fastify";
import { knex } from "../database";

export const convertSessionIdInUser = async (request: FastifyRequest, response: FastifyReply) => {
    const { sessionId } = request.cookies;

    if (!sessionId) {
        return response.status(401).send({
            error: "Unauthorized",
            message: "You must have a session ID"
        });
    }

    await knex('users').where({ session_id: sessionId }).first().then((user) => {
        if (!user) {
            return response.status(401).send({
                error: "Unauthorized",
                message: "You must be logged in to access this route"
            })
        }
        request.user = user;
    })
}