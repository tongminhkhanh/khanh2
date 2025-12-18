const axios = require('axios');

async function testSlugApi() {
    try {
        // Assuming the server is running on port 3000
        const baseUrl = 'http://localhost:3000';

        // 1. Fetch all articles to get a slug
        console.log('Fetching all articles...');
        const articlesRes = await axios.get(`${baseUrl}/api/articles`);
        const articles = articlesRes.data;

        if (articles.length === 0) {
            console.log('No articles found to test.');
            return;
        }

        const article = articles[0];
        console.log(`Testing with article: ${article.title} (Slug: ${article.slug})`);

        if (!article.slug) {
            console.error('Article does not have a slug!');
            return;
        }

        // 2. Fetch article by slug via API
        console.log(`Fetching article by slug: ${article.slug}...`);
        const slugRes = await axios.get(`${baseUrl}/api/articles/${article.slug}`);

        if (slugRes.status === 200 && slugRes.data._id === article._id) {
            console.log('SUCCESS: Fetched article by slug correctly.');
        } else {
            console.error('FAILURE: API response does not match expected article.');
        }

        // 3. Test public URL (HTML response)
        // Note: This might return HTML, so we just check status 200
        console.log(`Testing public URL: /bai-viet/${article.slug}...`);
        try {
            const publicRes = await axios.get(`${baseUrl}/bai-viet/${article.slug}`);
            if (publicRes.status === 200) {
                console.log('SUCCESS: Public URL is accessible.');
            }
        } catch (err) {
            console.error('FAILURE: Public URL not accessible:', err.message);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testSlugApi();
