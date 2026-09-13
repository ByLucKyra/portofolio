# Data dan aset sebelum implementasi

Acuan: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md). Dokumen tersebut merupakan rangkuman yang diberikan pengguna, bukan transkrip lengkap percakapan atau salinan aset Figma.

## Keputusan yang sudah dikunci

- Identitas: Lucky Ramadhan — Software Developer.
- Prototype mengejar fidelity UI Persona 3 Reload: biru/cyan/navy, putih kontras, aksen selected merah, komposisi diagonal, tipografi besar, lapisan air/refleksi, dan karakter anime.
- Desktop berupa pengalaman menu fullscreen 16:9; setiap section merupakan screen terpisah.
- Urutan navigasi: About → Experience → Projects → Skills → Achievements → Contact.
- Input: mouse, W/S atau panah, Enter untuk konfirmasi, Escape untuk kembali.
- Setiap screen memakai karakter yang sama dengan pose, properti, dan lingkungan berbeda.
- Content, UI, dan art dipisahkan; teks dan kontrol dibuat sebagai UI editable.
- State motion: idle, hover, selected, confirm, transition, screen open, back.
- Main Menu menjadi benchmark pertama sebelum pengembangan semua screen.

## Data yang perlu dilengkapi

| Screen | Informasi tersedia | Masih dibutuhkan |
| --- | --- | --- |
| About | Nama dan peran | Bio, profil yang ingin ditampilkan, minat, motivasi, kutipan pribadi |
| Experience | Format perjalanan profesional | Tahun/tanggal, peran, organisasi, deskripsi, teknologi untuk setiap entri |
| Projects | K&U Platform, Progressio, Hermes PolyLab beserta gambaran singkat di konteks | Peran Lucky, kontribusi, hasil yang terverifikasi, stack, gambar, tautan demo/repository, pilihan proyek final |
| Skills | Kategori dan contoh teknologi | Teknologi final yang dikonfirmasi; kriteria level bila level akan ditampilkan |
| Achievements | Struktur milestone dan kategori potensial | Pencapaian asli, tahun, deskripsi, kategori, bukti atau tautan bila tersedia |
| Contact | Rencana channel | Alamat email dan URL sosial yang boleh ditampilkan |

Jangan mengubah placeholder visual menjadi fakta. Jangan mengarang umur, jabatan, tanggal, prestasi, URL, hasil proyek, atau skor kemampuan.

## Aset dan desain yang perlu tersedia

- Figma: https://www.figma.com/design/n6Gi5Hx54vlBSV3T25HXUm
- File Figma sudah diperiksa pada 13 September 2026. Prototype aktif mencakup Main Menu dan tujuh section, termasuk THE LAB.
- Keputusan terbaru: pertahankan UI Figma saat ini tanpa karakter manusia untuk sementara. Layer karakter disembunyikan pada screen aktif; kebutuhan artwork karakter di bawah ditunda untuk fase berikutnya.
- Artwork dari percakapan sebelumnya belum tersedia sebagai file di proyek ini.
- Dibutuhkan artwork Main Menu dan enam screen, dengan identitas karakter konsisten dan layer terpisah dari UI.
- Kunci token warna, tipografi, selected state, komponen HUD, layout setiap screen, dan perilaku navigasi.
- Responsivitas mobile, perilaku overflow konten, focus keyboard, dan reduced motion perlu ditentukan saat menyusun desain implementasi.
- Stack implementasi belum diputuskan dalam sumber konteks.

## Urutan kerja

1. Lengkapi konten asli dan kumpulkan artwork serta referensi Figma.
2. Kunci design system dan layout tiap screen, dimulai dari Main Menu.
3. Buat prototype interaksi dan motion dengan layer art/UI terpisah.
4. Implementasikan website dan periksa navigasi, keterbacaan, responsivitas, dan aksesibilitas.
