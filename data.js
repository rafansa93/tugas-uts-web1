
/* =========================================================
   data.js - Data dummy (Array JSON) Toko Buku Online
   Dipakai oleh semua halaman melalui script.js
   ========================================================= */

// Akun demo untuk login (email: user@tokobuku.com, password: 123456)
const dataUser = [
  { nama: "Pengguna Demo", email: "user@tokobuku.com", password: "123456" },
  { nama: "Admin Toko", email: "admin@tokobuku.com", password: "admin123" }
];

// Data katalog / stok buku
const dataKatalogBuku = [
  { id: 1,  judul: "Laskar Pelangi",               penulis: "Andrea Hirata",        kategori: "Novel",     harga: 89000,  stok: 25 },
  { id: 2,  judul: "Bumi Manusia",                 penulis: "Pramoedya Ananta Toer", kategori: "Novel",     harga: 110000, stok: 12 },
  { id: 3,  judul: "Filosofi Teras",               penulis: "Henry Manampiring",    kategori: "Self-Help", harga: 98000,  stok: 4 },
  { id: 4,  judul: "Atomic Habits",                penulis: "James Clear",          kategori: "Self-Help", harga: 119000, stok: 30 },
  { id: 5,  judul: "Clean Code",                   penulis: "Robert C. Martin",     kategori: "Teknologi", harga: 350000, stok: 8 },
  { id: 6,  judul: "Pemrograman Web Dasar",        penulis: "Budi Raharjo",         kategori: "Teknologi", harga: 125000, stok: 15 },
  { id: 7,  judul: "Interaksi Manusia dan Komputer", penulis: "Ben Shneiderman",    kategori: "Teknologi", harga: 275000, stok: 0 },
  { id: 8,  judul: "Sapiens",                      penulis: "Yuval Noah Harari",    kategori: "Sejarah",   harga: 149000, stok: 10 },
  { id: 9,  judul: "Sejarah Indonesia Modern",     penulis: "M.C. Ricklefs",        kategori: "Sejarah",   harga: 165000, stok: 3 },
  { id: 10, judul: "Rich Dad Poor Dad",            penulis: "Robert T. Kiyosaki",   kategori: "Bisnis",    harga: 95000,  stok: 18 },
  { id: 11, judul: "Start With Why",               penulis: "Simon Sinek",          kategori: "Bisnis",    harga: 105000, stok: 0 },
  { id: 12, judul: "Dilan 1990",                   penulis: "Pidi Baiq",            kategori: "Novel",     harga: 79000,  stok: 20 }
];

// Tahapan status pengiriman
const dataStatusPengiriman = [
  { nama: "Pesanan Dibuat",     ket: "Pesanan diterima dan menunggu diproses" },
  { nama: "Sedang Dikemas",     ket: "Buku sedang disiapkan dan dikemas" },
  { nama: "Diserahkan ke Kurir", ket: "Paket sudah dijemput oleh kurir" },
  { nama: "Dalam Perjalanan",   ket: "Paket sedang menuju alamat tujuan" },
  { nama: "Terkirim",           ket: "Paket sudah diterima pemesan" }
];

// Data pengiriman contoh (status = indeks pada dataStatusPengiriman)
const dataPengiriman = [
  { noDO: "DO-20261101", nama: "Budi Santoso",  status: 4, ekspedisi: "JNE Reguler",  resi: "JNE1234567890", tanggal: "2026-11-01", paket: "Paket Buku (2 judul)", total: 207000 },
  { noDO: "DO-20261103", nama: "Siti Aminah",   status: 3, ekspedisi: "J&T Express",  resi: "JT9876543210",  tanggal: "2026-11-03", paket: "Paket Buku (1 judul)", total: 130000 },
  { noDO: "DO-20261105", nama: "Andi Wijaya",   status: 1, ekspedisi: "SiCepat",      resi: "SCP5566778899", tanggal: "2026-11-05", paket: "Paket Buku (3 judul)", total: 388000 },
  { noDO: "DO-20261107", nama: "Rina Marlina",  status: 0, ekspedisi: "JNE Reguler",  resi: "JNE0011223344", tanggal: "2026-11-07", paket: "Paket Buku (1 judul)", total: 110000 }
];

// Ongkos kirim per pengiriman
const dataOngkir = {
  "JNE Reguler": 15000,
  "J&T Express": 14000,
  "SiCepat": 13000,
  "Ambil di Toko": 0
};

// Metode pembayaran beserta pilihan detailnya (null = tanpa detail)
const dataMetodeBayar = {
  "Transfer Bank": { label: "Pilih Bank",   opsi: ["BCA", "Mandiri", "BNI", "BRI"] },
  "E-Wallet":      { label: "Pilih E-Wallet", opsi: ["GoPay", "OVO", "DANA", "ShopeePay"] },
  "COD":           null
};