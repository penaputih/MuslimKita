
const https = require('https');

const url = 'https://api.quran.gading.dev/surah';

console.log(`Testing connection to: ${url}`);

https.get(url, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const parsedData = JSON.parse(data);
            console.log('Response data (first item):', parsedData.data ? parsedData.data[0] : parsedData);
        } catch (e) {
            console.log('Response body (not JSON):', data.substring(0, 200));
        }
    });

}).on('error', (e) => {
    console.error('Error:', e);
});
