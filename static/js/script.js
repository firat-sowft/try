document.addEventListener('DOMContentLoaded', () => {
    // API isteği yapmadan önce DOM elementlerinin varlığını kontrol et
    const splashScreen = document.getElementById('splash-screen');
    const loginPage = document.getElementById('login-page');
    const notification = document.getElementById('notification');
    
    if (!splashScreen || !loginPage || !notification) {
        console.error('Required DOM elements not found');
        return;
    }

    // Artık API URL'ye ihtiyaç yok çünkü aynı domainde çalışıyoruz
    // API isteklerini göreceli yollarla yapacağız
    
    // API ve DB durumunu kontrol et
    fetch('/db-test')
        .then(response => response.json())
        .then(data => {
            console.log('Database Status:', data);
            if (data.status === 'success') {
                showNotification('Sunucu bağlantısı başarılı!');
            }
        })
        .catch(error => {
            console.error('Database Error:', error);
            showNotification('Sunucu bağlantısında hata!', true);
        });

    // Splash screen'i 3 saniye sonra gizle
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        loginPage.classList.remove('hidden');
    }, 3000);

    // ...existing event listeners...

    // Tüm fetch çağrılarından API_URL'yi kaldır
    // Örnek:
    // fetch('/login', ...)
    // fetch('/register', ...)
});
