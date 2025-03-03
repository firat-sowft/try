document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://web-production-463f9.up.railway.app';
    
    // Bağlantı durumunu kontrol et
    fetch(`${API_URL}/db-test`)
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

    // API URL'sini güncelleyin
    // const API_URL = 'https://try-production.up.railway.app';
    
    // API'nin çalışıp çalışmadığını kontrol et
    fetch(`${API_URL}/health`)
        .then(response => response.json())
        .then(data => console.log('API Status:', data))
        .catch(error => console.error('API Error:', error));

    // Splash screen'i 3 saniye sonra gizle
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('login-page').classList.remove('hidden');
    }, 3000);

    // Sayfa geçişleri
    document.getElementById('register-btn').addEventListener('click', () => {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('register-page').classList.remove('hidden');
    });

    document.getElementById('back-to-login').addEventListener('click', () => {
        document.getElementById('register-page').classList.add('hidden');
        document.getElementById('login-page').classList.remove('hidden');
    });

    document.getElementById('forgot-password').addEventListener('click', () => {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('forgot-password-page').classList.remove('hidden');
    });

    function showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.remove('hidden');
        notification.classList.toggle('error', isError);
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Doğrulama kodu gönderme işlemleri
    document.getElementById('send-code-register').addEventListener('click', async () => {
        const email = document.getElementById('register-email').value;
        console.log(`Sending verification code to ${email}`);
        const response = await fetch(`${API_URL}/send-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
            },
            body: JSON.stringify({ email })
        });
        
        if (response.ok) {
            document.getElementById('verification-section-forgot').classList.remove('hidden');
        }
    });

    document.getElementById('save-register').addEventListener('click', async () => {
        const name = document.getElementById('register-name').value;
        const surname = document.getElementById('register-surname').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        const verificationCode = document.getElementById('verification-code-register').value;

        if (password !== passwordConfirm) {
            showNotification('Şifreler aynı olmalı.', true);
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/;
        if (!passwordRegex.test(password)) {
            showNotification('Şifre en az 8, en fazla 16 karakter olmalı, bir büyük harf, bir küçük harf ve bir rakam içermelidir.', true);
            return;
        }

        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, surname, email, password, verificationCode })
        });

        if (response.ok) {
            showNotification('Hesap başarıyla oluşturuldu!');
            document.getElementById('register-page').classList.add('hidden');
            document.getElementById('login-page').classList.remove('hidden');
        } else {
            const errorData = await response.json();
            showNotification(`Kayıt başarısız: ${errorData.error}`, true);
        }
    });

    document.getElementById('change-password').addEventListener('click', async () => {
        const email = document.getElementById('forgot-email').value;
        const verificationCode = document.getElementById('verification-code-forgot').value;
        const newPassword = document.getElementById('new-password').value;

        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, verificationCode, newPassword })
        });

        if (response.ok) {
            showNotification('Şifre başarıyla değiştirildi!');
            document.getElementById('forgot-password-page').classList.add('hidden');
            document.getElementById('login-page').classList.remove('hidden');
        } else {
            showNotification('Şifre değiştirme başarısız. Lütfen tekrar deneyin.', true);
        }
    });

    document.getElementById('login-btn').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'game.html';
        } else {
            const errorData = await response.json();
            showNotification(`Giriş başarısız: ${errorData.error}`, true);
        }
    });
});