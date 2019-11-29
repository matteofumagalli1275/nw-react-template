const webpack = require("webpack");
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const fs = require('fs');
const webpack_config_common = require('./webpack.config.js')
const utils = require('./utils')
const release_folder = '../build_release/';

const nw_options = [path.resolve(__dirname, release_folder)]


const webpack_config_release = {
    mode: 'production',
    output: {
        path: path.resolve(__dirname, release_folder),
        filename: "bundle.js"
    }
}

var webpack_config = {
    ...webpack_config_release,
    ...webpack_config_common
}

console.log('Starting...')

var startWebpack = function() {
    return new Promise((resolve, reject) => {
		webpack(webpack_config, (err, stats) => {
			if (err || stats.hasErrors()) {
				reject(err)
			}
			resolve()
		});
    });
}

/* We only run webpack for building the application. No dev server. */
var finalizeBuild = function() {
    return new Promise((resolve, reject) => {
        try {

			const content = fs.readFileSync(path.resolve(__dirname, '../src/nw_package.json'))
			const nw_config = JSON.parse(content)
			/* Should customize json? */
			fs.writeFileSync(path.resolve(__dirname, `${release_folder}package.json`),JSON.stringify(nw_config, null, 2));
		
			utils.copyDir(path.resolve(__dirname, '../src/res'), path.resolve(__dirname, `${release_folder}res`))
			
            resolve()
        } catch (err) {
            reject(err)
        }
    });
}

startWebpack()
    .then(() => {
        return finalizeBuild()
    }).then(() => {
        console.log("===Build completed===")
    }).catch(err => {
        console.error("===Build failed=== \n" + err)
    })