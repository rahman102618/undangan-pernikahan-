// =====================================================================
// config.js — PUSAT PENGATURAN UNDANGAN
// Ubah data di file ini saja, maka seluruh website ikut berubah.
// SEMUA DATA DI BAWAH ADALAH PLACEHOLDER (contoh), bukan data asli.
// =====================================================================

// Menyimpan seluruh konfigurasi pada satu objek global agar bisa dibaca file JS lain
window.WEDDING_CONFIG = {

    // Alamat foto cadangan; dipakai jika foto utama gagal dimuat
    placeholderImage: "assets/images/placeholder.svg",

    // ---------------- DATA MEMPELAI PRIA ----------------
    groom: {
        nickname: "Raka",                                   // Nama panggilan (tampil di cover)
        fullName: "Raka Pratama Wijaya",                    // Nama lengkap
        parents: "Putra dari Bapak Hendra Wijaya & Ibu Sari Wijaya", // Keterangan orang tua
        photo: "assets/images/placeholder.svg"              // Ganti dengan foto asli, mis. assets/images/groom.jpg
    },

    // ---------------- DATA MEMPELAI WANITA ----------------
    bride: {
        nickname: "Anindya",
        fullName: "Anindya Putri Maharani",
        parents: "Putri dari Bapak Bambang Maharani & Ibu Lestari Maharani",
        photo: "assets/images/placeholder.svg"
    },

    // ---------------- FOTO UTAMA ----------------
    coverPhoto: "assets/images/placeholder.svg",    // Foto latar cover
    openingPhoto: "assets/images/placeholder.svg",  // Foto bagian pembuka
    closingPhoto: "assets/images/placeholder.svg",  // Foto bagian penutup

    // ---------------- TANGGAL UTAMA (dipakai cover, countdown, footer) ----------------
    // Format ISO dengan zona waktu: +07:00 = WIB, +08:00 = WITA, +09:00 = WIT
    weddingDate: "2027-03-20T09:00:00+07:00",
    timezoneLabel: "WIB",

    // ---------------- DAFTAR ACARA ----------------
    // mapsUrl dikosongkan agar tidak memakai tautan palsu. Isi dengan link Google Maps asli.
    events: [
        {
            id: "akad",
            title: "Akad Nikah",
            start: "2027-03-20T09:00:00+07:00",
            timeText: "09.00 – 10.00 WIB",
            place: "Nama Lokasi Akad (contoh)",
            address: "Alamat lengkap lokasi akad (isi dengan alamat asli)",
            mapsUrl: ""
        },
        {
            id: "resepsi",
            title: "Resepsi",
            start: "2027-03-20T11:00:00+07:00",
            timeText: "11.00 – 14.00 WIB",
            place: "Nama Lokasi Resepsi (contoh)",
            address: "Alamat lengkap lokasi resepsi (isi dengan alamat asli)",
            mapsUrl: ""
        }
    ],

    // ---------------- DRESS CODE ----------------
    dressCode: {
        description: "Kami mengundang Anda mengenakan busana dengan nuansa warna netral hangat berikut.",
        colors: [
            { name: "Ivory", hex: "#F7F3ED" },
            { name: "Sand", hex: "#D8CABB" },
            { name: "Champagne", hex: "#AE9274" },
            { name: "Charcoal", hex: "#47423E" }
        ]
    },

    // ---------------- LIVE STREAMING ----------------
    // Kosongkan url jika belum ada; tombol akan disembunyikan dan catatan ditampilkan
    liveStreaming: {
        url: "",
        note: "Tautan siaran langsung akan dibagikan mendekati hari acara."
    },

    // ---------------- GALERI FOTO ----------------
    // layout: "tall" (tinggi), "wide" (lebar), atau "" (normal)
    gallery: [
        { src: "assets/images/placeholder.svg", alt: "Foto galeri pasangan 1", layout: "tall" },
        { src: "assets/images/placeholder.svg", alt: "Foto galeri pasangan 2", layout: "" },
        { src: "assets/images/placeholder.svg", alt: "Foto galeri pasangan 3", layout: "" },
        { src: "assets/images/placeholder.svg", alt: "Foto galeri pasangan 4", layout: "wide" },
        { src: "assets/images/placeholder.svg", alt: "Foto galeri pasangan 5", layout: "" },
        { src: "assets/images/placeholder.svg", alt: "Foto galeri pasangan 6", layout: "tall" }
    ],

    // ---------------- CERITA CINTA ----------------
    story: [
        { year: "Tahun 1", title: "Pertemuan Pertama", text: "Tuliskan cerita bagaimana kalian pertama kali bertemu." },
        { year: "Tahun 2", title: "Perjalanan Bersama", text: "Tuliskan kisah perjalanan hubungan kalian." },
        { year: "Tahun 3", title: "Lamaran", text: "Tuliskan momen pertunangan atau lamaran kalian." },
        { year: "2027", title: "Hari Pernikahan", text: "Tuliskan harapan kalian untuk hari pernikahan." }
    ],

    // ---------------- HADIAH PERNIKAHAN ----------------
    gifts: {
        note: "Kehadiran Anda adalah hadiah terbaik. Namun jika ingin berbagi kebahagiaan, Anda dapat menggunakan informasi berikut.",
        accounts: [
            { bank: "Nama Bank (contoh)", number: "0000000000", holder: "Nama Pemilik Rekening (contoh)" }
        ],
        address: "" // Isi alamat pengiriman hadiah, atau kosongkan untuk menyembunyikannya
    },

    // ---------------- MUSIK ----------------
    music: {
        src: "assets/music/wedding-song.mp3", // Letakkan file lagu Anda di path ini
        volume: 0.6                           // 0.0 (hening) sampai 1.0 (maksimal)
    },

    // ---------------- PENUTUP ----------------
    closingMessage: "Merupakan kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Terima kasih atas segala cinta dan perhatian yang diberikan.",

    // ---------------- DATABASE ONLINE (OPSIONAL) ----------------
    // Biarkan enabled: false untuk mode demo localStorage.
    // Jika diaktifkan, isi url dan anonKey (kunci PUBLIK anon, JANGAN service role key).
    supabase: {
        enabled: false,
        url: "",
        anonKey: ""
    }
};
