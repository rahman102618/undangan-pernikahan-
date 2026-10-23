// =====================================================================
// rsvp.js — FORMULIR RSVP DAN UCAPAN (GUESTBOOK)
// Mode 1 (bawaan): localStorage — data hanya tersimpan di browser ini (DEMO LOKAL).
// Mode 2 (opsional): Supabase — data online lintas perangkat (butuh setup, lihat README).
// Semua teks dari pengguna ditampilkan dengan textContent, bukan innerHTML.
// =====================================================================

window.Rsvp = (function () {

    // Kunci penyimpanan di localStorage
    const KEY_RSVP = "wedding_rsvp_demo";
    const KEY_WISH = "wedding_wishes_demo";

    // Daftar emoji sederhana untuk ucapan
    const EMOJIS = ["❤️", "🙏", "🎉", "💍", "✨", "😊"];

    // Mengambil konfigurasi Supabase dan menentukan apakah mode online aktif
    function online() {
        const s = window.WEDDING_CONFIG.supabase;
        return !!(s && s.enabled && s.url && s.anonKey);
    }

    // ---------- Penyimpanan lokal ----------
    // Membaca array dari localStorage dengan aman (bisa gagal di mode privat)
    function readLocal(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(data) ? data : [];
        } catch (e) { return []; }
    }
    // Menulis array ke localStorage; mengembalikan false jika gagal
    function writeLocal(key, list) {
        try { localStorage.setItem(key, JSON.stringify(list)); return true; }
        catch (e) { return false; }
    }

    // ---------- Penyimpanan online (Supabase REST) ----------
    // Mengirim satu baris ke tabel Supabase memakai kunci anon PUBLIK (dibatasi RLS di server)
    async function insertOnline(table, row) {
        const s = window.WEDDING_CONFIG.supabase;
        const res = await fetch(s.url + "/rest/v1/" + table, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": s.anonKey,
                "Authorization": "Bearer " + s.anonKey,
                "Prefer": "return=minimal"
            },
            body: JSON.stringify(row)
        });
        if (!res.ok) throw new Error("Supabase menolak data (" + res.status + ")");
    }
    // Mengambil ucapan terbaru dari Supabase
    async function fetchWishesOnline() {
        const s = window.WEDDING_CONFIG.supabase;
        const res = await fetch(s.url + "/rest/v1/wishes?select=name,message,created_at&order=created_at.desc&limit=50", {
            headers: { "apikey": s.anonKey, "Authorization": "Bearer " + s.anonKey }
        });
        if (!res.ok) throw new Error("Gagal mengambil ucapan");
        return res.json();
    }

    // ---------- Validasi ----------
    // Membersihkan spasi berlebih dan karakter kontrol dari teks
    function clean(text) {
        return String(text || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
    }
    // Menampilkan pesan pada elemen status form
    function setMsg(el, text, type) {
        el.textContent = text;
        el.className = "form-msg " + (type ? "is-" + type : "");
    }

    // ---------- RSVP ----------
    function initRsvp() {
        const form = document.getElementById("rsvpForm");
        const nameEl = document.getElementById("rsvpName");
        const statusEl = document.getElementById("rsvpStatus");
        const countEl = document.getElementById("rsvpCount");
        const countWrap = document.getElementById("guestCountWrap");
        const msg = document.getElementById("rsvpMsg");
        const note = document.getElementById("storageNote");

        // Penjelasan jujur tentang tempat penyimpanan data
        note.textContent = online()
            ? "Konfirmasi Anda dikirim ke database online mempelai."
            : "Mode demo: konfirmasi hanya tersimpan di browser ini dan tidak dikirim ke perangkat lain.";

        // Jumlah tamu hanya relevan jika hadir
        statusEl.addEventListener("change", function () {
            countWrap.hidden = statusEl.value !== "hadir";
        });

        // Mengisi nama otomatis dari parameter ?to= jika ada
        const guest = window.GUEST_NAME || "";
        if (guest) nameEl.value = guest;

        form.addEventListener("submit", async function (event) {
            // Mencegah halaman reload
            event.preventDefault();

            const name = clean(nameEl.value);
            const status = statusEl.value;
            const count = status === "hadir" ? parseInt(countEl.value, 10) : 0;

            // Validasi input kosong atau tidak masuk akal
            if (name.length < 2) return setMsg(msg, "Mohon isi nama minimal 2 karakter.", "error");
            if (status !== "hadir" && status !== "tidak") return setMsg(msg, "Mohon pilih kehadiran Anda.", "error");
            if (status === "hadir" && (!(count >= 1) || count > 10)) return setMsg(msg, "Jumlah tamu harus 1 sampai 10.", "error");

            const row = { name: name.slice(0, 60), status: status, guests: count };
            try {
                if (online()) {
                    await insertOnline("rsvp", row);
                } else {
                    row.created_at = new Date().toISOString();
                    const list = readLocal(KEY_RSVP);
                    list.push(row);
                    if (!writeLocal(KEY_RSVP, list)) throw new Error("localStorage tidak tersedia");
                }
                setMsg(msg, "Terima kasih, konfirmasi Anda telah tersimpan.", "ok");
                form.reset();
                countWrap.hidden = false;
            } catch (error) {
                console.warn(error);
                setMsg(msg, "Maaf, konfirmasi gagal dikirim. Silakan coba lagi.", "error");
            }
        });
    }

    // ---------- UCAPAN ----------
    // Membuat satu kartu ucapan dengan textContent (aman dari HTML berbahaya)
    function renderWishCard(wish) {
        const card = document.createElement("div");
        card.className = "wish-card";

        const name = document.createElement("strong");
        name.textContent = wish.name;

        const date = document.createElement("small");
        const d = new Date(wish.created_at);
        date.textContent = isNaN(d) ? "" : d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

        const text = document.createElement("p");
        text.textContent = wish.message;

        card.append(name, date, text);
        return card;
    }

    // Menampilkan seluruh daftar ucapan
    async function renderWishes() {
        const box = document.getElementById("wishList");
        let list = [];
        try {
            list = online() ? await fetchWishesOnline() : readLocal(KEY_WISH).slice().reverse();
        } catch (e) { console.warn(e); }

        box.replaceChildren();
        if (!list.length) {
            const empty = document.createElement("p");
            empty.className = "wish-empty";
            empty.textContent = "Belum ada ucapan. Jadilah yang pertama!";
            box.appendChild(empty);
            return;
        }
        list.forEach(function (w) { box.appendChild(renderWishCard(w)); });
    }

    function initWishes() {
        const form = document.getElementById("wishForm");
        const nameEl = document.getElementById("wishName");
        const textEl = document.getElementById("wishText");
        const counter = document.getElementById("wishCounter");
        const msg = document.getElementById("wishMsg");
        const emojiRow = document.getElementById("emojiRow");

        // Tombol emoji: menyisipkan emoji ke akhir teks bila masih ada ruang
        EMOJIS.forEach(function (emoji) {
            const b = document.createElement("button");
            b.type = "button";
            b.textContent = emoji;
            b.setAttribute("aria-label", "Tambah emoji " + emoji);
            b.addEventListener("click", function () {
                if (textEl.value.length + emoji.length <= textEl.maxLength) {
                    textEl.value += emoji;
                    counter.textContent = textEl.value.length + "/" + textEl.maxLength;
                }
            });
            emojiRow.appendChild(b);
        });

        // Penghitung karakter
        textEl.addEventListener("input", function () {
            counter.textContent = textEl.value.length + "/" + textEl.maxLength;
        });

        const guest = window.GUEST_NAME || "";
        if (guest) nameEl.value = guest;

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const name = clean(nameEl.value).slice(0, 60);
            const message = clean(textEl.value).slice(0, 200);

            if (name.length < 2) return setMsg(msg, "Mohon isi nama minimal 2 karakter.", "error");
            if (message.length < 3) return setMsg(msg, "Ucapan terlalu pendek.", "error");

            // Pembatas spam sederhana di sisi browser: jeda 15 detik antar kiriman.
            // CATATAN: ini hanya hambatan ringan; untuk mode online wajib ada pembatasan di server.
            const last = Number(sessionStorage.getItem("wishLast") || 0);
            if (Date.now() - last < 15000) return setMsg(msg, "Mohon tunggu sebentar sebelum mengirim lagi.", "error");

            try {
                if (online()) {
                    await insertOnline("wishes", { name: name, message: message });
                } else {
                    const list = readLocal(KEY_WISH);
                    list.push({ name: name, message: message, created_at: new Date().toISOString() });
                    if (!writeLocal(KEY_WISH, list.slice(-100))) throw new Error("localStorage tidak tersedia");
                }
                try { sessionStorage.setItem("wishLast", String(Date.now())); } catch (e) {}
                setMsg(msg, online() ? "Ucapan Anda terkirim. Terima kasih!" : "Ucapan tersimpan di browser ini (mode demo). Terima kasih!", "ok");
                textEl.value = "";
                counter.textContent = "0/" + textEl.maxLength;
                renderWishes();
            } catch (error) {
                console.warn(error);
                setMsg(msg, "Maaf, ucapan gagal dikirim. Silakan coba lagi.", "error");
            }
        });

        renderWishes();
    }

    // Menjalankan kedua formulir
    function init() { initRsvp(); initWishes(); }

    return { init: init };
})();
