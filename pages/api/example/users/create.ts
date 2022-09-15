// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { UserModel } from '../../../../db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    var result = await UserModel.create({ name: 'Test User' })
    res.status(200).json(result.toJSON())
}
