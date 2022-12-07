// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { UserModel } from '../../../db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const id = req.query.id
    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid user id.' })
    }

    try {
        switch (req.method) {
            /**
             * @swagger
             * /api/users/{id}:
             *   get:
             *     tags:
             *       - users
             *     summary: Get user by ID
             *     description: Get a users details by their ID.
             *     parameters:
             *       - in: path
             *         name: id
             *         required: true
             *         schema:
             *           type: string
             *         description: ID of the user.
             *     responses:
             *       200:
             *         description: "Success (TODO: schema)"
             *       500:
             *         description: Internal error
             */
            case 'GET': {
                const list = await getUserById(id)
                return res.status(200).json({ list })
            }

            /**
             * @swagger
             * /api/users/{id}:
             *   delete:
             *     tags:
             *       - users
             *     summary: Delete user by ID
             *     description: Delete a user by their ID.
             *     parameters:
             *       - in: path
             *         name: id
             *         required: true
             *         schema:
             *           type: string
             *         description: ID of the user to delete.
             *     responses:
             *       200:
             *         description: Success
             *       500:
             *         description: Internal error
             */
            case 'DELETE': {
                const deleted = await deleteUserById(id)
                if (!deleted) {
                    throw new Error('Failed to delete list.')
                }
                return res.status(200).json({ message: 'Success' })
            }
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal error' })
    }
}

export async function getUserById(id: string) {
    const result = await UserModel.findByPk(id)

    if (!result) {
        throw new Error('Failed to get user by id')
    }

    return result.toJSON()
}

export async function deleteUserById(id: string) {
    const result = await UserModel.destroy({ where: { id } })

    if (!result) {
        throw new Error('Failed to delete user by id')
    }

    const didDelete = result > 0
    return didDelete
}
