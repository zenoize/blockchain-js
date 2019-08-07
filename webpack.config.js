const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const UglifyEsPlugin = require('uglify-es-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const serverConfig = {
    target: 'node',
    entry: {
        // myEmitter: "./src/myEmitter.js",
        // queryBuilder: "./src/queryBuilder.js",
        // blockchain: "./src/blockchain/index.js",
        // wrapper: "./src/blockchain/wrapper.js",
        // minter: "./src/blockchain/MINTER/index.js",
        ethereum: "./src/blockchain/ETHEREUM/index.js",
        // api: "./src/blockchain/MINTER/modules/api.js",
        // config: "./src/blockchain/MINTER/modules/config.js",
        // explorer: "./src/blockchain/MINTER/modules/explorer.js",
        // util: "./src/blockchain/MINTER/modules/util.js",
        // wallet: "./src/blockchain/MINTER/modules/wallet.js",
    },
    output: {
        library: 'abr-blockchain',
        libraryTarget: 'umd'
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new UglifyEsPlugin({
            mangle: false
            // {
            //     reserved: [
            //         'Buffer',
            //         'BigInteger',
            //         'Point',
            //         'ECPubKey',
            //         'ECKey',
            //         'sha512_asm',
            //         'asm',
            //         'ECPair',
            //         'HDNode',
            //     ]
            // }
        }),
        // new TerserPlugin({
        //     parallel: true,
        //     terserOptions: {
        //        ecma: 6,
        //     },
        // }),
    ],
    optimization: {
        namedModules: true,
        namedChunks: true,
        splitChunks: {
            cacheGroups: {
                default: false
            }
        },
        // minimizer: [
        //     new TerserPlugin({
        //         parallel: true,
        //         terserOptions: {
        //           ecma: 6,
        //         },
        //     })
        // ]
    }
};

module.exports = serverConfig
