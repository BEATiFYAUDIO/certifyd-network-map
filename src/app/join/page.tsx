import Link from "next/link";
import { EligibilityChecker } from "@/components/EligibilityChecker";

const flowSteps = ["Run Node", "Meet Requirements", "Submit Node", "Eligibility Check", "Become Discoverable"];

const checklist = [
  "Identity service",
  "Content service",
  "Commerce service",
  "Settlement service",
  "Proof service",
  "Reachable public route",
  "Provider public key",
  "Canonical provider URL"
];

export const metadata = {
  title: "Apply to Join the Certifyd Network",
  description: "Check whether a sovereign Certifyd node is eligible and provisionable on the public Network Map."
};

export default function JoinPage() {
  return (
    <main>
      <section className="hero joinHero shell">
        <div className="heroCopy">
          <p className="eyebrow">Operator Admission</p>
          <h1>Apply to Join the Certifyd Network</h1>
          <p className="heroText">
            Run a sovereign node, prove your capabilities, and become discoverable to creators looking for trusted identity,
            content, commerce, settlement, and proof services.
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
          <p className="eyebrow">Open Participation</p>
          <h2>Anyone can run a sovereign Certifyd node.</h2>
          <p>
            Public map placement is not automatic. Nodes must publish valid public identity, reachable metadata, and provider
            capability signals before creators can rely on them for provisioning.
          </p>
        </div>
        <div className="panel joinStatement">
          <p className="eyebrow">Conditional Discoverability</p>
          <h2>Eligibility protects creator trust.</h2>
          <p>
            The Network Map filters incomplete, unreachable, or non-provisionable nodes. This is not gatekeeping; it is public
            discoverability based on capability.
          </p>
        </div>
      </section>

      <section className="shell checklistBand" aria-label="Capability checklist">
        <div>
          <p className="eyebrow">Capability Checklist</p>
          <h2>Provisionable providers expose creator-safe services and connection fields.</h2>
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
