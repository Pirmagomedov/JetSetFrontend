const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path')

module.exports = merge(common, {
    mode: 'development',
    optimization: {
        runtimeChunk: 'single',
    },
    devtool: 'inline-source-map',
    devServer: {
        hot: true,
        watchOptions: {
            ignored: /node_modules/,
        },
        historyApiFallback: true,
        port: 9000,
        proxy: {
            '/graphql': {
                target: 'https://dev.wingform.com',
                changeOrigin: true,
                cookieDomainRewrite: '',
            },
        },
    },
})
