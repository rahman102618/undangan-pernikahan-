// =====================================================================
// invitation.js — ISI UNDANGAN
// Mengisi teks dan foto dari config.js, membuat kartu acara, galeri,
// timeline, rekening, countdown, lightbox, dan membuka/menutup cover.
// =====================================================================

window.Invitation = (function () {

    const cfg = window.WEDDING_CONFIG;
    let countdownTimer = null;
    let lightbox = null;      // instance Bootstrap Modal
    let lbIndex = 0;          // indeks foto yang sedang dibuka di lightbox

    // Membuat elemen dengan class dan teks (textContent = aman dari HTML berbahaya)
    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    // Format tanggal panjang dalam bahasa Indonesia, memakai zona waktu acara (WIB/WITA/WIT)
    function formatDate(iso) {
        const d = new Date(iso);
        if (isNaN(d)) return "";
        return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tzName() });
    }
    // Menentukan zona IANA dari label di config (WIB/WITA/WIT)
    function tzName() {
        return { WIB: "Asia/Jakarta", WITA: "Asia/Makassar", WIT: "Asia/Jayapura" }[cfg.timezoneLabel] || "Asia/Jakarta";
    }

    // ---------- Mengisi teks dan foto ----------
    function fillBindings() {
        const map = {
            groomNick: cfg.groom.nickname, brideNick: cfg.bride.nickname,
            groomFull: cfg.groom.fullName, brideFull: cfg.bride.fullName,
            groomParents: cfg.groom.parents, brideParents: cfg.bride.parents,
            weddingDate: formatDate(cfg.weddingDate),
            dressDesc: cfg.dressCode.description,
            closingMessage: cfg.closingMessage,
            footerYear: String(new Date(cfg.weddingDate).getFullYear() || new Date().getFullYear())
        };
        // Setiap elemen ber-atribut data-bind diisi dengan textContent
        document.querySelectorAll("[data-bind]").forEach(function (node) {
            const value = map[node.dataset.bind];
            if (value !== undefined) node.textContent = value;
        });

        // Foto: atribut data-photo menunjuk kunci pada config
        const photos = {
            coverPhoto: cfg.coverPhoto, openingPhoto: cfg.openingPhoto, closingPhoto: cfg.closingPhoto,
            groomPhoto: cfg.groom.photo, bridePhoto: cfg.bride.photo
        };
        document.querySelectorAll("img[data-photo]").forEach(function (img) {
            // Jika foto gagal dimuat, ganti ke placeholder (sekali saja agar tidak berulang)
            img.addEventListener("error", function () {
                if (!img.dataset.fallback) { img.dataset.fallback = "1"; img.src = cfg.placeholderImage; }
            });
            img.src = photos[img.dataset.photo] || cfg.placeholderImage;
        });
    }

    // ---------- Kartu acara ----------
    function renderEvents() {
        const list = document.getElementById("eventList");
        cfg.events.forEach(function (ev, i) {
            const col = el("div", "col-12 col-md-6 col-lg-5");
            const card = el("article", "event-card reveal");
            card.style.setProperty("--d", (i * 0.15) + "s");

            card.append(
                el("h3", "", ev.title),
                el("p", "event-card__date", formatDate(ev.start)),
                el("p", "event-card__time", ev.timeText),
                el("p", "event-card__place", ev.place),
                el("p", "event-card__address", ev.address)
            );

            if (ev.mapsUrl) {
                // Tombol Maps; rel noopener noreferrer demi keamanan tautan eksternal
                const a = el("a", "btn-luxe btn-luxe--dark", "Buka Google Maps");
                a.href = ev.mapsUrl; a.target = "_blank"; a.rel = "noopener noreferrer";
                card.appendChild(a);
            } else {
                // Jujur: tidak ada tombol palsu bila link belum diisi
                card.appendChild(el("p", "event-card__nomap", "Tautan peta akan segera ditambahkan."));
            }
            col.appendChild(card);
            list.appendChild(col);
        });
    }

    // ---------- Dress code & live streaming ----------
    function renderDressAndLive() {
        const sw = document.getElementById("swatchList");
        cfg.dressCode.colors.forEach(function (c) {
            const item = el("div", "swatch");
            const dot = document.createElement("i");
            // hanya menerima format warna hex agar tidak ada injeksi style
            if (/^#[0-9a-fA-F]{3,8}$/.test(c.hex)) dot.style.background = c.hex;
            item.append(dot, el("span", "", c.name));
            sw.appendChild(item);
        });

        const note = document.getElementById("liveNote");
        const btn = document.getElementById("liveButton");
        if (cfg.liveStreaming.url) {
            note.textContent = "Bagi Anda yang tidak dapat hadir langsung, silakan menyaksikan melalui siaran langsung.";
            btn.href = cfg.liveStreaming.url;
            btn.hidden = false;
        } else {
            note.textContent = cfg.liveStreaming.note;
        }
    }

    // ---------- Galeri + lightbox ----------
    function renderGallery() {
        const grid = document.getElementById("galleryGrid");
        cfg.gallery.forEach(function (photo, i) {
            // Tiap foto adalah tombol agar bisa diakses keyboard dan layar sentuh
            const btn = el("button", "gallery__item reveal" + (photo.layout ? " gallery__item--" + photo.layout : ""));
            btn.type = "button";
            btn.setAttribute("aria-label", "Buka foto: " + photo.alt);
            btn.style.setProperty("--d", (i % 3) * 0.1 + "s");

            const img = document.createElement("img");
            img.src = photo.src; img.alt = photo.alt; img.loading = "lazy";
            img.addEventListener("error", function () {
                if (!img.dataset.fallback) { img.dataset.fallback = "1"; img.src = cfg.placeholderImage; }
            });
            btn.appendChild(img);
            btn.addEventListener("click", function () { openLightbox(i); });
            grid.appendChild(btn);
        });

        // Menyiapkan modal Bootstrap dan tombol navigasinya
        lightbox = new bootstrap.Modal(document.getElementById("lightboxModal"));
        document.getElementById("lbPrev").addEventListener("click", function () { showPhoto(lbIndex - 1); });
        document.getElementById("lbNext").addEventListener("click", function () { showPhoto(lbIndex + 1); });

        // Panah keyboard dan geser jari untuk pindah foto
        const modalEl = document.getElementById("lightboxModal");
        modalEl.addEventListener("keydown", function (e) {
            if (e.key === "ArrowLeft") showPhoto(lbIndex - 1);
            if (e.key === "ArrowRight") showPhoto(lbIndex + 1);
        });
        let startX = null;
        modalEl.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
        modalEl.addEventListener("touchend", function (e) {
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
            startX = null;
        });
    }
    // Menampilkan foto ke-n pada lightbox (berputar di ujung daftar)
    function showPhoto(i) {
        const n = cfg.gallery.length;
        lbIndex = (i + n) % n;
        const img = document.getElementById("lightboxImg");
        img.src = cfg.gallery[lbIndex].src;
        img.alt = cfg.gallery[lbIndex].alt;
    }
    function openLightbox(i) { showPhoto(i); lightbox.show(); }

    // ---------- Timeline cerita ----------
    function renderStory() {
        const box = document.getElementById("storyList");
        cfg.story.forEach(function (s, i) {
            const item = el("div", "timeline__item reveal");
            item.style.setProperty("--d", (i * 0.12) + "s");
            item.append(el("span", "timeline__year", s.year), el("h3", "", s.title), el("p", "", s.text));
            box.appendChild(item);
        });
    }

    // ---------- Hadiah ----------
    function renderGifts() {
        document.getElementById("giftNote").textContent = cfg.gifts.note;
        const list = document.getElementById("giftList");
        cfg.gifts.accounts.forEach(function (acc) {
            const col = el("div", "col-12 col-md-6 col-lg-4");
            const card = el("div", "gift-card reveal");
            const copy = el("button", "btn-luxe btn-luxe--dark", "Salin Nomor");
            copy.type = "button";
            copy.addEventListener("click", function () { copyText(acc.number); });
            card.append(el("p", "gift-card__bank", acc.bank), el("p", "gift-card__number", acc.number), el("p", "gift-card__holder", "a.n. " + acc.holder), copy);
            col.appendChild(card);
            list.appendChild(col);
        });
        if (cfg.gifts.address) {
            const a = document.getElementById("giftAddress");
            a.textContent = "Alamat pengiriman hadiah: " + cfg.gifts.address;
            a.hidden = false;
        }
    }
    // Menyalin teks ke clipboard; punya cadangan untuk browser lama / koneksi non-HTTPS
    async function copyText(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const t = document.createElement("textarea");
                t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
                document.body.appendChild(t); t.select();
                const ok = document.execCommand("copy");
                t.remove();
                if (!ok) throw new Error("copy gagal");
            }
            window.showToast("Nomor rekening berhasil disalin");
        } catch (e) {
            window.showToast("Gagal menyalin. Silakan salin secara manual.");
        }
    }

    // ---------- Countdown ----------
    function startCountdown() {
        const target = new Date(cfg.weddingDate).getTime();
        const note = document.getElementById("countdownNote");
        const box = document.getElementById("countdownBox");
        const pad = function (n) { return String(n).padStart(2, "0"); };

        if (isNaN(target)) { note.textContent = "Tanggal acara belum diatur."; return; }
        note.textContent = "Menuju " + formatDate(cfg.weddingDate) + ", pukul " +
            new Date(cfg.weddingDate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tzName() }).replace(":", ".") +
            " " + cfg.timezoneLabel;

        function tick() {
            const diff = target - Date.now();
            if (diff <= 0) {
                // Acara telah lewat atau sedang berlangsung
                clearInterval(countdownTimer);
                box.hidden = true;
                note.textContent = "Hari bahagia telah tiba. Terima kasih atas doa dan kehadiran Anda.";
                return;
            }
            document.getElementById("cdDays").textContent = pad(Math.floor(diff / 864e5));
            document.getElementById("cdHours").textContent = pad(Math.floor(diff / 36e5) % 24);
            document.getElementById("cdMinutes").textContent = pad(Math.floor(diff / 6e4) % 60);
            document.getElementById("cdSeconds").textContent = pad(Math.floor(diff / 1e3) % 60);
        }
        tick();
        countdownTimer = setInterval(tick, 1000);
    }

    // ---------- Membuka undangan ----------
    function open() {
        const cover = document.getElementById("cover");
        // Menampilkan konten utama, tombol musik, dan navigasi
        const main = document.getElementById("invitation");
        main.classList.remove("is-hidden");
        main.classList.add("is-visible");
        document.getElementById("musicButton").classList.remove("is-hidden");
        document.getElementById("floatNav").classList.remove("is-hidden");

        // Menjalankan transisi cover lalu melepas kunci scroll
        cover.classList.add("is-closing");
        document.body.classList.remove("is-locked");
        window.scrollTo(0, 0);

        // Menghapus cover dari tampilan setelah transisi selesai (tanpa reload halaman)
        setTimeout(function () { cover.classList.add("is-hidden"); }, 1200);
    }

    // Menyiapkan semua bagian isi undangan
    function init() {
        fillBindings();
        renderEvents();
        renderDressAndLive();
        renderGallery();
        renderStory();
        renderGifts();
        startCountdown();
    }

    return { init: init, open: open };
})();
