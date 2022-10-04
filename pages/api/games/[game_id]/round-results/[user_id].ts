// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ListItemModel } from '../../../../../db'
import { Results } from '../../../../../lib/2bttns/ClassicMode/types'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
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

        // const list_item = await getListItemById(user_id)
        // return res.status(200).json({ list_item })
        return res.status(200).json(body)
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
