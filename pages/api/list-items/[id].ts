// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ListItemModel } from '../../../db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const id = req.query.id
    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid list item id.' })
    }

    try {
        switch (req.method) {
            case 'GET': {
                const list_item = await getListItemById(id)
                return res.status(200).json({ list_item })
            }
            case 'DELETE': {
                const deleted = await deleteListItemById(id)
                return res.status(200).json({ deleted })
            }
        }
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
