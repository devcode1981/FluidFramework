const path = require("path");
const merge = require("webpack-merge");
const nodeExternals = require("webpack-node-externals");

module.exports = env => {
    const isProduction = env === "production";
    const tsconfig = isProduction
        ? "tsconfig.dev.json" // TODO: "tsconfig.prod.json"
        : "tsconfig.dev.json";
    const styleLocalIdentName = isProduction
        ? "[hash:base64:5]"
        : "[path][name]-[local]-[hash:base64:5]"

    return merge({
        entry: { main: "./src/index.tsx" },
        resolve: { extensions: [".ts", ".tsx", ".js"] },
        
        // We use WebPack to bundle assets like CSS, but do not require WebPack to bundle our dependencies since
        // the output of this pack package is rebundled by the consuming apps ('routerlicious' and 'flow-app')
        // target: "node",                 // Do not bundle built-in node modules (e.g., 'fs', 'path', etc.)
        // externals: [nodeExternals()],   // Do not bundle modules in /node_modules/ folder 

        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: ["source-map-loader"],
                    exclude: /node_modules/,
                    enforce: "pre"
                },
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    options: { 
                        configFile: tsconfig,
                        // ts-loader v4.4.2 resolves the 'declarationDir' for .d.ts files relative to 'outDir'.
                        // This is different than 'tsc', which resolves 'declarationDir' relative to the location
                        // of the tsconfig. 
                        compilerOptions: {
                            declarationDir: ".",
                        }
                    },
                },
                {
                    test: /\.css$/,
                    use: [
                        "style-loader", // creates style nodes from JS strings
                        "css-loader", // translates CSS into CommonJS
                    ]
                }
                // {
                //     test: /\.css$/,
                //     include: path.join(__dirname, 'src'),
                //     use: [
                //         'style-loader', {
                //             loader: 'typings-for-css-modules-loader',
                //             options: {
                //                 modules: true,
                //                 namedExport: true,
                //                 localIdentName: styleLocalIdentName
                //             }
                //         },
                //         "css-loader", // translates CSS into CommonJS
                //     ]
                // }
        ]
        },
        output: {
            filename: "[name].bundle.js",
            path: path.resolve(__dirname, "dist"),
            library: "[name]",
            // https://github.com/webpack/webpack/issues/5767
            // https://github.com/webpack/webpack/issues/7939            
            devtoolNamespace: "flow-host",
            libraryTarget: "umd",
            publicPath: "/dist/",
        },
        devServer: {
            contentBase: [path.resolve(__dirname, 'assets')],
        }
    }, isProduction
        ? require("./webpack.prod")
        : require("./webpack.dev"));
};
