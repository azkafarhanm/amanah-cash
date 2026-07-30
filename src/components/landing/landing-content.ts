export const problems = [
  {
    icon: "Files",
    title: "Catatan tersebar",
    description:
      "Transaksi dapat tersimpan di beberapa tempat dan mengikuti cara pencatatan yang berbeda.",
  },
  {
    icon: "Calculator",
    title: "Saldo harus dihitung ulang",
    description:
      "Setiap transaksi baru atau koreksi dapat memerlukan perhitungan manual kembali.",
  },
  {
    icon: "Search",
    title: "Riwayat sulit ditelusuri",
    description:
      "Menemukan transaksi tertentu menjadi lambat ketika urutan dan keterangannya tidak konsisten.",
  },
  {
    icon: "FileClock",
    title: "Laporan menyita waktu",
    description:
      "Rekap membutuhkan pengumpulan dan pemeriksaan ulang dari catatan yang terpisah.",
  },
  {
    icon: "CircleAlert",
    title: "Kesalahan sulit ditemukan",
    description:
      "Salah jumlah, arah transaksi, atau siswa dapat terlambat diketahui tanpa jejak yang jelas.",
  },
] as const;

export const solutions = [
  {
    icon: "UserRoundCheck",
    title: "Konteks siswa yang jelas",
    description:
      "Cari siswa lalu lihat saldo, transaksi, dan tindakan yang tersedia pada konteks yang tepat.",
  },
  {
    icon: "ArrowLeftRight",
    title: "Pencatatan terarah",
    description:
      "Setoran dan penarikan membedakan jenis, jumlah, waktu, dan keterangan transaksi.",
  },
  {
    icon: "Scale",
    title: "Saldo dari transaksi",
    description:
      "Saldo terbaru dan riwayat dapat diperiksa tanpa mengubah angka saldo secara manual.",
  },
  {
    icon: "ChartNoAxesCombined",
    title: "Pelaporan siap ditinjau",
    description:
      "Ringkasan dan laporan membantu pengguna memahami aktivitas tanpa menyusun ulang catatan.",
  },
  {
    icon: "History",
    title: "Perubahan dapat ditelusuri",
    description:
      "Tindakan penting meninggalkan riwayat untuk mendukung pemeriksaan dan pertanggungjawaban.",
  },
] as const;

export const workflowSteps = [
  {
    title: "Pilih siswa",
    description:
      "Cari nama siswa dan buka detail yang tepat sebelum mencatat transaksi.",
  },
  {
    title: "Catat transaksi",
    description:
      "Pilih Setor atau Tarik, lalu masukkan jumlah, waktu, dan keterangan.",
  },
  {
    title: "Periksa hasil",
    description:
      "Konfirmasi transaksi tersimpan dan saldo terbaru tampil sesuai hasil.",
  },
  {
    title: "Tinjau aktivitas",
    description:
      "Gunakan riwayat dan laporan untuk memahami transaksi pada periode tertentu.",
  },
  {
    title: "Telusuri perubahan",
    description:
      "Periksa jejak audit untuk melihat tindakan penting dan konteks pelakunya.",
  },
  {
    title: "Jaga keberlanjutan",
    description:
      "Admin membuat backup dan memulihkannya melalui proses yang tervalidasi.",
  },
] as const;

export const features = [
  {
    icon: "Users",
    title: "Pengelolaan siswa",
    description:
      "Tambah, cari, perbarui, dan kelola data siswa sesuai kewenangan pengguna.",
  },
  {
    icon: "ArrowLeftRight",
    title: "Setoran dan penarikan",
    description:
      "Catat dana yang masuk atau keluar dari saldo siswa melalui alur yang terarah.",
  },
  {
    icon: "Scale",
    title: "Saldo terkini",
    description:
      "Lihat saldo siswa yang disimpan dan direkonsiliasi dengan riwayat transaksi.",
  },
  {
    icon: "ListOrdered",
    title: "Riwayat transaksi",
    description:
      "Tinjau jenis, jumlah, waktu, keterangan, dan status transaksi secara berurutan.",
  },
  {
    icon: "FileDown",
    title: "Laporan dan ekspor",
    description:
      "Tinjau ringkasan dan hasilkan dokumen sesuai kebutuhan operasional serta kewenangan.",
  },
  {
    icon: "History",
    title: "Jejak audit",
    description:
      "Telusuri tindakan penting yang memengaruhi data keuangan atau kepemilikan.",
  },
  {
    icon: "ShieldCheck",
    title: "Akses berbasis peran",
    description:
      "Admin dan Operator menerima tindakan sesuai kewenangan yang ditegakkan di server.",
  },
  {
    icon: "DatabaseBackup",
    title: "Backup dan restore",
    description:
      "Admin membuat backup dan memulihkan backup kompatibel melalui validasi dan konfirmasi.",
  },
  {
    icon: "Settings",
    title: "Pengaturan",
    description:
      "Atur tema, jumlah item per halaman, keamanan akun, dan informasi aplikasi.",
  },
  {
    icon: "Smartphone",
    title: "Antarmuka responsif",
    description:
      "Gunakan alur utama melalui browser di ponsel maupun komputer.",
  },
] as const;

