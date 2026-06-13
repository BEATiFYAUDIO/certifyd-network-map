import Link from "next/link";
import { EligibilityChecker } from "@/components/EligibilityChecker";

const flowSteps = ["Run Node", "Provide Commerce", "Publish Availability", "Check Readiness", "Support Creators"];

const checklist = [
  "Commerce service",
  "Settlement service",
  "Network availability",
  "Provider public key",
  "Canonical provider URL",
  "Reachable public route"
];

export const metadata = {
  title: "Become a Node Operator",
  description: "Support creators by running commerce infrastructure for the Sovereign Network."
};

export default function JoinPage() {
  return (
    <main>
      <section className="hero joinHero shell">
        <div className="heroCopy">
          <p className="eyebrow">Join The Network</p>
          <h1>Become a Node Operator</h1>
          <p className="heroText">
            We&apos;re early. The network is small. The opportunity is significant. If you want to help creators build
            independent businesses, we&apos;d love to talk.
          </p>
          <div className="heroActions">
            <a className="primaryAction" href="#eligibility-checker">Check Node Eligibility</a>
            <Link className="cardLink" href="/">View Network Map</Link>
          </div>
        </div>
        <div className="joinFlowCard" aria-label="Network admission flow">
          {flowSteps.map((step, index) => (
            <div className="flowStep" key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="shell joinIntro">
        <div className="panel joinStatement">
          <p className="eyebrow">What Is A Node Operator?</p>
          <h2>A node operator provides commerce services to creators.</h2>
          <p>
            When a creator sells something through the network, node operators help make that transaction possible. Think
            of it as supporting creator-owned commerce rather than platform-owned commerce.
          </p>
        </div>
        <div className="panel joinStatement">
          <p className="eyebrow">The Mission</p>
          <h2>Creators deserve better infrastructure.</h2>
          <p>
            Most creator platforms extract value from creators. We&apos;re building infrastructure that helps creators earn,
            sell, and grow independently by supporting them.
          </p>
        </div>
      </section>

      <section className="shell checklistBand" aria-label="Capability checklist">
        <div>
          <p className="eyebrow">What Operators Provide Today</p>
          <h2>Commerce, settlement, and network availability.</h2>
          <p className="muted">
            The network starts with commerce because creators can&apos;t build sustainable businesses if they don&apos;t
            control how they get paid.
          </p>
        </div>
        <div className="capabilityGrid">
          {checklist.map((item) => (
            <span className="checkPending" key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="shell">
        <EligibilityChecker />
      </section>
    </main>
  );
}
