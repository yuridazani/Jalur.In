// === ADMIN MODULE - FIXED ===
(() => {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let vehicleTypes = JSON.parse(localStorage.getItem('vehicleTypes')) || ['Truk Engkel', 'Pickup', 'Tronton'];
    let reportCategories = JSON.parse(localStorage.getItem('reportCategories')) || ['Ban Pecah', 'Mesin Overheat', 'Kecelakaan Ringan'];


    // --- INISIALISASI ADMIN ---
    function initAdmin() {
        setupAdminNav();
        renderAdminView(); // Default view
        setupEventListeners();
    }

    // --- SETUP NAVIGASI ---
    function setupAdminNav() {
        const sidebarNav = document.getElementById('sidebar-nav');
        sidebarNav.innerHTML = `
            <a href="#" data-view="users" class="nav-link flex items-center gap-3 p-3 rounded-lg font-bold">
                <i class="fas fa-users-cog fa-fw w-6 text-center"></i> 
                <span>Manajemen Pengguna</span>
            </a>
            <a href="#" data-view="settings" class="nav-link flex items-center gap-3 p-3 rounded-lg font-bold">
                <i class="fas fa-cogs fa-fw w-6 text-center"></i> 
                <span>Pengaturan Aplikasi</span>
            </a>
        `;
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        const sidebarNav = document.getElementById('sidebar-nav');
        
        sidebarNav.addEventListener('click', (e) => {
            const navLink = e.target.closest('a.nav-link');
            if (!navLink) return;
            e.preventDefault();
            
            window.closeSidebar();

            const view = navLink.dataset.view;
            if (view === 'users') {
                renderAdminView();
            } else if (view === 'settings') {
                renderSettingsView();
            }
        });

        // Event Listener Terpusat untuk semua aksi
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const action = button.dataset.action;
            handleAdminAction(action, button);
        });
    }

    // --- HANDLER AKSI ADMIN ---
    function handleAdminAction(action, button) {
        switch (action) {
            case 'add-user-btn': openUserModal(); break;
            case 'edit-user': openUserModal(parseInt(button.dataset.userId)); break;
            case 'delete-user': deleteUser(parseInt(button.dataset.userId)); break;
            // Aksi Baru
            case 'add-vehicle-type': addMasterData('vehicle'); break;
            case 'edit-vehicle-type': editMasterData('vehicle', button.dataset.index); break;
            case 'delete-vehicle-type': deleteMasterData('vehicle', button.dataset.index); break;
            case 'add-report-category': addMasterData('report'); break;
            case 'edit-report-category': editMasterData('report', button.dataset.index); break;
            case 'delete-report-category': deleteMasterData('report', button.dataset.index); break;
        }
    }

    // --- RENDER FUNCTIONS ---
    function renderAdminView() {
        window.switchView('admin-view', '[data-view="users"]');
        
        const pageTitle = document.getElementById('page-title');
        const headerActions = document.getElementById('header-actions');
        
        pageTitle.textContent = 'Administrasi Pengguna';
        headerActions.innerHTML = `
            <button id="add-user-btn" data-action="add-user-btn" class="px-4 py-2 rounded-md bg-sky-500 text-white font-semibold flex items-center gap-2">
                <i class="fas fa-user-plus"></i> Tambah Pengguna
            </button>
        `;

        const adminViewContainer = document.getElementById('admin-view');
        adminViewContainer.innerHTML = `
            <div class="bg-white dark:bg-jalur-dark-2 p-6 rounded-lg shadow">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="border-b border-slate-200 dark:border-jalur-muted/20">
                            <tr>
                                <th class="p-3">Nama</th>
                                <th class="p-3">Username</th>
                                <th class="p-3">Peran</th>
                                <th class="p-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="admin-users-table"></tbody>
                    </table>
                </div>
            </div>
        `;
        
        updateUsersTable();
    }

    // --- FUNGSI RENDER SETTINGS VIEW - DIPERBAIKI ---
    function renderSettingsView() {
        // Buat view baru untuk settings jika belum ada
        createSettingsView();
        
        window.switchView('admin-settings-view', '[data-view="settings"]');
        
        const pageTitle = document.getElementById('page-title');
        const headerActions = document.getElementById('header-actions');
        
        pageTitle.textContent = 'Pengaturan Aplikasi';
        headerActions.innerHTML = ''; // Tidak ada aksi di header

        updateMasterDataLists();
    }

    // --- CREATE SETTINGS VIEW ---
    function createSettingsView() {
        if (!document.getElementById('admin-settings-view')) {
            const mainContentArea = document.getElementById('main-content-area');
            mainContentArea.insertAdjacentHTML('beforeend', `
                <div id="admin-settings-view" class="view-hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white dark:bg-jalur-dark-2 p-6 rounded-lg shadow enhanced-shadow">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xl font-bold">Jenis Kendaraan</h3>
                                <button data-action="add-vehicle-type" class="px-3 py-1 text-sm rounded-md bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors">
                                    <i class="fas fa-plus mr-1"></i> Tambah
                                </button>
                            </div>
                            <ul id="vehicle-types-list" class="space-y-2">
                                <!-- Data akan diisi oleh updateMasterDataLists() -->
                            </ul>
                        </div>
                        <div class="bg-white dark:bg-jalur-dark-2 p-6 rounded-lg shadow enhanced-shadow">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xl font-bold">Kategori Laporan</h3>
                                <button data-action="add-report-category" class="px-3 py-1 text-sm rounded-md bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors">
                                    <i class="fas fa-plus mr-1"></i> Tambah
                                </button>
                            </div>
                            <ul id="report-categories-list" class="space-y-2">
                                <!-- Data akan diisi oleh updateMasterDataLists() -->
                            </ul>
                        </div>
                    </div>
                </div>
            `);
        }
    }

    function updateUsersTable() {
        const tableBody = document.getElementById('admin-users-table');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        users.forEach(user => {
            const roleColorClass = getRoleColorClass(user.role);
            
            tableBody.innerHTML += `
                <tr class="border-b border-slate-200 dark:border-jalur-muted/20 hover:bg-slate-50 dark:hover:bg-jalur-dark-1">
                    <td class="p-3 font-bold">${user.name}</td>
                    <td class="p-3 font-mono text-sm">${user.username}</td>
                    <td class="p-3">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${roleColorClass}">
                            ${capitalizeRole(user.role)}
                        </span>
                    </td>
                    <td class="p-3 space-x-2">
                        <button data-action="edit-user" data-user-id="${user.id}" 
                                class="text-sky-500 hover:text-sky-700 transition-colors" 
                                title="Edit Pengguna">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button data-action="delete-user" data-user-id="${user.id}" 
                                class="text-red-500 hover:text-red-700 transition-colors" 
                                title="Hapus Pengguna">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        // Tampilkan pesan jika tidak ada data
        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="p-8 text-center text-slate-500 dark:text-jalur-muted">
                        <i class="fas fa-users text-4xl mb-4 opacity-50"></i>
                        <p>Belum ada pengguna yang terdaftar.</p>
                    </td>
                </tr>
            `;
        }
    }

    function updateMasterDataLists() {
        // Update Vehicle Types List
        const vehicleList = document.getElementById('vehicle-types-list');
        if (vehicleList) {
            vehicleList.innerHTML = '';
            
            if (vehicleTypes.length === 0) {
                vehicleList.innerHTML = `
                    <li class="text-center py-4 text-slate-500 dark:text-jalur-muted">
                        <i class="fas fa-truck text-2xl mb-2 block"></i>
                        Belum ada jenis kendaraan
                    </li>
                `;
            } else {
                vehicleTypes.forEach((type, index) => {
                    vehicleList.innerHTML += `
                        <li class="flex justify-between items-center p-3 rounded-md hover:bg-slate-100 dark:hover:bg-jalur-dark border border-slate-200 dark:border-jalur-muted/20">
                            <span class="font-medium">${type}</span>
                            <div class="space-x-2">
                                <button data-action="edit-vehicle-type" data-index="${index}" 
                                        class="text-sky-500 hover:text-sky-700 transition-colors p-1" 
                                        title="Edit">
                                    <i class="fas fa-pencil-alt"></i>
                                </button>
                                <button data-action="delete-vehicle-type" data-index="${index}" 
                                        class="text-red-500 hover:text-red-700 transition-colors p-1" 
                                        title="Hapus">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </li>
                    `;
                });
            }
        }

        // Update Report Categories List
        const categoryList = document.getElementById('report-categories-list');
        if (categoryList) {
            categoryList.innerHTML = '';
            
            if (reportCategories.length === 0) {
                categoryList.innerHTML = `
                    <li class="text-center py-4 text-slate-500 dark:text-jalur-muted">
                        <i class="fas fa-exclamation-triangle text-2xl mb-2 block"></i>
                        Belum ada kategori laporan
                    </li>
                `;
            } else {
                reportCategories.forEach((cat, index) => {
                    categoryList.innerHTML += `
                        <li class="flex justify-between items-center p-3 rounded-md hover:bg-slate-100 dark:hover:bg-jalur-dark border border-slate-200 dark:border-jalur-muted/20">
                            <span class="font-medium">${cat}</span>
                            <div class="space-x-2">
                                <button data-action="edit-report-category" data-index="${index}" 
                                        class="text-sky-500 hover:text-sky-700 transition-colors p-1" 
                                        title="Edit">
                                    <i class="fas fa-pencil-alt"></i>
                                </button>
                                <button data-action="delete-report-category" data-index="${index}" 
                                        class="text-red-500 hover:text-red-700 transition-colors p-1" 
                                        title="Hapus">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </li>
                    `;
                });
            }
        }
    }

    // --- UTILITY FUNCTIONS ---
    function getRoleColorClass(role) {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'manager':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'supir':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    }

    function capitalizeRole(role) {
        const roleNames = {
            'admin': 'Admin',
            'manager': 'Manajer',
            'supir': 'Supir'
        };
        return roleNames[role] || role;
    }

    function deleteUser(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const confirmMessage = `Anda yakin ingin menghapus pengguna "${user.name}" (${user.username})?`;
        
        if (confirm(confirmMessage)) {
            users = users.filter(u => u.id !== userId);
            localStorage.setItem('users', JSON.stringify(users));
            renderAdminView();
            
            // Tampilkan notifikasi sukses
            showNotification('Pengguna berhasil dihapus!', 'success');
        }
    }

    // --- FUNGSI BARU: CRUD DATA MASTER ---
    function addMasterData(type) {
        const label = type === 'vehicle' ? 'Jenis Kendaraan' : 'Kategori Laporan';
        const newValue = prompt(`Masukkan ${label} baru:`);
        if (newValue && newValue.trim() !== '') {
            const trimmedValue = newValue.trim();
            if (type === 'vehicle') {
                if (!vehicleTypes.includes(trimmedValue)) {
                    vehicleTypes.push(trimmedValue);
                } else {
                    showNotification('Jenis kendaraan sudah ada!', 'error');
                    return;
                }
            } else {
                if (!reportCategories.includes(trimmedValue)) {
                    reportCategories.push(trimmedValue);
                } else {
                    showNotification('Kategori laporan sudah ada!', 'error');
                    return;
                }
            }
            saveMasterData();
            showNotification(`${label} berhasil ditambahkan!`, 'success');
        }
    }

    function editMasterData(type, index) {
        const array = type === 'vehicle' ? vehicleTypes : reportCategories;
        const label = type === 'vehicle' ? 'Jenis Kendaraan' : 'Kategori Laporan';
        const oldValue = array[index];
        const newValue = prompt(`Edit ${label}:`, oldValue);
        if (newValue && newValue.trim() !== '' && newValue.trim() !== oldValue) {
            const trimmedValue = newValue.trim();
            const otherItems = array.filter((_, i) => i !== index);
            if (!otherItems.includes(trimmedValue)) {
                array[index] = trimmedValue;
                saveMasterData();
                showNotification(`${label} berhasil diubah!`, 'success');
            } else {
                showNotification(`${label} sudah ada!`, 'error');
            }
        }
    }

    function deleteMasterData(type, index) {
        const array = type === 'vehicle' ? vehicleTypes : reportCategories;
        const label = type === 'vehicle' ? 'Jenis Kendaraan' : 'Kategori Laporan';
        const item = array[index];
        if (confirm(`Anda yakin ingin menghapus "${item}"?`)) {
            array.splice(index, 1);
            saveMasterData();
            showNotification(`${label} berhasil dihapus!`, 'success');
        }
    }

    function saveMasterData() {
        localStorage.setItem('vehicleTypes', JSON.stringify(vehicleTypes));
        localStorage.setItem('reportCategories', JSON.stringify(reportCategories));
        updateMasterDataLists(); // Render ulang daftar setelah ada perubahan
    }

    // --- MODAL FUNCTIONS ---
    function openUserModal(userId = null) {
        const userModal = document.getElementById('user-modal');
        const userForm = document.getElementById('user-form');
        const modalTitle = document.getElementById('user-modal-title');
        
        const formHTML = `
            <input type="hidden" id="user-id">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="user-name" class="block text-sm font-medium mb-1">Nama Lengkap</label>
                    <input type="text" id="user-name" required 
                           class="w-full p-2 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                </div>
                <div>
                    <label for="user-username" class="block text-sm font-medium mb-1">Username</label>
                    <input type="text" id="user-username" required 
                           class="w-full p-2 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                </div>
            </div>
            <div>
                <label for="user-password" class="block text-sm font-medium mb-1">Password</label>
                <input type="password" id="user-password" 
                       class="w-full p-2 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                <small class="text-slate-500 dark:text-jalur-muted text-xs mt-1 block" id="password-hint"></small>
            </div>
            <div>
                <label for="user-role" class="block text-sm font-medium mb-1">Peran Pengguna</label>
                <select id="user-role" required 
                        class="w-full p-2 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                    <option value="">-- Pilih Peran --</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manajer</option>
                    <option value="supir">Supir</option>
                </select>
            </div>
            <div class="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-jalur-muted/20">
                <button type="button" id="cancel-user-modal-btn" 
                        class="px-4 py-2 rounded-md bg-slate-200 dark:bg-jalur-muted text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-300 dark:hover:bg-jalur-muted/80 transition-colors">
                    Batal
                </button>
                <button type="submit" 
                        class="px-4 py-2 rounded-md bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors">
                    <i class="fas fa-save mr-2"></i>Simpan
                </button>
            </div>
        `;
        
        userForm.innerHTML = formHTML;

        const user = userId ? users.find(u => u.id === userId) : null;
        
        if (user) { // Mode Edit
            modalTitle.textContent = 'Edit Pengguna';
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-username').value = user.username;
            document.getElementById('user-role').value = user.role;
            document.getElementById('user-password').required = false;
            document.getElementById('password-hint').textContent = 'Kosongkan jika tidak ingin mengubah password';
        } else { // Mode Tambah
            modalTitle.textContent = 'Tambah Pengguna Baru';
            document.getElementById('user-password').required = true;
            document.getElementById('password-hint').textContent = 'Password minimal 6 karakter';
        }

        userModal.classList.remove('hidden');
        setTimeout(() => userModal.classList.remove('opacity-0'), 10);
        
        setupUserModalEvents();
    }

    function setupUserModalEvents() {
        // Remove existing listeners to prevent duplicates
        const userForm = document.getElementById('user-form');
        const newForm = userForm.cloneNode(true);
        userForm.parentNode.replaceChild(newForm, userForm);
        
        document.getElementById('close-user-modal-btn').onclick = closeUserModal;
        document.getElementById('cancel-user-modal-btn').onclick = closeUserModal;
        
        document.getElementById('user-form').addEventListener('submit', handleUserFormSubmit);
    }

    function closeUserModal() {
        const userModal = document.getElementById('user-modal');
        userModal.classList.add('opacity-0');
        setTimeout(() => userModal.classList.add('hidden'), 300);
    }

    function handleUserFormSubmit(e) {
        e.preventDefault();
        
        const userId = document.getElementById('user-id').value;
        const username = document.getElementById('user-username').value.trim();
        const password = document.getElementById('user-password').value;
        const name = document.getElementById('user-name').value.trim();
        const role = document.getElementById('user-role').value;

        // Validasi
        if (!name || !username || !role) {
            showNotification('Semua field wajib diisi!', 'error');
            return;
        }

        if (!userId && (!password || password.length < 6)) {
            showNotification('Password minimal 6 karakter!', 'error');
            return;
        }

        if (userId && password && password.length < 6) {
            showNotification('Password minimal 6 karakter!', 'error');
            return;
        }

        // Cek username unik
        const isUsernameTaken = users.some(u => u.username === username && u.id != userId);
        if (isUsernameTaken) {
            showNotification('Username sudah digunakan. Silakan pilih yang lain.', 'error');
            return;
        }
        
        const userData = {
            name: name,
            username: username,
            role: role,
        };

        if (userId) { // Update
            const index = users.findIndex(u => u.id == userId);
            users[index] = { ...users[index], ...userData };
            if (password) users[index].password = password;
            showNotification('Pengguna berhasil diperbarui!', 'success');
        } else { // Create
            userData.id = Date.now();
            userData.password = password;
            users.push(userData);
            showNotification('Pengguna berhasil ditambahkan!', 'success');
        }

        localStorage.setItem('users', JSON.stringify(users));
        renderAdminView();
        closeUserModal();
    }

    // --- NOTIFICATION FUNCTION ---
    function showNotification(message, type = 'info') {
        // Gunakan Toastify jika tersedia, atau fallback ke alert
        if (typeof Toastify !== 'undefined') {
            const colors = {
                'success': 'linear-gradient(to right, #16a34a, #22c55e)',
                'error': 'linear-gradient(to right, #dc2626, #ef4444)',
                'info': 'linear-gradient(to right, #0ea5e9, #38bdf8)'
            };
            
            Toastify({
                text: message,
                duration: 3000,
                gravity: "top",
                position: "right",
                style: {
                    background: colors[type] || colors.info,
                },
                stopOnFocus: true,
            }).showToast();
        } else {
            alert(message);
        }
    }

    // --- INISIALISASI ---
    initAdmin();
})();