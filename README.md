# 🏍️🚗 VeloCare — Vehicle Care & Logbook (iOS App)

Aplikasi asisten perawatan kendaraan dan buku servis digital modern yang dirancang khusus untuk iPhone menggunakan **React Native & Expo**.

---

## 🌟 Fitur Unggulan

1. **Garasi Multi-Kendaraan**:
   - Mendukung banyak motor dan mobil (contoh preset: *Honda Vario 160* & *Toyota Avanza Veloz*).
   - Mudah berganti kendaraan langsung dari bilah atas (header).
   - Tambah kendaraan baru dengan template perawatan otomatis sesuai tipe kendaraan.

2. **Pengingat Servis Cerdas (Smart Maintenance Reminders)**:
   - **Oli Mesin**: Progress bar visual dan countdown sisa kilometer & sisa hari.
   - **Oli Gardan / Transmisi**: Menghitung waktu penggantian transmisi matic.
   - **Filter Udara, Busi, Kampas Rem**: Status kesehatan komponen berkode warna (*Aman*, *Perlu Dicek*, *Jatuh Tempo*).
   - **Pajak STNK Tahunan & 5 Tahunan**: Peringatan jatuh tempo PKB kendaraan.
   - Fitur **1-Tap Mark as Done**: Tandai komponen sudah diganti hari ini untuk otomatis mereset interval.

3. **Catatan BBM & Kalkulator Efisiensi**:
   - Catat pengisian bensin (Pertalite, Pertamax, Shell, Dexlite, dll).
   - Perhitungan otomatis efisiensi **KM/Liter** dan estimasi **Biaya Operasional per KM (Rp/KM)**.
   - Riwayat pengisian bensin dan pengeluaran bulanan.

4. **Buku Riwayat Servis & Bengkel (Logbook)**:
   - Catatan servis berkala lengkap dengan nama bengkel, tanggal, KM odometer, dan suku cadang yang diganti.
   - Filter berdasarkan kategori: *Rutin*, *Perbaikan*, *Modifikasi*, dan *Cuci/Detail*.

5. **Update Odometer Cepat (Quick KM Update)**:
   - Perbarui angka kilometer harian hanya dalam 3 detik menggunakan tombol pintasan (+10 km, +25 km, +50 km, +100 km).

6. **Analisis Biaya Kepemilikan (Total Cost of Ownership)**:
   - Grafik pembagian pengeluaran (BBM vs Servis Bengkel).
   - Ringkasan total jarak tempuh, total liter bahan bakar, dan total biaya pemeliharaan.

7. **Aman & Offline-First**:
   - Seluruh data disimpan langsung di memori iPhone menggunakan `AsyncStorage`. Tidak perlu registrasi akun atau koneksi internet.

---

## 📱 Cara Menjalankan di iPhone Anda (Langkah demi Langkah)

### Langkah 1: Pasang Aplikasi Expo Go di iPhone
- Buka **App Store** di iPhone Anda.
- Cari aplikasi bernama **"Expo Go"** (oleh 650 Industries, Inc.) dan unduh secara gratis.

### Langkah 2: Pastikan iPhone dan Komputer Terhubung ke WiFi yang Sama
- Hubungkan iPhone dan laptop/PC Anda ke jaringan WiFi lokal yang sama.

### Langkah 3: Jalankan Proyek di Terminal
Buka terminal di folder proyek ini (`d:\Aplikasi Iphone`) dan jalankan perintah:

```bash
npx expo start
```

### Langkah 4: Buka Aplikasi di iPhone
1. Buka aplikasi **Kamera bawaan iPhone** Anda.
2. Arahkan kamera ke **QR Code** yang muncul di layar terminal komputer.
3. Ketuk banner notifikasi kuning bertuliskan **"Open in Expo Go"**.
4. Aplikasi **VeloCare** akan langsung dimuat dan berjalan secara native di iPhone Anda! 🎉

---

## 🌐 Menjalankan di Web Browser (Opsional)

Jika ingin melihat tampilan langsung di browser laptop/PC:
```bash
npm run web
```
Aplikasi akan otomatis terbuka di `http://localhost:8081`.
