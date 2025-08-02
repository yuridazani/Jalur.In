// === MANAGER DRIVERS MODULE ===
// File: js/manager-drivers.js

(() => {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let vehicleTypes = JSON.parse(localStorage.getItem('vehicleTypes')) || ['Truk Engkel', 'Pickup', 'Tronton'];

    // === RENDER DRIVERS VIEW ===
    function renderDriversView() {
        window.switchView('manager-drivers-view', '[data-view="drivers"]');
        
        const pageTitle = document.getElementById('page-title');
        const headerActions = document.getElementById('header-actions');
        
        pageTitle.textContent = 'Manajemen Supir';
        headerActions.innerHTML = `
            <button data-action="add-driver" class="px-4 py-2 rounded-md bg-sky-500 text-white font-semibold flex items-center gap-2">
                <i class="fas fa-user-plus"></i> Tambah Supir
            </button>
        `;

        updateDriversTable();
    }

    // === UPDATE DRIVERS TABLE ===
    function updateDriversTable() {
        const driversContainer = document.getElementById('manager-drivers-view');
        const drivers = users.filter(u => u.role === 'supir');

        driversContainer.innerHTML = `
            <div class="bg-white dark:bg-jalur-dark-2 p-6 rounded-lg shadow enhanced-shadow">
                <div class="mb-4">
                    <h3 class="text-xl font-bold mb-2">Daftar Supir</h3>
                    <p class="text-slate-500 dark:text-jalur-muted text-sm">Kelola informasi dan data supir</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="border-b border-slate-200 dark:border-jalur-muted/20">
                            <tr>
                                <th class="p-3">Nama</th>
                                <th class="p-3">Username</th>
                                <th class="p-3">Kendaraan</th>
                                <th class="p-3">No. Telp</th>
                                <th class="p-3">Status</th>
                                <th class="p-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="drivers-table-body">
                            ${drivers.length === 0 ? `
                                <tr>
                                    <td colspan="6" class="p-8 text-center text-slate-500 dark:text-jalur-muted">
                                        <i class="fas fa-users text-4xl mb-4 opacity-50"></i>
                                        <p>Belum ada supir yang terdaftar.</p>
                                    </td>
                                </tr>
                            ` : drivers.map(driver => `
                                <tr class="border-b border-slate-200 dark:border-jalur-muted/20 hover:bg-slate-50 dark:hover:bg-jalur-dark-1">
                                    <td class="p-3">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                ${driver.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </div>
                                            <div>
                                                <p class="font-semibold">${driver.name}</p>
                                                <p class="text-xs text-slate-500">ID: ${driver.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="p-3 font-mono text-sm">${driver.username}</td>
                                    <td class="p-3">
                                        <span class="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                                            ${driver.vehicleType || 'Belum ditentukan'}
                                        </span>
                                    </td>
                                    <td class="p-3">${driver.phone || '-'}</td>
                                    <td class="p-3">
                                        <span class="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                                            Aktif
                                        </span>
                                    </td>
                                    <td class="p-3 space-x-2">
                                        <button data-action="edit-driver" data-driver-id="${driver.id}" 
                                                class="text-sky-500 hover:text-sky-700 transition-colors" 
                                                title="Edit Supir">
                                            <i class="fas fa-pencil-alt"></i>
                                        </button>
                                        <button data-action="view-driver-performance" data-driver-id="${driver.id}" 
                                                class="text-green-500 hover:text-green-700 transition-colors" 
                                                title="Lihat Performa">
                                            <i class="fas fa-chart-line"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // === DRIVER MODAL ===
    function openDriverModal(driverId = null) {
        const driverModal = document.getElementById('driver-modal');
        const driverForm = document.getElementById('driver-form');
        const modalTitle = document.getElementById('driver-modal-title');
        
        const driver = driverId ? users.find(u => u.id === driverId) : null;
        
        modalTitle.textContent = driver ? 'Edit Supir' : 'Tambah Supir Baru';
        
        driverForm.innerHTML = `
            <input type="hidden" id="driver-id" value="${driver ? driver.id : ''}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="driver-name" class="block text-sm font-medium mb-1">Nama Lengkap</label>
                    <input type="text" id="driver-name" required value="${driver ? driver.name : ''}"
                           class="w-full p-2 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500">
                </div>
                <div>
                    <label for="driver-username" class="block text-sm font-medium mb-1">Username</label>
                    <input type="text" id="driver-username" required value="${driver ? driver.username : ''}"
                           class="w-full p-2 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500">
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="driver-phone" class="block text-sm font-medium mb-1">No. Telepon</label>
                    <input type="tel" id="driver-phone" value="${driver ? (driver.phone || '') : ''}"
                           class="w-full p-2 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500">
                </div>
                <div>
                    <label for="driver-vehicle" class="block text-sm font-medium mb-1">Jenis Kendaraan</label>
                    <select id="driver-vehicle" 
                            class="w-full p-2 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500">
                        <option value="">-- Pilih Kendaraan --</option>
                        ${vehicleTypes.map(type => 
                            `<option value="${type}" ${driver && driver.vehicleType === type ? 'selected' : ''}>${type}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            <div>
                <label for="driver-license" class="block text-sm font-medium mb-1">No. SIM</label>
                <input type="text" id="driver-license" value="${driver ? (driver.license || '') : ''}"
                       class="w-full p-2 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500">
            </div>
            <div>
                <label for="driver-password" class="block text-sm font-medium mb-1">Password</label>
                <input type="password" id="driver-password" ${!driver ? 'required' : ''}
                       class="w-full p-2 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500">
                <small class="text-slate-500 text-xs mt-1 block">
                    ${driver ? 'Kosongkan jika tidak ingin mengubah password' : 'Password minimal 6 karakter'}
                </small>
            </div>
            <div class="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-jalur-muted/20">
                <button type="button" id="cancel-driver-modal-btn" 
                        class="px-4 py-2 rounded-md bg-slate-200 dark:bg-jalur-muted text-slate-700 dark:text-slate-300 font-semibold">
                    Batal
                </button>
                <button type="submit" 
                        class="px-4 py-2 rounded-md bg-sky-500 text-white font-semibold">
                    <i class="fas fa-save mr-2"></i>Simpan
                </button>
            </div>
        `;
        
        driverModal.classList.remove('hidden');
        setTimeout(() => driverModal.classList.remove('opacity-0'), 10);
        
        setupDriverModalEvents();
    }

    function setupDriverModalEvents() {
        document.getElementById('close-driver-modal-btn').onclick = closeDriverModal;
        document.getElementById('cancel-driver-modal-btn').onclick = closeDriverModal;
        
        document.getElementById('driver-form').addEventListener('submit', handleDriverFormSubmit);
    }

    function closeDriverModal() {
        const driverModal = document.getElementById('driver-modal');
        driverModal.classList.add('opacity-0');
        setTimeout(() => driverModal.classList.add('hidden'), 300);
    }

    function handleDriverFormSubmit(e) {
        e.preventDefault();
        
        const driverId = document.getElementById('driver-id').value;
        const name = document.getElementById('driver-name').value.trim();
        const username = document.getElementById('driver-username').value.trim();
        const phone = document.getElementById('driver-phone').value.trim();
        const vehicleType = document.getElementById('driver-vehicle').value;
        const license = document.getElementById('driver-license').value.trim();
        const password = document.getElementById('driver-password').value;

        // Validasi
        if (!name || !username) {
            alert('Nama dan username wajib diisi!');
            return;
        }

        if (!driverId && (!password || password.length < 6)) {
            alert('Password minimal 6 karakter!');
            return;
        }

        // Cek username unik
        const isUsernameTaken = users.some(u => u.username === username && u.id != driverId);
        if (isUsernameTaken) {
            alert('Username sudah digunakan. Silakan pilih yang lain.');
            return;
        }
        
        const driverData = {
            name: name,
            username: username,
            role: 'supir',
            phone: phone,
            vehicleType: vehicleType,
            license: license
        };

        if (driverId) { // Update
            const index = users.findIndex(u => u.id == driverId);
            users[index] = { ...users[index], ...driverData };
            if (password) users[index].password = password;
            showNotification('Supir berhasil diperbarui!', 'success');
        } else { // Create
            driverData.id = Date.now();
            driverData.password = password;
            users.push(driverData);
            showNotification('Supir berhasil ditambahkan!', 'success');
        }

        localStorage.setItem('users', JSON.stringify(users));
        renderDriversView();
        closeDriverModal();
    }

    // === HANDLE ACTIONS ===
    function handleDriverAction(action, button) {
        const driverId = parseInt(button.dataset.driverId);
        
        switch (action) {
            case 'add-driver':
                openDriverModal();
                break;
            case 'edit-driver':
                openDriverModal(driverId);
                break;
            case 'view-driver-performance':
                viewDriverPerformance(driverId);
                break;
        }
    }

    function viewDriverPerformance(driverId) {
        const driver = users.find(u => u.id === driverId);
        const shipments = JSON.parse(localStorage.getItem('shipments')) || [];
        const driverShipments = shipments.filter(s => s.driverId === driverId);
        
        const completed = driverShipments.filter(s => s.status === 'Selesai').length;
        const active = driverShipments.filter(s => s.status === 'Dalam Perjalanan').length;
        const pending = driverShipments.filter(s => s.status === 'Menunggu').length;
        
        alert(`Performa Supir: ${driver.name}\n\n` +
              `✅ Selesai: ${completed}\n` +
              `🚚 Dalam Perjalanan: ${active}\n` +
              `⏳ Menunggu: ${pending}\n` +
              `📊 Total Tugas: ${driverShipments.length}`);
    }

    function showNotification(message, type = 'info') {
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

    // === EXPORT FUNCTIONS ===
    window.managerDrivers = {
        renderDriversView,
        handleDriverAction
    };
})();