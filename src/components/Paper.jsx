import React from 'react';
import './Paper.css';

export function Paper() {
  return (
    <section className="paper">
      <div className="paper-content">
        <div className="divider"></div>
        
        <div className="paper-header">
          <h2 className="paper-title">The Pavlos Paper</h2>
          <a href="/assets/Pavlos Whitepaper.pdf" download className="paper-download">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 11L4 7H7V1H9V7H12L8 11Z" fill="currentColor" />
              <path d="M14 13V15H2V13H0V15C0 16.1 0.9 16 2 16H14C15.1 16 16 16.1 16 15V13H14Z" fill="currentColor" />
            </svg>
          </a>
        </div>
        
        <p className="paper-description">
          Written in January 2023, we wrote our vision for the Pavlos Network and how to build it.
        </p>
        
        <div className="paper-links">
          <div className="paper-link">
            <span className="link-title">AI powered user research interviews</span>
            <a href="https://use-reach.com" className="link-url" target="_blank" rel="noopener noreferrer">
              use-reach.com <span className="arrow">↗</span>
            </a>
          </div>
          
          <div className="paper-link">
            <span className="link-title">AI personalized shopping</span>
            <a href="https://thumbsy.xyz" className="link-url" target="_blank" rel="noopener noreferrer">
              thumbsy.xyz <span className="arrow">↗</span>
            </a>
          </div>
          <div className="paper-link">
            <span className="link-title">AI powered interview prep</span>
            <a href="https://caseprepered.com" className="link-url" target="_blank" rel="noopener noreferrer">
              caseprepered.com <span className="arrow">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 