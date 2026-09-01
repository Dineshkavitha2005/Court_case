const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 8765;
const host = '127.0.0.1';
const root = process.cwd();

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

// Load village database JSON if available
let villageData = null;
const jsonDbPath = path.join(root, 'villages.json');

function loadVillageData() {
    try {
        if (fs.existsSync(jsonDbPath)) {
            const raw = fs.readFileSync(jsonDbPath, 'utf-8');
            villageData = JSON.parse(raw);
            console.log(`Loaded Village Database: ${villageData.total_districts} districts, ${villageData.total_villages} villages.`);
        }
    } catch (err) {
        console.error("Error loading villages.json:", err.message);
    }
}
loadVillageData();

// Load 10,000 Survey Numbers dataset
let surveyNumbers = [];
const surveyDbPath = path.join(root, 'survey_numbers.json');

function loadSurveyNumbers() {
    try {
        if (fs.existsSync(surveyDbPath)) {
            const raw = fs.readFileSync(surveyDbPath, 'utf-8');
            surveyNumbers = JSON.parse(raw);
            console.log(`Loaded ${surveyNumbers.length} Survey Numbers from dataset.`);
        }
    } catch (err) {
        console.error("Error loading survey_numbers.json:", err.message);
    }
}
loadSurveyNumbers();

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const urlPath = decodeURIComponent(parsedUrl.pathname);

    // API Routes
    if (urlPath === '/api/districts') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        const districts = villageData ? villageData.districts : [];
        res.end(JSON.stringify({ state: "Tamil Nadu", total: districts.length, districts }));
        return;
    }

    if (urlPath === '/api/villages') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        let list = villageData ? villageData.villages : [];
        const query = (parsedUrl.query.q || '').toLowerCase().trim();
        const distFilter = (parsedUrl.query.district || '').toLowerCase().trim();

        if (distFilter) {
            list = list.filter(v => v.district.toLowerCase() === distFilter);
        }
        if (query) {
            list = list.filter(v =>
                v.name.toLowerCase().includes(query) ||
                v.district.toLowerCase().includes(query) ||
                v.sub_district.toLowerCase().includes(query)
            );
        }

        res.end(JSON.stringify({
            total: list.length,
            results: list.slice(0, 100) // cap to 100 results per request
        }));
        return;
    }

    if (urlPath === '/api/surveynumbers') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        const query = (parsedUrl.query.q || '').toLowerCase().trim();
        let list = surveyNumbers;
        if (query) {
            list = surveyNumbers.filter(sn => sn.toLowerCase().startsWith(query) || sn.toLowerCase().includes(query));
        }
        res.end(JSON.stringify({
            total: list.length,
            results: list.slice(0, 50) // top 50 matches
        }));
        return;
    }

    if (urlPath === '/api/stats') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            state: villageData ? villageData.state : "Tamil Nadu",
            source: villageData ? villageData.source : "https://vlist.in/state/33.html",
            total_districts: villageData ? villageData.total_districts : 0,
            total_sub_districts: villageData ? villageData.total_sub_districts : 0,
            total_villages: villageData ? villageData.total_villages : 0,
            total_survey_numbers: surveyNumbers.length
        }));
        return;
    }

    // Static File Serving
    const relativePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
    const filePath = path.resolve(root, relativePath);

    if (!filePath.startsWith(root)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }

        res.writeHead(200, {
            'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream'
        });
        res.end(data);
    });
});

server.listen(port, host, () => {
    console.log(`LandGuard running at http://${host}:${port}`);
});
