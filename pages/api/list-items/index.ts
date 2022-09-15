// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ListItemModel } from '../../../db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).send({ message: 'Method not allowed' })
    }

    try {
        const result = await ListItemModel.findAll()
        return res.status(200).json({
            list_items: result.map((l) => {
                return l.toJSON()
            }),
        })
    } catch (error) {
        return res.status(500).json({ message: 'Internal error' })
    }
}
