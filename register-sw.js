if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker berhasil didaftarkan: ', registration.scope);
            })
            .catch(error => {
                console.log('Pendaftaran ServiceWorker gagal: ', error);
            });
    });
}