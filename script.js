var DEFAULT_USERS = [
    {
        idNum: "030202500023",
        name: "Anne Timang",
        email: "anne.timang@student.president.ac.id",
        division: "BPH",
        role: "Ketua",
        password: "admin123",
        createdAt: new Date().toISOString()
    },
    {
        idNum: "030202500008",
        name: "Ferdi Arga Varian",
        email: "ferdi.varian@student.president.ac.id",
        division: "BPH",
        role: "Admin",
        password: "admin123",
        createdAt: new Date().toISOString()
    }
];

function getUsers() {
    var users = JSON.parse(localStorage.getItem('puma_users'));
    if (!users) {
        users = DEFAULT_USERS;
        localStorage.setItem('puma_users', JSON.stringify(users));
    }
    return users;
}

function saveUsers(users) {
    localStorage.setItem('puma_users', JSON.stringify(users));
}

function getAttendance() {
    var att = JSON.parse(localStorage.getItem('puma_attendance'));
    if (!att) {
        att = {};
        localStorage.setItem('puma_attendance', JSON.stringify(att));
    }
    return att;
}

function saveAttendance(att) {
    localStorage.setItem('puma_attendance', JSON.stringify(att));
}

function getCurrentSession() {
    return JSON.parse(localStorage.getItem('puma_current_session')) || null;
}

function saveCurrentSession(session) {
    localStorage.setItem('puma_current_session', JSON.stringify(session));
}

var currentUser = JSON.parse(localStorage.getItem('puma_logged_in_user')) || null;
var currentView = currentUser ? 'dashboard' : 'login';

function navigateTo(view) {
    currentView = view;
    render();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('puma_logged_in_user');
    navigateTo('login');
}

function getLogoHtml(isCentered) {
    if (isCentered) {
        return '<div class="flex flex-col items-center justify-center mb-8">' +
               '<div class="w-16 h-16 rounded-2xl bg-white p-2 shadow-md flex items-center justify-center mb-3">' +
               '<img src="logo puma.png" alt="Logo PUMA IT" class="w-full h-full object-contain" />' +
               '</div>' +
               '<h1 class="text-xl font-bold tracking-tight text-white">PUMA IT Portal</h1>' +
               '<p class="text-xs text-puma-300 mt-0.5">President University Major Association</p>' +
               '</div>';
    } else {
        return '<div class="flex items-center space-x-3">' +
               '<div class="w-9 h-9 rounded-xl bg-white p-1.5 shadow flex items-center justify-center">' +
               '<img src="logo puma.png" alt="Logo PUMA IT" class="w-full h-full object-contain" />' +
               '</div>' +
               '<div>' +
               '<span class="font-bold text-sm tracking-tight text-white block leading-tight">PUMA IT</span>' +
               '<span class="text-[10px] text-puma-300">Digital Attendance</span>' +
               '</div>' +
               '</div>';
    }
}

function render() {
    var app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = '';

    if (currentView === 'login') {
        app.innerHTML = renderLogin();
    } else if (currentView === 'register') {
        app.innerHTML = renderRegister();
    } else if (currentView === 'forgot') {
        app.innerHTML = renderForgot();
    } else if (currentView === 'dashboard') {
        app.innerHTML = renderDashboard();
        
        // Eksekusi langsung fungsi pendukung admin & QR code tanpa jeda
        if (currentUser && (currentUser.division === 'BPH' || currentUser.role === 'Ketua' || currentUser.role === 'Admin')) {
            updateAdminTable();
            var cur = getCurrentSession();
            if (cur) {
                setTimeout(function() {
                    var c = document.getElementById('qrCodeCanvas');
                    if (c) {
                        c.innerHTML = '';
                        QRCode.toCanvas(c, cur.code, { width: 80, margin: 1 });
                    }
                }, 20);
            }
        }
    }
}

