import Link from "next/link";

const temporaryErrors = new Set(["Configuration", "OAuthCallback", "OAuthSignin", "OAuthCreateAccount"]);

export default async function AccessDeniedPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const temporary = Boolean(error && temporaryErrors.has(error));
  return (
    <main className="authPage">
      <section className="authCard" aria-labelledby="denied-title">
        <Link href="/" className="authBrand">Amanah Cash</Link>
        <h1 id="denied-title">Tidak dapat masuk</h1>
        <p>{temporary ? "Layanan Google sedang tidak tersedia atau proses masuk tidak valid. Silakan coba lagi." : "Akun Anda belum terdaftar. Silakan hubungi Administrator Platform."}</p>
        <Link href="/login" className="authPrimaryLink">Kembali ke halaman masuk</Link>
      </section>
    </main>
  );
}
