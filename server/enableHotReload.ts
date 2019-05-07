// import chokidar from "chokidar";
// import core from "express";
// import webpack from "webpack";
// import webpackDevMiddleware from "webpack-dev-middleware";
// import webpackHotMiddleware from "webpack-hot-middleware";
// const webpackConfig = require("../../webpack.config.dev");
// const compiler = webpack(webpackConfig);

// export const enableHotReload = (app: core.Express) => {
//   app.use(
//     webpackDevMiddleware(compiler, {
//       publicPath: webpackConfig.output.publicPath
//     })
//   );
//   app.use(webpackHotMiddleware(compiler));
//   // Do "hot-reloading" of express stuff on the server
//   // Throw away cached modules and re-require next time
//   // Ensure there's no important state in there!
//   const watcher = chokidar.watch("./server");
//   watcher.on("ready", () => {
//     watcher.on("all", () => {
//       console.log("Clearing /server/ module cache from server");
//       Object.keys(require.cache).forEach(id => {
//         if (/\/server\//.test(id)) delete require.cache[id];
//       });
//     });
//   });
// };
