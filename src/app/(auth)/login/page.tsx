import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginButton } from "@/components/auth/login-button";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  let session;
  try {
    session = await auth();
  } catch {
    redirect("/access-denied?error=Configuration");
  }
  if (session) redirect("/app");

  return (
    <main className="authPage">
      <section className="authCard" aria-labelledby="login-title">
        <Link href="/" className="authBrand">Amanah Cash</Link>
        <h1 id="login-title">Masuk</h1>
        <p>Gunakan akun Google yang telah didaftarkan oleh Administrator Platform.</p>
        <LoginButton />
      </section>
    </main>
  );
}
