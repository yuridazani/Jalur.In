document.addEventListener('DOMContentLoaded', () => {
    // --- Pengecekan User & Inisialisasi Dasar ---
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        window.location.href = 'index.html';
        return;
    }

    // --- Setup UI Umum (Sidebar, Header, Tema, dll) ---
    setupCommonUI();


    // --- Muat Modul Berdasarkan Role ---
    loadRoleModule(loggedInUser.role);

    // --- FUNGSI SETUP UI UMUM ---
    function setupCommonUI() {
        // Setup User Header dengan info dan dropdown
        setupUserHeader(loggedInUser);
        
        // Setup Dropdown Menu di Header
        setupUserDropdown();
        
        // Setup Sidebar Mobile
        setupMobileSidebar();

        // Setup Tema (dipindah ke dropdown header)
        setupThemeToggle();
        
        // Setup Logout (dipindah ke dropdown header)
        setupLogout();
    }

    // --- SETUP USER HEADER ---
    function setupUserHeader(user) {
        // Generate initials dari nama user
        const initials = user.name.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
        
        // Update elemen header
        const userInitialsEl = document.getElementById('user-initials');
        const headerUserNameEl = document.getElementById('header-user-name');
        const headerUserRoleEl = document.getElementById('header-user-role');
        const mobileUserNameEl = document.getElementById('mobile-user-name');
        const mobileUserRoleEl = document.getElementById('mobile-user-role');
        const userGreetingEl = document.getElementById('user-greeting');

        if (userInitialsEl) userInitialsEl.textContent = initials;
        if (headerUserNameEl) headerUserNameEl.textContent = user.name;
        if (headerUserRoleEl) headerUserRoleEl.textContent = user.role;
        if (mobileUserNameEl) mobileUserNameEl.textContent = user.name;
        if (mobileUserRoleEl) mobileUserRoleEl.textContent = user.role;
        if (userGreetingEl) userGreetingEl.textContent = `Selamat datang kembali, ${user.name}!`;
    }

    // --- SETUP USER DROPDOWN ---
    function setupUserDropdown() {
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (!userMenuBtn || !userDropdown) return;
        
        let isOpen = false;
        
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });
        
        // Close dropdown saat klik di luar
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                closeDropdown();
            }
        });
        
        // Close dropdown saat ESC ditekan
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                closeDropdown();
            }
        });
        
        function toggleDropdown() {
            isOpen = !isOpen;
            userDropdown.classList.toggle('show', isOpen);
        }
        
        function closeDropdown() {
            isOpen = false;
            userDropdown.classList.remove('show');
        }

        // Export fungsi untuk digunakan oleh fungsi lain
        window.closeUserDropdown = closeDropdown;
    }

    // --- SETUP SIDEBAR MOBILE ---
    function setupMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const sidebarOverlay = document.getElementById('sidebar-overlay');

        if (!sidebar || !hamburgerBtn || !sidebarOverlay) return;

        function openSidebar() {
            sidebar.classList.remove('-translate-x-full');
            sidebarOverlay.classList.remove('hidden');
        }

        function closeSidebar() {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
        }

        hamburgerBtn.addEventListener('click', openSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Export untuk digunakan oleh fungsi lain
        window.closeSidebar = closeSidebar;
    }

    // --- SETUP THEME TOGGLE (Dipindah ke Header Dropdown) ---
    function setupThemeToggle() {
        const themeToggleBtn = document.getElementById('theme-toggle');
        const darkIcon = document.getElementById('theme-toggle-dark-icon');
        const lightIcon = document.getElementById('theme-toggle-light-icon');
        
        if (!themeToggleBtn || !darkIcon || !lightIcon) return;
        
        const updateIcons = (isDarkMode) => {
            darkIcon.classList.toggle('hidden', !isDarkMode);
            lightIcon.classList.toggle('hidden', isDarkMode);
        };
        
        // Cek tema saat ini
        const isDarkMode = localStorage.getItem('theme') === 'dark' || 
                          (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        document.documentElement.classList.toggle('dark', isDarkMode);
        updateIcons(isDarkMode);
        
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateIcons(isDark);
            
            // Tutup dropdown setelah aksi
            if (window.closeUserDropdown) {
                window.closeUserDropdown();
            }
        });
    }

    // --- SETUP LOGOUT (Dipindah ke Header Dropdown) ---
    function setupLogout() {
        const logoutButton = document.getElementById('logout-button');
        
        if (!logoutButton) return;
        
        logoutButton.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin keluar?')) {
                // Bersihkan semua interval jika ada
                if (window.locationUpdateInterval) {
                    clearInterval(window.locationUpdateInterval);
                    window.locationUpdateInterval = null;
                }
                
                // Bersihkan session storage
                sessionStorage.removeItem('loggedInUser');
                localStorage.removeItem('currentShipmentId'); // Jika ada
                
                // Redirect ke login
                window.location.href = 'index.html';
            }
        });
    }

    // --- FUNGSI MUAT MODUL DINAMIS ---
    function loadRoleModule(role) {
        const script = document.createElement('script');
        
        switch (role) {
            case 'manager':
                script.src = 'js/manager.js';
                break;
            case 'supir':
                script.src = 'js/supir.js';
                break;
            case 'admin':
                script.src = 'js/admin.js';
                break;
            default:
                console.error('Role tidak dikenal:', role);
                return;
        }

        script.onload = () => {
            console.log(`Modul ${role} berhasil dimuat`);
        };

        script.onerror = () => {
            console.error(`Gagal memuat modul ${role}`);
            alert('Terjadi kesalahan saat memuat aplikasi. Silakan refresh halaman.');
        };

        document.head.appendChild(script);
    }

    // --- FUNGSI UTILITAS GLOBAL ---
    window.switchView = function(activeViewId, activeNavSelector) {
        const mainContentArea = document.getElementById('main-content-area');
        if (!mainContentArea) return;
        
        // Sembunyikan semua view
        Array.from(mainContentArea.children).forEach(view => view.classList.add('view-hidden'));
        
        // Tampilkan view yang aktif
        const activeView = document.getElementById(activeViewId);
        if (activeView) {
            activeView.classList.remove('view-hidden');
        }
        
        // Update navigasi aktif
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('nav-active'));
        if (activeNavSelector) {
            const activeNav = document.querySelector(activeNavSelector);
            if (activeNav) activeNav.classList.add('nav-active');
        }

        // Tutup sidebar di mobile setelah navigasi
        if (window.closeSidebar && window.innerWidth < 768) {
            window.closeSidebar();
        }
    };

    // Fungsi utilitas untuk konversi file ke base64
    window.toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    // Fungsi utilitas untuk preview gambar
    window.previewImage = function(input, previewElement) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewElement.src = e.target.result;
                previewElement.classList.remove('hidden');
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    // Fungsi utilitas untuk generate initials
    window.generateInitials = function(name) {
        return name.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Fungsi utilitas untuk format role bahasa Indonesia
    window.formatRole = function(role) {
        const roleMap = {
            'manager': 'Manager',
            'supir': 'Supir',
            'admin': 'Administrator'
        };
        return roleMap[role] || role;
    };
});