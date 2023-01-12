import { NextApiRequest, NextApiResponse } from 'next'
import { Includeable } from 'sequelize'
import { GameModel, ListModel } from '../../../../db'
import { gameInclude } from '../../../../db/constants'
import { GameAttributes } from '../../../../db/models/GameModel'

export type GetGamesRouteResponse = {
    games: GameAttributes[]
}

export async function getGamesRoute(
    req: NextApiRequest,
    res: NextApiResponse<GetGamesRouteResponse>
) {
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
