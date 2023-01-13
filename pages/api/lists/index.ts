// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ListItemModel, ListModel } from '../../../db'
import { ListCreationAttributes } from '../../../db/models/ListModel'
import { getListsRoute } from '../../../lib/api/lists/server/getListsRoute'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        switch (req.method) {
            /**
             * @swagger
             * /api/lists:
             *   get:
             *     tags:
             *       - lists
             *     summary: Get lists
             *     description: |
             *       Returns an array of 'lists'. If the `list_ids` query parameter is provided, only lists with those IDs are returned.
             *
             *       Otherwise, all lists are returned.
             *     parameters:
             *       - in: query
             *         name: list_ids
             *         schema:
             *           type: string
             *           example: '1,42,777'
             *       - in: query
             *         name: include_list_items
             *         schema:
             *           type: boolean
             *         description: Set to 'true' to include related list items with the results.
             *       - in: query
             *         name: include_games
             *         schema:
             *           type: boolean
             *         description: Set to 'true' to include input_list and output_list relations to games along with the results.
             *     responses:
             *       200:
             *         description: "Success (TODO: schema)"
             *       500:
             *         description: Internal error
             */
            case 'GET': {
                return getListsRoute(req, res)
            }

            /**
             * @swagger
             * /api/lists:
             *   post:
             *     tags:
             *       - lists
             *     summary: Create a list
             *     description: Creates a list.
             *     requestBody:
             *       description: Foo
             *       required: true
             *       content:
             *         application/json:
             *             schema:
             *               $ref: '#/components/schemas/List'
             *             examples:
             *               'Example Body':
             *                 $ref: '#/components/examples/ListRequestBody'
             *
             *
             *     responses:
             *       200:
             *         description: "Success (TODO: schema)"
             *       500:
             *         description: Internal error
             */
            case 'POST': {
                const body = req.body as ListCreationAttributes
                const result = await ListModel.create(body, {
                    include: [ListItemModel],
                })
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
