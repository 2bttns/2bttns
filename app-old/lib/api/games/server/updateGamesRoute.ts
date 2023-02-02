import { NextApiRequest, NextApiResponse } from 'next'
import { GameModel } from '../../../../db'
import { GameCreationAttributes } from '../../../../db/models/GameModel'
import { DefaultResponse } from '../../constants'

export async function updateGamesRoute(
    req: NextApiRequest,
    res: NextApiResponse<DefaultResponse>
) {
    let game_ids = []
    try {
        game_ids = (req.query.game_ids as string).split(',')
        if (game_ids.length === 0) {
            throw new Error(`"game_ids" is empty`)
        }
    } catch {
        return res.status(400).json({
            message: `"game_ids" must contain one or more comma-separated game IDs.`,
            statusCode: 400,
        })
    }

    for await (const id of game_ids) {
        const game = await GameModel.findOne({ where: { id } })
        if (game === null) {
            return res.status(400).json({
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
        return res.status(500).json({
            message: 'Update failed. 0 games were updated.',
            statusCode: 500,
        })
    }

    return res.status(200).json({ message: 'Update Success', statusCode: 200 })
}
