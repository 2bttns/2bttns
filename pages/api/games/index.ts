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
             *       description: Foo
             *       required: true
             *       content:
             *         application/json:
             *             schema:
             *               $ref: '#/components/schemas/Game'
             *             examples:
             *               'Example Body':
             *                 $ref: '#/components/examples/GameRequestBody'
             *     responses:
             *       200:
             *         description: "Success (TODO: schema)"
             *       500:
             *         description: Internal error
             */
            case 'POST': {
                const body = req.body as GameCreationAttributes
                const result = await GameModel.create(body)
                console.log(result)
                return res.status(200).json({ result })
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
