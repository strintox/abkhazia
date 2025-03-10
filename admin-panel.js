// Объект для работы с панелью администратора
const AdminPanel = {
    // Инициализация панели администратора
    init: function() {
        console.log('Инициализация админ-панели');
        
        // Проверяем авторизацию и права администратора
        if (Auth) {
            console.log('Auth доступен, проверка прав администратора');
            console.log('Текущий пользователь:', Auth.currentUser ? Auth.currentUser.email : 'не авторизован');
            console.log('Статус админа:', Auth.isAdmin ? 'Да' : 'Нет');
        } else {
            console.error('Объект Auth не инициализирован!');
        }
        
        // Проверяем, является ли устройство мобильным
        this.isMobile = window.innerWidth <= 768;
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
        });
        
        // Проверяем, что пользователь авторизован как администратор
        this.checkAdminAccess();
        
        // Настройка обработчиков событий
        this.setupEventListeners();
        
        // Загружаем IP-адреса при открытии соответствующей вкладки
        this.setupIpManagement();
        
        // Добавляем заголовок "Новостной портал" если на мобильном
        if (this.isMobile) {
            this.addMobileHeader();
        }
    },
    
    // Добавляем мобильный заголовок
    addMobileHeader: function() {
        const container = document.querySelector('.admin-page-container');
        if (container) {
            const header = document.createElement('div');
            header.className = 'news-portal-header';
            header.innerHTML = '<i class="fas fa-newspaper"></i> Новостной портал';
            
            container.insertBefore(header, container.firstChild);
            
            // Обновляем кнопку
            const refreshBtn = document.createElement('button');
            refreshBtn.className = 'refresh-btn-top';
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить';
            refreshBtn.addEventListener('click', () => {
                this.loadIpAddresses();
            });
            
            container.insertBefore(refreshBtn, header.nextSibling);
        }
    },

    // Проверка прав администратора
    checkAdminAccess: function() {
        const adminHeader = document.getElementById('adminHeader');
        const adminAccessDenied = document.getElementById('adminAccessDenied');
        const adminControls = document.getElementById('adminControls');
        
        // Дополнительная проверка на админа через email
        const isAdmin = Auth && Auth.currentUser && 
                        Auth.currentUser.email && 
                        Auth.currentUser.email.toLowerCase() === "strintox@gmail.com";
        
        console.log('Проверка админских прав:');
        console.log('- Auth.isAdmin:', Auth && Auth.isAdmin);
        console.log('- Текущий email:', Auth && Auth.currentUser ? Auth.currentUser.email : 'нет');
        console.log('- Результат проверки:', isAdmin || (Auth && Auth.isAdmin));
        
        if (isAdmin || (Auth && Auth.isAdmin)) {
            // Пользователь имеет права администратора
            console.log('Доступ к админ-панели разрешен');
            
            if (adminHeader) adminHeader.classList.remove('hidden');
            if (adminAccessDenied) adminAccessDenied.classList.add('hidden');
            if (adminControls) adminControls.classList.remove('hidden');
            
            // Загружаем список новостей
            this.loadNews();
        } else {
            // Пользователь не имеет прав администратора
            console.log('Доступ к админ-панели запрещен');
            
            if (adminHeader) adminHeader.classList.add('hidden');
            if (adminAccessDenied) adminAccessDenied.classList.remove('hidden');
            if (adminControls) adminControls.classList.add('hidden');
        }
    },

    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Формы
        const newsCreateForm = document.getElementById('newsCreateForm');
        const editNewsForm = document.getElementById('edit-news-form');
        const deleteNewsBtn = document.getElementById('delete-news-btn');
        
        // Вкладки админ-панели
        const createNewsTabBtn = document.getElementById('createNewsTabBtn');
        const manageNewsTabBtn = document.getElementById('manageNewsTabBtn');
        const manageIpTabBtn = document.getElementById('manageIpTabBtn');
        
        // Модальные окна
        const editNewsModal = document.getElementById('editNewsModal');
        const confirmationModal = document.getElementById('confirmationModal');
        const closeButtons = document.querySelectorAll('.close');
        
        // Кнопки подтверждения действий
        const confirmYesBtn = document.getElementById('confirmYesBtn');
        const confirmNoBtn = document.getElementById('confirmNoBtn');
        
        // Обработка создания новости
        if (newsCreateForm) {
            newsCreateForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNews();
            });
        }
        
        // Обработка редактирования новости
        if (editNewsForm) {
            editNewsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateNews();
            });
        }
        
        // Обработка удаления новости
        if (deleteNewsBtn) {
            deleteNewsBtn.addEventListener('click', () => {
                const newsId = document.getElementById('edit-news-id').value;
                this.showConfirmation('Вы уверены, что хотите удалить эту новость?', () => {
                    this.deleteNews(newsId);
                });
            });
        }
        
        // Переключение вкладок админ-панели
        if (createNewsTabBtn && manageNewsTabBtn && manageIpTabBtn) {
            // Вкладка создания новости
            createNewsTabBtn.addEventListener('click', () => {
                this.switchTab('createNewsTab');
            });
            
            // Вкладка управления новостями
            manageNewsTabBtn.addEventListener('click', () => {
                this.switchTab('manageNewsTab');
                this.loadNews();
            });
            
            // Вкладка управления IP-адресами
            manageIpTabBtn.addEventListener('click', () => {
                this.switchTab('manageIpTab');
                this.loadIpAddresses();
            });
        }
        
        // Закрытие модальных окон
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                editNewsModal.classList.add('hidden');
                confirmationModal.classList.add('hidden');
            });
        });
        
        // Обработка кнопок подтверждения
        if (confirmYesBtn && confirmNoBtn) {
            // Кнопка "Да"
            confirmYesBtn.addEventListener('click', () => {
                // Выполняем действие и скрываем модальное окно
                if (typeof this.confirmCallback === 'function') {
                    this.confirmCallback();
                }
                confirmationModal.classList.add('hidden');
            });
            
            // Кнопка "Нет"
            confirmNoBtn.addEventListener('click', () => {
                // Отменяем действие и скрываем модальное окно
                confirmationModal.classList.add('hidden');
            });
        }
        
        // Поиск и обновление списка IP-адресов
        const searchIpInput = document.getElementById('searchIp');
        const refreshIpListBtn = document.getElementById('refreshIpList');
        
        if (searchIpInput) {
            searchIpInput.addEventListener('input', () => {
                this.filterIpAddresses(searchIpInput.value);
            });
        }
        
        if (refreshIpListBtn) {
            refreshIpListBtn.addEventListener('click', () => {
                this.loadIpAddresses();
            });
        }
    },

    // Переключение вкладок админ-панели
    switchTab: function(tabId) {
        // Скрываем все вкладки
        const tabContents = document.querySelectorAll('.admin-tab-content');
        tabContents.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Сбрасываем активные кнопки вкладок
        const tabButtons = document.querySelectorAll('.admin-tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Показываем выбранную вкладку
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Активируем соответствующую кнопку
        const tabButton = document.querySelector(`[data-tab="${tabId}"]`) || 
                          document.getElementById(`${tabId}Btn`);
        if (tabButton) {
            tabButton.classList.add('active');
        }
    },

    // Создание новой новости
    createNews: function() {
        const title = document.getElementById('news-title').value;
        const content = document.getElementById('news-content').value;
        
        if (!title || !content) {
            alert('Пожалуйста, заполните все поля формы');
            return;
        }
        
        const newsData = {
            title: title,
            content: content,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            author: Auth.currentUser.displayName || 'Администратор',
            authorId: Auth.currentUser.uid
        };
        
        db.collection('news').add(newsData)
            .then(() => {
                alert('Новость успешно опубликована!');
                document.getElementById('newsCreateForm').reset();
            })
            .catch(error => {
                console.error('Ошибка при создании новости:', error);
                alert('Ошибка при создании новости: ' + error.message);
            });
    },

    // Загрузка списка новостей
    loadNews: function() {
        const adminNewsList = document.getElementById('adminNewsList');
        
        // Показываем загрузку
        adminNewsList.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Загрузка новостей...</span>
            </div>
        `;
        
        // Загружаем новости из Firestore
        db.collection('news')
            .orderBy('createdAt', 'desc')
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    adminNewsList.innerHTML = `
                        <div class="no-news-message">
                            <i class="fas fa-info-circle"></i>
                            <p>Новости пока отсутствуют</p>
                        </div>
                    `;
                    return;
                }
                
                // Создаем HTML для списка новостей
                let newsHtml = '';
                
                snapshot.forEach(doc => {
                    const news = doc.data();
                    const newsId = doc.id;
                    const date = news.createdAt ? news.createdAt.toDate().toLocaleDateString('ru-RU') : 'Дата не указана';
                    
                    newsHtml += `
                        <div class="admin-news-item" data-id="${newsId}">
                            <div class="admin-news-info">
                                <h3 class="admin-news-title">${news.title}</h3>
                                <div class="admin-news-date">
                                    <i class="far fa-calendar-alt"></i> ${date}
                                </div>
                            </div>
                            <div class="admin-news-actions">
                                <button class="edit-news-btn" onclick="AdminPanel.editNews('${newsId}')">
                                    <i class="fas fa-edit"></i> Редактировать
                                </button>
                                <button class="delete-news-btn" onclick="AdminPanel.confirmDeleteNews('${newsId}')">
                                    <i class="fas fa-trash"></i> Удалить
                                </button>
                            </div>
                        </div>
                    `;
                });
                
                adminNewsList.innerHTML = newsHtml;
            })
            .catch(error => {
                console.error('Ошибка при загрузке новостей:', error);
                adminNewsList.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Ошибка при загрузке новостей: ${error.message}</p>
                    </div>
                `;
            });
    },

    // Редактирование новости
    editNews: function(newsId) {
        const editNewsModal = document.getElementById('editNewsModal');
        const editNewsIdInput = document.getElementById('edit-news-id');
        const editNewsTitleInput = document.getElementById('edit-news-title');
        const editNewsContentInput = document.getElementById('edit-news-content');
        
        // Загружаем данные новости из Firestore
        db.collection('news').doc(newsId).get()
            .then(doc => {
                if (doc.exists) {
                    const news = doc.data();
                    
                    // Заполняем форму данными новости
                    editNewsIdInput.value = newsId;
                    editNewsTitleInput.value = news.title;
                    editNewsContentInput.value = news.content;
                    
                    // Показываем модальное окно
                    editNewsModal.classList.remove('hidden');
                } else {
                    alert('Новость не найдена');
                }
            })
            .catch(error => {
                console.error('Ошибка при загрузке новости:', error);
                alert('Ошибка при загрузке новости: ' + error.message);
            });
    },

    // Обновление новости
    updateNews: function() {
        const newsId = document.getElementById('edit-news-id').value;
        const title = document.getElementById('edit-news-title').value;
        const content = document.getElementById('edit-news-content').value;
        
        if (!title || !content) {
            alert('Пожалуйста, заполните все поля формы');
            return;
        }
        
        const newsData = {
            title: title,
            content: content,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        db.collection('news').doc(newsId).update(newsData)
            .then(() => {
                alert('Новость успешно обновлена!');
                document.getElementById('editNewsModal').classList.add('hidden');
                this.loadNews();
            })
            .catch(error => {
                console.error('Ошибка при обновлении новости:', error);
                alert('Ошибка при обновлении новости: ' + error.message);
            });
    },

    // Подтверждение удаления новости
    confirmDeleteNews: function(newsId) {
        this.showConfirmation('Вы уверены, что хотите удалить эту новость?', () => {
            this.deleteNews(newsId);
        });
    },

    // Удаление новости
    deleteNews: function(newsId) {
        db.collection('news').doc(newsId).delete()
            .then(() => {
                alert('Новость успешно удалена!');
                document.getElementById('editNewsModal').classList.add('hidden');
                this.loadNews();
            })
            .catch(error => {
                console.error('Ошибка при удалении новости:', error);
                alert('Ошибка при удалении новости: ' + error.message);
            });
    },

    // Показать модальное окно подтверждения
    showConfirmation: function(message, callback) {
        const confirmationModal = document.getElementById('confirmationModal');
        const confirmationMessage = document.getElementById('confirmationMessage');
        
        // Устанавливаем сообщение
        confirmationMessage.textContent = message;
        
        // Сохраняем колбэк
        this.confirmCallback = callback;
        
        // Показываем модальное окно
        confirmationModal.classList.remove('hidden');
    },

    // Настройка управления IP-адресами
    setupIpManagement: function() {
        // Обработчики событий для управления IP уже настроены в setupEventListeners
        // Здесь можно добавить дополнительную инициализацию при необходимости
    },

    // Загрузка списка IP-адресов - ПОЛНОСТЬЮ ОБНОВЛЕНО для мобильных
    loadIpAddresses: function() {
        const ipTableBody = document.getElementById('ipTableBody');
        
        if (!ipTableBody) {
            console.error('Элемент ipTableBody не найден!');
            return;
        }
        
        // Показываем загрузку
        ipTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="loading-data">
                    <i class="fas fa-spinner fa-spin"></i> Загрузка данных...
                </td>
            </tr>
        `;
        
        // Загружаем IP-адреса из Firestore
        db.collection('ipAddresses')
            .orderBy('lastVisit', 'desc')
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    ipTableBody.innerHTML = `
                        <tr>
                            <td colspan="5" class="no-data">
                                <i class="fas fa-info-circle"></i> Данных пока нет
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                // Создаем HTML для таблицы IP-адресов
                let ipHtml = '';
                
                snapshot.forEach(doc => {
                    const ipData = doc.data();
                    const ipId = doc.id;
                    const isBlocked = ipData.blocked || false;
                    
                    // Форматируем дату
                    let lastVisit = 'Неизвестно';
                    if (ipData.lastVisit) {
                        const date = ipData.lastVisit.toDate();
                        lastVisit = date.toLocaleString('ru-RU');
                    }
                    
                    const visits = ipData.visits || 1;
                    
                    if (this.isMobile) {
                        // Мобильная версия с вертикальным расположением
                        ipHtml += `
                            <tr data-ip="${ipId}">
                                <td class="ip-address">
                                    <span class="value">${ipId}</span>
                                </td>
                                <td class="last-visit">
                                    <span class="value">${lastVisit}</span>
                                </td>
                                <td class="visits">
                                    <span class="value">${visits}</span>
                                </td>
                                <td class="status">
                                    <span class="value ${isBlocked ? 'blocked' : 'active'}">
                                        ${isBlocked ? 'Заблокирован' : 'Активен'}
                                    </span>
                                </td>
                                <td class="actions">
                                    ${isBlocked ? 
                                        `<button class="unblock-btn" onclick="AdminPanel.unblockIp('${ipId}')">
                                            <i class="fas fa-unlock"></i> Разблокировать
                                        </button>` : 
                                        `<button class="block-btn" onclick="AdminPanel.blockIp('${ipId}')">
                                            <i class="fas fa-ban"></i> Заблокировать
                                        </button>`
                                    }
                                </td>
                            </tr>
                        `;
                    } else {
                        // Десктопная версия (стандартная таблица)
                        ipHtml += `
                            <tr data-ip="${ipId}">
                                <td>${ipId}</td>
                                <td>${lastVisit}</td>
                                <td>${visits}</td>
                                <td class="${isBlocked ? 'blocked-ip' : 'active-ip'}">
                                    ${isBlocked ? 'Заблокирован' : 'Активен'}
                                </td>
                                <td class="actions">
                                    ${isBlocked ? 
                                        `<button class="unblock-btn" onclick="AdminPanel.unblockIp('${ipId}')">
                                            <i class="fas fa-unlock"></i> Разблокировать
                                        </button>` : 
                                        `<button class="block-btn" onclick="AdminPanel.blockIp('${ipId}')">
                                            <i class="fas fa-ban"></i> Заблокировать
                                        </button>`
                                    }
                                </td>
                            </tr>
                        `;
                    }
                });
                
                ipTableBody.innerHTML = ipHtml;
            })
            .catch(error => {
                console.error('Ошибка при загрузке IP-адресов:', error);
                ipTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="error-data">
                            <i class="fas fa-exclamation-triangle"></i> Ошибка при загрузке данных: ${error.message}
                        </td>
                    </tr>
                `;
            });
    },

    // Фильтрация IP-адресов
    filterIpAddresses: function(searchText) {
        const rows = document.querySelectorAll('#ipTableBody tr');
        
        if (!rows || rows.length === 0 || rows[0].querySelector('.loading-data') || rows[0].querySelector('.no-data')) {
            return;
        }
        
        searchText = searchText.toLowerCase().trim();
        
        rows.forEach(row => {
            const ip = row.getAttribute('data-ip').toLowerCase();
            
            if (ip.includes(searchText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },

    // Блокировка IP-адреса
    blockIp: function(ipAddress) {
        let confirmMessage = `Вы уверены, что хотите заблокировать IP-адрес ${ipAddress}?`;
        
        // Для мобильных устройств сокращаем сообщение
        if (this.isMobile && ipAddress.length > 15) {
            confirmMessage = `Заблокировать IP ${ipAddress.substring(0, 10)}...?`;
        }
        
        this.showConfirmation(confirmMessage, () => {
            db.collection('ipAddresses').doc(ipAddress).update({
                blocked: true,
                blockedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                alert(`IP-адрес ${ipAddress} успешно заблокирован`);
                this.loadIpAddresses();
            })
            .catch(error => {
                console.error('Ошибка при блокировке IP-адреса:', error);
                alert('Ошибка при блокировке IP-адреса: ' + error.message);
            });
        });
    },

    // Разблокировка IP-адреса
    unblockIp: function(ipAddress) {
        let confirmMessage = `Вы уверены, что хотите разблокировать IP-адрес ${ipAddress}?`;
        
        // Для мобильных устройств сокращаем сообщение
        if (this.isMobile && ipAddress.length > 15) {
            confirmMessage = `Разблокировать IP ${ipAddress.substring(0, 10)}...?`;
        }
        
        this.showConfirmation(confirmMessage, () => {
            db.collection('ipAddresses').doc(ipAddress).update({
                blocked: false,
                unblockedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                alert(`IP-адрес ${ipAddress} успешно разблокирован`);
                this.loadIpAddresses();
            })
            .catch(error => {
                console.error('Ошибка при разблокировке IP-адреса:', error);
                alert('Ошибка при разблокировке IP-адреса: ' + error.message);
            });
        });
    }
};

// Ждем загрузки страницы для инициализации
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем авторизацию через Firebase перед инициализацией панели администратора
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('Пользователь авторизован:', user.email);
            // Принудительно проверяем, является ли пользователь администратором
            if (user.email && user.email.toLowerCase() === "strintox@gmail.com") {
                console.log('Это администратор!');
                Auth.isAdmin = true;
            }
            // Инициализируем панель администратора
            AdminPanel.init();
        } else {
            console.log('Пользователь не авторизован');
            // Инициализируем панель администратора (она покажет сообщение о запрете доступа)
            AdminPanel.init();
        }
    });
}); 