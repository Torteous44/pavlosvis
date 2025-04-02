import './Content.css';

export function Content() {
  return (
    <section className="content">
      <div className="content__section">
        <h2 className="content__title">The Pavlos Network</h2>
        <p className="content__description">
          We envision an open, decentralized platform where AI and human creativity merge
          seamlessly to deliver equitable and accessible services. Guided by community
          wisdom, Pavlos Network removes barriers, connecting technology deeply with daily
          life, leaving no community behind.
        </p>
      </div>

      <div className="content__section">
        <h2 className="content__title">Inclusive Collaboration</h2>
        <p className="content__description">
          The future belongs to flexible economies. On our network, requesters and creators
          unite effortlessly, tackling challenges of every scale together.
        </p>
        <p className="content__description">
          Our system transparently matches requests with skilled collaborators, enabling
          effective, unified solutions.
        </p>
      </div>

      <div className="content__section">
        <h2 className="content__title">Proof of Excellence</h2>
        <p className="content__description">
          Excellence isn't just an outcome—it's our core value. Recognizing true talent
          and meaningful effort empowers individuals to push creative limits, elevating
          the entire community's potential.
        </p>
      </div>

      <div className="content__section">
        <h2 className="content__title">A Community Driven Network</h2>
        <p className="content__description">
          Pavlos Network cultivates an environment where impactful contributions receive
          transparent, meaningful rewards. By aligning personal aspirations with collective
          advancement, we ensure real-world innovation remains our central mission.
        </p>
      </div>
    </section>
  );
}