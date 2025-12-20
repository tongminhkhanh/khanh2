const CONFIG = {
    API: {
        BASE_URL: '/api',
        TIMEOUT: 10000
    },
    STORAGE: {
        TOKEN_KEY: 'admin-token'
    },
    UI: {
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 3000
    },
    VALIDATION: {
        MIN_TITLE_LENGTH: 5,
        MAX_TITLE_LENGTH: 200
    },
    FEATURES: {
        DARK_MODE: false,
        DRAFT_AUTO_SAVE: true
    }
};

// Freeze to prevent modifications
Object.freeze(CONFIG);
