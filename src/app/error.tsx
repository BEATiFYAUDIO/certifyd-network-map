"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="shell">
      <section className="panel errorPanel">
        <p className="eyebrow">Initial registry seed unavailable</p>
        <h1>Could not load eligible Certifyd nodes.</h1>
        <p>{error.message}</p>
        <button className="copyButton" type="button" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
