/* =========================================================
   script.js - Logika semua halaman Toko Buku Online
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Helper ---------- */
  const $ = (id) => document.getElementById(id);
  const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const emailOK = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const sesi = () => { try { return JSON.parse(localStorage.getItem('sesi')); } catch (e) { return null; } };

  // tampilkan pesan error di <span class="error">; return true jika valid
  function err(id, msg) { const e = $(id); if (e) e.textContent = msg || ''; return !msg; }

  function toast(msg) {
    const t = $('toast');
    if (!t) { alert(msg); return; }
    t.textContent = msg;
    t.classList.add('show', 'tampil');
    t.style.cssText += ';display:block;opacity:1;visibility:visible';
    clearTimeout(t._h);
    t._h = setTimeout(() => { t.classList.remove('show', 'tampil'); t.style.display = 'none'; }, 2600);
  }
  function buka(id) { const m = $(id); m.classList.add('show', 'open', 'aktif'); m.style.display = 'flex'; }
  function tutup(id) { const m = $(id); m.classList.remove('show', 'open', 'aktif'); m.style.display = 'none'; }

  const getKatalog = () => load('katalog', null) || JSON.parse(JSON.stringify(dataKatalogBuku));
  const statusStok = (s) => (s <= 0 ? 'Habis' : s <= 5 ? 'Menipis' : 'Tersedia');
  const semuaUser = () => dataUser.concat(load('userBaru', []));
  const semuaPengiriman = () => dataPengiriman.concat(load('pesananBaru', []));

  /* ---------- Router halaman ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const isLogin = !!$('formLogin');
    if (!isLogin && !sesi()) { location.replace('index.html'); return; }

    if (isLogin) initLogin();
    else initLogout();

    if (document.body.classList.contains('dashboard-page')) initDashboard();
    if ($('tabelStok')) initStok();
    if ($('tabelPesanan')) initCheckout();
    if ($('formCari')) initTracking();
  });

  /* ---------- Logout (dipakai semua halaman selain login) ---------- */
  function initLogout() {
    ['btnLogout', 'linkLogout'].forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Yakin ingin logout?')) { localStorage.removeItem('sesi'); location.href = 'index.html'; }
      });
    });
    // perbaiki tautan antar halaman
    document.querySelectorAll('a.nav-link').forEach((a) => {
      if (a.textContent.trim() === 'Pesan Buku' && a.getAttribute('href') === 'index.html') a.href = 'checkout.html';
    });
  }

  /* =========================================================
     1. LOGIN
     ========================================================= */
  function initLogin() {
    $('formLogin').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('email').value.trim().toLowerCase();
      const pass = $('password').value;
      let ok = true;
      ok = err('errEmail', !email ? 'Email wajib diisi' : !emailOK(email) ? 'Format email tidak valid' : '') && ok;
      ok = err('errPassword', !pass ? 'Password wajib diisi' : '') && ok;
      if (!ok) return;

      const user = semuaUser().find((u) => u.email.toLowerCase() === email && u.password === pass);
      if (!user) { alert('Email/password yang anda masukkan salah'); return; }
      localStorage.setItem('sesi', JSON.stringify({ nama: user.nama, email: user.email }));
      location.href = 'dashboard.html';
    });

    // Modal Lupa Password
    $('btnLupa').addEventListener('click', () => { $('emailLupa').value = ''; err('errLupa'); buka('modalLupa'); });
    $('btnKirimLupa').addEventListener('click', () => {
      const em = $('emailLupa').value.trim().toLowerCase();
      if (!em) return err('errLupa', 'Email wajib diisi');
      if (!emailOK(em)) return err('errLupa', 'Format email tidak valid');
      if (!semuaUser().some((u) => u.email.toLowerCase() === em)) return err('errLupa', 'Email belum terdaftar');
      err('errLupa');
      tutup('modalLupa');
      alert('Petunjuk reset password telah dikirim ke ' + em + ' (simulasi).');
    });

    // Modal Daftar
    $('btnDaftar').addEventListener('click', () => {
      ['dNama', 'dEmail', 'dPass', 'dPass2'].forEach((i) => ($(i).value = ''));
      ['errDNama', 'errDEmail', 'errDPass', 'errDPass2'].forEach((i) => err(i));
      buka('modalDaftar');
    });
    $('btnSimpanDaftar').addEventListener('click', () => {
      const nama = $('dNama').value.trim(), em = $('dEmail').value.trim().toLowerCase();
      const p1 = $('dPass').value, p2 = $('dPass2').value;
      let ok = true;
      ok = err('errDNama', !nama ? 'Nama wajib diisi' : '') && ok;
      ok = err('errDEmail', !em ? 'Email wajib diisi' : !emailOK(em) ? 'Format email tidak valid' : semuaUser().some((u) => u.email.toLowerCase() === em) ? 'Email sudah terdaftar' : '') && ok;
      ok = err('errDPass', p1.length < 6 ? 'Password minimal 6 karakter' : '') && ok;
      ok = err('errDPass2', p2 !== p1 ? 'Konfirmasi password tidak sama' : '') && ok;
      if (!ok) return;
      const baru = load('userBaru', []);
      baru.push({ nama, email: em, password: p1 });
      save('userBaru', baru);
      tutup('modalDaftar');
      $('email').value = em;
      alert('Pendaftaran berhasil! Silakan login.');
    });

    document.querySelectorAll('[data-tutup]').forEach((b) => b.addEventListener('click', () => tutup(b.dataset.tutup)));
    document.querySelectorAll('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) tutup(m.id); }));
  }

  /* =========================================================
     2. DASHBOARD
     ========================================================= */
  function initDashboard() {
    const s = sesi();
    $('namaUser').textContent = '👤 ' + s.nama;

    function tick() {
      const now = new Date(), h = now.getHours();
      let sapa, ikon;
      if (h < 11) { sapa = 'Selamat Pagi'; ikon = '🌅'; }
      else if (h < 15) { sapa = 'Selamat Siang'; ikon = '☀️'; }
      else if (h < 18) { sapa = 'Selamat Sore'; ikon = '🌇'; }
      else { sapa = 'Selamat Malam'; ikon = '🌙'; }
      $('sapa').textContent = sapa + ', ' + s.nama + '!';
      $('ikonSapa').textContent = ikon;
      $('tanggal').textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      $('jam').textContent = now.toLocaleTimeString('id-ID', { hour12: false });
    }
    tick();
    setInterval(tick, 1000);

    // Menu katalog mengarah ke halaman stok
    $('menuKatalog').href = 'stok.html';

    // === MODIFIKASI: Laporan & History ditampilkan langsung via Modal di Dashboard ===
    
    // Fungsi helper untuk menampilkan modal dinamis di dashboard
    function tampilkanPanelDashboard(judulHtml, isiTabelHtml) {
      let modal = $('modalDashboardDinamis');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalDashboardDinamis';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:9999;';
        document.body.appendChild(modal);
      }
      modal.innerHTML = `
        <div style="background:white; padding:24px; border-radius:12px; width:90%; max-width:700px; max-height:80vh; overflow-y:auto; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
          <h2 style="margin-top:0; color:#1e293b; font-size:1.25rem; border-bottom:2px solid #e2e8f0; padding-bottom:10px;">${judulHtml}</h2>
          <div style="margin:15px 0; overflow-x:auto;">${isiTabelHtml}</div>
          <div style="text-align:right; margin-top:15px;">
            <button type="button" id="tutupPanelDinamis" style="background:#4f46e5; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">Tutup</button>
          </div>
        </div>`;
      modal.style.display = 'flex';
      $('tutupPanelDinamis').onclick = () => { modal.style.display = 'none'; };
      modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    }

    // 1. Menu Laporan Pemesanan
    $('menuLaporan').addEventListener('click', (e) => {
      e.preventDefault();
      const semuaPesan = semuaPengiriman();
      
      let tabel = `<table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                    <thead>
                      <tr style="background:#f8fafc; border-bottom:2px solid #cbd5e1;">
                        <th style="padding:10px; text-align:left;">No. DO</th>
                        <th style="padding:10px; text-align:left;">Nama Pemesan</th>
                        <th style="padding:10px; text-align:left;">Ekspedisi</th>
                        <th style="padding:10px; text-align:left;">Tanggal</th>
                        <th style="padding:10px; text-align:right;">Total</th>
                      </tr>
                    </thead>
                    <tbody>`;
      
      if (semuaPesan.length === 0) {
        tabel += `<tr><td colspan="5" style="text-align:center; padding:20px; color:#64748b;">Belum ada data pemesanan.</td></tr>`;
      } else {
        semuaPesan.forEach(p => {
          tabel += `<tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:10px;">${esc(p.noDO)}</td>
                      <td style="padding:10px;">${esc(p.nama)}</td>
                      <td style="padding:10px;">${esc(p.ekspedisi)}</td>
                      <td style="padding:10px;">${esc(p.tanggal)}</td>
                      <td style="padding:10px; text-align:right;">${rp(p.total)}</td>
                    </tr>`;
        });
      }
      tabel += `</tbody></table>`;
      tampilkanPanelDashboard('📊 Ringkasan Laporan Pemesanan', tabel);
    });

    // 2. Menu History Transaksi
    $('menuHistory').addEventListener('click', (e) => {
      e.preventDefault();
      const history = semuaPengiriman();

      let tabel = `<table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                    <thead>
                      <tr style="background:#f8fafc; border-bottom:2px solid #cbd5e1;">
                        <th style="padding:10px; text-align:left;">No. DO</th>
                        <th style="padding:10px; text-align:left;">Paket Buku</th>
                        <th style="padding:10px; text-align:left;">No. Resi</th>
                        <th style="padding:10px; text-align:center;">Status</th>
                      </tr>
                    </thead>
                    <tbody>`;
      
      if (history.length === 0) {
        tabel += `<tr><td colspan="4" style="text-align:center; padding:20px; color:#64748b;">Belum ada riwayat transaksi.</td></tr>`;
      } else {
        history.forEach(h => {
          tabel += `<tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:10px;">${esc(h.noDO)}</td>
                      <td style="padding:10px;">${esc(h.paket)}</td>
                      <td style="padding:10px;">${esc(h.resi)}</td>
                      <td style="padding:10px; text-align:center;"><span style="background:#dcfce7; color:#166534; padding:3px 8px; border-radius:4px; font-size:0.8rem;">Selesai / Diproses</span></td>
                    </tr>`;
        });
      }
      tabel += `</tbody></table>`;
      tampilkanPanelDashboard('📜 History Transaksi Anda', tabel);
    });
  }

  /* =========================================================
     3. STOK / KATALOG
     ========================================================= */
  function initStok() {
    let data = getKatalog();
    const simpan = () => save('katalog', data);

    function isiKategori() {
      const kat = [...new Set(data.map((b) => b.kategori))].sort();
      const cur = $('filterKategori').value;
      $('filterKategori').innerHTML = '<option value="">Semua Kategori</option>' + kat.map((k) => `<option>${esc(k)}</option>`).join('');
      $('filterKategori').value = cur;
      $('daftarKategori').innerHTML = kat.map((k) => `<option value="${esc(k)}">`).join('');
    }

    function render() {
      const q = $('cari').value.trim().toLowerCase(), fk = $('filterKategori').value, fs = $('filterStatus').value;
      const list = data.filter((b) =>
        (!q || b.judul.toLowerCase().includes(q) || b.penulis.toLowerCase().includes(q)) &&
        (!fk || b.kategori === fk) && (!fs || statusStok(b.stok) === fs));

      $('tabelStok').innerHTML = list.length ? list.map((b, i) => {
        const st = statusStok(b.stok);
        return `<tr>
          <td>${i + 1}</td><td>${esc(b.judul)}</td><td>${esc(b.penulis)}</td><td>${esc(b.kategori)}</td>
          <td>${rp(b.harga)}</td><td>${b.stok}</td>
          <td><span class="badge status-${st.toLowerCase()}">${st}</span></td>
          <td><button type="button" data-aksi="pesan" data-id="${b.id}" ${b.stok <= 0 ? 'disabled' : ''}>Pesan</button>
              <button type="button" class="secondary" data-aksi="hapus" data-id="${b.id}">Hapus</button></td></tr>`;
      }).join('') : '<tr><td colspan="8" style="text-align:center">Data tidak ditemukan</td></tr>';

      $('totalJudul').textContent = data.length;
      $('totalStok').textContent = data.reduce((a, b) => a + b.stok, 0);
      $('totalHabis').textContent = data.filter((b) => b.stok <= 0).length;
    }

    isiKategori();
    render();
    ['cari', 'filterKategori', 'filterStatus'].forEach((id) => $(id).addEventListener('input', render));

    $('tabelStok').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-aksi]');
      if (!btn) return;
      const id = Number(btn.dataset.id), buku = data.find((b) => b.id === id);
      if (btn.dataset.aksi === 'hapus') {
        if (confirm('Hapus "' + buku.judul + '" dari daftar stok?')) { data = data.filter((b) => b.id !== id); simpan(); isiKategori(); render(); toast('Buku dihapus'); }
      } else {
        const cart = load('keranjang', []), item = cart.find((c) => c.id === id);
        if (item) { if (item.qty >= buku.stok) return toast('Jumlah pesanan sudah mencapai stok'); item.qty++; }
        else cart.push({ id, qty: 1 });
        save('keranjang', cart);
        toast('"' + buku.judul + '" ditambahkan ke pesanan');
        if (confirm('Buku ditambahkan. Lanjut ke halaman pemesanan?')) location.href = 'checkout.html';
      }
    });

    // Modal tambah stok
    const fields = ['fJudul', 'fPenulis', 'fKategori', 'fHarga', 'fStok'];
    $('btnTambah').addEventListener('click', () => {
      fields.forEach((f) => ($(f).value = ''));
      ['errJudul', 'errPenulis', 'errKategori', 'errHarga', 'errStok'].forEach((i) => err(i));
      buka('modalTambah');
      $('fJudul').focus();
    });
    $('btnBatal').addEventListener('click', () => tutup('modalTambah'));
    $('modalTambah').addEventListener('click', (e) => { if (e.target.id === 'modalTambah') tutup('modalTambah'); });

    $('btnSimpan').addEventListener('click', () => {
      const judul = $('fJudul').value.trim(), penulis = $('fPenulis').value.trim(), kategori = $('fKategori').value.trim();
      const harga = $('fHarga').value, stok = $('fStok').value;
      let ok = true;
      ok = err('errJudul', !judul ? 'Judul wajib diisi' : data.some((b) => b.judul.toLowerCase() === judul.toLowerCase()) ? 'Judul sudah ada' : '') && ok;
      ok = err('errPenulis', !penulis ? 'Penulis wajib diisi' : '') && ok;
      ok = err('errKategori', !kategori ? 'Kategori wajib diisi' : '') && ok;
      ok = err('errHarga', harga === '' || Number(harga) <= 0 ? 'Harga harus lebih dari 0' : '') && ok;
      ok = err('errStok', stok === '' || Number(stok) < 0 || !Number.isInteger(Number(stok)) ? 'Stok harus angka bulat ≥ 0' : '') && ok;
      if (!ok) return;
      data.push({ id: data.reduce((m, b) => Math.max(m, b.id), 0) + 1, judul, penulis, kategori, harga: Number(harga), stok: Number(stok) });
      simpan(); isiKategori(); render(); tutup('modalTambah');
      toast('Stok baru berhasil ditambahkan');
    });
  }

  /* =========================================================
     4. CHECKOUT / PEMESANAN
     ========================================================= */
  function initCheckout() {
    let katalog = getKatalog();
    const cari = (id) => katalog.find((b) => b.id === id);
    let cart = load('keranjang', []).filter((c) => cari(c.id));
    const simpanCart = () => save('keranjang', cart);

    const s = sesi();
    if (s) { $('nama').value = s.nama; $('email').value = s.email; }

    // pilihan buku untuk menambah
    const tersedia = katalog.filter((b) => b.stok > 0);
    $('pilihBuku').innerHTML = tersedia.length
      ? tersedia.map((b) => `<option value="${b.id}">${esc(b.judul)} — ${rp(b.harga)} (stok ${b.stok})</option>`).join('')
      : '<option value="">Semua stok habis</option>';

    function normalisasi() { // gabungkan baris buku sama & batasi sesuai stok
      const map = {};
      cart.forEach((c) => { map[c.id] = (map[c.id] || 0) + c.qty; });
      cart = Object.keys(map).map((k) => ({ id: Number(k), qty: Math.max(1, Math.min(map[k], cari(Number(k)).stok || 1)) }))
        .filter((c) => cari(c.id).stok > 0);
    }

    function hitung() {
      const sub = cart.reduce((a, c) => a + cari(c.id).harga * c.qty, 0);
      const ongkir = cart.length ? (dataOngkir[$('kurir').value] || 0) : 0;
      $('rSubtotal').textContent = rp(sub);
      $('rOngkir').textContent = rp(ongkir);
      $('rTotal').textContent = rp(sub + ongkir);
      return { sub, ongkir, total: sub + ongkir };
    }

    function render() {
      normalisasi(); simpanCart();
      $('tabelPesanan').innerHTML = cart.length ? cart.map((c, i) => {
        const b = cari(c.id);
        const opsi = katalog.filter((x) => x.stok > 0 || x.id === c.id)
          .map((x) => `<option value="${x.id}" ${x.id === c.id ? 'selected' : ''}>${esc(x.judul)}</option>`).join('');
        return `<tr data-i="${i}"><td>${i + 1}</td>
          <td><select class="sel-buku" aria-label="Judul buku">${opsi}</select></td>
          <td>${rp(b.harga)}</td>
          <td><input type="number" class="inp-qty" min="1" max="${b.stok}" value="${c.qty}" style="width:70px" aria-label="Jumlah"></td>
          <td>${rp(b.harga * c.qty)}</td>
          <td><button type="button" class="secondary btn-hapus">Hapus</button></td></tr>`;
      }).join('') : '<tr><td colspan="6" style="text-align:center">Belum ada buku dalam pesanan</td></tr>';
      hitung();
    }

    $('btnTambah').addEventListener('click', () => {
      const id = Number($('pilihBuku').value), qty = parseInt($('jumlahBaru').value, 10);
      if (!id) return toast('Pilih buku terlebih dahulu');
      if (!qty || qty < 1) return toast('Jumlah minimal 1');
      const b = cari(id), ada = cart.find((c) => c.id === id), total = (ada ? ada.qty : 0) + qty;
      if (total > b.stok) return toast('Stok "' + b.judul + '" hanya ' + b.stok);
      if (ada) ada.qty = total; else cart.push({ id, qty });
      $('jumlahBaru').value = 1;
      render();
      toast('Buku ditambahkan ke pesanan');
    });

    $('tabelPesanan').addEventListener('change', (e) => {
      const tr = e.target.closest('tr[data-i]'); if (!tr) return;
      const c = cart[Number(tr.dataset.i)];
      if (e.target.classList.contains('sel-buku')) c.id = Number(e.target.value);
      if (e.target.classList.contains('inp-qty')) {
        const q = parseInt(e.target.value, 10), max = cari(c.id).stok;
        if (!q || q < 1) { toast('Jumlah minimal 1'); c.qty = 1; }
        else if (q > max) { toast('Stok hanya ' + max); c.qty = max; }
        else c.qty = q;
      }
      render();
    });
    $('tabelPesanan').addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-hapus')) return;
      cart.splice(Number(e.target.closest('tr').dataset.i), 1);
      render();
    });

    $('kurir').addEventListener('change', hitung);
    $('metode').addEventListener('change', () => {
      const m = dataMetodeBayar[$('metode').value];
      $('boxDetail').hidden = !m;
      if (m) { $('lblDetail').textContent = m.label; $('detailMetode').innerHTML = '<option value="">-- ' + m.label + ' --</option>' + m.opsi.map((o) => `<option>${esc(o)}</option>`).join(''); }
    });

    // Validasi & konfirmasi
    let pesanan = null;
    $('formCheckout').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!cart.length) return toast('Tambahkan minimal satu buku ke pesanan');
      const nama = $('nama').value.trim(), email = $('email').value.trim(), tel = $('telepon').value.trim().replace(/[\s-]/g, '');
      const kurir = $('kurir').value, alamat = $('alamat').value.trim(), metode = $('metode').value, detail = $('detailMetode').value;
      let ok = true;
      ok = err('errNama', nama.length < 3 ? 'Nama minimal 3 karakter' : '') && ok;
      ok = err('errEmail', !email ? 'Email wajib diisi' : !emailOK(email) ? 'Format email tidak valid' : '') && ok;
      ok = err('errTelepon', !/^08\d{8,11}$/.test(tel) ? 'Nomor telepon tidak valid (contoh 081234567890)' : '') && ok;
      ok = err('errKurir', !kurir ? 'Pilih pengiriman' : '') && ok;
      ok = err('errAlamat', kurir !== 'Ambil di Toko' && alamat.length < 10 ? 'Alamat minimal 10 karakter' : '') && ok;
      ok = err('errMetode', !metode ? 'Pilih metode pembayaran' : '') && ok;
      ok = err('errDetail', dataMetodeBayar[metode] && !detail ? 'Pilihan wajib diisi' : '') && ok;
      if (!ok) return;

      const t = hitung();
      pesanan = { nama, email, tel, kurir, alamat, metode, detail, catatan: $('catatanPesan').value.trim(), total: t.total, ongkir: t.ongkir };
      $('modalIsi').innerHTML = `
        <ul>${cart.map((c) => `<li>${esc(cari(c.id).judul)} × ${c.qty} = ${rp(cari(c.id).harga * c.qty)}</li>`).join('')}</ul>
        <p><strong>Pemesan:</strong> ${esc(nama)} (${esc(tel)})<br>
        <strong>Pengiriman:</strong> ${esc(kurir)}${kurir !== 'Ambil di Toko' ? ' — ' + esc(alamat) : ''}<br>
        <strong>Pembayaran:</strong> ${esc(metode)}${detail ? ' - ' + esc(detail) : ''}<br>
        <strong>Ongkir:</strong> ${rp(t.ongkir)}<br><strong>Total Bayar:</strong> ${rp(t.total)}</p>`;
      buka('modal');
    });

    $('btnBatal').addEventListener('click', () => tutup('modal'));
    $('btnKonfirmasi').addEventListener('click', () => {
      // cek ulang stok lalu kurangi
      katalog = getKatalog();
      for (const c of cart) {
        if (cari(c.id).stok < c.qty) { tutup('modal'); return toast('Stok "' + cari(c.id).judul + '" tidak mencukupi'); }
      }
      const jumlahJudul = cart.length;
      cart.forEach((c) => { cari(c.id).stok -= c.qty; });
      save('katalog', katalog);

      const d = new Date(), ymd = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
      const semua = semuaPengiriman().map((p) => p.noDO);
      let no, n = 1;
      do { no = 'DO-' + ymd + String(n++).padStart(2, '0'); } while (semua.includes(no));

      const baru = load('pesananBaru', []);
      baru.push({
        noDO: no, nama: pesanan.nama, status: 0, ekspedisi: pesanan.kurir,
        resi: 'RESI' + Math.floor(1e9 + Math.random() * 9e9),
        tanggal: d.toISOString().slice(0, 10),
        paket: 'Paket Buku (' + jumlahJudul + ' judul)', total: pesanan.total
      });
      save('pesananBaru', baru);
      cart = []; simpanCart();
      tutup('modal');
      alert('Pesanan berhasil dibuat!\nNomor Delivery Order: ' + no);
      location.href = 'tracking.html?do=' + encodeURIComponent(no);
    });

    render();
  }

  /* =========================================================
     5. TRACKING PENGIRIMAN
     ========================================================= */
  function initTracking() {
    const warna = ['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#16a34a'];
    const getOverride = () => load('trackStatus', {});
    let aktif = null;

    $('chipContoh').innerHTML = dataPengiriman.map((p) =>
      `<button type="button" class="chip" data-do="${p.noDO}" style="margin:2px">${p.noDO}</button>`).join('');
    $('chipContoh').addEventListener('click', (e) => {
      const b = e.target.closest('[data-do]'); if (!b) return;
      $('noDO').value = b.dataset.do; cariDO();
    });

    function gagal(msg) { $('pesanGagal').textContent = msg; $('hasil').hidden = true; buka('modalGagal'); }

    function tampil() {
      const idx = getOverride()[aktif.noDO] !== undefined ? getOverride()[aktif.noDO] : aktif.status;
      const n = dataStatusPengiriman.length, persen = Math.round(((idx + 1) / n) * 100);
      $('hNama').textContent = aktif.nama;
      $('hNo').textContent = aktif.noDO;
      $('hBadge').textContent = dataStatusPengiriman[idx].nama;
      $('hBadge').style.cssText += ';background:' + warna[idx] + ';color:#fff';
      $('progress').setAttribute('aria-valuenow', persen);
      $('progressIsi').style.width = persen + '%';
      $('progressIsi').style.background = warna[idx];
      $('hPersen').textContent = persen + '% selesai';
      $('langkah').innerHTML = dataStatusPengiriman.map((s, i) =>
        `<li class="${i < idx ? 'selesai' : i === idx ? 'aktif' : ''}">
          <span class="titik">${i <= idx ? '✓' : i + 1}</span>
          <div><strong>${esc(s.nama)}</strong><br><small>${esc(s.ket)}</small></div></li>`).join('');
      $('hEkspedisi').textContent = aktif.ekspedisi;
      $('hResi').textContent = aktif.resi;
      $('hTanggal').textContent = new Date(aktif.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      $('hPaket').textContent = aktif.paket;
      $('hTotal').textContent = rp(aktif.total);
      $('btnSimulasi').hidden = idx >= n - 1;
      $('hasil').hidden = false;
    }

    function cariDO() {
      const kode = $('noDO').value.trim().toUpperCase();
      if (!kode) return err('errDO', 'Nomor Delivery Order wajib diisi');
      if (!/^DO-\d{8,10}$/.test(kode)) return err('errDO', 'Format tidak valid (contoh: DO-20261103)');
      err('errDO');
      const p = semuaPengiriman().find((x) => x.noDO === kode);
      if (!p) return gagal('Nomor Delivery Order "' + kode + '" tidak ditemukan. Periksa kembali nomor Anda.');
      aktif = p;
      tampil();
    }

    $('formCari').addEventListener('submit', (e) => { e.preventDefault(); cariDO(); });
    $('btnTutupGagal').addEventListener('click', () => tutup('modalGagal'));
    $('btnSimulasi').addEventListener('click', () => {
      if (!aktif) return;
      const ov = getOverride(), cur = ov[aktif.noDO] !== undefined ? ov[aktif.noDO] : aktif.status;
      if (cur < dataStatusPengiriman.length - 1) { ov[aktif.noDO] = cur + 1; save('trackStatus', ov); tampil(); }
    });

    // dari halaman checkout: tracking.html?do=DO-...
    const q = new URLSearchParams(location.search).get('do');
    if (q) { $('noDO').value = q; cariDO(); }
  }
})();