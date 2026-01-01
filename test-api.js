const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000, // Default port
    path: '/api/articles',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const articles = JSON.parse(data);
            console.log(`Total articles returned: ${articles.length}`);
            const drafts = articles.filter(a => a.status === 'draft');
            console.log(`Drafts returned: ${drafts.length}`);
            if (drafts.length > 0) {
                console.log('FAIL: API is still returning drafts!');
                console.log('Sample draft:', drafts[0].title);
            } else {
                console.log('SUCCESS: API is NOT returning drafts.');
            }
        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
