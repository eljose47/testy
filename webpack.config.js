const path = require("path"),
  HtmlPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const output = {
    entry: "./src/index.tsx",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: "/node_modules",
        },
      ],
    },
    plugins: [
      new HtmlPlugin({
        title: "Dev",
        template: "index.html",
      }),
    ],
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
  };

  if ((argv.mode = "development")) {
    (output.devtool = "inline-source-map"),
      (output.devServer = {
        static: "./dist",
        port: env.port ?? 3000,
      });
  }

  return output;
};
