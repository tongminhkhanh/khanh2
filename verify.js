const axios = require('axios');

async function verify() {
    const API_URL = 'http://localhost:3000/api';
    let token;

    try {
        // 1. Try Login
        console.log('Attempting Login...');
        try {
            const loginRes = await axios.post(`${API_URL}/login`, {
                username: 'admin',
                password: 'password123'
            });
            console.log('Login Success!');
            token = loginRes.data.token;
        } catch (e) {
            console.log('Login Failed, attempting Register...');
            // 2. Register if login failed
            await axios.post(`${API_URL}/register`, {
                username: 'admin',
                email: 'admin@school.edu.vn',
                fullName: 'Principal',
                password: 'password123'
            });
            console.log('Register Success!');

            // Login again
            const loginRes = await axios.post(`${API_URL}/login`, {
                username: 'admin',
                password: 'password123'
            });
            console.log('Login after Register Success!');
            token = loginRes.data.token;
        }

        // 3. Create Article
        console.log('Creating Article...');
        await axios.post(`${API_URL}/articles`, {
            title: 'Node Verification Article',
            content: 'Content from Node script',
            category: 'Tin tức',
            image: 'https://via.placeholder.com/150'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Article Created!');

        // 4. List Articles
        console.log('Listing Articles...');
        const articlesRes = await axios.get(`${API_URL}/articles`);
        console.log(`Found ${articlesRes.data.length} articles.`);

    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

verify();
