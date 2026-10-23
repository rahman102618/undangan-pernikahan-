// =====================================================================
// music.js — KONTROL MUSIK LATAR DAN PIRINGAN VINYL
// Memakai HTMLAudioElement. Status putaran piringan DISINKRONKAN dengan
// event audio yang sebenarnya (play, pause, error), bukan sekadar tebakan.
// =====================================================================

// Membungkus semua kode dalam satu objek global bernama Music
window.Music = (function () {

    // Elemen audio dan tombol vinyl (diisi saat init)
    let audio = null;
    let button = null;
    let stateIcon = null;

    // Menandai apakah file musik tidak dapat dimuat (mis. file belum ditambahkan)
    let unavailable = false;

    // Memperbarui tampilan tombol sesuai status audio yang sebenarnya
    function updateUI() {
        // Audio dianggap sedang diputar jika tidak paused dan tidak error
        const playing = !!audio && !audio.paused && !unavailable;

        // Class is-playing membuat CSS menjalankan animasi putar piringan
        button.classList.toggle("is-playing", playing);
        button.classList.toggle("is-unavailable", unavailable);

        // Atribut aksesibilitas untuk pembaca layar
        button.setAttribute("aria-pressed", String(playing));
        button.setAttribute("aria-label", unavailable ? "Musik tidak tersedia" : (playing ? "Jeda musik" : "Putar musik"));

        // Ikon kecil: jeda saat memutar, segitiga saat berhenti, tanda silang jika tidak tersedia
        stateIcon.textContent = unavailable ? "✕" : (playing ? "❚❚" : "▶");
    }

    // Menyiapkan elemen audio dan event-nya
    function init() {
        audio = document.getElementById("weddingMusic");
        button = document.getElementById("musicButton");
        stateIcon = document.getElementById("musicState");
        const cfg = window.WEDDING_CONFIG.music;

        // Mengisi sumber lagu dan volume dari config.js
        audio.src = cfg.src;
        audio.volume = cfg.volume;

        // Event audio: setiap perubahan status langsung memperbarui piringan
        audio.addEventListener("play", updateUI);
        audio.addEventListener("pause", updateUI);
        audio.addEventListener("ended", updateUI);

        // Event error: terjadi jika file tidak ditemukan atau format tidak didukung
        audio.addEventListener("error", function () {
            unavailable = true;
            updateUI();
        });

        // Klik tombol vinyl: ganti antara putar dan jeda
        button.addEventListener("click", toggle);
        updateUI();
    }

    // Memutar musik; mengembalikan true jika berhasil. Harus dipanggil dari klik pengguna.
    async function start() {
        if (!audio || unavailable) return false;
        try {
            await audio.play();
            return true;
        } catch (error) {
            // Browser menolak atau file tidak ada; tampilkan pesan jujur
            console.warn("Musik belum dapat diputar:", error);
            if (window.showToast) {
                window.showToast("Musik belum dapat diputar. Pastikan file lagu sudah ditambahkan.");
            }
            return false;
        }
    }

    // Mengganti status: jika sedang main maka jeda, jika berhenti maka lanjut dari posisi terakhir
    async function toggle() {
        if (!audio) return;
        if (unavailable) {
            window.showToast && window.showToast("File musik belum tersedia di assets/music/wedding-song.mp3");
            return;
        }
        if (audio.paused) {
            await start();   // play() melanjutkan dari currentTime terakhir, bukan dari awal
        } else {
            audio.pause();
        }
    }

    // Hanya fungsi yang perlu diakses file lain yang dibuka ke luar
    return { init: init, start: start, toggle: toggle };
})();