function renderLogin() {
    return '<div class="flex-grow flex items-center justify-center px-4 py-12">' +
           '<div class="clean-card w-full max-w-md p-8 rounded-2xl shadow-xl">' +
           getLogoHtml(true) +
           '<form onsubmit="handleLogin(event)" autocomplete="off" class="space-y-4">' +
           '<div>' +
           '<label class="block text-xs font-medium text-puma-300 mb-1.5">Student ID (NIM)</label>' +
           '<input type="text" id="loginId" autocomplete="off" required placeholder="0302025000" class="clean-input w-full px-4 py-2.5 rounded-xl text-sm">' +
           '</div>' +
           '<div>' +
           '<div class="flex justify-between items-center mb-1.5">' +
           '<label class="block text-xs font-medium text-puma-300">Kata Sandi</label>' +
           '<button type="button" onclick="navigateTo(\'forgot\')" class="text-xs text-puma-400 hover:text-white transition">Lupa Sandi?</button>' +
           '</div>' +
           '<input type="password" id="loginPass" autocomplete="new-password" required placeholder="Enter your password" class="clean-input w-full px-4 py-2.5 rounded-xl text-sm">' +
           '</div>' +
           '<button type="submit" class="w-full py-3 bg-puma-600 hover:bg-puma-500 text-white font-medium rounded-xl text-sm shadow transition mt-2">Masuk ke Portal</button>' +
           '</form>' +
           '<div class="mt-6 text-center text-xs text-puma-300">' +
           'Belum punya akun? <button onclick="navigateTo(\'register\')" class="text-puma-400 font-semibold hover:underline ml-1">Buat Akun</button>' +
           '</div>' +
           '</div>' +
           '</div>';
}

function handleLogin(e) {
    e.preventDefault();
    var idNum = document.getElementById('loginId').value.trim();
    var pass = document.getElementById('loginPass').value;
    var users = getUsers();
    var user = users.find(function(u) { return u.idNum === idNum && u.password === pass; });

    if (user) {
        currentUser = user;
        localStorage.setItem('puma_logged_in_user', JSON.stringify(currentUser));
        navigateTo('dashboard');
    } else {
        alert('Student ID atau Kata Sandi salah!');
    }
}

function renderRegister() {
    return '<div class="flex-grow flex items-center justify-center px-4 py-12">' +
           '<div class="clean-card w-full max-w-lg p-8 rounded-2xl shadow-xl">' +
           getLogoHtml(true) +
           '<form onsubmit="handleRegister(event)" autocomplete="off" class="space-y-4">' +
           '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">' +
           '<div><label class="block text-xs font-medium text-puma-300 mb-1">Student ID (NIM)</label><input type="text" id="regId" autocomplete="off" required placeholder="030202500023" class="clean-input w-full px-4 py-2.5 rounded-xl text-sm"></div>' +
           '<div><label class="block text-xs font-medium text-puma-300 mb-1">Nama Lengkap</label><input type="text" id="regName" autocomplete="off" required placeholder="Budi Santoso" class="clean-input w-full px-4 py-2.5 rounded-xl text-sm"></div>' +
           '</div>' +
           '<div><label class="block text-xs font-medium text-puma-300 mb-1">Email Institusi</label><input type="email" id="regEmail" autocomplete="off" required placeholder="budi@student.president.ac.id" class="clean-input w-full px-4 py-2.5 rounded-xl text-sm"></div>' +
           '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">' +
           '<div><label class="block text-xs font-medium text-puma-300 mb-1">Divisi PUMA</label><select id="regDiv" required class="clean-input w-full px-4 py-2.5 rounded-xl text-sm"><option value="" disabled selected>Pilih Divisi</option><option value="BPH">BPH</option><option value="Divisi Internal">Divisi Internal</option><option value="Divisi External">Divisi External</option><option value="Divisi R&D">Divisi R&D</option><option value="Divisi RICM">Divisi RICM</option></select></div>' +
           '<div><label class="block text-xs font-medium text-puma-300 mb-1">Peran</label><select id="regRole" required class="clean-input w-full px-4 py-2.5 rounded-xl text-sm"><option value="" disabled selected>Pilih Peran</option><option value="Ketua">Ketua</option><option value="Admin">Admin</option><option value="Anggota">Anggota</option></select></div>' +
           '</div>' +
           '<div><label class="block text-xs font-medium text-puma-300 mb-1">Kata Sandi</label><input type="password" id="regPass" autocomplete="new-password" required placeholder="••••••••" class="clean-input w-full px-4 py-2.5 rounded-xl text-sm"></div>' +
           '<button type="submit" class="w-full py-3 bg-puma-600 hover:bg-puma-500 text-white font-medium rounded-xl text-sm shadow transition mt-2">Daftar Akun</button>' +
           '</form>' +
           '<div class="mt-6 text-center text-xs text-puma-300">Sudah punya akun? <button onclick="navigateTo(\'login\')" class="text-puma-400 font-semibold hover:underline ml-1">Masuk</button></div>' +
           '</div>' +
           '</div>';
}

