const webpack = require("webpack");
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const process = require('process');
const fs = require('fs');
const utils = require('./utils')
const webpack_config_common = require('./webpack.config.js')
const debug_folder = '../build_debug/';
const port = 8080;

var webpack_dev_server

const webpack_dev_server_options = {
	// Do not open the browser
    open: false,
	// Enable hot reloading
    hot: true,
	// Enable live reloading
    inline: true,
	/* Disable cross origin check. Hot reloading cause "Invalid Host/Origin header" message
	 * because webpack with node-webkit target sends requests with origin chrome-extension://<random_id> and not localhost.
	 * We run this configuration only for testing the desktop application, so it is not important
	 */
	disableHostCheck: true
};

/* Enable remote chrome debugging for attaching an external IDE */
const nw_options = '--remote-debugging-port=9222'

const webpack_config_debug = {
    mode: 'development',
	// Enable source map for debugging bundled script
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, debug_folder),
        filename: "bundle.js"
    },
	// Enable hot reloading plugin
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
}

/* Merge common webpack configuration and debug-only options */ 
var webpack_config = {
    ...webpack_config_debug,
    ...webpack_config_common
}

console.log('Starting...')

var startWebpack = function () {
    return new Promise((resolve, reject) => {

        const compiler = webpack(webpack_config);
        webpack_dev_server = new WebpackDevServer(compiler, webpack_dev_server_options);

        compiler.hooks.done.tap('Done', (context, entry) => {
            resolve()
        });

        webpack_dev_server.listen(port, 'localhost', function (err) {
            if (err) {
                reject(err)
            }
        })
    });
}

var startNw = function () {
    return new Promise((resolve, reject) => {
        try {

            /* Create debug folder if it does not exist */
            if (!fs.existsSync(path.resolve(__dirname, debug_folder))) {
                fs.mkdirSync(path.resolve(__dirname, debug_folder));
            }
            /* Copy local resources used by the desktop application. If possible we use symlink to speed up and have less overhead */
            try {
                if (!fs.existsSync(path.resolve(__dirname, `${debug_folder}res`))) {
                    fs.symlinkSync(path.resolve(__dirname, '../src/res'), path.resolve(__dirname, `${debug_folder}res`))
                }
            } catch (err) {
                console.warn('Failed to use symlink, fallback to dir copy');
                utils.copyDir(path.resolve(__dirname, '../src/res'), path.resolve(__dirname, `${debug_folder}res`))
            }

            /* Nw.js requires a package.json and the root index file.
             * Due to an annoying issue with Nw not reloading itself correctly when having main as localhost (it spawns two times the window instead
             * of closing the old one) i created a index_debug.html that tricks it into thinking we are loading a local page.
             * But inside we have an iframe loading localhost
             */
            const content = fs.readFileSync(path.resolve(__dirname, '../src/nw_package.json'))
            const nw_config = JSON.parse(content)
            nw_config['main'] = "index_debug.html";
			/* Since we are loading the application from an iframe loading localhost, allow nodejs modules on all localhost domain */
            nw_config['node-remote'] = "http://localhost/*";
			/* Put package.json and index_debug.html in the build drectory */
            fs.writeFileSync(path.resolve(__dirname, `${debug_folder}package.json`), JSON.stringify(nw_config, null, 2));
            fs.copyFileSync(path.resolve(__dirname, 'index_debug.html'), path.resolve(__dirname, `${debug_folder}index_debug.html`))

            /* Launch Nw.js */
            const { exec } = require('child_process');
            child = exec('nw ' + nw_options,
                {
                    cwd: path.resolve(__dirname, debug_folder),
                    detached: false,
                    stdio: 'ignore'
                }
            )

            child.on('close', (exit_code) => {
                if (typeof webpack_dev_server !== 'undefined' && webpack_dev_server !== null) {
                    webpack_dev_server.close()
                }
            });

            resolve()
        } catch (err) {
            reject(err)
        }
    });
}

startWebpack()
    .then(() => {
        return startNw()
    }).then(() => {
        console.log("===Nw started===")
    }).catch(err => {
        console.error("===Nw failed starting=== \n" + err)
        if (typeof webpack_dev_server !== 'undefined' && webpack_dev_server !== null) {
            webpack_dev_server.close()
        }
    })