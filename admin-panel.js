// Объект для работы с панелью администратора
const Admin = {
    // Инициализация панели администратора
    init: function() {
        this.checkAdminAccess();
        this.setupEventListeners();
        this.setupMobileMenu();
    },

    // Проверка прав администратора
    checkAdminAccess: function() {
        // Проверяем наличие авторизованного пользователя
        auth.onAuthStateChanged(user => {
            const adminControls = document.getElementById('adminControls');
            const adminAccessDenied = document.getElementById('adminAccessDenied');
            const adminWelcomeMessage = document.getElementById('adminWelcomeMessage');
            
            if (user && user.email === "strintox@gmail.com") {
                // Пользователь администратор
                if (adminControls) adminControls.classList.remove('hidden');
                if (adminAccessDenied) adminAccessDenied.classList.add('hidden');
                if (adminWelcomeMessage) adminWelcomeMessage.textContent = `Добро пожаловать, ${user.displayName || user.email}!`;
                
                // Загружаем новости для управления
                this.loadNewsForManagement();
            } else {
                // Пользователь не администратор
                if (adminControls) adminControls.classList.add('hidden');
                if (adminAccessDenied) adminAccessDenied.classList.remove('hidden');
            }
        });
    },

    // Настройка обработчиков событий
    setupEventListeners: function() {
        const createNewsTabBtn = document.getElementById('createNewsTabBtn');
        const manageNewsTabBtn = document.getElementById('manageNewsTabBtn');
        const createNewsTab = document.getElementById('createNewsTab');
        const manageNewsTab = document.getElementById('manageNewsTab');
        const newsCreateForm = document.getElementById('newsCreateForm');
        const editNewsForm = document.getElementById('edit-news-form');
        const deleteNewsBtn = document.getElementById('delete-news-btn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        // Переключение вкладок
        if (createNewsTabBtn && manageNewsTabBtn) {
            createNewsTabBtn.addEventListener('click', () => {
                createNewsTabBtn.classList.add('active');
                manageNewsTabBtn.classList.remove('active');
                createNewsTab.classList.add('active');
                manageNewsTab.classList.remove('active');
            });
            
            manageNewsTabBtn.addEventListener('click', () => {
                manageNewsTabBtn.classList.add('active');
                createNewsTabBtn.classList.remove('active');
                manageNewsTab.classList.add('active');
                createNewsTab.classList.remove('active');
                
                // Загружаем новости при переключении на вкладку управления
                this.loadNewsForManagement();
            });
        }
        
        // Создание новости
        if (newsCreateForm) {
            newsCreateForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('news-title').value;
                const content = document.getElementById('news-content').value;
                
                this.createNews(title, content);
            });
        }
        
        // Редактирование новости
        if (editNewsForm) {
            editNewsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('edit-news-id').value;
                const title = document.getElementById('edit-news-title').value;
                const content = document.getElementById('edit-news-content').value;
                
                this.updateNews(id, title, content);
            });
        }
        
        // Удаление новости
        if (deleteNewsBtn) {
            deleteNewsBtn.addEventListener('click', () => {
                const id = document.getElementById('edit-news-id').value;
                this.confirmDeleteNews(id);
            });
        }
        
        // Обработка модальных окон
        document.addEventListener('click', (e) => {
            const editNewsModal = document.getElementById('editNewsModal');
            const confirmationModal = document.getElementById('confirmationModal');
            
            // Закрытие модальных окон при клике на фон
            if (e.target === editNewsModal) {
                editNewsModal.classList.add('hidden');
            }
            
            if (e.target === confirmationModal) {
                confirmationModal.classList.add('hidden');
            }
        });
        
        // Кнопки закрытия в модальных окнах
        const closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        });
        
        // Кнопки действий в модальном окне подтверждения
        const confirmYesBtn = document.getElementById('confirmYesBtn');
        const confirmNoBtn = document.getElementById('confirmNoBtn');
        
        if (confirmYesBtn) {
            confirmYesBtn.addEventListener('click', () => {
                const newsId = confirmYesBtn.getAttribute('data-id');
                if (newsId) {
                    this.deleteNews(newsId);
                }
                document.getElementById('confirmationModal').classList.add('hidden');
            });
        }
        
        if (confirmNoBtn) {
            confirmNoBtn.addEventListener('click', () => {
                document.getElementById('confirmationModal').classList.add('hidden');
            });
        }
        
        // Выход
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                auth.signOut().then(() => {
                    window.location.href = 'index.html';
                });
            });
        }
    },

    // Настройка мобильного меню
    setupMobileMenu: function() {
        const mobileMenuToggle = document.createElement('button');
        mobileMenuToggle.className = 'mobile-menu-toggle';
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        
        const nav = document.querySelector('nav');
        const header = document.querySelector('header .container');
        
        // Добавляем кнопку мобильного меню только на мобильных устройствах
        if (window.innerWidth <= 768) {
            if (!document.querySelector('.mobile-menu-toggle')) {
                header.appendChild(mobileMenuToggle);
            }
        }
        
        // При изменении размера окна
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                if (!document.querySelector('.mobile-menu-toggle')) {
                    header.appendChild(mobileMenuToggle);
                }
            } else {
                const toggle = document.querySelector('.mobile-menu-toggle');
                if (toggle) {
                    toggle.remove();
                    nav.classList.remove('active');
                }
            }
        });
        
        // Открытие/закрытие мобильного меню
        mobileMenuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            if (nav.classList.contains('active')) {
                mobileMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
                document.body.style.overflow = 'hidden'; // Запрет прокрутки фона
            } else {
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = ''; // Разрешение прокрутки
            }
        });
        
        // Закрытие мобильного меню при клике на ссылку
        const navLinks = document.querySelectorAll('nav ul li a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    nav.classList.remove('active');
                    const toggle = document.querySelector('.mobile-menu-toggle');
                    if (toggle) toggle.innerHTML = '<i class="fas fa-bars"></i>';
                    document.body.style.overflow = '';
                }
            });
        });
    },
    
    // Загрузка новостей для управления
    loadNewsForManagement: function() {
        const adminNewsList = document.getElementById('adminNewsList');
        if (!adminNewsList) return;
        
        // Показываем индикатор загрузки
        adminNewsList.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Загрузка новостей...</span>
            </div>
        `;
        
        // Получаем новости из базы данных
        db.collection('news')
            .orderBy('createdAt', 'desc')
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    adminNewsList.innerHTML = `
                        <div class="no-news-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <p>Новости еще не созданы</p>
                        </div>
                    `;
                    return;
                }
                
                adminNewsList.innerHTML = '';
                
                snapshot.forEach(doc => {
                    const news = doc.data();
                    const date = news.createdAt ? news.createdAt.toDate() : new Date();
                    const formattedDate = new Intl.DateTimeFormat('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).format(date);
                    
                    const newsItem = document.createElement('div');
                    newsItem.className = 'admin-news-item';
                    newsItem.innerHTML = `
                        <div class="admin-news-info">
                            <h3 class="admin-news-title">${news.title}</h3>
                            <div class="admin-news-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</div>
                        </div>
                        <div class="admin-news-actions">
                            <button class="edit-news-btn" data-id="${doc.id}"><i class="fas fa-edit"></i> Редактировать</button>
                            <button class="delete-news-btn" data-id="${doc.id}"><i class="fas fa-trash"></i> Удалить</button>
                        </div>
                    `;
                    
                    adminNewsList.appendChild(newsItem);
                    
                    // Добавляем обработчики событий для кнопок
                    const editBtn = newsItem.querySelector('.edit-news-btn');
                    const deleteBtn = newsItem.querySelector('.delete-news-btn');
                    
                    editBtn.addEventListener('click', () => {
                        this.openEditNewsModal(doc.id, news.title, news.content);
                    });
                    
                    deleteBtn.addEventListener('click', () => {
                        this.confirmDeleteNews(doc.id);
                    });
                });
            })
            .catch(error => {
                console.error('Ошибка при загрузке новостей:', error);
                adminNewsList.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Ошибка при загрузке новостей</p>
                    </div>
                `;
            });
    },
    
    // Создание новости
    createNews: function(title, content) {
        // Проверяем, что заголовок и содержание не пустые
        if (!title.trim() || !content.trim()) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        // Создаем новость в базе данных
        db.collection('news').add({
            title: title,
            content: content,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            alert('Новость успешно создана!');
            document.getElementById('newsCreateForm').reset();
            
            // Переключаемся на вкладку управления новостями
            document.getElementById('manageNewsTabBtn').click();
        })
        .catch(error => {
            console.error('Ошибка при создании новости:', error);
            alert('Ошибка при создании новости: ' + error.message);
        });
    },
    
    // Открытие модального окна редактирования новости
    openEditNewsModal: function(id, title, content) {
        const modal = document.getElementById('editNewsModal');
        const idField = document.getElementById('edit-news-id');
        const titleField = document.getElementById('edit-news-title');
        const contentField = document.getElementById('edit-news-content');
        
        idField.value = id;
        titleField.value = title;
        contentField.value = content;
        
        modal.classList.remove('hidden');
    },
    
    // Обновление новости
    updateNews: function(id, title, content) {
        // Проверяем, что заголовок и содержание не пустые
        if (!title.trim() || !content.trim()) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        // Обновляем новость в базе данных
        db.collection('news').doc(id).update({
            title: title,
            content: content,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            alert('Новость успешно обновлена!');
            document.getElementById('editNewsModal').classList.add('hidden');
            this.loadNewsForManagement();
        })
        .catch(error => {
            console.error('Ошибка при обновлении новости:', error);
            alert('Ошибка при обновлении новости: ' + error.message);
        });
    },
    
    // Подтверждение удаления новости
    confirmDeleteNews: function(id) {
        const confirmationModal = document.getElementById('confirmationModal');
        const confirmYesBtn = document.getElementById('confirmYesBtn');
        const confirmMessage = document.getElementById('confirmationMessage');
        
        confirmMessage.textContent = 'Вы уверены, что хотите удалить эту новость? Это действие нельзя отменить.';
        confirmYesBtn.setAttribute('data-id', id);
        
        confirmationModal.classList.remove('hidden');
    },
    
    // Удаление новости
    deleteNews: function(id) {
        db.collection('news').doc(id).delete()
        .then(() => {
            alert('Новость успешно удалена!');
            document.getElementById('editNewsModal').classList.add('hidden');
            this.loadNewsForManagement();
        })
        .catch(error => {
            console.error('Ошибка при удалении новости:', error);
            alert('Ошибка при удалении новости: ' + error.message);
        });
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    Admin.init();
}); 