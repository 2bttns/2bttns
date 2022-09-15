import { NextApiRequest, NextApiResponse } from 'next'
import { createSwaggerSpec } from 'next-swagger-doc'
import swaggerDefinition from '../../docs/swaggerDefinition'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).send('Invalid method')
    }

    const spec = createSwaggerSpec(swaggerDefinition)
    return res.status(200).json(spec)
}
