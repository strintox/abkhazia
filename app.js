// Основной файл приложения
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, что все нужные объекты загружены
    if (typeof firebase !== 'undefined' && 
        typeof Auth !== 'undefined' && 
        typeof News !== 'undefined' && 
        typeof Admin !== 'undefined') {
        
        console.log('Новостной портал успешно инициализирован');
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