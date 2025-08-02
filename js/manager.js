// === ENHANCED MANAGER MODULE ===
(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    let shipments = JSON.parse(localStorage.getItem('shipments')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let reports = JSON.parse(localStorage.getItem('reports')) || [];
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let vehicleTypes = JSON.parse(localStorage.getItem('vehicleTypes')) || ['Truk Engkel', 'Pickup', 'Tronton'];
    let reportCategories = JSON.parse(localStorage.getItem('reportCategories')) || ['Ban Pecah', 'Mesin Overheat', 'Kecelakaan Ringan'];
    let mapInstance = null;
    let mapMarkers = [];

    // --- INISIALISASI MANAGER ---
    function initManager() {
        setupManagerNav();
        renderManagerDashboard(); // Default view
        setupEventListeners();
    }

    // --- SETUP NAVIGASI YANG DIPERLUAS ---
    function setupManagerNav() {
        const sidebarNav = document.getElementById('sidebar-nav');
        sidebarNav.innerHTML = `
            <a href="#" data-view="dashboard" class="nav-link flex items-center gap-3 p-3 rounded-lg font-bold">
                <i class="fas fa-tachometer-alt fa-fw w-6 text-center"></i> 
                <span>Dasbor</span>
            </a>
            <a href="#" data-view="history" class="nav-link flex items-center gap-3 p-3 rounded-lg font-bold">
                <i class="fas fa-history fa-fw w-6 text-center"></i> 
                <span>Riwayat Pengiriman</span>
            </a>
            <a href="#" data-view="finance" class="nav-link flex items-center gap-3 p-3 rounded-lg font-bold">
                <i class="fas fa-money-bill-wave fa-fw w-6 text-center"></i> 
                <span>Keuangan</span>
            </a>
            <a href="#" data-view="drivers" class="nav-link flex items-center gap-3 p-3 rounded-lg font-bold">
                <i class="fas fa-users fa-fw w-6 text-center"></i> 
                <span>Manajemen Supir</span>
            </a>
            <a href="#" data-view="reports" class="nav-link flex items-center gap-3 p-3 rounded-lg font-bold">
                <i class="fas fa-exclamation-triangle fa-fw w-6 text-center"></i> 
                <span>Laporan Kendala</span>
            </a>
        `;
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        const sidebarNav = document.getElementById('sidebar-nav');
        
        // Navigasi Sidebar
        sidebarNav.addEventListener('click', (e) => {
            const navLink = e.target.closest('a.nav-link');
            if (!navLink) return;
            e.preventDefault();
            
            const view = navLink.dataset.view;
            
            switch (view) {
                case 'dashboard':
                    renderManagerDashboard();
                    break;
                case 'reports':
                    renderManagerReports();
                    break;
                case 'history':
                    renderHistoryView();
                    break;
                case 'finance':
                    renderFinanceView();
                    break;
                case 'drivers':
                    if (window.managerDrivers) {
                        window.managerDrivers.renderDriversView();
                    }
                    break;
                default:
                    console.log('Unknown view:', view);
            }
        });

        // Event Listener Terpusat untuk Actions
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const action = button.dataset.action || button.id;
            handleManagerAction(action, button);
        });
    }

    // --- HANDLER AKSI MANAGER YANG DIPERLUAS ---
    function handleManagerAction(action, button) {
        switch (action) {
            case 'create-shipment-btn':
                openCreateShipmentModal();
                break;
            case 'add-driver-btn':
                openDriverModal();
                break;
            case 'view-image':
                openImageViewerModal(button.dataset.imgSrc);
                break;
            case 'pay-transaction':
                openTransactionModal(button.dataset.shipmentId);
                break;
            case 'view-driver':
                openDriverModal(parseInt(button.dataset.driverId), true);
                break;
            case 'edit-driver':
                openDriverModal(parseInt(button.dataset.driverId), false);
                break;
            case 'delete-driver':
                deleteDriver(parseInt(button.dataset.driverId));
                break;
            case 'view-transaction':
                viewTransactionDetails(button.dataset.transactionId);
                break;
            case 'edit-transaction':
                editTransaction(button.dataset.transactionId);
                break;
            case 'delete-transaction':
                deleteTransaction(button.dataset.transactionId);
                break;
            case 'view-shipment-detail':
                viewShipmentDetail(button.dataset.shipmentId);
                break;
        }
        if (action.includes('driver')) {
            if (window.managerDrivers) {
                window.managerDrivers.handleDriverAction(action, button);
            }
            return;
        }
    }

    // --- RENDER DASHBOARD (HANYA AKTIF) ---
    function renderManagerDashboard() {
        window.switchView('manager-dashboard-view', '[data-view="dashboard"]');
        
        const pageTitle = document.getElementById('page-title');
        const headerActions = document.getElementById('header-actions');
        
        pageTitle.textContent = 'Dasbor Manajer';
        headerActions.innerHTML = `
            <button id="create-shipment-btn" class="px-4 py-2 rounded-md bg-sky-500 dark:bg-jalur-accent text-white font-semibold flex items-center gap-2 shadow hover:bg-sky-600 dark:hover:bg-jalur-accent-hover transition-colors">
                <i class="fas fa-plus"></i> Buat Surat Jalan
            </button>
        `;

        // Update Statistics - HANYA YANG AKTIF
        const statsContainer = document.getElementById('manager-dashboard-view').querySelector('.grid');
        const waitingCount = shipments.filter(s => s.status === 'Menunggu').length;
        const activeCount = shipments.filter(s => s.status === 'Dalam Perjalanan').length;
        const driverCount = users.filter(u => u.role === 'supir').length;
        
        statsContainer.innerHTML = `
            <div class="bg-amber-500 dark:bg-amber-600 text-white p-6 rounded-lg shadow flex items-center gap-4">
                <i class="fas fa-clock text-4xl opacity-75"></i>
                <div>
                    <h4 class="font-semibold">Menunggu</h4>
                    <p class="text-3xl font-bold">${waitingCount}</p>
                </div>
            </div>
            <div class="bg-sky-500 dark:bg-sky-600 text-white p-6 rounded-lg shadow flex items-center gap-4">
                <i class="fas fa-truck-loading text-4xl opacity-75"></i>
                <div>
                    <h4 class="font-semibold">Dalam Perjalanan</h4>
                    <p class="text-3xl font-bold">${activeCount}</p>
                </div>
            </div>
            <div class="bg-slate-700 dark:bg-slate-800 text-white p-6 rounded-lg shadow flex items-center gap-4">
                <i class="fas fa-users text-4xl opacity-75"></i>
                <div>
                    <h4 class="font-semibold">Total Armada</h4>
                    <p class="text-3xl font-bold">${driverCount}</p>
                </div>
            </div>
        `;

        // Setup Map
        setupMap();
        
        // Update Table - HANYA YANG AKTIF
        updateActiveShipmentTable();
    }

    // --- RENDER RIWAYAT PENGIRIMAN (YANG SELESAI) ---
    function renderShipmentHistory() {
        // Buat view baru untuk history
        createHistoryView();
        window.switchView('manager-history-view', '[data-view="history"]');
        
        const pageTitle = document.getElementById('page-title');
        const headerActions = document.getElementById('header-actions');
        
        pageTitle.textContent = 'Riwayat Pengiriman';
        headerActions.innerHTML = '';

        updateHistoryTable();
    }

    // --- RENDER MANAJEMEN KEUANGAN ---
    function renderFinanceManagement() {
        createFinanceView();
        window.switchView('manager-finance-view', '[data-view="finance"]');
        
        const pageTitle = document.getElementById('page-title');
        const headerActions = document.getElementById('header-actions');
        
        pageTitle.textContent = 'Manajemen Keuangan';
        headerActions.innerHTML = '';

        updateFinanceTable();
        updateFinanceStats();
    }

    // --- RENDER MANAJEMEN SUPIR - DIPERBAIKI ---
    function renderManagerDrivers() {
        window.switchView('manager-drivers-view', '[data-view="drivers"]');
        
        const pageTitle = document.getElementById('page-title');
        const headerActions = document.getElementById('header-actions');
        
        pageTitle.textContent = 'Manajemen Supir';
        headerActions.innerHTML = `
            <button id="add-driver-btn" class="px-4 py-2 rounded-md bg-sky-500 text-white font-semibold flex items-center gap-2">
                <i class="fas fa-user-plus"></i> Tambah Supir
            </button>
        `;

        const driversView = document.getElementById('manager-drivers-view');
        driversView.innerHTML = `
            <div class="bg-white dark:bg-jalur-dark-2 p-6 rounded-lg shadow enhanced-shadow">
                <div class="mb-4">
                    <h3 class="text-xl font-bold mb-2">Daftar Supir</h3>
                    <p class="text-slate-500 dark:text-jalur-muted text-sm">Kelola informasi supir dan kendaraan armada</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="border-b border-slate-200 dark:border-jalur-muted/20">
                            <tr>
                                <th class="p-3">Nama</th>
                                <th class="p-3">Username</th>
                                <th class="p-3">Telepon</th>
                                <th class="p-3">Kendaraan</th>
                                <th class="p-3">Plat Nomor</th>
                                <th class="p-3">Status</th>
                                <th class="p-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="drivers-table-body"></tbody>
                    </table>
                </div>
            </div>
        `;
        
        updateDriversTable();
    }

    function renderManagerReports() {
        window.switchView('manager-reports-view', '[data-view="reports"]');
        
        const pageTitle = document.getElementById('page-title');
        const headerActions = document.getElementById('header-actions');
        
        pageTitle.textContent = 'Laporan Kendala';
        headerActions.innerHTML = '';
        
        const reportsView = document.getElementById('manager-reports-view');
        
        // Loading effect
        reportsView.innerHTML = `<p class="text-center p-8"><i class="fas fa-spinner fa-spin mr-2"></i> Memuat laporan...</p>`;

        setTimeout(() => {
            if (reports.length === 0) {
                reportsView.innerHTML = `
                    <div class="bg-white dark:bg-jalur-dark-2 p-8 rounded-lg shadow text-center">
                        <i class="fas fa-clipboard-list text-6xl text-slate-300 dark:text-jalur-muted/50 mb-4"></i>
                        <h3 class="text-xl font-semibold text-slate-600 dark:text-jalur-muted mb-2">Tidak Ada Laporan</h3>
                        <p class="text-slate-500 dark:text-jalur-muted">Belum ada laporan kendala yang masuk dari supir.</p>
                    </div>
                `;
                return;
            }
            
            reportsView.innerHTML = `
                <div class="bg-white dark:bg-jalur-dark-2 p-6 rounded-lg shadow enhanced-shadow">
                    <div class="mb-4">
                        <h3 class="text-xl font-bold mb-2">Laporan Kendala dari Supir</h3>
                        <p class="text-slate-500 dark:text-jalur-muted text-sm">Daftar semua laporan kendala yang dikirimkan oleh supir</p>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="border-b border-slate-200 dark:border-jalur-muted/20">
                                <tr>
                                    <th class="p-3">Waktu</th>
                                    <th class="p-3">Pelapor</th>
                                    <th class="p-3">Kategori</th>
                                    <th class="p-3">Deskripsi</th>
                                    <th class="p-3">Bukti Foto</th>
                                    <th class="p-3">Status</th>
                                    <th class="p-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="reports-table-body"></tbody>
                        </table>
                    </div>
                </div>
            `;
            
            updateReportsTable();
        }, 500);
    }

    // --- CREATE NEW VIEWS ---
    function createHistoryView() {
        if (!document.getElementById('manager-history-view')) {
            const mainContentArea = document.getElementById('main-content-area');
            mainContentArea.insertAdjacentHTML('beforeend', `
                <div id="manager-history-view" class="view-hidden">
                    <div class="bg-white dark:bg-jalur-dark-2 p-6 rounded-lg shadow enhanced-shadow">
                        <div class="mb-4">
                            <h3 class="text-xl font-bold mb-2">Arsip Surat Jalan Selesai</h3>
                            <p class="text-slate-500 dark:text-jalur-muted text-sm">Riwayat semua pengiriman yang telah diselesaikan</p>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead class="border-b border-slate-200 dark:border-jalur-muted/20">
                                    <tr>
                                        <th class="p-3">ID</th>
                                        <th class="p-3">Supir</th>
                                        <th class="p-3">Tujuan</th>
                                        <th class="p-3">Tanggal Selesai</th>
                                        <th class="p-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="history-table-body"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `);
        }
    }

    function createFinanceView() {
        if (!document.getElementById('manager-finance-view')) {
            const mainContentArea = document.getElementById('main-content-area');
            mainContentArea.insertAdjacentHTML('beforeend', `
                <div id="manager-finance-view" class="view-hidden space-y-6">
                    <!-- Stats Keuangan -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="finance-stats">
                        <!-- Stats akan diisi oleh JS -->
                    </div>
                    
                    <!-- Tabel Transaksi -->
                    <div class="bg-white dark:bg-jalur-dark-2 p-6 rounded-lg shadow enhanced-shadow">
                        <div class="mb-4">
                            <h3 class="text-xl font-bold mb-2">Riwayat Transaksi Uang Jalan</h3>
                            <p class="text-slate-500 dark:text-jalur-muted text-sm">Kelola semua transaksi uang jalan untuk pengiriman</p>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead class="border-b border-slate-200 dark:border-jalur-muted/20">
                                    <tr>
                                        <th class="p-3">Tanggal</th>
                                        <th class="p-3">ID Surat Jalan</th>
                                        <th class="p-3">Supir</th>
                                        <th class="p-3">Jumlah</th>
                                        <th class="p-3">Bukti</th>
                                        <th class="p-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="finance-table-body"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `);
        }
    }

    // --- UPDATE FUNCTIONS ---
    function setupMap() {
        if (!mapInstance) {
            const mapContainer = document.getElementById('manager-dashboard-view').querySelector('#map');
            if (mapContainer) {
                mapInstance = L.map(mapContainer).setView([-7.2575, 112.7521], 10);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
                }).addTo(mapInstance);
            }
        }
        
        if (mapInstance) {
            // Clear existing markers
            mapMarkers.forEach(marker => marker.remove());
            mapMarkers = [];
            
            // Add new markers for active shipments
            const activeShipments = shipments.filter(s => s.status === 'Dalam Perjalanan' && s.locationHistory.length > 0);
            activeShipments.forEach(shipment => {
                const lastLocation = shipment.locationHistory[shipment.locationHistory.length - 1];
                const marker = L.marker([lastLocation.lat, lastLocation.lng])
                    .addTo(mapInstance)
                    .bindPopup(`<b>${shipment.driverName}</b><br>Tujuan: ${shipment.destination}`);
                mapMarkers.push(marker);
            });
            
            if (activeShipments.length > 0) {
                mapInstance.fitBounds(L.featureGroup(mapMarkers).getBounds(), { padding: [50, 50] });
            }
        }
    }

    function updateActiveShipmentTable() {
        const tableBody = document.getElementById('manager-shipments-table');
        if (!tableBody.parentElement.parentElement.querySelector('thead')) {
            tableBody.parentElement.parentElement.insertAdjacentHTML('afterbegin', `
                <thead class="border-b border-slate-200 dark:border-jalur-muted/20">
                    <tr>
                        <th class="p-3">ID</th>
                        <th class="p-3">Supir</th>
                        <th class="p-3">Tujuan</th>
                        <th class="p-3">Status</th>
                        <th class="p-3">Uang Jalan</th>
                    </tr>
                </thead>
            `);
        }
        
        tableBody.innerHTML = '';
        // HANYA TAMPILKAN YANG AKTIF (Menunggu dan Dalam Perjalanan)
        const activeShipments = shipments.filter(s => s.status === 'Menunggu' || s.status === 'Dalam Perjalanan');
        
        activeShipments.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(s => {
            const transactionExists = transactions.some(t => t.shipmentId === s.id);
            const statusColor = s.status === 'Dalam Perjalanan' ? 'bg-sky-500/10 text-sky-500' : 'bg-amber-500/10 text-amber-500';
            const transactionButton = transactionExists
                ? `<button disabled class="text-green-500"><i class="fas fa-check-circle"></i> Lunas</button>`
                : `<button data-action="pay-transaction" data-shipment-id="${s.id}" class="text-sky-500 font-bold hover:text-sky-700">
                     <i class="fas fa-money-bill-wave"></i> Bayar
                   </button>`;

            tableBody.innerHTML += `
                <tr class="border-b border-slate-200 dark:border-jalur-muted/20 hover:bg-slate-50 dark:hover:bg-jalur-dark/50">
                    <td class="p-3 font-mono text-xs">${s.id}</td>
                    <td class="p-3 font-semibold">${s.driverName}</td>
                    <td class="p-3">${s.destination}</td>
                    <td class="p-3"><span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">${s.status}</span></td>
                    <td class="p-3">${transactionButton}</td>
                </tr>`;
        });

        if (activeShipments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="p-8 text-center text-slate-500 dark:text-jalur-muted">
                        <i class="fas fa-inbox text-4xl mb-2 block"></i>
                        Tidak ada surat jalan aktif
                    </td>
                </tr>`;
        }
    }

    function updateHistoryTable() {
        const tableBody = document.getElementById('history-table-body');
        tableBody.innerHTML = '';
        
        // HANYA TAMPILKAN YANG SELESAI
        const completedShipments = shipments.filter(s => s.status === 'Selesai');
        
        completedShipments.sort((a,b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)).forEach(s => {
            const completedDate = s.completedAt ? new Date(s.completedAt).toLocaleDateString('id-ID') : 'N/A';
            
            tableBody.innerHTML += `
                <tr class="border-b border-slate-200 dark:border-jalur-muted/20 hover:bg-slate-50 dark:hover:bg-jalur-dark/50">
                    <td class="p-3 font-mono text-xs">${s.id}</td>
                    <td class="p-3 font-semibold">${s.driverName}</td>
                    <td class="p-3">${s.destination}</td>
                    <td class="p-3">${completedDate}</td>
                    <td class="p-3">
                        <button data-action="view-shipment-detail" data-shipment-id="${s.id}" class="text-sky-500 hover:text-sky-700">
                            <i class="fas fa-eye"></i> Detail
                        </button>
                    </td>
                </tr>`;
        });

        if (completedShipments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="p-8 text-center text-slate-500 dark:text-jalur-muted">
                        <i class="fas fa-archive text-4xl mb-2 block"></i>
                        Belum ada pengiriman yang selesai
                    </td>
                </tr>`;
        }
    }

    function updateFinanceStats() {
        const statsContainer = document.getElementById('finance-stats');
        const totalTransactions = transactions.length;
        const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const thisMonthTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.timestamp);
            const now = new Date();
            return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
        }).length;

        statsContainer.innerHTML = `
            <div class="bg-green-500 dark:bg-green-600 text-white p-6 rounded-lg shadow flex items-center gap-4">
                <i class="fas fa-receipt text-4xl opacity-75"></i>
                <div>
                    <h4 class="font-semibold">Total Transaksi</h4>
                    <p class="text-3xl font-bold">${totalTransactions}</p>
                </div>
            </div>
            <div class="bg-blue-500 dark:bg-blue-600 text-white p-6 rounded-lg shadow flex items-center gap-4">
                <i class="fas fa-money-bill-wave text-4xl opacity-75"></i>
                <div>
                    <h4 class="font-semibold">Total Nilai</h4>
                    <p class="text-2xl font-bold">Rp ${totalAmount.toLocaleString('id-ID')}</p>
                </div>
            </div>
            <div class="bg-purple-500 dark:bg-purple-600 text-white p-6 rounded-lg shadow flex items-center gap-4">
                <i class="fas fa-calendar-month text-4xl opacity-75"></i>
                <div>
                    <h4 class="font-semibold">Bulan Ini</h4>
                    <p class="text-3xl font-bold">${thisMonthTransactions}</p>
                </div>
            </div>
        `;
    }

    function updateFinanceTable() {
        const tableBody = document.getElementById('finance-table-body');
        tableBody.innerHTML = '';
        
        transactions.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(transaction => {
            const shipment = shipments.find(s => s.id === transaction.shipmentId);
            const driverName = shipment ? shipment.driverName : 'N/A';
            const transactionDate = new Date(transaction.timestamp).toLocaleDateString('id-ID');
            
            tableBody.innerHTML += `
                <tr class="border-b border-slate-200 dark:border-jalur-muted/20 hover:bg-slate-50 dark:hover:bg-jalur-dark/50">
                    <td class="p-3">${transactionDate}</td>
                    <td class="p-3 font-mono text-xs">${transaction.shipmentId}</td>
                    <td class="p-3 font-semibold">${driverName}</td>
                    <td class="p-3 font-bold text-green-600">Rp ${transaction.amount.toLocaleString('id-ID')}</td>
                    <td class="p-3">
                        ${transaction.proofBase64 ? 
                            `<button data-action="view-image" data-img-src="${transaction.proofBase64}" class="text-sky-500 hover:text-sky-700">
                                <i class="fas fa-image"></i> Lihat
                             </button>` : 
                            '<span class="text-slate-400">Tidak ada</span>'
                        }
                    </td>
                    <td class="p-3 space-x-2">
                        <button data-action="view-transaction" data-transaction-id="${transaction.id}" class="text-slate-500 hover:text-slate-700">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button data-action="edit-transaction" data-transaction-id="${transaction.id}" class="text-sky-500 hover:text-sky-700">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button data-action="delete-transaction" data-transaction-id="${transaction.id}" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>`;
        });

        if (transactions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="p-8 text-center text-slate-500 dark:text-jalur-muted">
                        <i class="fas fa-wallet text-4xl mb-2 block"></i>
                        Belum ada transaksi uang jalan
                    </td>
                </tr>`;
        }
    }

    // --- UPDATE DRIVERS TABLE - DIPERBAIKI ---
    function updateDriversTable() {
        const tableBody = document.getElementById('drivers-table-body');
        tableBody.innerHTML = '';
        
        const drivers = users.filter(u => u.role === 'supir');
        
        drivers.forEach(driver => {
            // Cek apakah supir sedang aktif (ada tugas yang sedang berjalan)
            const activeShipment = shipments.find(s => s.driverId === driver.id && (s.status === 'Menunggu' || s.status === 'Dalam Perjalanan'));
            const statusBadge = activeShipment ? 
                '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Aktif</span>' :
                '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300">Standby</span>';
                
            tableBody.innerHTML += `
                <tr class="border-b border-slate-200 dark:border-jalur-muted/20 hover:bg-slate-50 dark:hover:bg-jalur-dark/50">
                    <td class="p-3 font-bold">${driver.name}</td>
                    <td class="p-3 font-mono text-sm">${driver.username}</td>
                    <td class="p-3">${driver.phone || '-'}</td>
                    <td class="p-3">${driver.vehicleType || '-'}</td>
                    <td class="p-3 font-mono">${driver.licensePlate || '-'}</td>
                    <td class="p-3">${statusBadge}</td>
                    <td class="p-3 space-x-2">
                        <button data-action="view-driver" data-driver-id="${driver.id}" 
                                class="text-slate-500 hover:text-slate-700 transition-colors" 
                                title="Lihat Detail">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button data-action="edit-driver" data-driver-id="${driver.id}" 
                                class="text-sky-500 hover:text-sky-700 transition-colors" 
                                title="Edit Supir">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button data-action="delete-driver" data-driver-id="${driver.id}" 
                                class="text-red-500 hover:text-red-700 transition-colors" 
                                title="Hapus Supir">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        if (drivers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="p-8 text-center text-slate-500 dark:text-jalur-muted">
                        <i class="fas fa-user-plus text-4xl mb-2 block"></i>
                        Belum ada supir yang terdaftar
                    </td>
                </tr>`;
        }
    }

    function updateReportsTable() {
        const tableBody = document.getElementById('reports-table-body');
        tableBody.innerHTML = '';
        
        reports.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(report => {
            const proofButton = report.photoBase64 
                ? `<button data-action="view-image" data-img-src="${report.photoBase64}" class="text-sky-500 hover:text-sky-700 transition-colors">
                     <i class="fas fa-camera mr-1"></i> Lihat
                   </button>`
                : `<span class="text-slate-400">-</span>`;

            // Tentukan kategori berdasarkan deskripsi atau set default
            const category = report.category || 'Lainnya';
            const statusBadge = report.status || 'Menunggu';
            const statusColor = statusBadge === 'Selesai' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                               statusBadge === 'Dalam Proses' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                               'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
                
            tableBody.innerHTML += `
                <tr class="border-b border-slate-200 dark:border-jalur-muted/20 hover:bg-slate-50 dark:hover:bg-jalur-dark/50">
                    <td class="p-3 text-sm">${new Date(report.timestamp).toLocaleString('id-ID')}</td>
                    <td class="p-3 font-semibold">${report.driverName}</td>
                    <td class="p-3">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
                            ${category}
                        </span>
                    </td>
                    <td class="p-3 text-sm max-w-xs truncate" title="${report.description}">${report.description}</td>
                    <td class="p-3">${proofButton}</td>
                    <td class="p-3">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
                            ${statusBadge}
                        </span>
                    </td>
                    <td class="p-3 space-x-2">
                        <button data-action="resolve-report" data-report-id="${report.id}" 
                                class="text-green-500 hover:text-green-700 transition-colors ${report.status === 'Selesai' ? 'opacity-50 cursor-not-allowed' : ''}" 
                                title="Tandai Selesai"
                                ${report.status === 'Selesai' ? 'disabled' : ''}>
                            <i class="fas fa-check"></i>
                        </button>
                        <button data-action="view-report-detail" data-report-id="${report.id}" 
                                class="text-sky-500 hover:text-sky-700 transition-colors" 
                                title="Lihat Detail">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        if (reports.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="p-8 text-center text-slate-500 dark:text-jalur-muted">
                        <i class="fas fa-clipboard-list text-4xl mb-2 block"></i>
                        Belum ada laporan kendala
                    </td>
                </tr>`;
        }
    }

    // --- MODAL FUNCTIONS ---
    function openCreateShipmentModal() {
        const shipmentModal = document.getElementById('create-shipment-modal');
        const driverSelect = document.getElementById('driver');
        
        driverSelect.innerHTML = '<option value="">-- Pilih Supir --</option>';
        users.filter(u => u.role === 'supir').forEach(driver => {
            driverSelect.innerHTML += `<option value="${driver.id}">${driver.name} (${driver.vehicleType || 'Kendaraan tidak diset'})</option>`;
        });
        
        document.getElementById('create-shipment-form').reset();
        shipmentModal.classList.remove('hidden');
        setTimeout(() => shipmentModal.classList.remove('opacity-0'), 10);
        
        // Setup event listeners jika belum ada
        setupShipmentModalEvents();
    }

    function setupShipmentModalEvents() {
        const shipmentModal = document.getElementById('create-shipment-modal');
        const shipmentForm = document.getElementById('create-shipment-form');
        
        // Remove existing listeners to prevent duplicates
        const newForm = shipmentForm.cloneNode(true);
        shipmentForm.parentNode.replaceChild(newForm, shipmentForm);
        
        document.getElementById('close-shipment-modal-btn').onclick = closeCreateShipmentModal;
        document.getElementById('cancel-shipment-modal-btn').onclick = closeCreateShipmentModal;
        
        document.getElementById('create-shipment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const selectedDriverId = parseInt(document.getElementById('driver').value);
            const selectedDriver = users.find(u => u.id === selectedDriverId);
            
            if (!selectedDriver) {
                alert('Silakan pilih supir yang valid.');
                return;
            }
            
            const newShipment = {
                id: `SJ-${Date.now()}`,
                driverId: selectedDriver.id,
                driverName: selectedDriver.name,
                destination: document.getElementById('destination').value,
                items: document.getElementById('items').value,
                status: 'Menunggu',
                createdAt: new Date().toISOString(),
                locationHistory: []
            };
            
            shipments.push(newShipment);
            localStorage.setItem('shipments', JSON.stringify(shipments));
            renderManagerDashboard();
            closeCreateShipmentModal();
            
            // Show success notification
            showNotification('Surat jalan berhasil dibuat dan akan muncul di dashboard supir', 'success');
        });
    }

    function closeCreateShipmentModal() {
        const shipmentModal = document.getElementById('create-shipment-modal');
        shipmentModal.classList.add('opacity-0');
        setTimeout(() => shipmentModal.classList.add('hidden'), 300);
    }

    // --- DRIVER MANAGEMENT - DIPERBAIKI ---
    function openDriverModal(driverId = null, isViewMode = false) {
        const driverModal = document.getElementById('driver-modal');
        const driverForm = document.getElementById('driver-form');
        const modalTitle = document.getElementById('driver-modal-title');
        
        modalTitle.textContent = driverId ? (isViewMode ? 'Detail Supir' : 'Edit Supir') : 'Tambah Supir Baru';
        
        const driver = driverId ? users.find(u => u.id === driverId) : null;
        
        const formHTML = `
            <input type="hidden" id="driver-id" value="${driver ? driver.id : ''}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="driver-name" class="block text-sm font-medium mb-2">Nama Lengkap</label>
                    <input type="text" id="driver-name" required 
                           value="${driver ? driver.name : ''}"
                           ${isViewMode ? 'readonly' : ''}
                           class="w-full p-3 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
                </div>
                <div>
                    <label for="driver-username" class="block text-sm font-medium mb-2">Username</label>
                    <input type="text" id="driver-username" required 
                           value="${driver ? driver.username : ''}"
                           ${isViewMode ? 'readonly' : ''}
                           class="w-full p-3 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="driver-password" class="block text-sm font-medium mb-2">Password</label>
                    <input type="password" id="driver-password" 
                           ${!driver && !isViewMode ? 'required' : ''}
                           ${isViewMode ? 'readonly placeholder="********"' : ''}
                           class="w-full p-3 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
                    <small class="text-slate-500 dark:text-jalur-muted text-xs mt-1 block">
                        ${driver && !isViewMode ? 'Kosongkan jika tidak ingin mengubah password' : !isViewMode ? 'Password minimal 6 karakter' : ''}
                    </small>
                </div>
                <div>
                    <label for="driver-phone" class="block text-sm font-medium mb-2">Nomor Telepon</label>
                    <input type="tel" id="driver-phone" 
                           value="${driver ? driver.phone || '' : ''}"
                           ${isViewMode ? 'readonly' : ''}
                           placeholder="08xxxxxxxxxx"
                           class="w-full p-3 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="driver-vehicle-type" class="block text-sm font-medium mb-2">Jenis Kendaraan</label>
                    <select id="driver-vehicle-type" 
                            ${isViewMode ? 'disabled' : ''}
                            class="w-full p-3 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
                        <option value="">-- Pilih Jenis Kendaraan --</option>
                        ${vehicleTypes.map(type => 
                            `<option value="${type}" ${driver && driver.vehicleType === type ? 'selected' : ''}>${type}</option>`
                        ).join('')}
                    </select>
                </div>
                <div>
                    <label for="driver-license-plate" class="block text-sm font-medium mb-2">Plat Nomor</label>
                    <input type="text" id="driver-license-plate" 
                           value="${driver ? driver.licensePlate || '' : ''}"
                           ${isViewMode ? 'readonly' : ''}
                           placeholder="B 1234 XYZ"
                           class="w-full p-3 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
                </div>
            </div>
            <div>
                <label for="driver-notes" class="block text-sm font-medium mb-2">Catatan Tambahan</label>
                <textarea id="driver-notes" rows="3" 
                          ${isViewMode ? 'readonly' : ''}
                          placeholder="Catatan khusus untuk supir ini (opsional)"
                          class="w-full p-3 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">${driver ? driver.notes || '' : ''}</textarea>
            </div>
            ${!isViewMode ? `
            <div class="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-jalur-muted/20">
                <button type="button" id="cancel-driver-modal-btn" 
                        class="px-6 py-3 rounded-md bg-slate-200 dark:bg-jalur-muted text-slate-800 dark:text-white font-semibold hover:bg-slate-300 dark:hover:bg-jalur-muted/80 transition-colors">
                    Batal
                </button>
                <button type="submit" 
                        class="px-6 py-3 rounded-md bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors">
                    <i class="fas fa-save mr-2"></i>${driver ? 'Update' : 'Simpan'} Supir
                </button>
            </div>
            ` : `
            <div class="flex justify-end pt-6 border-t border-slate-200 dark:border-jalur-muted/20">
                <button type="button" id="close-view-driver-modal-btn" 
                        class="px-6 py-3 rounded-md bg-slate-500 text-white font-semibold hover:bg-slate-600 transition-colors">
                    Tutup
                </button>
            </div>
            `}
        `;
        
        driverForm.innerHTML = formHTML;
        
        driverModal.classList.remove('hidden');
        setTimeout(() => driverModal.classList.remove('opacity-0'), 10);
        
        setupDriverModalEvents(isViewMode);
    }

    function setupDriverModalEvents(isViewMode = false) {
        // Remove existing listeners to prevent duplicates
        const driverForm = document.getElementById('driver-form');
        const newForm = driverForm.cloneNode(true);
        driverForm.parentNode.replaceChild(newForm, driverForm);
        
        document.getElementById('close-driver-modal-btn').onclick = closeDriverModal;
        
        if (isViewMode) {
            document.getElementById('close-view-driver-modal-btn').onclick = closeDriverModal;
        } else {
            document.getElementById('cancel-driver-modal-btn').onclick = closeDriverModal;
            document.getElementById('driver-form').addEventListener('submit', handleDriverFormSubmit);
        }
    }

    function handleDriverFormSubmit(e) {
        e.preventDefault();
        
        const driverId = document.getElementById('driver-id').value;
        const username = document.getElementById('driver-username').value.trim();
        const password = document.getElementById('driver-password').value;
        const name = document.getElementById('driver-name').value.trim();
        const phone = document.getElementById('driver-phone').value.trim();
        const vehicleType = document.getElementById('driver-vehicle-type').value;
        const licensePlate = document.getElementById('driver-license-plate').value.trim();
        const notes = document.getElementById('driver-notes').value.trim();

        // Validasi
        if (!name || !username || !vehicleType) {
            showNotification('Nama, username, dan jenis kendaraan wajib diisi!', 'error');
            return;
        }

        if (!driverId && (!password || password.length < 6)) {
            showNotification('Password minimal 6 karakter!', 'error');
            return;
        }

        if (driverId && password && password.length < 6) {
            showNotification('Password minimal 6 karakter!', 'error');
            return;
        }

        // Cek username unik
        const isUsernameTaken = users.some(u => u.username === username && u.id != driverId);
        if (isUsernameTaken) {
            showNotification('Username sudah digunakan. Silakan pilih yang lain.', 'error');
            return;
        }
        
        const driverData = {
            name: name,
            username: username,
            role: 'supir',
            phone: phone,
            vehicleType: vehicleType,
            licensePlate: licensePlate,
            notes: notes
        };

        if (driverId) { // Update
            const index = users.findIndex(u => u.id == driverId);
            users[index] = { ...users[index], ...driverData };
            if (password) users[index].password = password;
            showNotification('Data supir berhasil diperbarui!', 'success');
        } else { // Create
            driverData.id = Date.now();
            driverData.password = password;
            users.push(driverData);
            showNotification('Supir berhasil ditambahkan!', 'success');
        }

        localStorage.setItem('users', JSON.stringify(users));
        renderManagerDrivers();
        closeDriverModal();
    }

    function closeDriverModal() {
        const driverModal = document.getElementById('driver-modal');
        driverModal.classList.add('opacity-0');
        setTimeout(() => driverModal.classList.add('hidden'), 300);
    }

    function deleteDriver(driverId) {
        const driver = users.find(u => u.id === driverId);
        if (!driver) return;
        
        // Check if driver has active shipments
        const activeShipments = shipments.filter(s => s.driverId === driverId && s.status !== 'Selesai');
        if (activeShipments.length > 0) {
            showNotification('Tidak dapat menghapus supir yang memiliki surat jalan aktif', 'error');
            return;
        }
        
        if (confirm(`Anda yakin ingin menghapus supir ${driver.name}?\n\nData yang akan dihapus:\n- Akun login\n- Informasi kendaraan\n- Riwayat akan tetap tersimpan`)) {
            users = users.filter(u => u.id !== driverId);
            localStorage.setItem('users', JSON.stringify(users));
            renderManagerDrivers();
            showNotification('Supir berhasil dihapus', 'success');
        }
    }

    // --- TRANSACTION MANAGEMENT ---
    function openTransactionModal(shipmentId) {
        const transactionModal = document.getElementById('transaction-modal');
        const shipment = shipments.find(s => s.id === shipmentId);
        
        if (!shipment) {
            alert('Surat jalan tidak ditemukan');
            return;
        }
        
        document.getElementById('transaction-shipment-id').value = shipmentId;
        document.getElementById('transaction-form').reset();
        document.getElementById('transaction-preview').classList.add('hidden');
        
        transactionModal.classList.remove('hidden');
        setTimeout(() => transactionModal.classList.remove('opacity-0'), 10);
        
        setupTransactionModalEvents();
    }

    function setupTransactionModalEvents() {
        // Remove existing listeners
        const oldForm = document.getElementById('transaction-form');
        const newForm = oldForm.cloneNode(true);
        oldForm.parentNode.replaceChild(newForm, oldForm);
        
        document.getElementById('close-transaction-modal-btn').onclick = closeTransactionModal;
        document.getElementById('cancel-transaction-modal-btn').onclick = closeTransactionModal;
        
        // File preview
        document.getElementById('transaction-proof').addEventListener('change', (e) => {
            const file = e.target.files[0];
            const preview = document.getElementById('transaction-preview');
            
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    preview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            } else {
                preview.classList.add('hidden');
            }
        });
        
        // Form submit
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const shipmentId = document.getElementById('transaction-shipment-id').value;
            const amount = parseInt(document.getElementById('transaction-amount').value);
            const proofFile = document.getElementById('transaction-proof').files[0];
            
            if (!proofFile) {
                alert('Silakan upload bukti transfer');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const newTransaction = {
                    id: `TXN-${Date.now()}`,
                    shipmentId: shipmentId,
                    amount: amount,
                    proofBase64: e.target.result,
                    timestamp: new Date().toISOString(),
                    createdBy: loggedInUser.name
                };
                
                transactions.push(newTransaction);
                localStorage.setItem('transactions', JSON.stringify(transactions));
                
                // Update current view
                if (document.getElementById('manager-dashboard-view').classList.contains('view-hidden') === false) {
                    renderManagerDashboard();
                } else if (document.getElementById('manager-finance-view').classList.contains('view-hidden') === false) {
                    renderFinanceManagement();
                }
                
                closeTransactionModal();
                showNotification('Transaksi uang jalan berhasil dicatat', 'success');
            };
            reader.readAsDataURL(proofFile);
        });
    }

    function closeTransactionModal() {
        const transactionModal = document.getElementById('transaction-modal');
        transactionModal.classList.add('opacity-0');
        setTimeout(() => transactionModal.classList.add('hidden'), 300);
    }

    function viewTransactionDetails(transactionId) {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return;
        
        const shipment = shipments.find(s => s.id === transaction.shipmentId);
        
        alert(`Detail Transaksi:
ID: ${transaction.id}
Surat Jalan: ${transaction.shipmentId}
Supir: ${shipment ? shipment.driverName : 'N/A'}
Jumlah: Rp ${transaction.amount.toLocaleString('id-ID')}
Tanggal: ${new Date(transaction.timestamp).toLocaleString('id-ID')}
Dibuat oleh: ${transaction.createdBy}`);
    }

    function editTransaction(transactionId) {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return;
        
        const newAmount = prompt('Edit jumlah uang jalan:', transaction.amount);
        if (newAmount && !isNaN(newAmount)) {
            transaction.amount = parseInt(newAmount);
            transaction.updatedAt = new Date().toISOString();
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            updateFinanceTable();
            updateFinanceStats();
            showNotification('Transaksi berhasil diupdate', 'success');
        }
    }

    function deleteTransaction(transactionId) {
        if (confirm('Anda yakin ingin menghapus transaksi ini?')) {
            transactions = transactions.filter(t => t.id !== transactionId);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            updateFinanceTable();
            updateFinanceStats();
            showNotification('Transaksi berhasil dihapus', 'success');
        }
    }

    // --- SHIPMENT DETAILS ---
    function viewShipmentDetail(shipmentId) {
        const shipment = shipments.find(s => s.id === shipmentId);
        if (!shipment) return;
        
        const transaction = transactions.find(t => t.shipmentId === shipmentId);
        const transactionInfo = transaction ? 
            `Uang Jalan: Rp ${transaction.amount.toLocaleString('id-ID')} (${new Date(transaction.timestamp).toLocaleDateString('id-ID')})` : 
            'Uang Jalan: Belum dibayar';
        
        alert(`Detail Surat Jalan:
ID: ${shipment.id}
Supir: ${shipment.driverName}
Tujuan: ${shipment.destination}
Barang: ${shipment.items}
Status: ${shipment.status}
Dibuat: ${new Date(shipment.createdAt).toLocaleString('id-ID')}
${shipment.completedAt ? `Selesai: ${new Date(shipment.completedAt).toLocaleString('id-ID')}` : ''}
${transactionInfo}`);
    }

    // --- IMAGE VIEWER ---
    function openImageViewerModal(imageSrc) {
        const imageViewerModal = document.getElementById('image-viewer-modal');
        document.getElementById('image-viewer-src').src = imageSrc;
        imageViewerModal.classList.remove('hidden');
        setTimeout(() => imageViewerModal.classList.remove('opacity-0'), 10);
        
        document.getElementById('close-image-viewer-btn').onclick = () => {
            imageViewerModal.classList.add('opacity-0');
            setTimeout(() => imageViewerModal.classList.add('hidden'), 300);
        };
    }

    // --- NOTIFICATION SYSTEM ---
    function showNotification(message, type = 'info') {
        // Use Toastify if available, otherwise use alert
        if (typeof Toastify !== 'undefined') {
            const bgColor = type === 'success' ? '#10B981' : 
                           type === 'error' ? '#EF4444' : 
                           type === 'warning' ? '#F59E0B' : '#3B82F6';
            
            Toastify({
                text: message,
                duration: 3000,
                gravity: "top",
                position: "right",
                style: {
                    background: bgColor,
                }
            }).showToast();
        } else {
            alert(message);
        }
    }

    // --- REFRESH DATA FUNCTIONS ---
    function refreshData() {
        shipments = JSON.parse(localStorage.getItem('shipments')) || [];
        users = JSON.parse(localStorage.getItem('users')) || [];
        reports = JSON.parse(localStorage.getItem('reports')) || [];
        transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    }

    // Auto refresh data every 30 seconds
    setInterval(refreshData, 30000);

    // --- INISIALISASI ---
    initManager();
})();