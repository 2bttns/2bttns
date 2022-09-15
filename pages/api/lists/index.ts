// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ListItemModel, ListModel } from '../../../db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).send({ message: 'Method not allowed' })
    }

    const include_list_items = req.query.include_list_items === 'true'
    const include = include_list_items ? [ListItemModel] : undefined

    try {
        const result = await ListModel.findAll({ include })
        return res.status(200).json({
            lists: result.map((l) => {
                return l.toJSON()
            }),
        })
    } catch (error) {
        return res.status(500).json({ message: 'Internal error' })
    }
}