function handleRegister(e) {
    e.preventDefault();
    var idNum = document.getElementById('regId').value.trim();
    var name = document.getElementById('regName').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var division = document.getElementById('regDiv').value;
    var role = document.getElementById('regRole').value;
    var password = document.getElementById('regPass').value;

    var users = getUsers();
    if (users.some(function(u) { return u.idNum === idNum; })) {
        alert('Student ID sudah terdaftar!');
        return;
    }

    users.push({ idNum: idNum, name: name, email: email, division: division, role: role, password: password, createdAt: new Date().toISOString() });
    saveUsers(users);
    alert('Registrasi berhasil! Silakan masuk.');
    navigateTo('login');
}

function renderForgot() {
    return '<div class="flex-grow flex items-center justify-center px-4 py-12">' +
           '<div class="clean-card w-full max-w-md p-8 rounded-2xl shadow-xl">' +
           getLogoHtml(true) +
           '<h2 class="text-base font-bold text-center text-white mb-1">Reset Kata Sandi</h2>' +
           '<p class="text-xs text-puma-300 text-center mb-6">Masukkan email pemulihan terdaftar.</p>' +
           '<form onsubmit="handleForgot(event)" autocomplete="off" class="space-y-4">' +
           '<div><label class="block text-xs font-medium text-puma-300 mb-1">Email</label><input type="email" id="forgotEmail" autocomplete="off" required placeholder="email@student.president.ac.id" class="clean-input w-full px-4 py-2.5 rounded-xl text-sm"></div>' +
           '<button type="submit" class="w-full py-3 bg-puma-600 text-white font-medium rounded-xl text-sm transition">Kirim Instruksi</button>' +
           '</form>' +
           '<div class="mt-6 text-center"><button onclick="navigateTo(\'login\')" class="text-xs text-puma-400 hover:text-white transition">Kembali ke Masuk</button></div>' +
           '</div>' +
           '</div>';
}

function handleForgot(e) {
    e.preventDefault();
    var email = document.getElementById('forgotEmail').value.trim();
    var users = getUsers();
    var user = users.find(function(u) { return u.email === email; });

    if (user) {
        alert('[Simulasi]\nHalo ' + user.name + ',\nKata sandi akun Anda adalah: "' + user.password + '"');
        navigateTo('login');
    } else {
        alert('Email tidak ditemukan.');
    }
}

