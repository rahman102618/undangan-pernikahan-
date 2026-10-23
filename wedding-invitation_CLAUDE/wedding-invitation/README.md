# Modern Luxury Wedding Invitation

Website undangan pernikahan digital berbasis **HTML5, Bootstrap 5.3.8, CSS3, dan JavaScript murni**.
Tanpa build, tanpa Node.js, tanpa instalasi dependency.

> **Penting — semua data di `js/config.js` masih PLACEHOLDER** (nama, tanggal, alamat, rekening, foto).
> Ganti dengan data asli sebelum undangan dibagikan.

## 1. Membuka di VS Code dan menjalankan Live Server
1. Buka VS Code → **File → Open Folder** → pilih folder `wedding-invitation`.
2. Pasang ekstensi **Live Server** (Ritwick Dey) dari tab Extensions.
3. Klik kanan `index.html` → **Open with Live Server**.
4. Browser terbuka di alamat seperti `http://127.0.0.1:5500`.

Catatan: font Google dan Bootstrap (mode CDN) membutuhkan **koneksi internet**.

## 2. Struktur folder
```text
wedding-invitation/
├── index.html              Struktur halaman
├── css/
│   ├── style.css           Gaya utama (warna, tipografi, komponen)
│   ├── responsive.css      Penyesuaian ukuran layar
│   └── animation.css       Semua animasi
├── js/
│   ├── config.js           PUSAT DATA undangan (ubah di sini)
│   ├── music.js            Musik dan piringan vinyl
│   ├── rsvp.js             RSVP dan ucapan (localStorage / Supabase)
│   ├── invitation.js       Isi undangan, countdown, galeri, buka cover
│   └── main.js             Penggerak utama (dimuat terakhir)
└── assets/
    ├── images/placeholder.svg
    └── music/              ← letakkan wedding-song.mp3 di sini
```
Urutan `<script>` di `index.html` penting: `config → music → rsvp → invitation → main`.

## 3. Mengganti data
Semua melalui **`js/config.js`**:
- **Nama pengantin & orang tua**: bagian `groom` dan `bride`.
- **Tanggal & zona waktu**: `weddingDate` (format `2027-03-20T09:00:00+07:00`; `+07:00` WIB, `+08:00` WITA, `+09:00` WIT) dan `timezoneLabel`. Ubah juga `start` dan `timeText` pada `events`.
- **Lokasi**: `place`, `address`, dan `mapsUrl` (tempel link Google Maps asli; jika kosong, tombol tidak ditampilkan).
- **Live streaming**: isi `liveStreaming.url`; jika kosong, tombol disembunyikan.
- **Rekening**: `gifts.accounts` (boleh lebih dari satu).
- **Cerita cinta**: `story`. **Dress code**: `dressCode`. **Penutup**: `closingMessage`.

## 4. Mengganti foto
1. Simpan foto di `assets/images/` (disarankan JPG/WebP, lebar maks ±1600 px, di bawah 400 KB agar cepat).
2. Ubah path di `config.js`, misalnya `photo: "assets/images/groom.jpg"`.
3. Foto cover/opening/closing: `coverPhoto`, `openingPhoto`, `closingPhoto`. Galeri: array `gallery` (isi `alt` yang deskriptif).

Jika foto gagal dimuat, otomatis tampil `placeholder.svg`.

## 5. Mengganti musik
Letakkan file lagu Anda di **`assets/music/wedding-song.mp3`** (atau ubah `music.src`). Pastikan Anda memiliki hak menggunakan lagu tersebut.
Selama file belum ada, tombol vinyl menampilkan tanda ✕ dan musik **tidak** diputar.

## 6. Mengubah warna
Buka `css/style.css`, ubah variabel di bagian `:root` (`--ivory`, `--sand`, `--champagne`, `--charcoal`, `--black`).

## 7. Bootstrap lokal (tanpa internet untuk Bootstrap)
1. Unduh Bootstrap 5.3.8 *compiled CSS and JS* dari getbootstrap.com.
2. Ekstrak sehingga ada folder `bootstrap-5.3.8-dist/` di samping `index.html`.
3. Di `index.html` ganti dua alamat CDN menjadi:
   - `bootstrap-5.3.8-dist/css/bootstrap.min.css`
   - `bootstrap-5.3.8-dist/js/bootstrap.bundle.min.js`

## 8. Nama tamu lewat URL
`index.html?to=Budi%20Santoso` → nama tampil di cover dan terisi otomatis pada form. Spasi ditulis `%20`.

## 9. RSVP dan ucapan
**Mode demo (bawaan):** data disimpan di `localStorage` — **hanya terlihat di browser dan perangkat yang sama**. Mempelai tidak dapat melihat data tamu lain. Jangan gunakan untuk acara sebenarnya.

**Mode online (Supabase):**
1. Buat proyek di supabase.com, lalu jalankan SQL berikut di SQL Editor:
```sql
create table rsvp (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 60),
  status text not null check (status in ('hadir','tidak')),
  guests int not null check (guests between 0 and 10),
  created_at timestamptz default now()
);
create table wishes (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 60),
  message text not null check (char_length(message) between 3 and 200),
  created_at timestamptz default now()
);
alter table rsvp enable row level security;
alter table wishes enable row level security;
-- Publik hanya boleh MENAMBAH RSVP (tidak boleh membaca, demi privasi tamu)
create policy "publik tambah rsvp" on rsvp for insert to anon with check (true);
-- Publik boleh menambah dan membaca ucapan
create policy "publik tambah ucapan" on wishes for insert to anon with check (true);
create policy "publik baca ucapan" on wishes for select to anon using (true);
```
2. Di Supabase: **Project Settings → API**, salin **Project URL** dan **anon public key**.
3. Isi di `config.js`: `supabase: { enabled: true, url: "...", anonKey: "..." }`.
4. **Jangan pernah** memakai `service_role` key di frontend.
5. Untuk melihat daftar RSVP, buka **Table Editor** di dashboard Supabase.

Catatan keamanan: pembatas spam di browser hanya hambatan ringan. Untuk acara besar, tambahkan pembatasan di sisi server (mis. Edge Function dengan rate limit atau captcha).

## 10. Mempublikasikan
Karena situs ini statis, Anda bisa mengunggahnya ke **Netlify**, **Vercel**, **Cloudflare Pages**, atau **GitHub Pages** (unggah seluruh folder). Bagikan tautan dengan `?to=Nama%20Tamu` untuk tiap tamu.

## 11. Checklist uji manual
- [ ] Cover tampil penuh layar, nama tamu muncul bila memakai `?to=`.
- [ ] "Buka Undangan" menutup cover dan halaman bisa di-scroll.
- [ ] Musik berputar setelah klik (jika file mp3 ada); vinyl berputar saat main, berhenti saat jeda; lanjut dari posisi terakhir.
- [ ] Tanpa file mp3: vinyl tampil ✕ dan muncul pesan, tanpa error yang merusak halaman.
- [ ] Countdown berjalan; ubah tanggal ke masa lalu untuk melihat pesan "telah tiba".
- [ ] Galeri: klik foto membuka lightbox, panah/geser berfungsi.
- [ ] Tombol salin rekening menampilkan notifikasi.
- [ ] RSVP dan ucapan menolak input kosong dan menampilkan pesan.
- [ ] Coba lebar layar 320 px, 375 px, tablet, dan desktop tanpa scroll horizontal.
- [ ] Console browser (F12) tanpa error merah.
