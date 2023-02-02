import { NextApiRequest, NextApiResponse } from 'next'
import { GameModel } from '../../../../db'
import { DefaultResponse } from '../../constants'

export async function deleteGamesRoute(
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

    const result = await GameModel.destroy({ where: { id: game_ids } })

    if (result === 0) {
        return res.status(500).json({
            message: 'Deletion failed. 0 games were deleted.',
            statusCode: 500,
        })
    }

    return res.status(200).json({ message: 'Delete Success', statusCode: 200 })
}