function renderDashboard() {
    var isAdmin = currentUser.division === 'BPH' || currentUser.role === 'Ketua' || currentUser.role === 'Admin';
    var currentSession = getCurrentSession();

    var adminSection = '';
    if (isAdmin) {
        adminSection = '<div class="clean-card p-6 rounded-2xl space-y-4">' +
                       '<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">' +
                       '<div><h3 class="text-sm font-bold text-white">Database Anggota & Rekapitulasi</h3><p class="text-[11px] text-puma-300">Unduh laporan dalam format Word (.docx) atau PDF.</p></div>' +
                       '<div class="flex gap-2">' +
                       '<button onclick="exportAttendanceDocx()" class="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition"><i class="fa-solid fa-file-word mr-1.5"></i> Word</button>' +
                       '<button onclick="exportAttendancePDF()" class="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-medium transition"><i class="fa-solid fa-file-pdf mr-1.5"></i> PDF</button>' +
                       '</div>' +
                       '</div>' +
                       '<div class="overflow-x-auto rounded-xl border border-puma-900/80">' +
                       '<table class="w-full text-left text-xs text-puma-200">' +
                       '<thead class="bg-puma-950 text-[10px] uppercase text-puma-300"><tr><th class="px-3 py-2.5">No</th><th class="px-3 py-2.5">Nama</th><th class="px-3 py-2.5">Email</th><th class="px-3 py-2.5">Divisi</th><th class="px-3 py-2.5">Jabatan</th><th class="px-3 py-2.5 text-center">Status</th><th class="px-3 py-2.5 text-right">Waktu</th></tr></thead>' +
                       '<tbody id="adminDatabaseTableBody" class="divide-y divide-puma-900/50"></tbody>' +
                       '</table>' +
                       '</div>' +
                       '</div>';
    }

    var adminPanelContent = '';
    if (isAdmin) {
        adminPanelContent = '<div class="space-y-3">' +
                            '<div><label class="block text-[11px] font-medium text-puma-300 mb-1">Judul Sesi</label><input type="text" id="sessionTitle" placeholder="Rapat Pleno Mingguan" class="clean-input w-full px-3.5 py-2 rounded-xl text-xs"></div>' +
                            '<div><label class="block text-[11px] font-medium text-puma-300 mb-1">Durasi Deadline</label><select id="sessionDuration" class="clean-input w-full px-3.5 py-2 rounded-xl text-xs"><option value="5">5 Menit</option><option value="10" selected>10 Menit</option><option value="15">15 Menit</option></select></div>' +
                            '<button onclick="createAttendanceSession()" class="w-full py-2.5 bg-puma-600 hover:bg-puma-500 text-white font-medium rounded-xl text-xs transition">Buat Barcode & Sesi</button>' +
                            '<div id="adminSessionBox" class="mt-4 pt-4 border-t border-puma-900/60">' + renderAdminActiveSession(currentSession) + '</div>' +
                            '</div>';
    } else {
        adminPanelContent = '<div class="py-8 text-center text-xs text-puma-300">Hanya BPH, Ketua, atau Admin yang dapat membuat sesi presensi.</div>';
    }

    return '<nav class="clean-card border-b border-puma-900/60 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">' +
           getLogoHtml(false) +
           '<div class="flex items-center space-x-4">' +
           '<div class="text-right hidden sm:block"><span class="block text-xs font-semibold text-white">' + currentUser.name + '</span><span class="text-[10px] text-puma-300">' + currentUser.division + ' • ' + currentUser.role + '</span></div>' +
           '<button onclick="logout()" class="bg-puma-900/60 hover:bg-puma-800 text-puma-200 px-3.5 py-2 rounded-xl text-xs font-medium transition">Keluar</button>' +
           '</div>' +
           '</nav>' +
           '<div class="flex-grow max-w-7xl w-full mx-auto px-4 py-8 space-y-6">' +
           '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">' +
           '<div class="lg:col-span-2 clean-card p-6 rounded-2xl flex flex-col justify-between"><div><span class="px-2.5 py-1 bg-puma-600/20 text-puma-400 rounded-md text-[11px] font-semibold inline-block mb-3">' + (isAdmin ? 'Administrator / ' + currentUser.role : 'Anggota PUMA IT') + '</span><h2 class="text-2xl font-bold text-white mb-1">Halo, ' + currentUser.name + '!</h2><p class="text-xs text-puma-300 leading-relaxed">Selamat datang di portal presensi resmi. Divisi Anda: <span class="text-white font-medium">' + currentUser.division + '</span> (' + currentUser.role + ').</p></div></div>' +
           '<div class="clean-card p-6 rounded-2xl flex flex-col justify-between border-puma-600/30"><div><span class="text-[10px] text-puma-400 font-semibold tracking-wider uppercase block mb-3">Identitas Pengguna</span><div class="space-y-2 text-xs"><div><span class="text-puma-400 text-[10px]">Nama</span><p class="font-semibold text-white">' + currentUser.name + '</p></div><div><span class="text-puma-400 text-[10px]">Email</span><p class="font-medium text-puma-200 truncate">' + currentUser.email + '</p></div></div></div><div class="mt-4 pt-3 border-t border-puma-900/50 flex justify-between text-[11px] text-puma-400"><span>President University</span><span class="text-emerald-400 font-medium">Terverifikasi</span></div></div>' +
           '</div>' +
           '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">' +
           '<div class="clean-card p-6 rounded-2xl"><div class="flex items-center justify-between mb-4"><h3 class="text-sm font-bold text-white flex items-center"><i class="fa-solid fa-qrcode text-puma-400 mr-2"></i> Generator Sesi Absen</h3>' + (isAdmin ? '<span class="text-[10px] text-emerald-400 font-semibold">Akses Admin</span>' : '<span class="text-[10px] text-rose-400">Khusus Admin</span>') + '</div>' + adminPanelContent + '</div>' +
           '<div class="clean-card p-6 rounded-2xl flex flex-col justify-between"><div><div class="flex items-center space-x-2 mb-4"><h3 class="text-sm font-bold text-white"><i class="fa-solid fa-clipboard-user text-puma-400 mr-2"></i> Input Kehadiran</h3></div><div id="memberSessionStatus" class="mb-4">' + renderMemberSessionStatus(currentSession) + '</div><form onsubmit="submitAttendance(event)" autocomplete="off" class="space-y-3"><div><label class="block text-[11px] font-medium text-puma-300 mb-1">Kode Absen</label><input type="text" id="inputAttendanceCode" autocomplete="off" required placeholder="PUMA-XXXX" class="clean-input w-full px-3.5 py-2.5 rounded-xl text-xs uppercase font-mono tracking-wider"></div><button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs transition">Kirim Kehadiran</button></form></div><div class="mt-6 pt-4 border-t border-puma-900/60 flex justify-between text-xs text-puma-400"><span>Status:</span><span id="myAttendanceBadge" class="font-semibold">-</span></div></div>' +
           '</div>' +
           adminSection +
           '</div>';
}

