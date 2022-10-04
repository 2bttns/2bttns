import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { createSwaggerSpec } from 'next-swagger-doc'
import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'
import swaggerDefinition from '../../docs/swaggerDefinition'

const SwaggerUI = dynamic<{
    spec: any
}>(import('swagger-ui-react') as any, { ssr: false })

function ApiDoc({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
    return <SwaggerUI spec={spec} />
}

export const getStaticProps: GetStaticProps = async () => {
    const spec: Record<string, any> = createSwaggerSpec(swaggerDefinition)

    return {
        props: {
            spec,
        },
    }
}

export default ApiDoc
