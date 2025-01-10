import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
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

        if (meal.user_id !== userId) {
            return response.status(403).send({ message: "You don't have permission to see this meal" });
        }

        return response.status(200).send({ meals: meal });
    })

    app.put('/:id', { preHandler: [convertSessionIdInUser] }, async (request, response) => {
        const getMealIdParamSchema = z.object({
            id: z.string().uuid()
        })

        const createMealsBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            date: z.string(),
            isInDiet: z.boolean()
        })

        const { id } = getMealIdParamSchema.parse(request.params);
        const { name, description, date, isInDiet } = createMealsBodySchema.parse(request.body);

        const userId = request.user?.id;
        const userToAdd = await knex('meals').where({ id }).select().first();

        if (userToAdd.user_id !== userId) {
            return response.status(403).send({ message: "You don't have permission to update this meal" });
        }

        await knex('meals').where({ id }).andWhere({ user_id: userId }).update({
            name,
            description,
            date,
            is_in_diet: isInDiet,
        })

        return response.status(200).send({});
    })

    app.delete('/:id/delete', { preHandler: [convertSessionIdInUser] }, async (request, response) => {
        const getMealIdParamSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = getMealIdParamSchema.parse(request.params);
        const userId = request.user?.id;

        const meal = await knex('meals').where({ id }).select().first();

        if (meal.user_id !== userId) {
            return response.status(403).send({ message: "You don't have permission to delete this meal" });
        }

        await knex('meals').where({ id }).andWhere({ user_id: userId }).delete();

        return response.status(200).send({});
    })

    app.get('/summary', { preHandler: [convertSessionIdInUser] }, async (request, response) => {
        const userId = request.user?.id;
        const meals = await knex('meals').where({ user_id: userId });
        const mealsOnDiet = [];
        const mealsNotOnDiet = [];

        const { onDietSequence } = meals.reduce(
            (acc, meal) => {
                acc.currentSequence = meal.is_in_diet ? acc.currentSequence + 1 : 0;

                if (acc.currentSequence > acc.onDietSequence) {
                    acc.onDietSequence = acc.currentSequence
                }
                return acc
            },
            { onDietSequence: 0, currentSequence: 0 },
        )

        meals.forEach(meal => {
            if (meal.is_in_diet) {
                mealsOnDiet.push(meal);
            } else {
                mealsNotOnDiet.push(meal);
            }
        })

        return response.status(200).send({ totalMeals: meals.length, mealsOnDiet: mealsOnDiet.length, mealsNotOnDiet: mealsNotOnDiet.length, onDietSequence });
    })
}