const swaggerDefinition = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: '2BTTNS API - OpenAPI 3.0',
            description:
                "The official 2bttns API.",
            version: '0.1.0',
        },
        externalDocs: {
            description: 'Find out more about Swagger',
            url: 'http://swagger.io',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}`,
            },
        ],
        tags: [
            {
                name: 'lists',
                description: 'Manage lists',
            },
        ],
    },
}

export default swaggerDefinition
