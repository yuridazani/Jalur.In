// === SUPIR MODULE - DIPERBAIKI ===
(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    let shipments = JSON.parse(localStorage.getItem('shipments')) || [];
    let reports = JSON.parse(localStorage.getItem('reports')) || [];
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let activeSupirFilter = 'aktif'; // Default filter
    
    // Global variable untuk interval pengingat lokasi
    window.locationUpdateInterval = null;

    // === INISIALISASI SUPIR ===
    function initSupir() {
        setupSupirNav();
        renderSupirView(); // Default view dengan filter aktif
        setupEventListeners();
    }

    // === SETUP NAVIGASI ===
    function setupSupirNav() {
        const sidebarNav = document.getElementById('sidebar-nav');
        sidebarNav.innerHTML = `
            <a href="#" data-filter="aktif" class="nav-link flex items-center gap-3 p-3 rounded-lg font-bold">
                <i class="fas fa-shipping-fast fa-fw w-6 text-center"></i> 
                <span>Tugas Aktif</span>
            </a>
            <a href="#" data-filter="selesai" class="nav-link flex items-center gap-3 p-3 rounded-lg font-bold">
                <i class="fas fa-history fa-fw w-6 text-center"></i> 
                <span>Riwayat Tugas</span>
            </a>
            <div class="border-t border-slate-200 dark:border-jalur-muted/20 my-2"></div>
            <a href="#" data-view="supir-finance" class="nav-link flex items-center gap-3 p-3 rounded-lg font-bold">
                <i class="fas fa-wallet fa-fw w-6 text-center"></i> 
                <span>Info Uang Jalan</span>
            </a>
        `;
    }

    // === EVENT LISTENERS ===
    function setupEventListeners() {
        const sidebarNav = document.getElementById('sidebar-nav');
        
        sidebarNav.addEventListener('click', (e) => {
            const navLink = e.target.closest('a.nav-link');
            if (!navLink) return;
            e.preventDefault();
            
            // Tutup sidebar di mobile
            if (window.closeSidebar) {
                window.closeSidebar();
            }

            const filter = navLink.dataset.filter;
            const view = navLink.dataset.view;

            if (filter) {
                activeSupirFilter = filter;
                renderSupirView();
            } else if (view === 'supir-finance') {
                renderSupirFinanceView();
            }
        });

        // Event listener untuk tombol-tombol aksi
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;
            const action = button.dataset.action || button.id;
            handleSupirAction(action, button);
        });

        // Event listener untuk melihat gambar
        document.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'view-image') {
                openImageViewerModal(e.target.dataset.imgSrc);
            }
        });
    }

    // === HANDLER AKSI SUPIR ===
    function handleSupirAction(action, button) {
        switch (action) {
            case 'report-issue-btn':
                openReportIssueModal();
                break;
            case 'mulai-task':
                startTask(button.dataset.taskId);
                break;
            case 'update-location':
                updateLocationTask(button);
                break;
            case 'selesai-task':
                completeTask(button.dataset.taskId);
                break;
            case 'view-image':
                openImageViewerModal(button.dataset.imgSrc);
                break;
        }
    }

    // === RENDER FUNCTIONS ===
    function renderSupirView() {
        const activeNavSelector = activeSupirFilter === 'aktif' ? '[data-filter="aktif"]' : '[data-filter="selesai"]';
        window.switchView('supir-view', activeNavSelector);

        const pageTitle = document.getElementById('page-title');
        const headerActions = document.getElementById('header-actions');
        
        pageTitle.textContent = activeSupirFilter === 'aktif' ? 'Tugas Aktif' : 'Riwayat Tugas';
        headerActions.innerHTML = `
            <button id="report-issue-btn" class="px-4 py-2 rounded-md bg-red-500 text-white font-semibold flex items-center gap-2 shadow hover:bg-red-600 transition-colors">
                <i class="fas fa-exclamation-triangle"></i> Lapor Kendala
            </button>
        `;

        const tasksList = document.getElementById('supir-tasks-list');
        tasksList.innerHTML = '';

        // Refresh data untuk memastikan data terbaru
        refreshData();

        const myTasks = shipments.filter(s => {
            if (activeSupirFilter === 'aktif') {
                return s.driverId === loggedInUser.id && (s.status === 'Menunggu' || s.status === 'Dalam Perjalanan');
            } else {
                return s.driverId === loggedInUser.id && s.status === 'Selesai';
            }
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (myTasks.length === 0) {
            const emptyMessage = activeSupirFilter === 'aktif' ? 'Tidak ada tugas aktif saat ini.' : 'Tidak ada riwayat tugas.';
            tasksList.innerHTML = `<p class="text-center text-slate-500 dark:text-jalur-muted p-8">${emptyMessage}</p>`;
            if (activeSupirFilter === 'aktif') stopLocationReminder();
            return;
        }

        myTasks.forEach(task => {
            const statusColor = task.status === 'Selesai' ? 'bg-green-500/10 text-green-500' : 
                               (task.status === 'Dalam Perjalanan' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-500/10 text-slate-500');
            
            tasksList.innerHTML += `
                <div class="bg-white dark:bg-jalur-dark-2 p-6 rounded-lg shadow">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm text-slate-500 dark:text-jalur-muted">${task.id}</p>
                            <h3 class="text-xl font-bold">${task.destination}</h3>
                            <p class="text-sm text-slate-500 dark:text-jalur-muted">Barang: ${task.items}</p>
                        </div>
                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
                            ${task.status}
                        </span>
                    </div>
                    <div class="mt-4 pt-4 border-t border-slate-200 dark:border-jalur-muted/20 flex flex-col sm:flex-row gap-2">
                        <button data-action="mulai-task" data-task-id="${task.id}" 
                                class="flex-1 p-2 rounded-lg bg-sky-500 text-white font-bold ${task.status !== 'Menunggu' ? 'opacity-50 cursor-not-allowed' : ''}" 
                                ${task.status !== 'Menunggu' ? 'disabled' : ''}>
                            Mulai
                        </button>
                        <button data-action="update-location" data-task-id="${task.id}" 
                                class="flex-1 p-2 rounded-lg bg-sky-500 text-white font-bold ${task.status !== 'Dalam Perjalanan' ? 'opacity-50 cursor-not-allowed' : ''}" 
                                ${task.status !== 'Dalam Perjalanan' ? 'disabled' : ''}>
                            Update Lokasi
                        </button>
                        <button data-action="selesai-task" data-task-id="${task.id}" 
                                class="flex-1 p-2 rounded-lg bg-green-500 text-white font-bold ${task.status !== 'Dalam Perjalanan' ? 'opacity-50 cursor-not-allowed' : ''}" 
                                ${task.status !== 'Dalam Perjalanan' ? 'disabled' : ''}>
                            Selesai
                        </button>
                    </div>
                </div>
            `;
        });

        // Kelola pengingat lokasi
        if (activeSupirFilter === 'aktif') {
            checkAndStartLocationReminder();
        } else {
            stopLocationReminder();
        }
    }

    // === RENDER SUPIR FINANCE VIEW - DIPERBAIKI ===
    function renderSupirFinanceView() {
        // Buat view baru jika belum ada
        createSupirFinanceView();
        
        // Switch ke view finance
        window.switchView('supir-finance-view', '[data-view="supir-finance"]');

        const pageTitle = document.getElementById('page-title');
        const headerActions = document.getElementById('header-actions');
        
        pageTitle.textContent = 'Info Uang Jalan';
        headerActions.innerHTML = ''; // Tidak ada aksi di header

        // Refresh data untuk memastikan data terbaru
        refreshData();

        const tableBody = document.getElementById('supir-transactions-table');
        tableBody.innerHTML = '';

        // Filter transaksi berdasarkan shipment yang dimiliki supir ini
        const myShipmentIds = shipments
            .filter(s => s.driverId === loggedInUser.id)
            .map(s => s.id);

        const myTransactions = transactions
            .filter(t => myShipmentIds.includes(t.shipmentId))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        console.log('Supir ID:', loggedInUser.id);
        console.log('My Shipments:', myShipmentIds);
        console.log('My Transactions:', myTransactions);
        
        if (myTransactions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center p-8 text-slate-500 dark:text-jalur-muted">
                        <i class="fas fa-wallet text-4xl mb-2 block"></i>
                        Belum ada riwayat transaksi uang jalan.
                    </td>
                </tr>`;
            return;
        }

        // Update stats
        updateSupirFinanceStats(myTransactions);

        // Render tabel transaksi
        myTransactions.forEach(trans => {
            const shipment = shipments.find(s => s.id === trans.shipmentId);
            const destination = shipment ? shipment.destination : 'N/A';
            const formattedAmount = new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR', 
                minimumFractionDigits: 0 
            }).format(trans.amount);

            tableBody.innerHTML += `
                <tr class="border-b border-slate-200 dark:border-jalur-muted/20 hover:bg-slate-50 dark:hover:bg-jalur-dark/50">
                    <td class="p-3 font-mono text-xs">${trans.shipmentId}</td>
                    <td class="p-3 text-sm">${destination}</td>
                    <td class="p-3 font-semibold text-green-600">${formattedAmount}</td>
                    <td class="p-3 text-sm">${new Date(trans.timestamp).toLocaleString('id-ID')}</td>
                    <td class="p-3">
                        ${trans.proofBase64 ? 
                            `<button data-action="view-image" data-img-src="${trans.proofBase64}" class="text-sky-500 hover:text-sky-700 font-semibold text-sm">
                                <i class="fas fa-image mr-1"></i>Lihat Bukti
                             </button>` : 
                            '<span class="text-slate-400">Tidak ada</span>'
                        }
                    </td>
                </tr>
            `;
        });
    }

    // === CREATE SUPIR FINANCE VIEW ===
    function createSupirFinanceView() {
        if (!document.getElementById('supir-finance-view')) {
            const mainContentArea = document.getElementById('main-content-area');
            mainContentArea.insertAdjacentHTML('beforeend', `
                <div id="supir-finance-view" class="view-hidden space-y-6">
                    <!-- Stats Keuangan Supir -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="supir-finance-stats">
                        <!-- Stats akan diisi oleh JS -->
                    </div>
                    
                    <!-- Tabel Transaksi Supir -->
                    <div class="bg-white dark:bg-jalur-dark-2 p-6 rounded-lg shadow">
                        <div class="mb-4">
                            <h3 class="text-xl font-bold mb-2">Riwayat Uang Jalan Saya</h3>
                            <p class="text-slate-500 dark:text-jalur-muted text-sm">Daftar transaksi uang jalan yang telah Anda terima untuk setiap pengiriman</p>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead class="border-b border-slate-200 dark:border-jalur-muted/20">
                                    <tr>
                                        <th class="p-3">ID Pengiriman</th>
                                        <th class="p-3">Tujuan</th>
                                        <th class="p-3">Jumlah</th>
                                        <th class="p-3">Waktu</th>
                                        <th class="p-3">Bukti</th>
                                    </tr>
                                </thead>
                                <tbody id="supir-transactions-table">
                                    <!-- Data akan diisi oleh JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `);
        }
    }

    // === UPDATE SUPIR FINANCE STATS ===
    function updateSupirFinanceStats(myTransactions) {
        const statsContainer = document.getElementById('supir-finance-stats');
        const totalTransactions = myTransactions.length;
        const totalAmount = myTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const thisMonthTransactions = myTransactions.filter(t => {
            const transactionDate = new Date(t.timestamp);
            const now = new Date();
            return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
        }).length;
        const thisMonthAmount = myTransactions.filter(t => {
            const transactionDate = new Date(t.timestamp);
            const now = new Date();
            return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
        }).reduce((sum, t) => sum + (t.amount || 0), 0);

        statsContainer.innerHTML = `
            <div class="bg-blue-500 dark:bg-blue-600 text-white p-6 rounded-lg shadow flex items-center gap-4">
                <i class="fas fa-receipt text-4xl opacity-75"></i>
                <div>
                    <h4 class="font-semibold">Total Transaksi</h4>
                    <p class="text-3xl font-bold">${totalTransactions}</p>
                </div>
            </div>
            <div class="bg-green-500 dark:bg-green-600 text-white p-6 rounded-lg shadow flex items-center gap-4">
                <i class="fas fa-money-bill-wave text-4xl opacity-75"></i>
                <div>
                    <h4 class="font-semibold">Total Diterima</h4>
                    <p class="text-2xl font-bold">Rp ${totalAmount.toLocaleString('id-ID')}</p>
                </div>
            </div>
            <div class="bg-purple-500 dark:bg-purple-600 text-white p-6 rounded-lg shadow flex items-center gap-4">
                <i class="fas fa-calendar-month text-4xl opacity-75"></i>
                <div>
                    <h4 class="font-semibold">Bulan Ini</h4>
                    <p class="text-2xl font-bold">Rp ${thisMonthAmount.toLocaleString('id-ID')}</p>
                </div>
            </div>
        `;
    }

    // === TASK ACTIONS ===
    function startTask(taskId) {
        const taskIndex = shipments.findIndex(s => s.id === taskId);
        if (taskIndex > -1) {
            shipments[taskIndex].status = 'Dalam Perjalanan';
            saveAndRerender();
            checkAndStartLocationReminder();
        }
    }

    function updateLocationTask(button) {
        const taskId = button.dataset.taskId;
        const taskIndex = shipments.findIndex(s => s.id === taskId);
        if (taskIndex > -1) {
            updateLocation(button, taskIndex);
        }
    }

    function completeTask(taskId) {
        const taskIndex = shipments.findIndex(s => s.id === taskId);
        if (taskIndex > -1) {
            shipments[taskIndex].status = 'Selesai';
            shipments[taskIndex].completedAt = new Date().toISOString();
            saveAndRerender();
        }
    }

    // === LOCATION FUNCTIONS ===
    function updateLocation(button, taskIndex) {
        if (!("geolocation" in navigator)) {
            alert("Browser Anda tidak mendukung Geolocation.");
            return;
        }
        
        const originalText = button.textContent;
        button.textContent = "Mencari...";
        button.disabled = true;
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    timestamp: new Date().toISOString()
                };
                shipments[taskIndex].locationHistory.push(newLocation);
                alert(`Lokasi berhasil diupdate!\nLat: ${newLocation.lat.toFixed(4)}, Lng: ${newLocation.lng.toFixed(4)}`);
                button.textContent = originalText;
                button.disabled = false;
                saveAndRerender();
            },
            (error) => {
                alert(`Gagal mendapatkan lokasi: ${error.message}`);
                button.textContent = originalText;
                button.disabled = false;
            }
        );
    }

    function checkAndStartLocationReminder() {
        const hasActiveShipment = shipments.some(s => s.driverId === loggedInUser.id && s.status === 'Dalam Perjalanan');
        if (hasActiveShipment) {
            startLocationReminder();
        } else {
            stopLocationReminder();
        }
    }

    function startLocationReminder() {
        if (window.locationUpdateInterval) {
            clearInterval(window.locationUpdateInterval);
        }
        
        console.log("Memulai pengingat lokasi otomatis...");
        const intervalDuration = 30000; // 30 detik untuk demo

        window.locationUpdateInterval = setInterval(() => {
            const stillHasActiveShipment = shipments.some(s => s.driverId === loggedInUser.id && s.status === 'Dalam Perjalanan');
            if (stillHasActiveShipment) {
                if (confirm("Sudah 30 detik sejak update terakhir. Update lokasi sekarang?")) {
                    const taskIndexToUpdate = shipments.findIndex(s => s.driverId === loggedInUser.id && s.status === 'Dalam Perjalanan');
                    if (taskIndexToUpdate !== -1) {
                        forceUpdateLocation(taskIndexToUpdate);
                    }
                }
            } else {
                stopLocationReminder();
            }
        }, intervalDuration);
    }

    function stopLocationReminder() {
        if (window.locationUpdateInterval) {
            console.log("Menghentikan pengingat lokasi otomatis.");
            clearInterval(window.locationUpdateInterval);
            window.locationUpdateInterval = null;
        }
    }

    function forceUpdateLocation(taskIndex) {
        if (!("geolocation" in navigator)) {
            alert("Browser Anda tidak mendukung Geolocation.");
            return;
        }
        
        alert("Meminta lokasi Anda secara otomatis...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    timestamp: new Date().toISOString()
                };
                shipments[taskIndex].locationHistory.push(newLocation);
                alert(`Lokasi berhasil diupdate secara otomatis!\nLat: ${newLocation.lat.toFixed(4)}, Lng: ${newLocation.lng.toFixed(4)}`);
                saveAndRerender();
            },
            (error) => {
                alert(`Gagal mendapatkan lokasi secara otomatis: ${error.message}`);
            }
        );
    }

    // === MODAL FUNCTIONS ===
    function openReportIssueModal() {
        const reportModal = document.getElementById('report-issue-modal');
        
        // Ambil kategori laporan dari localStorage
        const reportCategories = JSON.parse(localStorage.getItem('reportCategories')) || ['Ban Pecah', 'Mesin Overheat', 'Kecelakaan Ringan'];
        
        // Update form HTML dengan dropdown kategori
        const reportForm = document.getElementById('report-issue-form');
        reportForm.innerHTML = `
            <div>
                <label for="report-category" class="block text-sm font-medium text-slate-700 dark:text-jalur-light mb-2">Kategori Kendala</label>
                <select id="report-category" name="category" required 
                        class="mt-1 w-full p-3 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-jalur-accent dark:focus:border-jalur-accent transition-colors">
                    <option value="">-- Pilih Kategori --</option>
                    ${reportCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    <option value="Lainnya">Lainnya</option>
                </select>
            </div>
            <div id="custom-category-wrapper" class="hidden">
                <label for="custom-category" class="block text-sm font-medium text-slate-700 dark:text-jalur-light mb-2">Kategori Khusus</label>
                <input type="text" id="custom-category" name="customCategory" 
                    class="mt-1 w-full p-3 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-jalur-accent dark:focus:border-jalur-accent transition-colors"
                    placeholder="Tulis kategori khusus...">
            </div>
            <div>
                <label for="report-description" class="block text-sm font-medium text-slate-700 dark:text-jalur-light mb-2">Deskripsi Kendala</label>
                <textarea id="report-description" name="description" rows="4" required 
                        class="mt-1 w-full p-3 bg-slate-50 dark:bg-jalur-dark border border-slate-300 dark:border-jalur-muted/30 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-jalur-accent dark:focus:border-jalur-accent transition-colors"
                        placeholder="Jelaskan kendala yang dihadapi secara detail..."></textarea>
            </div>
            <div>
                <label for="report-photo" class="block text-sm font-medium text-slate-700 dark:text-jalur-light mb-2">Upload Foto Bukti</label>
                <input type="file" id="report-photo" name="photo" accept="image/*" required 
                    class="mt-1 w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 dark:file:bg-jalur-dark file:text-sky-700 dark:file:text-jalur-accent hover:file:bg-sky-100 dark:hover:file:bg-jalur-dark-2 transition-colors">
                <img id="photo-preview" src="" alt="Pratinjau Foto" class="mt-4 rounded-md max-h-48 border border-slate-300 dark:border-jalur-muted/30 hidden"/>
            </div>
            <div class="flex justify-end gap-4 pt-6">
                <button type="button" id="cancel-report-modal-btn" class="px-6 py-3 rounded-md bg-slate-200 dark:bg-jalur-muted text-slate-800 dark:text-white font-semibold hover:bg-slate-300 dark:hover:bg-jalur-muted/80 transition-colors">Batal</button>
                <button type="submit" class="px-6 py-3 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
                    <i class="fas fa-exclamation-triangle mr-2"></i>Kirim Laporan
                </button>
            </div>
        `;
        
        reportModal.classList.remove('hidden');
        setTimeout(() => reportModal.classList.remove('opacity-0'), 10);
        
        setupReportModalEvents();
    }

    function setupReportModalEvents() {
        document.getElementById('close-report-modal-btn').onclick = closeReportIssueModal;
        document.getElementById('cancel-report-modal-btn').onclick = closeReportIssueModal;
        
        // Handle kategori dropdown
        document.getElementById('report-category').addEventListener('change', (e) => {
            const customWrapper = document.getElementById('custom-category-wrapper');
            const customInput = document.getElementById('custom-category');
            
            if (e.target.value === 'Lainnya') {
                customWrapper.classList.remove('hidden');
                customInput.required = true;
            } else {
                customWrapper.classList.add('hidden');
                customInput.required = false;
                customInput.value = '';
            }
        });
        
        // Handle photo preview
        document.getElementById('report-photo').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('photo-preview').src = event.target.result;
                    document.getElementById('photo-preview').classList.remove('hidden');
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });

        // Handle form submit
        document.getElementById('report-issue-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const category = document.getElementById('report-category').value;
            const customCategory = document.getElementById('custom-category').value;
            const description = document.getElementById('report-description').value;
            const photoFile = document.getElementById('report-photo').files[0];
            
            if (!photoFile) {
                alert('Silakan pilih foto bukti terlebih dahulu.');
                return;
            }
            
            const finalCategory = category === 'Lainnya' ? customCategory : category;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const newReport = {
                    id: `RPT-${Date.now()}`,
                    driverId: loggedInUser.id,
                    driverName: loggedInUser.name,
                    category: finalCategory,
                    description: description,
                    photoBase64: event.target.result,
                    timestamp: new Date().toISOString(),
                    status: 'Menunggu' // Tambah status untuk tracking
                };
                
                reports.push(newReport);
                localStorage.setItem('reports', JSON.stringify(reports));

                if (typeof Toastify !== 'undefined') {
                    Toastify({
                        text: "Laporan berhasil dikirim!",
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        style: {
                            background: "linear-gradient(to right, #16a34a, #22c55e)",
                        },
                        stopOnFocus: true,
                    }).showToast();
                } else {
                    alert("Laporan berhasil dikirim!");
                }
                
                closeReportIssueModal();
            };
            reader.readAsDataURL(photoFile);
        });
    }

    function closeReportIssueModal() {
        const reportModal = document.getElementById('report-issue-modal');
        reportModal.classList.add('opacity-0');
        setTimeout(() => reportModal.classList.add('hidden'), 300);
    }

    // === IMAGE VIEWER MODAL ===
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

    // === UTILITY FUNCTIONS ===
    function saveAndRerender() {
        localStorage.setItem('shipments', JSON.stringify(shipments));
        renderSupirView();
    }

    function refreshData() {
        shipments = JSON.parse(localStorage.getItem('shipments')) || [];
        reports = JSON.parse(localStorage.getItem('reports')) || [];
        transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    }

    // Auto refresh data setiap 30 detik
    setInterval(refreshData, 30000);

    // === INISIALISASI ===
    initSupir();
})();