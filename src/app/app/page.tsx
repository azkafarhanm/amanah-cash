import { requireAuthentication } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";

export const dynamic = "force-dynamic";

export default async function AuthenticatedApplicationEntry() {
  const user = await requireAuthentication();

  return (
    <main className="authPage">
      <section className="authCard" aria-labelledby="authenticated-title">
        <h1 id="authenticated-title">Anda telah masuk</h1>
        <p>{user.name ?? user.email}</p>
        <p>Fitur aplikasi dan otorisasi akan tersedia pada sprint berikutnya.</p>
        <LogoutButton />
      </section>
    </main>
  );
}
