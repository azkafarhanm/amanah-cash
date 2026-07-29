export const problems = [
  {
    icon: "Files",
    title: "Catatan tersebar",
    description:
      "Transaksi dapat tersimpan di buku, pesan, lembar kerja, atau ingatan orang yang mencatatnya.",
  },
  {
    icon: "Calculator",
    title: "Saldo perlu dihitung ulang",
    description:
      "Perhitungan manual harus diulang ketika ada transaksi baru atau catatan perlu diperiksa.",
  },
  {
    icon: "Search",
    title: "Riwayat sulit ditemukan",
    description:
      "Mencari transaksi tertentu membutuhkan waktu ketika urutan dan tempat pencatatannya tidak konsisten.",
  },
  {
    icon: "ArrowLeftRight",
    title: "Arah transaksi kurang jelas",
    description:
      "Pemasukan dan pengeluaran dapat tertukar ketika istilah dan keterangannya tidak seragam.",
  },
  {
    icon: "MessageCircleQuestion",
    title: "Penjelasan membutuhkan waktu",
    description:
      "Pertanyaan tentang saldo sulit dijawab dengan cepat ketika bukti transaksi tidak berada dalam satu riwayat.",
  },
] as const;

export const solutions = [
  {
    icon: "UserRoundCheck",
    title: "Catatan terpusat per siswa",
    description:
      "Pencatatan dan riwayat transaksi tersedia dalam konteks siswa yang sama.",
  },
  {
    icon: "History",
    title: "Saldo dari riwayat lengkap",
    description:
      "Saldo dihitung dari seluruh transaksi yang tersimpan, bukan diubah secara manual.",
  },
  {
    icon: "ArrowLeftRight",
    title: "Arah transaksi yang jelas",
    description:
      "Setiap transaksi menunjukkan apakah dana dititipkan kepada siswa atau dikembalikan oleh siswa.",
  },
  {
    icon: "ListOrdered",
    title: "Riwayat yang mudah ditelusuri",
    description:
      "Transaksi ditampilkan dari yang terbaru dengan jenis, jumlah, dan waktu yang jelas.",
  },
] as const;

export const workflowSteps = [
  {
    title: "Cari siswa",
    description:
      "Gunakan pencarian nama untuk membuka detail siswa yang tepat.",
  },
  {
    title: "Catat transaksi",
    description:
      "Pilih Setor atau Tarik, lalu masukkan jumlah Rupiah utuh.",
  },
  {
    title: "Periksa saldo dan riwayat",
    description:
      "Setelah transaksi berhasil tersimpan, saldo terbaru dan transaksi baru langsung terlihat.",
  },
] as const;

export const features = [
  {
    icon: "Search",
    title: "Pencarian siswa",
    description:
      "Cari nama secara langsung dan buka catatan siswa yang dibutuhkan.",
  },
  {
    icon: "ArrowLeftRight",
    title: "Pencatatan transaksi",
    description:
      "Catat Setoran atau Penarikan dalam Rupiah utuh melalui alur yang terfokus.",
  },
  {
    icon: "Scale",
    title: "Saldo yang dapat dijelaskan",
    description:
      "Lihat saldo yang dihitung dari seluruh riwayat transaksi siswa.",
  },
  {
    icon: "ListOrdered",
    title: "Riwayat transaksi",
    description:
      "Tinjau jenis, jumlah, dan waktu transaksi dari yang terbaru.",
  },
  {
    icon: "Smartphone",
    title: "Akses melalui ponsel",
    description:
      "Gunakan melalui browser di ponsel atau komputer, lalu pasang pada perangkat yang mendukung untuk akses seperti aplikasi.",
  },
  {
    icon: "CircleCheckBig",
    title: "Hasil operasi yang jelas",
    description:
      "Keberhasilan, kegagalan, dan kondisi koneksi ditampilkan tanpa menyamarkan hasil transaksi.",
  },
] as const;

export const trustPrinciples = [
  {
    icon: "History",
    title: "Saldo berubah bersama transaksi",
    description:
      "Transaksi, saldo siswa, dan catatan audit disimpan sebagai satu perubahan yang utuh.",
  },
  {
    icon: "ListChecks",
    title: "Perubahan tetap dapat ditelusuri",
    description:
      "Edit, penghapusan lunak, dan pemulihan transaksi menyimpan pelaku, alasan, serta keadaan sebelum dan sesudah.",
  },
  {
    icon: "ArrowLeftRight",
    title: "Arah transaksi dinyatakan dengan jelas",
    description:
      "Aplikasi menjelaskan apakah dana dititipkan kepada siswa atau dikembalikan oleh siswa.",
  },
  {
    icon: "DatabaseZap",
    title: "Keberhasilan menunggu penyimpanan",
    description:
      "Transaksi hanya dinyatakan berhasil setelah penyimpanan dikonfirmasi.",
  },
  {
    icon: "CircleAlert",
    title: "Kegagalan tidak disamarkan",
    description:
      "Kesalahan dan hasil yang belum pasti ditampilkan secara eksplisit agar tindakan tidak diulang sebelum hasilnya diketahui.",
  },
] as const;

export const frequentlyAskedQuestions = [
  {
    question: "Apa itu Amanah Cash?",
    answer:
      "Amanah Cash adalah aplikasi pencatatan transaksi keuangan siswa. Aplikasi ini membantu operator sekolah mencatat Setoran, Penarikan, dan Koreksi beralasan, melihat saldo, serta menelusuri perubahan transaksi setiap siswa.",
  },
  {
    question: "Siapa yang dapat menggunakan Amanah Cash?",
    answer:
      "Amanah Cash dirancang untuk orang yang menangani pencatatan transaksi keuangan siswa, termasuk guru, wali kelas, bendahara sekolah, dan pengelola asrama.",
  },
  {
    question: "Transaksi apa yang dapat dicatat?",
    answer:
      "Amanah Cash mencatat Setoran, Penarikan, dan Koreksi beralasan yang secara jelas menambah atau mengurangi saldo. Setiap jumlah menggunakan Rupiah utuh.",
  },
  {
    question: "Bagaimana saldo siswa dihitung?",
    answer:
      "Saldo disimpan pada data siswa dan hanya berubah bersama transaksi dalam satu operasi yang utuh. Nilainya dapat diperiksa kembali dari seluruh transaksi aktif siswa.",
  },
  {
    question: "Apakah Amanah Cash dapat digunakan melalui ponsel?",
    answer:
      "Ya. Amanah Cash dirancang untuk digunakan melalui browser di ponsel maupun komputer. Pada perangkat dan browser yang mendukung, Amanah Cash juga dapat dipasang untuk akses seperti aplikasi.",
  },
  {
    question: "Apakah transaksi dapat dicatat saat offline?",
    answer:
      "Belum. Koneksi ke layanan aplikasi diperlukan untuk memuat data dan menyimpan transaksi. Amanah Cash tidak mengantrekan transaksi untuk dikirim otomatis ketika koneksi kembali.",
  },
  {
    question: "Apakah transaksi dapat diedit atau dihapus?",
    answer:
      "Dapat. Edit, penghapusan lunak, dan pemulihan transaksi selalu memperbarui saldo secara utuh dan mencatat pelaku, alasan, serta perubahan sebelum dan sesudah. Transaksi tidak dihapus permanen.",
  },
] as const;
