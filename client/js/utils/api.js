const api = {
    async request(endpoint, options = {}) {
        const token = storage.get('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Request failed');
        }

        return data;
    },

    auth: {
        register(login, password, role) {
            return api.request('/users/register', {
                method: 'POST',
                body: JSON.stringify({ login, password, role })
            });
        },

        login(login, password) {
            return api.request('/users/login', {
                method: 'POST',
                body: JSON.stringify({ login, password })
            });
        },

        getProfile() {
            return api.request('/auth/profile');
        }
    },

    cards: {
        getAll() {
            return api.request('/cards');
        },

        getById(id) {
            return api.request(`/cards/${id}`);
        },

        create(cardData) {
            return api.request('/cards', {
                method: 'POST',
                body: JSON.stringify(cardData)
            });
        },

        update(id, cardData) {
            return api.request(`/cards/${id}`, {
                method: 'PUT',
                body: JSON.stringify(cardData)
            });
        },

        delete(id) {
            return api.request(`/cards/${id}`, {
                method: 'DELETE'
            });
        }
    },

    audio: {
        getAll() {
            return api.request('/audio');
        },

        getProgress() {
            return api.request('/audio/progress');
        }
    },

    texts: {
        getAll() {
            return api.request('/texts');
        },

        getById(id) {
            return api.request(`/texts/${id}`);
        }
    },

    progress: {
        get() {
            return api.request('/progress');
        },

        getTree() {
            return api.request('/progress/tree');
        },

        getAchievements() {
            return api.request('/progress/achievements');
        }
    }
};