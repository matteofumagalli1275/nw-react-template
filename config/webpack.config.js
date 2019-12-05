/* common webpack confiuguration both for debug and build */

const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: "./src/index.js",
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
        },
        {
            test: /\.css$/,
            use: ["style-loader", "css-loader"]
        }
        ]
    },
    target: "node-webkit",
    plugins: [
        new CopyPlugin([{
            from: 'src/template-res',
            to: './'
        }])
    ],
    resolve: {
        alias: {
            'react-dom': '@hot-loader/react-dom',
        },
    }
};