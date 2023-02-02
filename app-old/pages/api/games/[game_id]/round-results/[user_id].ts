// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { GameModel, ListItemModel, UserModel } from '../../../../../db'
import { Results } from '../../../../../lib/2bttns/ClassicMode/types'

/**
 * @swagger
 * /api/games/{game_id}/round-results/{user_id}:
 *   put:
 *     tags:
 *       - games
 *     summary: Publish user round results
 *     description: |
 *         Publish round results for a user based on a game instance.
 *
 *         Results are calculated based on the game's configuration.
 *
 *         The calculated scores are saved to the user's respective cumulative scores.
 *
 *     parameters:
 *       - in: path
 *         name: game_id
 *         schema:
 *           type: string
 *         description: ID of the game.
 *         example: 'f110a710-aaa2-4360-ab26-15c86ab86727'
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         description: ID of the user.
 *         example: 'ceb31bae-ebda-49aa-b01e-b842e8c51553'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameRoundResultsRequestBody'
 *             examples:
 *               'Example Body':
 *                 $ref: '#/components/examples/GameRoundResultsRequestBody'
 *     responses:
 *       200:
 *         description: "Success (TODO: schema)"
 *       500:
 *         description: Internal error
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        return res.status(405).send({ message: 'Method not allowed' })
    }

    const game_id = req.query.game_id
    if (typeof game_id !== 'string') {
        return res.status(400).json({ message: 'Invalid game_id.' })
    }

    const user_id = req.query.user_id
    if (typeof user_id !== 'string') {
        return res.status(400).json({ message: 'Invalid user_id.' })
    }

    // @TODO: Validate body
    const body = req.body as Results

    try {
        // @TODO: Calculate scores based on Plugins associated with the Game

        // @TODO: Plugin: Gladiator
        // @TODO: Plugin: Related Weights
        // @TODO: Plugin: Delta

        const game = await GameModel.findOne({ where: { id: game_id } })
        if (!game) {
            return res
                .status(400)
                .json({ message: `Game with id=${game_id} does not exist.` })
        }

        const user = await UserModel.findOne({ where: { id: user_id } })
        // if (!user) {
        //     return res
        //         .status(400)
        //         .json({ message: `User with id=${user_id} does not exist.` })
        // }

        const plugins = game.plugins.split(',')
        // @TODO: Calculate results based on plugins        
        // @TODO: Save results

        return res.status(200).json({ plugins, game, user, body })
    } catch (error) {
        return res.status(500).json({ message: 'Internal error' })
    }
}

export async function getListItemById(id: string) {
    const result = await ListItemModel.findByPk(id)

    if (!result) {
        throw new Error('Failed to get list by id')
    }

    return result.toJSON()
}

export async function deleteListItemById(id: string) {
    const result = await ListItemModel.destroy({ where: { id } })

    if (!result) {
        throw new Error('Failed to delete list item by id')
    }

    const didDelete = result > 0
    return didDelete
}
