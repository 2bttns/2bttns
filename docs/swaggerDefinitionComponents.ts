export const swaggerDefinitionComponents = {
    schemas: {
        Game: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                plugins: {type: 'string', description: "Comma-separated list of plugins names enabled for the game instance.", example: "GLADIATOR_SORT,RELATED_ITEMS,DELTA"},
                input_list_id: {type: 'string'},
                input_list: {
                    $ref: '#/components/schemas/List'
                },
                output_list_id: {type: 'string'},
                output_list: {
                    $ref: '#/components/schemas/List'
                }
            },
        },
        GameCreateUpdateBody: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                plugins: {type: 'string', description: "Comma-separated list of plugins names enabled for the game instance.", example: "GLADIATOR_SORT,RELATED_ITEMS,DELTA"},
                input_list_id: {type: 'string'},
                output_list_id: {type: 'string'},
            },
        },
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
        GameRequestBody: {
            value: {
                name: "Example Game",
                description: "This is an example game.",
                input_list_id: null,
                output_list_id: null,
            },
        },
        GameUpdateRequestBody: {
            value: {
                name: "Updated Example Game",
                description: "This is an updated example game.",
            },
        },
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
