import type { NextApiRequest, NextApiResponse } from 'next'
import { Includeable } from 'sequelize'
import { gameInclude } from '../../../db/constants'
import { GameModel, ListModel } from '../../../db/index'
import { GameCreationAttributes } from '../../../db/models/GameModel'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        switch (req.method) {
            /**
             * @swagger
             * /api/games:
             *   get:
             *     tags:
             *       - games
             *     summary: Get games
             *     description: Returns an array containing every game.
             *     parameters:
             *       - in: query
             *         name: include_lists
             *         schema:
             *           type: boolean
             *         description: Set to 'true' to include related lists with the results.
             *     responses:
             *       200:
             *         description: "Success (TODO: schema)"
             *       500:
             *         description: Internal error
             */

            case 'GET': {
                const include_lists = req.query.include_lists === 'true'
                const include: Includeable[] = include_lists
                    ? [
                          { model: ListModel, as: gameInclude.input_list },
                          { model: ListModel, as: gameInclude.output_list },
                      ]
                    : []
                const result = await GameModel.findAll({ include })
                return res.status(200).json({
                    games: result.map((l) => {
                        return l.toJSON()
                    }),
                })
            }

            /**
             * @swagger
             * /api/games:
             *   post:
             *     tags:
             *       - games
             *     summary: Create a game
             *     description: Creates a game.
             *     requestBody:
             *       required: true
             *       content:
             *         application/json:
             *             schema:
             *               $ref: '#/components/schemas/GameCreateUpdateBody'
             *             examples:
             *               'Example Body':
             *                 $ref: '#/components/examples/GameRequestBody'
             *     responses:
             *       201:
             *         description: "Created (TODO: schema)"
             *       500:
             *         description: Internal error
             */
            case 'POST': {
                const body = req.body as GameCreationAttributes
                const result = await GameModel.create(body)
                return res.status(201).json({ result })
            }

            /**
             * @swagger
             * /api/games:
             *   put:
             *     tags:
             *       - games
             *     summary: Update games
             *     description: Update games.
             *     parameters:
             *       - in: query
             *         name: game_ids
             *         schema:
             *           type: string
             *         description: Comma-separated IDs of games that should be updated.
             *         example: '1,42,777'
             *     requestBody:
             *       required: true
             *       content:
             *         application/json:
             *             schema:
             *               $ref: '#/components/schemas/GameCreateUpdateBody'
             *             examples:
             *               'Example Body':
             *                 $ref: '#/components/examples/GameUpdateRequestBody'
             *     responses:
             *       200:
             *         description: "Success (TODO: schema)"
             *       500:
             *         description: Internal error
             */
            case 'PUT': {
                let game_ids = []
                try {
                    game_ids = (req.query.game_ids as string).split(',')
                    if (game_ids.length === 0) {
                        throw new Error(`"game_ids" is empty`)
                    }
                } catch {
                    return res.status(400).send({
                        message: `"game_ids" must contain one or more comma-separated game IDs.`,
                        statusCode: 400,
                    })
                }

                for await (const id of game_ids) {
                    const game = await GameModel.findOne({ where: { id } })
                    if (game === null) {
                        return res.status(400).send({
                            message: `Invalid game id: ${id}`,
                            statusCode: 400,
                        })
                    }
                }

                const body = req.body as GameCreationAttributes
                const result = await GameModel.update(body, {
                    where: { id: game_ids },
                })

                if (result[0] === 0) {
                    return res.status(500).send({
                        message: 'Update failed. 0 games were updated.',
                        statusCode: 500,
                    })
                }

                return res
                    .status(200)
                    .json({ message: 'Update Success', statusCode: 200 })
            }

            default: {
                return res.status(405).send({ message: 'Method not allowed' })
            }
        }
    } catch (error) {
        console.log(error)

        return res.status(500).json({ message: 'Internal error' })
    }
}
