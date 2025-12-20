const API = {
    // Main request method
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API.BASE_URL}${endpoint}`;
        const token = Utils.getToken();

        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            Utils.error('API Error:', error);
            throw error;
        }
    },

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // File upload
    async uploadFile(endpoint, file) {
        const formData = new FormData();
        formData.append('file', file);

        const token = Utils.getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Upload failed');
            }

            return await response.json();
        } catch (error) {
            Utils.error('Upload Error:', error);
            throw error;
        }
    }
};

// Freeze to prevent modifications
Object.freeze(API);
