import React from 'react';
import './Contact.css';

export function Contact() {
  return (
    <section className="contact">
      <div className="contact-content">
        <div className="divider"></div>
        
        <h2 className="contact-title">The Team</h2>
        
        <p className="contact-description">
          Meet the founders behind the Pavlos Network vision and development.
        </p>
        
        <div className="contact-profiles">
          <div className="contact-profile">
            <h3 className="profile-name">Max de Castro</h3>
            <p className="profile-bio">
              Product designer translating advanced tech into intuitive, human-centered experiences.
            </p>
            <a href="https://maxdecastro.com" className="profile-link" target="_blank" rel="noopener noreferrer">
              maxdecastro.com <span className="arrow">↗</span>
            </a>
          </div>
          
          <div className="contact-profile">
            <h3 className="profile-name">Matthew Porteous</h3>
            <p className="profile-bio">
              Developer crafting equitable, AI-driven solutions for real-world impact.
            </p>
            <a href="https://matthewporteous.com" className="profile-link" target="_blank" rel="noopener noreferrer">
              matthewporteous.com <span className="arrow">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 