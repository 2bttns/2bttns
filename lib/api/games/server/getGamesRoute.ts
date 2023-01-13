import { NextApiRequest, NextApiResponse } from 'next'
import { Includeable } from 'sequelize'
import { GameModel, ListModel } from '../../../../db'
import { gameInclude } from '../../../../db/constants'
import { GameAttributes } from '../../../../db/models/GameModel'

export type GetGamesRouteResponse = {
    games: GameAttributes[]
}

// Get games
// Can filter using an optional game_ids query parameter. If not provided, all games are returned.
export async function getGamesRoute(
    req: NextApiRequest,
    res: NextApiResponse<GetGamesRouteResponse>
) {
    const game_ids = req.query.game_ids
    let ids = null
    if (typeof game_ids === 'string') {
        ids = game_ids.split(',')
    }

    const include_lists = req.query.include_lists === 'true'
    const include: Includeable[] = include_lists
        ? [
              { model: ListModel, as: gameInclude.input_list },
              { model: ListModel, as: gameInclude.output_list },
          ]
        : []

    let result: GameModel[]
    if (ids) {
        result = await GameModel.findAll({ include, where: { id: ids } })
    } else {
        result = await GameModel.findAll({ include })
    }

    return res.status(200).json({
        games: result.map((l) => {
            return l.toJSON()
        }),
    })
}