export const trustPrinciples = [
  {
    icon: "History",
    title: "Jejak audit",
    description:
      "Tindakan penting menyimpan konteks perubahan dan pelaku untuk mendukung pemeriksaan.",
  },
  {
    icon: "DatabaseZap",
    title: "Integritas data keuangan",
    description:
      "Transaksi dan saldo disimpan dalam satu batas konsistensi menggunakan Rupiah utuh.",
  },
  {
    icon: "ShieldCheck",
    title: "Akses berbasis peran",
    description:
      "Kewenangan Admin dan Operator diperiksa di server, bukan hanya disembunyikan dari tampilan.",
  },
  {
    icon: "DatabaseBackup",
    title: "Backup dan restore",
    description:
      "Restore memerlukan backup kompatibel, validasi, konfirmasi, dan proses pemeliharaan.",
  },
  {
    icon: "Eye",
    title: "Transparansi finansial",
    description:
      "Saldo, transaksi, laporan, dan audit memberi konteks yang dapat diperiksa sesuai kewenangan.",
  },
] as const;

export const frequentlyAskedQuestions = [
  {
    question: "Apa itu Amanah Cash?",
    answer:
      "Amanah Cash adalah aplikasi pengelolaan keuangan siswa untuk membantu sekolah, pesantren, yayasan, panti asuhan, dan lembaga sejenis mencatat transaksi, memantau saldo, meninjau laporan, dan menelusuri riwayat.",
  },
  {
    question: "Siapa yang dapat menggunakan Amanah Cash?",
    answer:
      "Amanah Cash digunakan oleh pengguna yang telah disediakan pengelola sistem. Admin mengelola cakupan administratif dan pemulihan data, sedangkan Operator menjalankan pekerjaan harian sesuai siswa dan kewenangannya.",
  },
  {
    question: "Transaksi apa yang dapat dicatat?",
    answer:
      "Pengguna berwenang dapat mencatat Setoran, Penarikan, dan Koreksi beralasan. Jumlah menggunakan Rupiah utuh dan hasil tersimpan dapat ditinjau pada saldo serta riwayat.",
  },
  {
    question: "Bagaimana saldo siswa dihitung?",
    answer:
      "Saldo berubah melalui transaksi yang berhasil disimpan. Saldo tersimpan dan riwayat dipertahankan dalam batas konsistensi yang dapat direkonsiliasi; saldo tidak diedit sebagai angka bebas.",
  },
  {
    question: "Apakah tersedia laporan?",
    answer:
      "Ya. Pengguna dapat meninjau laporan sesuai perannya dan menghasilkan ekspor CSV, Excel, atau PDF yang didukung. Isi tetap mengikuti kewenangan akses.",
  },
  {
    question: "Apakah setiap pengguna memiliki akses yang sama?",
    answer:
      "Tidak. Admin dan Operator memiliki kewenangan berbeda. Pemeriksaan akses dilakukan di server sehingga menyembunyikan menu bukan satu-satunya batas keamanan.",
  },
  {
    question: "Apakah perubahan transaksi dapat ditelusuri?",
    answer:
      "Tindakan penting pada transaksi menyimpan jejak audit yang mendukung pemeriksaan perubahan, waktu, dan pelaku sesuai cakupan yang diterapkan.",
  },
  {
    question: "Bagaimana backup dan restore bekerja?",
    answer:
      "Admin dapat mengunduh backup keadaan operasional. Restore hanya menerima backup kompatibel yang tervalidasi, memerlukan konfirmasi, dan berjalan dalam mode pemeliharaan.",
  },
  {
    question: "Apakah Amanah Cash dapat digunakan di ponsel?",
    answer:
      "Ya. Antarmuka responsif digunakan melalui browser di ponsel maupun komputer. Koneksi tetap diperlukan untuk memuat data dan menyimpan perubahan keuangan.",
  },
  {
    question: "Apakah Amanah Cash terhubung ke bank?",
    answer:
      "Tidak. MVP tidak memiliki integrasi bank atau pemrosesan pembayaran. Amanah Cash mencatat aktivitas keuangan siswa dan tidak memindahkan atau menyimpan dana sebagai layanan keuangan.",
  },
] as const;
