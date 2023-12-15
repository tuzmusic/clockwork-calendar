/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildTarget: "netlify",
  server:
    process.env.NETLIFY || process.env.NETLIFY_LOCAL
      ? "./server.js"
      : undefined,
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: ".netlify/functions-internal/server.js",
  // publicPath: "/build/",
  serverModuleFormat: "cjs",
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
    // v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
};