function renderAdminActiveSession(session) {
    if (!session) return '<p class="text-xs text-puma-400 text-center py-2">Belum ada sesi aktif saat ini.</p>';
    var now = new Date().getTime();
    var timeLeft = Math.max(0, Math.floor((session.expiresAt - now) / 1000));
    if (timeLeft <= 0) return '<p class="text-xs text-rose-400 text-center py-2">Sesi telah berakhir.</p>';
    var m = Math.floor(timeLeft / 60);
    var s = timeLeft % 60;
    return '<div class="bg-puma-950/60 p-3.5 rounded-xl border border-puma-900/60 space-y-3">' +
           '<div class="flex justify-between items-center text-xs"><span class="font-bold text-white">' + session.title + '</span><span id="countdownTimer" class="font-mono bg-puma-900 px-2 py-0.5 rounded text-puma-200">' + m + 'm ' + (s < 10 ? '0' : '') + s + 's</span></div>' +
           '<div class="flex items-center justify-between bg-black/40 p-2.5 rounded-lg"><span class="font-mono font-bold text-sm tracking-widest text-white">' + session.code + '</span><canvas id="qrCodeCanvas" class="w-20 h-20 bg-white p-1 rounded"></canvas></div>' +
           '</div>';
}

function renderMemberSessionStatus(session) {
    if (!session || new Date().getTime() > session.expiresAt) {
        return '<div class="bg-puma-950/40 p-3 rounded-xl text-center text-xs text-puma-400">Tidak ada sesi aktif saat ini.</div>';
    }
    return '<div class="bg-puma-950/40 p-3 rounded-xl flex justify-between items-center text-xs"><span>Sesi: <strong class="text-white">' + session.title + '</strong></span><span class="text-emerald-400 font-semibold animate-pulse">Dibuka</span></div>';
}

function createAttendanceSession() {
    var titleInput = document.getElementById('sessionTitle');
    var title = titleInput ? titleInput.value.trim() || 'Rapat PUMA IT' : 'Rapat PUMA IT';
    var durInput = document.getElementById('sessionDuration');
    var dur = durInput ? parseInt(durInput.value) : 10;
    var code = 'PUMA-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    var now = new Date().getTime();
    var session = { id: 's_' + now, title: title, code: code, expiresAt: now + dur * 60000 };
    saveCurrentSession(session);
    var att = getAttendance();
    att[session.id] = { title: title, code: code, records: {} };
    saveAttendance(att);
    render();
}

function submitAttendance(e) {
    e.preventDefault();
    var code = document.getElementById('inputAttendanceCode').value.trim().toUpperCase();
    var session = getCurrentSession();
    if (!session || new Date().getTime() > session.expiresAt) {
        alert('Sesi tidak valid atau telah berakhir.');
        return;
    }
    if (code !== session.code) {
        alert('Kode absen salah!');
        return;
    }
    var att = getAttendance();
    if (!att[session.id]) att[session.id] = { records: {} };
    att[session.id].records[currentUser.idNum] = { timestamp: new Date().toISOString() };
    saveAttendance(att);
    alert('Kehadiran berhasil dicatat!');
    render();
}

