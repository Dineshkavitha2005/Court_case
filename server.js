/**
 * LandGuard — Root Server Entry Point
 * Delegates to backend/server.js for convenient root execution.
 */

const server = require('./backend/server');

const PORT = process.env.PORT || 8765;
const HOST = process.env.HOST || '127.0.0.1';

if (require.main === module) {
    server.listen(PORT, HOST, () => {
        console.log(`====================================================`);
        console.log(` LandGuard Server Running at http://${HOST}:${PORT}`);
        console.log(` Security: Strict Path Traversal Defense & CSP Enabled`);
        console.log(`====================================================`);
    });
}

module.exports = server;

