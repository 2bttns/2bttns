import type { NextApiRequest, NextApiResponse } from 'next'
import { createGameRoute } from '../../../lib/api/games/server/createGameRoute'
import { getGamesRoute } from '../../../lib/api/games/server/getGamesRoute'
import { updateGamesRoute } from '../../../lib/api/games/server/updateGamesRoute'

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
                return await getGamesRoute(req, res)
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
                return await createGameRoute(req, res)
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
                return await updateGamesRoute(req, res)
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
