"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="shell">
      <section className="panel errorPanel">
        <p className="eyebrow">Registry unavailable</p>
        <h1>Could not load the Certifyd Network.</h1>
        <p>{error.message}</p>
        <button className="copyButton" type="button" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
