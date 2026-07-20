"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id-ID">
      <body>
        <main className="systemStatePage">
          <section className="authCard" role="alert">
            <h1>Amanah Cash tidak dapat dimuat</h1>
            <p>Terjadi kendala tak terduga. Silakan muat ulang aplikasi.</p>
            <button className="systemStateButton" type="button" onClick={reset}>Muat ulang</button>
          </section>
        </main>
      </body>
    </html>
  );
}