function updateAdminTable() {
    var tbody = document.getElementById('adminDatabaseTableBody');
    if (!tbody) return;
    var users = getUsers();
    var session = getCurrentSession();
    var records = session && getAttendance()[session.id] ? getAttendance()[session.id].records : {};
    tbody.innerHTML = '';
    users.forEach(function(u, idx) {
        var rec = records[u.idNum];
        tbody.innerHTML += '<tr>' +
                           '<td class="px-3 py-2 text-puma-400">' + (idx + 1) + '</td>' +
                           '<td class="px-3 py-2 font-medium text-white">' + u.name + '</td>' +
                           '<td class="px-3 py-2 text-puma-300">' + u.email + '</td>' +
                           '<td class="px-3 py-2">' + u.division + '</td>' +
                           '<td class="px-3 py-2 text-puma-300">' + u.role + '</td>' +
                           '<td class="px-3 py-2 text-center">' + (rec ? '<span class="text-emerald-400 font-semibold">Hadir</span>' : '<span class="text-amber-400">Belum</span>') + '</td>' +
                           '<td class="px-3 py-2 text-right font-mono">' + (rec ? new Date(rec.timestamp).toLocaleTimeString() : '-') + '</td>' +
                           '</tr>';
    });
}

function exportAttendanceDocx() {
    var session = getCurrentSession();
    var users = getUsers();
    var records = session && getAttendance()[session.id] ? getAttendance()[session.id].records : {};
    var rows = '';
    users.forEach(function(u, i) {
        var r = records[u.idNum];
        rows += '<tr><td style="border:1px solid #ddd;padding:6px;">' + (i+1) + '</td><td style="border:1px solid #ddd;padding:6px;">' + u.name + '</td><td style="border:1px solid #ddd;padding:6px;">' + u.division + '</td><td style="border:1px solid #ddd;padding:6px;">' + u.role + '</td><td style="border:1px solid #ddd;padding:6px;">' + (r ? 'Hadir' : 'Belum') + '</td><td style="border:1px solid #ddd;padding:6px;">' + (r ? new Date(r.timestamp).toLocaleTimeString() : '-') + '</td></tr>';
    });
    var html = '<html><body><h2 style="color:#cb3550;text-align:center;">Rekap Absensi PUMA IT</h2><p>Sesi: ' + (session ? session.title : 'Umum') + '</p><table style="width:100%;border-collapse:collapse;font-size:11pt;"><tr><th>No</th><th>Nama</th><th>Divisi</th><th>Jabatan</th><th>Status</th><th>Waktu</th></tr>' + rows + '</table></body></html>';
    var blob = htmlDocx.asBlob(html);
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Rekap_Absensi_' + Date.now() + '.docx';
    a.click();
}

function exportAttendancePDF() {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var session = getCurrentSession();
    doc.text("Rekapitulasi Kehadiran PUMA IT", 14, 20);
    var users = getUsers();
    var records = session && getAttendance()[session.id] ? getAttendance()[session.id].records : {};
    var data = users.map(function(u, i) {
        var r = records[u.idNum];
        return [i+1, u.name, u.division, u.role, r ? 'Hadir' : 'Belum', r ? new Date(r.timestamp).toLocaleTimeString() : '-'];
    });
    doc.autoTable({ startY: 28, head: [['No', 'Nama', 'Divisi', 'Jabatan', 'Status', 'Waktu']], body: data });
    doc.save('Rekap_Absensi_' + Date.now() + '.pdf');
}

// Inisialisasi awal saat aplikasi dimuat
render();

// Interval global untuk memperbarui timer hitung mundur dan sinkronisasi tampilan secara mulus
setInterval(function() {
    var session = getCurrentSession();
    if (session) {
        var now = new Date().getTime();
        var timer = document.getElementById('countdownTimer');
        if (timer) {
            var left = Math.max(0, Math.floor((session.expiresAt - now) / 1000));
            var m = Math.floor(left/60);
            var s = left%60;
            timer.innerText = m + 'm ' + (s < 10 ? '0' : '') + s + 's';
            if (left <= 0) {
                // Jangan panggil render berulang jika tidak diperlukan agar tidak mengganggu input
            }
        }
    }
}, 1000);