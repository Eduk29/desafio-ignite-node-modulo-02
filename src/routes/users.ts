import { FastifyInstance } from "fastify";
import { z } from "zod";
import createSessionId from "../utils/create-session-id";
import { knex } from '../database';

export async function usersRoutes(app: FastifyInstance) {

    app.post("/", async (request, response) => {
        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string().email(),
        })

        const { name, email } = createUserBodySchema.parse(request.body);

        let sessionId = request.cookies.sessionId;

        if (!sessionId) {
            createSessionId(response);
        }

        await knex('users').insert({
            id: crypto.randomUUID(),
            name,
            email,
            session_id: sessionId
        }).then(() => {
            console.log("User created")
        })

        return response.status(201).send();
    });

    app.get("/", async (request, response) => {
        const users = await knex('users').select('*')
        return users;
    })
}