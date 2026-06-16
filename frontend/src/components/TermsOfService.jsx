import React from "react";

export default function TermsOfService({ navigate }) {
  return (
    <div className="legal-page">
      <header>
        <div className="header-left">
          <div className="logo" onClick={() => navigate("landing")}>Clarity<span>XO</span></div>
        </div>
        <div className="header-right">
          <button className="ghost-btn" onClick={() => navigate("landing")}>← Back</button>
        </div>
      </header>

      <main className="legal-main">
        <div className="legal-content">
          <p className="legal-eyebrow">Legal · Terms of Service</p>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-meta">Effective date: June 16, 2025 · Last updated: June 16, 2025</p>

          <p className="legal-lead">
            ClarityXO is an open-source, on-chain tic-tac-toe game deployed on the Stacks blockchain.
            By accessing or using the ClarityXO interface ("Service"), you agree to be bound by these Terms.
            If you do not agree, do not use the Service.
          </p>

          <section className="legal-section">
            <h2 className="legal-h2">1. Eligibility</h2>
            <p>
              You must be at least 18 years old and legally permitted to interact with blockchain protocols in your jurisdiction
              to use this Service. By using the Service you represent and warrant that these conditions are met.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">2. Nature of the Service</h2>
            <p>
              ClarityXO is a non-custodial, decentralized application. All game logic is encoded in a publicly auditable
              Clarity smart contract on Stacks mainnet. The Service provides a browser interface to interact with that
              contract. We do not hold, control, or custody any user assets at any time.
            </p>
            <p>
              Each on-chain move requires a Stacks transaction signed from your connected wallet. You are solely responsible
              for the transaction fees (denominated in STX) associated with your gameplay.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">3. Trophy NFTs</h2>
            <p>
              Top-ranked players at the end of each monthly season may receive a ClarityXO Trophy NFT minted directly
              to their Stacks wallet address. NFTs are standard SIP-009 assets and are freely transferable on any
              compatible marketplace. We make no representations about their monetary value.
              Nothing in these Terms constitutes investment advice.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">4. No Warranties</h2>
            <p>
              The Service is provided <strong>"as is"</strong> and <strong>"as available"</strong> without warranty of any kind.
              We do not warrant that the Service will be uninterrupted, error-free, or free of security vulnerabilities.
              Smart contracts may contain bugs; blockchain networks may experience congestion, forks, or downtime.
              Your use of the Service is entirely at your own risk.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, the ClarityXO team shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of funds, NFTs, or data, arising
              out of or related to your use of the Service, even if advised of the possibility of such damages.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">6. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="legal-list">
              <li>Attempt to exploit, manipulate, or attack the smart contract or surrounding infrastructure.</li>
              <li>Use the Service for money laundering, fraud, or any unlawful purpose.</li>
              <li>Circumvent or interfere with any security mechanism of the Service.</li>
              <li>Impersonate any person or misrepresent your identity or affiliation.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">7. Intellectual Property</h2>
            <p>
              The ClarityXO source code is released under an open-source license and is available on GitHub.
              The ClarityXO name, logo, and visual design remain the property of the project maintainers.
              You may not use them without prior written permission except as required to describe the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">8. Third-Party Services</h2>
            <p>
              The Service integrates with third-party wallet providers (Leather, Xverse) and the Stacks blockchain network.
              These are independent services governed by their own terms. We have no control over and accept no responsibility
              for third-party services.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">9. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. Continued use of the Service after changes are posted constitutes
              acceptance of the revised Terms. We will update the "Last updated" date at the top of this page.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">10. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with applicable laws, without regard to conflict
              of law provisions. Any disputes shall be resolved through good-faith negotiation before any formal
              legal proceedings.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">11. Contact</h2>
            <p>
              Questions about these Terms may be directed to the project GitHub repository at{" "}
              <a
                className="legal-link"
                href="https://github.com/Dominion116/ClarityXO"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/Dominion116/ClarityXO
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
