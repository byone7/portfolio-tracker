const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3456;

const server = http.createServer((req, res) => {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 메인 페이지
    if (req.url === '/' || req.url === '/index.html') {
        const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // Yahoo Finance 프록시
    if (req.url.startsWith('/api/yahoo/')) {
        const urlParts = new URL(req.url, `http://localhost:${PORT}`);
        const symbol = decodeURIComponent(urlParts.pathname.replace('/api/yahoo/', ''));
        const range = urlParts.searchParams.get('range') || '2d';
        const interval = urlParts.searchParams.get('interval') || '1d';
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;

        https.get(yahooUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
        }, (proxyRes) => {
            let data = '';
            proxyRes.on('data', chunk => data += chunk);
            proxyRes.on('end', () => {
                res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (e) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        });
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`\n  Portfolio Tracker 실행 중!`);
    console.log(`  http://localhost:${PORT}\n`);
    console.log(`  종료하려면 Ctrl+C\n`);
});
