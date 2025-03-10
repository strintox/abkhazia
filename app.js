// Основной файл приложения
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, что все нужные объекты загружены
    if (typeof firebase !== 'undefined' && 
        typeof Auth !== 'undefined' && 
        typeof News !== 'undefined' && 
        typeof Admin !== 'undefined') {
        
        console.log('Новостной портал успешно инициализирован');
        
        // Отслеживаем IP пользователя
        trackUserVisit();
    } else {
        console.error('Ошибка при инициализации приложения. Проверьте подключение скриптов.');
    }

    // Обработчик закрытия модальных окон при клике вне их содержимого
    window.addEventListener('click', (e) => {
        const authModal = document.getElementById('authModal');
        const registerModal = document.getElementById('registerModal');
        const newsModal = document.getElementById('newsModal');
        
        if (e.target === authModal) {
            authModal.classList.add('hidden');
        }
        
        if (e.target === registerModal) {
            registerModal.classList.add('hidden');
        }
        
        if (e.target === newsModal) {
            newsModal.classList.add('hidden');
        }
    });
    
    // Запрет копирования текста с исключением для редактора
    document.addEventListener('copy', function(e) {
        // Проверяем, происходит ли копирование в редакторе
        if (e.target.closest('.editor-content') || e.target.hasAttribute('contenteditable')) {
            // Разрешаем копирование в редакторе
            return true;
        }
        
        e.preventDefault();
        alert('Копирование контента запрещено!');
    });
    
    document.addEventListener('contextmenu', function(e) {
        // Разрешаем контекстное меню в редакторе
        if (e.target.closest('.editor-content') || e.target.hasAttribute('contenteditable')) {
            return true;
        }
        
        e.preventDefault();
        alert('Контекстное меню отключено!');
    });
    
    // Запрет выделения текста с исключением для редактора
    document.addEventListener('selectstart', function(e) {
        // Разрешаем выделение в редакторе
        if (e.target.closest('.editor-content') || e.target.hasAttribute('contenteditable')) {
            return true;
        }
        
        // Запрещаем выделение в остальных местах
        return false;
    });
    
    // Отслеживание IP адреса и проверка на блокировку
    async function trackUserVisit() {
        try {
            // Получаем IP адрес пользователя
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            const ipAddress = data.ip;
            
            // Проверяем, заблокирован ли этот IP
            const ipDoc = await db.collection('ipAddresses').doc(ipAddress).get();
            
            if (ipDoc.exists) {
                const ipData = ipDoc.data();
                
                // Если IP заблокирован, показываем сообщение
                if (ipData.blocked) {
                    showBlockedMessage(ipAddress);
                    return;
                }
                
                // Обновляем данные о посещении
                await db.collection('ipAddresses').doc(ipAddress).update({
                    lastVisit: firebase.firestore.FieldValue.serverTimestamp(),
                    visits: firebase.firestore.FieldValue.increment(1)
                });
            } else {
                // Создаем новую запись об IP
                await db.collection('ipAddresses').doc(ipAddress).set({
                    firstVisit: firebase.firestore.FieldValue.serverTimestamp(),
                    lastVisit: firebase.firestore.FieldValue.serverTimestamp(),
                    visits: 1,
                    blocked: false
                });
            }
            
            console.log('IP-адрес отслежен:', ipAddress);
        } catch (error) {
            console.error('Ошибка при отслеживании IP:', error);
        }
    }
    
    // Показать сообщение о блокировке
    function showBlockedMessage(ipAddress) {
        // Создаем элемент сообщения о блокировке
        const blockedMessage = document.createElement('div');
        blockedMessage.className = 'ip-blocked-message';
        blockedMessage.innerHTML = `
            <div class="ip-blocked-content">
                <i class="fas fa-ban"></i>
                <h2>Доступ запрещен</h2>
                <p>Ваш IP-адрес (${ipAddress}) заблокирован администратором.</p>
            </div>
        `;
        
        // Добавляем стили для сообщения о блокировке
        const style = document.createElement('style');
        style.textContent = `
            .ip-blocked-message {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.5s ease;
            }
            
            .ip-blocked-content {
                background-color: #e74c3c;
                padding: 30px;
                border-radius: 8px;
                text-align: center;
                max-width: 90%;
                width: 500px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            }
            
            .ip-blocked-content i {
                font-size: 50px;
                color: white;
                margin-bottom: 15px;
            }
            
            .ip-blocked-content h2 {
                color: white;
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .ip-blocked-content p {
                color: white;
                font-size: 16px;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        
        // Добавляем стили и сообщение в документ
        document.head.appendChild(style);
        document.body.appendChild(blockedMessage);
        
        // Блокируем доступ ко всему контенту
        document.body.style.overflow = 'hidden';
        
        // Скрываем основное содержимое
        const elements = document.body.children;
        for (let i = 0; i < elements.length; i++) {
            if (elements[i] !== blockedMessage) {
                elements[i].style.display = 'none';
            }
        }
    }
    
    // Мобильный заголовок
    function createMobileHeader() {
        // Удаляем существующую кнопку профиля, если она уже есть
        const existingProfileLink = document.querySelector('.mobile-header');
        if (existingProfileLink) {
            existingProfileLink.remove();
        }
        
        // Создаем мобильную шапку
        const mobileHeader = document.createElement('div');
        mobileHeader.className = 'mobile-header';
        
        // Кнопка "Новостной"
        const newsButton = document.createElement('a');
        newsButton.href = 'index.html';
        newsButton.className = 'mobile-news-btn';
        newsButton.innerHTML = '<i class="fas fa-newspaper"></i> Новостной';
        
        // Кнопка "Мой профиль"
        const profileButton = document.createElement('a');
        profileButton.href = 'profile.html';
        profileButton.className = 'mobile-profile-btn';
        profileButton.innerHTML = '<i class="fas fa-user"></i> Мой профиль';
        
        // Добавляем кнопки в шапку
        mobileHeader.appendChild(newsButton);
        mobileHeader.appendChild(profileButton);
        
        // Скрываем стандартный заголовок на мобильных устройствах
        const header = document.querySelector('header');
        if (header) {
            header.classList.add('desktop-only');
        }
        
        // Добавляем мобильную шапку в начало body
        document.body.insertBefore(mobileHeader, document.body.firstChild);
        
        // Обновляем видимость кнопки профиля в зависимости от авторизации
        updateMobileHeaderVisibility();
    }
    
    // Функция для обновления видимости элементов мобильной шапки
    function updateMobileHeaderVisibility() {
        const profileButton = document.querySelector('.mobile-profile-btn');
        if (profileButton) {
            // Показываем кнопку профиля только если пользователь авторизован
            if (Auth && Auth.isAuthenticated()) {
                profileButton.style.display = 'flex';
            } else {
                profileButton.style.display = 'none';
            }
        }
    }
    
    // Создаем мобильный заголовок на мобильных устройствах
    if (window.innerWidth <= 768) {
        createMobileHeader();
    }
    
    // Слушаем события авторизации для обновления кнопки
    if (Auth) {
        // При изменении состояния авторизации
        auth.onAuthStateChanged(user => {
            if (window.innerWidth <= 768) {
                updateMobileHeaderVisibility();
            }
        });
    }
    
    // При изменении размера окна
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            const mobileHeader = document.querySelector('.mobile-header');
            if (!mobileHeader) {
                createMobileHeader();
            }
            
            // Скрываем стандартный заголовок
            const header = document.querySelector('header');
            if (header) {
                header.classList.add('desktop-only');
            }
        } else {
            // Удаляем мобильную шапку и показываем стандартный заголовок
            const mobileHeader = document.querySelector('.mobile-header');
            if (mobileHeader) {
                mobileHeader.remove();
            }
            
            const header = document.querySelector('header');
            if (header) {
                header.classList.remove('desktop-only');
            }
        }
    });
    
    // Плавная прокрутка для ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}); 