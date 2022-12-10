export const swaggerDefinitionComponents = {
    schemas: {
        Game: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                plugins: {
                    type: 'string',
                    description:
                        'Comma-separated list of plugins names enabled for the game instance.',
                    example: 'GLADIATOR_SORT,RELATED_ITEMS,DELTA',
                },
                input_list_id: { type: 'string' },
                input_list: {
                    $ref: '#/components/schemas/List',
                },
                output_list_id: { type: 'string' },
                output_list: {
                    $ref: '#/components/schemas/List',
                },
            },
        },
        GameCreateUpdateBody: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                plugins: {
                    type: 'string',
                    description:
                        'Comma-separated list of plugins names enabled for the game instance.',
                    example: 'GLADIATOR_SORT,RELATED_ITEMS,DELTA',
                },
                input_list_id: { type: 'string' },
                output_list_id: { type: 'string' },
            },
        },
        GameRoundResultsRequestBody: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    picked: {
                        type: 'object',
                        properties: { id: { type: 'string' } },
                    },
                    not_picked: {
                        type: 'object',
                        properties: { id: { type: 'string' } },
                    },
                },
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
        ListItem: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
            },
        },
        User: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
            },
        },
    },
    examples: {
        GameRequestBody: {
            value: {
                name: 'Example Game',
                description: 'This is an example game.',
                input_list_id: null,
                output_list_id: null,
            },
        },
        GameUpdateRequestBody: {
            value: {
                name: 'Updated Example Game',
                description: 'This is an updated example game.',
            },
        },
        GameRoundResultsRequestBody: {
            value: [
                { picked: { id: 'a' }, not_picked: { id: 'b' } },
                { picked: { id: 'c' }, not_picked: { id: 'a' } },
                { picked: { id: 'c' }, not_picked: { id: 'd' } },
            ],
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
        ListUpdateRequestBody: {
            value: {
                name: 'Updated Example List',
                description: 'Updated example list.',
            },
        },
        ListCreateItemsRequestBody: {
            value: [
                {
                    name: 'New List Item #1',
                    description: 'New List Item #1',
                },
                {
                    name: 'New List Item #2',
                    description: 'New List Item #2.',
                },
                {
                    name: 'New List Item #3',
                    description: 'New List Item #3.',
                },
            ],
        },
        UserRequestBody: {
            value: {
                name: 'Example User',
            },
        },
        UserUpdateRequestBody: {
            value: {
                name: 'Updated User',
            },
        },
    },
}
