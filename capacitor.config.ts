import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.daarussyifa.app',
    appName: 'DISA: Daarussyifa Islamic Super App',
    webDir: 'out',
    server: {
        url: 'https://app.majelisdaarussyifa.com',
        androidScheme: 'https',
        allowNavigation: [
            'app.majelisdaarussyifa.com',
            'localhost',
            '*.google.com',
            '*.googleapis.com',
            'accounts.google.com'
        ]
    },
    plugins: {
        GoogleAuth: {
            scopes: ['profile', 'email'],
            serverClientId: '722190074692-jk9h1cmc9nepjjp5n8j7s9vjlc4jd42i.apps.googleusercontent.com',
            forceCodeForRefreshToken: true,
        },
    },
};

export default config;
