const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8'
};

const server = http.createServer((req, res) => {
    const cleanUrl = decodeURIComponent((req.url || '/').split('?')[0]);
    const safeRel = path.normalize(cleanUrl).replace(/^(\.\.[\/\\])+/, '').replace(/^[\/\\]+/, '');
    const targetPath = path.join(ROOT, safeRel);

    if (!targetPath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(targetPath, (err, stats) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }

        if (stats.isDirectory()) {
            const indexFile = path.join(targetPath, 'index.html');
            if (fs.existsSync(indexFile)) {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
                fs.createReadStream(indexFile).pipe(res);
                return;
            }

            // Listado simple de directorio (igual que python -m http.server) para autodescubrir JSONs nuevos
            fs.readdir(targetPath, (dirErr, files) => {
                if (dirErr) {
                    res.writeHead(500);
                    res.end('Error listing directory');
                    return;
                }
                const links = files.map(f => `<a href="${encodeURIComponent(f)}">${f}</a>`).join('<br>\n');
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
                res.end(`<!DOCTYPE html><html><body>${links}</body></html>`);
            });
            return;
        }

        const ext = path.extname(targetPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
        fs.createReadStream(targetPath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`Simulador AWS corriendo en: http://localhost:${PORT}/Examenes.html`);
});
