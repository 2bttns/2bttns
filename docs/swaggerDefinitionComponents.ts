export const swaggerDefinitionComponents = {
    schemas: {
        List: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                list_items: {
                    type: 'array',
                    items: {
                        $ref: '#/components/schemas/ListItem',
                    },
                },
            },
        },
    },
    examples: {
        ListRequestBody: {
            value: {
                name: 'Example List',
                description: 'This is an example list.',
                list_items: [
                    {
                        name: 'Example List Item',
                        description: 'This is an example list item.',
                    },
                ],
            },
        },
    },
}
