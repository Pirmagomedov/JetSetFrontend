const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: {
        main: './src/index.tsx',
        'service-worker': './src/assets/service-worker.js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.tsx', '.ts'],
        alias: {
            src: path.resolve(__dirname, 'src/'),
            assets: path.resolve(__dirname, 'src/assets/'),
            images: path.resolve(__dirname, 'src/assets/images/'),
        },
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        chunkFilename: '[id].js',
        publicPath: '/',
        clean: true,
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                exclude: /\.module.(s(a|c)ss)$/,
                test: /\.(scss|css)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(svg|png|jpg|pdf|gif)$/,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ],
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            name: false,
            cacheGroups: {
                styles: {
                    name: false,
                    test: /\.(scss|css)$/,
                    chunks: 'all',
                    enforce: true,
                },
            },
        },
        runtimeChunk: true,
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/assets/images/favicon/site.webmanifest',
                    to: 'site.webmanifest',
                },
                {
                    from: 'src/assets/images/favicon/android-chrome-192x192.png',
                    to: 'android-chrome-192x192.png',
                },
                {
                    from: 'src/assets/images/favicon/android-chrome-512x512.png',
                    to: 'android-chrome-512x512.png',
                },
            ],
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/index.html'),
            filename: 'index.html',
            inject: 'body',
            title: 'Chaching',
        }),
        new MiniCssExtractPlugin({
           ignoreOrder: true
        }),
        new CopyPlugin({
            patterns: [{ from: './src/assets', to: 'assets' }],
        }),
        new CleanWebpackPlugin(),
        new NodePolyfillPlugin(),
        new Dotenv({
            path: `./.env`,
        }),
    ],
}
