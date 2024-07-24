const fs = require("fs");

const FRONTEND_CONFIG_FILE_NAME = "mempool-frontend-config.json";

let configContent;

// Read frontend config
try {
  const rawConfig = fs.readFileSync(FRONTEND_CONFIG_FILE_NAME);
  configContent = JSON.parse(rawConfig);
  console.log(`${FRONTEND_CONFIG_FILE_NAME} file found, using provided config`);
} catch (e) {
  console.log(e);
  if (e.code !== "ENOENT") {
    throw new Error(e);
  } else {
    console.log(
      `${FRONTEND_CONFIG_FILE_NAME} file not found, using default config`
    );
  }
}

let PROXY_CONFIG = [];

PROXY_CONFIG.push(
  ...[
    {
      context: ["/api/v1/**"],
      target: `http://localhost:8999`,
      secure: false,
      ws: true,
      changeOrigin: true,
      proxyTimeout: 30000,
    },
    {
      context: ["/api/**"],
      target: `https://ferritecoin.com`,
      secure: false,
      changeOrigin: true,
      proxyTimeout: 30000,
    },
  ]
);

console.log(PROXY_CONFIG);

module.exports = PROXY_CONFIG;
