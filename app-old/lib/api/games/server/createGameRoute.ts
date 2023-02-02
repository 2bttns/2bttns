import { NextApiRequest, NextApiResponse } from 'next'
import { GameModel } from '../../../../db'
import {
    GameAttributes,
    GameCreationAttributes,
} from '../../../../db/models/GameModel'

export type CreateGameRouteResponse = {
    result: GameAttributes
}

export async function createGameRoute(
    req: NextApiRequest,
    res: NextApiResponse<CreateGameRouteResponse>
) {
    const body = req.body as GameCreationAttributes
    const result = await GameModel.create(body)
    const json = result.toJSON()
    return res.status(201).json({ result: json })
}
