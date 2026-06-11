import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell">
      <section className="panel errorPanel">
        <p className="eyebrow">Node not found</p>
        <h1>This provider is not in the registry.</h1>
        <Link className="primaryAction" href="/">Back to Network Map</Link>
      </section>
    </main>
  );
}
