// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ListItemModel, ListModel, UserModel } from '../../../db'
import { UserCreationAttributes } from '../../../db/models/UserModel'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        switch (req.method) {
            /**
             * @swagger
             * /api/users:
             *   get:
             *     tags:
             *       - users
             *     summary: Get users
             *     description: Returns an array containing every user.
             *     responses:
             *       200:
             *         description: "Success (TODO: schema)"
             *       500:
             *         description: Internal error
             */
            case 'GET': {
                const result = await UserModel.findAll()
                return res.status(200).json({
                    lists: result.map((l) => {
                        return l.toJSON()
                    }),
                })
            }

            /**
             * @swagger
             * /api/users:
             *   post:
             *     tags:
             *       - users
             *     summary: Create user
             *     description: Creates a user.
             *     requestBody:
             *       required: true
             *       content:
             *         application/json:
             *             schema:
             *               $ref: '#/components/schemas/User'
             *             examples:
             *               'Example Body':
             *                 $ref: '#/components/examples/UserRequestBody'
             *
             *
             *     responses:
             *       200:
             *         description: "Success (TODO: schema)"
             *       500:
             *         description: Internal error
             */
            case 'POST': {
                const body = req.body as UserCreationAttributes
                const result = await UserModel.create(body)
                return res
                    .status(200)
                    .json({ message: 'Created', statusCode: 200, result })
            }
            default: {
                return res.status(405).send({ message: 'Method not allowed' })
            }
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal error' })
    }
}
