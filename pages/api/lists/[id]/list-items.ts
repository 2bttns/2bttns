import { DefaultResponse } from './../../../../lib/api/constants'
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ListItemModel, ListModel, sequelize } from '../../../../db'
import { ListItemCreationAttributes } from '../../../../db/models/ListItemModel'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const list_id = req.query.id
    if (typeof list_id !== 'string') {
        return res.status(400).json({ message: 'Invalid list id.' })
    }

    try {
        switch (req.method) {
            /**
             * @swagger
             * /api/lists/{id}/list-items:
             *   get:
             *     tags:
             *       - list-items
             *     summary: Get list items
             *     description: Get list items by a list's ID.
             *     parameters:
             *       - in: path
             *         name: id
             *         required: true
             *         schema:
             *           type: string
             *         description: ID of the list
             *     responses:
             *       200:
             *         description: "Success (TODO: schema)"
             *       500:
             *         description: Internal error
             */
            case 'GET': {
                const list_items = await getListItemsById(list_id)
                return res.status(200).json({ list_items })
            }

            /**
             * @swagger
             * /api/lists/{id}/list-items:
             *   post:
             *     tags:
             *       - list-items
             *     summary: Add list items
             *     description: Adds list items to a list.
             *     parameters:
             *       - in: path
             *         name: id
             *         required: true
             *         schema:
             *           type: string
             *         description: ID of the list to add a new list item to.
             *     requestBody:
             *       required: true
             *       content:
             *         application/json:
             *             schema:
             *               type: array
             *               items:
             *                   $ref: '#/components/schemas/ListItem'
             *             examples:
             *               'Example Body':
             *                 $ref: '#/components/examples/ListCreateItemsRequestBody'
             *     responses:
             *       200:
             *         description: Success
             *       500:
             *         description: Internal error
             */
            case 'POST': {
                await createListItems(
                    list_id,
                    req.body as ListItemCreationAttributes[]
                )
                const response: DefaultResponse = {
                    message: 'Created',
                    statusCode: 201,
                }
                return res.status(response.statusCode).json(response)
            }

            /**
             * @swagger
             * /api/lists/{id}/list-items:
             *   put:
             *     tags:
             *       - list-items
             *     summary: Update list items
             *     description: Updates list items using a comma-separated list of list item IDs.
             *     parameters:
             *       - in: path
             *         name: id
             *         required: true
             *         schema:
             *           type: string
             *         description: ID of the list to edit list items in.
             *       - in: query
             *         name: list_item_ids
             *         required: true
             *         schema:
             *           type: string
             *         example: 1,42,777
             *         description: Comma-separated string of list item ID's.
             *     requestBody:
             *       required: true
             *       content:
             *         application/json:
             *             schema:
             *               $ref: '#/components/schemas/ListItem'
             *             examples:
             *               'Example Body':
             *                 $ref: '#/components/examples/ListItemUpdateRequestBody'
             *     responses:
             *       200:
             *         description: Success
             *       500:
             *         description: Internal error
             */
            case 'PUT': {
                if (typeof req.query.list_item_ids !== 'string') {
                    return res.status(400).json({ message: 'Invalid list id.' })
                }
                const list_item_ids = req.query.list_item_ids.split(',')

                await updateListItems(
                    list_id,
                    list_item_ids,
                    req.body as ListItemCreationAttributes
                )
                const response: DefaultResponse = {
                    message: `Successfully updated ${list_item_ids.length} list items`,
                    statusCode: 200,
                }
                return res.status(response.statusCode).json(response)
            }

            /**
             * @swagger
             * /api/lists/{id}/list-items:
             *   delete:
             *     tags:
             *       - list-items
             *     summary: Delete list items
             *     description: Delete multiple list items using a comma-separated list of id's.
             *     parameters:
             *       - in: path
             *         name: id
             *         required: true
             *         schema:
             *           type: string
             *         description: ID of the list to delete list items from.
             *       - in: query
             *         name: delete
             *         required: true
             *         schema:
             *           type: string
             *         description: Comma-separated string of list item ID's.
             *         examples:
             *           oneId:
             *             summary: Example of a single ID
             *             value: '5'
             *           multipleIds:
             *             summary: Example of multiple IDs
             *             value: '1,5,7'
             *     responses:
             *       200:
             *         description: Success
             *       500:
             *         description: Internal error
             */
            case 'DELETE': {
                const toDelete = (req.query['delete'] as string).split(',')
                await deleteListItems(list_id, toDelete)
                return res.status(200).json({ message: 'Success' })
            }
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal error' })
    }
}

export async function getListItemsById(list_id: string) {
    const result = await ListModel.findByPk(list_id, {
        include: [ListItemModel],
    })

    if (!result) {
        throw new Error('Failed to get list items by list id')
    }

    const { list_items } = result.toJSON()

    return list_items
}

export async function createListItems(
    list_id: string,
    body: ListItemCreationAttributes[]
) {
    const transaction = await sequelize.transaction()
    const items = body.map(({ name, description }) => {
        return { list_id, name, description } as ListItemCreationAttributes
    })
    const results = await ListItemModel.bulkCreate(items)
    if (results.length == 0) {
        await transaction.rollback()
        throw new Error(
            'Request body must be an array of 0 or more list items.'
        )
    }
    await transaction.commit()
}

export async function updateListItems(
    list_id: string,
    list_item_ids: string[],
    body: ListItemCreationAttributes
) {
    const { id, ...allowedUpdateFields } = body

    for (const list_item_id of list_item_ids) {
        const instance = await ListItemModel.findOne({
            where: { id: list_item_id, list_id },
        })
        if (!instance) {
            throw new Error(`Failed to find list item with id: ${list_item_id}`)
        }
    }

    await ListItemModel.update(allowedUpdateFields, {
        where: { id: list_item_ids, list_id },
    })
}

export async function deleteListItems(list_id: string, listItemIds: string[]) {
    const transaction = await sequelize.transaction()
    const result = await ListItemModel.destroy({
        where: { list_id, id: listItemIds },
        transaction,
    })

    if (!result || result === 0) {
        await transaction.rollback()
        throw new Error('Failed to delete list by id')
    }
    await transaction.commit()
}
