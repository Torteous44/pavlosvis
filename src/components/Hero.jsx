import './Hero.css';
import { HeroVisual } from './HeroVisual';

export function Hero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">
          A marketplace for all tasks that require intelligence.
        </h1>
        <a href="mailto:hello@pavlosnetwork.com" className="hero__cta">
          Get in touch
          <span className="hero__cta-icon">
            <img src="/assets/upRight.svg" alt="" aria-hidden="true" />
          </span>
        </a>
      </div>
      <div className="hero__visual" aria-hidden="true">
        <HeroVisual />
      </div>
    </section>
  );
} 