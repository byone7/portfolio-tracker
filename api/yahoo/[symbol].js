const https = require('https');

module.exports = (req, res) => {
    const { symbol } = req.query;
    const range = req.query.range || '2d';
    const interval = req.query.interval || '1d';
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;

    https.get(yahooUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
    }, (proxyRes) => {
        let data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');
            res.status(proxyRes.statusCode).send(data);
        });
    }).on('error', (e) => {
        res.status(500).json({ error: e.message });
    });
};
