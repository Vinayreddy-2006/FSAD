import React from 'react';
import { useNavigate } from 'react-router-dom';

const roleCards = [
  {
    eyebrow: 'Admin',
    title: 'Coordinate every drive from one mission control view.',
    desc: 'Create campaigns, review pledges, respond to donors, and keep response quality visible in real time.',
  },
  {
    eyebrow: 'Donor',
    title: 'Contribute essentials with confidence and transparency.',
    desc: 'Pledge support, follow approvals, and see how your items move toward the communities that need them.',
  },
  {
    eyebrow: 'Recipient',
    title: 'Request support quickly during urgent situations.',
    desc: 'Share what is needed, track updates, and receive clear visibility on approved deliveries.',
  },
  {
    eyebrow: 'Logistics',
    title: 'Keep deliveries organized from pickup to drop-off.',
    desc: 'Manage movement, monitor progress, and reduce delays across active response routes.',
  },
];

const highlights = [
  'Role-based dashboards for all stakeholders',
  'Live tracking across drives, donations, and deliveries',
  'Transparent approval flow for faster decisions',
  'Cleaner coordination during high-pressure emergencies',
];

const metrics = [
  { value: '4+', label: 'active response roles' },
  { value: '24/7', label: 'coordination readiness' },
  { value: '1', label: 'shared relief platform' },
];

const featureCards = [
  {
    code: '01',
    title: 'Rapid coordination',
    desc: 'ReliefConnect gives teams a single place to create drives, approve aid, and reduce communication gaps.',
  },
  {
    code: '02',
    title: 'Clear donor trust',
    desc: 'Transparent status updates help donors see what was approved, what is moving, and what was delivered.',
  },
  {
    code: '03',
    title: 'Smarter response flow',
    desc: 'Requests, pledges, and deliveries stay organized so evaluators can see the logic of the system immediately.',
  },
  {
    code: '04',
    title: 'Modern presentation',
    desc: 'A polished interface makes the project feel intentional, current, and stronger during reviews or demos.',
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-shell landing-hero-grid">
          <div className="landing-copy">
            <div className="landing-kicker">Disaster relief coordination, redesigned</div>
            <h1 className="landing-title">A calmer, clearer platform for delivering help when every minute matters.</h1>
            <p className="landing-lead">
              ReliefConnect brings donors, recipients, admins, and logistics teams into one coordinated workflow so aid can move faster and more transparently.
            </p>

            <div className="landing-actions">
              <button onClick={() => navigate('/register')} className="btn-primary">
                Start Coordinating
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary">
                View Login
              </button>
            </div>

            <div className="landing-bullets">
              {highlights.map((item) => (
                <div key={item} className="landing-bullet">
                  <span className="landing-bullet-dot" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-showcase">
            <div className="hero-panel hero-panel-main">
              <div className="hero-panel-label">Mission Snapshot</div>
              <div className="hero-panel-title">Emergency supply routing made visible.</div>
              <p className="hero-panel-text">
                From new requests to final delivery, the platform keeps the response chain simple enough to understand at a glance.
              </p>

              <div className="hero-metrics">
                {metrics.map((metric) => (
                  <div key={metric.label} className="hero-metric-card">
                    <div className="hero-metric-value">{metric.value}</div>
                    <div className="hero-metric-label">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-panel hero-panel-float">
              <div className="hero-panel-label">Evaluator View</div>
              <div className="hero-stack">
                <div className="hero-stack-row">
                  <span>Approvals</span>
                  <strong>Fast and traceable</strong>
                </div>
                <div className="hero-stack-row">
                  <span>Deliveries</span>
                  <strong>Structured by workflow</strong>
                </div>
                <div className="hero-stack-row">
                  <span>Design</span>
                  <strong>Modern and memorable</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-shell">
          <div className="landing-section-heading">
            <div className="landing-kicker">Designed around real roles</div>
            <h2>Every user gets a clear purpose inside the system.</h2>
            <p>
              The platform is organized so each stakeholder can immediately understand what to do, what matters next, and how their work connects to the rest of the relief process.
            </p>
          </div>

          <div className="landing-role-grid">
            {roleCards.map((card) => (
              <article key={card.eyebrow} className="landing-role-card">
                <div className="landing-role-eyebrow">{card.eyebrow}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-soft">
        <div className="landing-shell">
          <div className="landing-section-heading">
            <div className="landing-kicker">Why it stands out</div>
            <h2>A project presentation that feels stronger in evaluation.</h2>
            <p>
              This interface is meant to show both usability and thoughtfulness: strong hierarchy, better readability, and a cleaner visual identity across the app.
            </p>
          </div>

          <div className="landing-feature-grid">
            {featureCards.map((feature) => (
              <article key={feature.code} className="landing-feature-card">
                <span className="landing-feature-code">{feature.code}</span>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-shell landing-cta-card">
          <div>
            <div className="landing-kicker">Ready for demo day</div>
            <h2>Open the platform and let the experience speak for the project.</h2>
            <p>
              Sign in, create a drive, review donations, and show the evaluator a system that looks polished and feels easy to follow.
            </p>
          </div>
          <div className="landing-actions">
            <button onClick={() => navigate('/login')} className="btn-primary">
              Open Login
            </button>
            <button onClick={() => navigate('/register')} className="btn-secondary">
              Create Account
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;
