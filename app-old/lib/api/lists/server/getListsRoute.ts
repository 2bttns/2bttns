import { NextApiRequest, NextApiResponse } from 'next'
import { Includeable } from 'sequelize'
import { GameModel, ListItemModel, ListModel } from '../../../../db'
import { gameInclude } from '../../../../db/constants'
import { ListAttributes } from './../../../../db/models/ListModel'

export type GetListsRouteResponse = {
    lists: ListAttributes[]
}

// Get lists
// Can filter using an optional list_ids query parameter. If not provided, all lists are returned.
export async function getListsRoute(
    req: NextApiRequest,
    res: NextApiResponse<GetListsRouteResponse>
) {
    const list_ids = req.query.list_ids
    let ids = null
    if (typeof list_ids === 'string') {
        ids = list_ids.split(',')
    }

    const include: Includeable[] = []
    if (req.query.include_list_items === 'true') {
        include.push(ListItemModel)
    }
    if (req.query.include_games === 'true') {
        include.push(
            ...[
                { model: GameModel, as: gameInclude.input_list },
                { model: GameModel, as: gameInclude.output_list },
            ]
        )
    }

    let result: ListModel[]
    if (ids) {
        result = await ListModel.findAll({ include, where: { id: ids } })
    } else {
        result = await ListModel.findAll({ include })
    }

    return res.status(200).json({
        lists: result.map((l) => {
            return l.toJSON()
        }),
    })
}
