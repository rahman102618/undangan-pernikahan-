// =====================================================================
// main.js — PENGGERAK UTAMA (dimuat paling akhir)
// Fungsi umum: toast, nama tamu dari URL, scroll reveal, navigasi aktif,
// dan alur tombol "Buka Undangan".
// =====================================================================

// ---------- Toast (notifikasi singkat) ----------
(function () {
    let timer = null;
    // Dijadikan global agar bisa dipakai music.js dan invitation.js
    window.showToast = function (message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;               // textContent: aman dari HTML
        toast.classList.add("is-show");
        clearTimeout(timer);
        timer = setTimeout(function () { toast.classList.remove("is-show"); }, 2600);
    };
})();

// ---------- Nama tamu dari URL: index.html?to=Nama%20Tamu ----------
function readGuestName() {
    const raw = new URLSearchParams(window.location.search).get("to") || "";
    // Dibersihkan dan dibatasi 60 karakter; nanti hanya dimasukkan lewat textContent
    return raw.replace(/[\u0000-\u001F]/g, "").trim().slice(0, 60);
}

// ---------- Scroll reveal dengan Intersection Observer ----------
let revealObserver = null;
function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    // Cadangan: jika browser tidak mendukung, langsung tampilkan semua
    if (!("IntersectionObserver" in window)) {
        items.forEach(function (n) { n.classList.add("is-visible"); });
        return;
    }
    revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);   // cukup sekali agar ringan
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (n) { revealObserver.observe(n); });
}

// ---------- Indikator section aktif pada navigasi ----------
function setupActiveNav() {
    const links = document.querySelectorAll(".float-nav a");
    const map = {};
    links.forEach(function (a) { map[a.dataset.target] = a; });
    if (!("IntersectionObserver" in window)) return;

    const obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                links.forEach(function (a) { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
                const active = map[entry.target.id];
                if (active) { active.classList.add("is-active"); active.setAttribute("aria-current", "true"); }
            }
        });
    }, { rootMargin: "-45% 0px -50% 0px" });   // section dianggap aktif saat melewati tengah layar
    Object.keys(map).forEach(function (id) {
        const s = document.getElementById(id);
        if (s) obs.observe(s);
    });
}

// ---------- Inisialisasi setelah HTML selesai dimuat ----------
document.addEventListener("DOMContentLoaded", function () {

    // Menampilkan nama tamu pada cover jika ada
    const guest = readGuestName();
    window.GUEST_NAME = guest;
    if (guest) {
        document.getElementById("guestName").textContent = guest;
        document.getElementById("guestBox").hidden = false;
    }

    // Urutan: isi konten dulu, baru reveal diamati (karena elemen dibuat oleh invitation.js)
    Invitation.init();
    Music.init();
    Rsvp.init();
    setupReveal();
    setupActiveNav();

    // Tombol Buka Undangan: buka konten lalu putar musik (klik = interaksi pengguna yang sah)
    document.getElementById("openInvitation").addEventListener("click", function () {
        Invitation.open();
        Music.start();
    });
});
