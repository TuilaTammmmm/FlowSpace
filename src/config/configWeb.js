// Cấu hình chung cho toàn bộ website (Web Configuration)
export const APP_CONFIG = {
    APP_NAME: 'FlowSpace',
    VERSION: '1.0.0',
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    SUPPORT_EMAIL: 'support@flowspace.com'
};

export const UI_CONFIG = {
    SIDEBAR_WIDTH_PX: 250,
    TOAST_DURATION_MS: 3000,
    DEFAULT_THEME: 'light'
};

// Bạn có thể lưu các biến cấu hình giao diện, SEO, metadata của web tại đây
