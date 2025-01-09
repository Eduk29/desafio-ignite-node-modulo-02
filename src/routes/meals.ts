import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import createSessionId from "../utils/create-session-id";
import { convertSessionIdInUser } from '../middlewares/convert-session-id-in-user';

export async function mealsRoutes(app: FastifyInstance) {

    app.get("/", {
        preHandler: [convertSessionIdInUser]
    }, async (request, response) => {
        const userId = request.user?.id

        const userMeals = await knex("meals").where({ user_id: userId }).select();

        return response.status(200).send({ meals: userMeals });
    })

    app.post("/", { preHandler: [convertSessionIdInUser] }, async (request, response) => {
        const createMealsBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            date: z.string(),
            isInDiet: z.boolean()
        })

        const { name, description, date, isInDiet } = createMealsBodySchema.parse(request.body);

        const userId = request.user?.id

        await knex('meals').insert({
            id: crypto.randomUUID(),
            name,
            description,
            date,
            is_in_diet: isInDiet,
            user_id: userId,
        })

        return response.status(201).send();
    })

    app.get('/:id', { preHandler: [convertSessionIdInUser] }, async (request, response) => {
        const getMealIdParamSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = getMealIdParamSchema.parse(request.params);
        const userId = request.user?.id

        const meal = await knex('meals').where({ id }).andWhere({ user_id: userId }).select().first();

        return response.status(200).send({ meals: meal });
    })


}