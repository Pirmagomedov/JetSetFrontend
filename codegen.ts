import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
    overwrite: true,
    schema: 'https://dev.wingform.com/graphql',
    documents: [
        'src/**/*.graphql',
        'src/**/**/*.graphql',
        'src/**/**/**/*.graphql',
        'src/**/**/**/**/*.graphql',
    ],
    generates: {
        'src/generated/graphql.ts': {
            //preset: "client",
            plugins: ['typescript-urql', 'typescript', 'typescript-operations'],
            config: {
                skipTypeNameForRoot: true,
                omitOperationSuffix: true,
                namingConvention: {
                    enumValues: 'keep',
                },
            },
        },
    },
}

export default config
