const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack')
const dotenv = require('dotenv')

dotenv.config();

module.exports = {
    mode: "production",
    entry: {
        index: path.resolve(__dirname, "..", "src", "index.tsx"),
    },
    output: {
        path: path.join(__dirname, "../dist"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js", ".tsx"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: ["ts-loader"],
            },
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: ".", to: ".", context: "public" }]
        }),
        new webpack.DefinePlugin({ 'process.env': JSON.stringify(process.env) })
    ],
};