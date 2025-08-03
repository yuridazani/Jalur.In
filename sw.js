const CACHE_NAME = 'jalurin-cache-v1';
const urlsToCache = [
    '/',
    'index.html',
    'dashboard.html',
    'dashboard.js',
    'manifest.json',
    'icons/icon-192x192.png',
    'icons/icon-512x512.png',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Event saat Service Worker di-install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache dibuka');
                return cache.addAll(urlsToCache);
            })
    );
});

// Event saat ada permintaan (fetch) dari aplikasi
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Jika file ditemukan di cache, kembalikan dari cache
                if (response) {
                    return response;
                }
                // Jika tidak, coba ambil dari internet
                return fetch(event.request);
            })
    );
});