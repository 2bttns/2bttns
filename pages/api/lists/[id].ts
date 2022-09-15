// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ListModel } from '../../../db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const id = req.query.id
    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid list id.' })
    }

    try {
        switch (req.method) {
            case 'GET': {
                const list = await getListById(id)
                return res.status(200).json({ list })
            }
            case 'DELETE': {
                const deleted = await deleteListById(id)
                return res.status(200).json({ deleted })
            }
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal error' })
    }
}

export async function getListById(id: string) {
    const result = await ListModel.findByPk(id)

    if (!result) {
        throw new Error('Failed to get list by id')
    }

    return result.toJSON()
}

export async function deleteListById(id: string) {
    const result = await ListModel.destroy({ where: { id } })

    if (!result) {
        throw new Error('Failed to delete list by id')
    }

    const didDelete = result > 0
    return didDelete
}
