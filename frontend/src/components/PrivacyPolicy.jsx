import React from "react";

export default function PrivacyPolicy({ navigate }) {
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
          <p className="legal-eyebrow">Legal · Privacy Policy</p>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">Effective date: June 16, 2025 · Last updated: June 16, 2025</p>

          <p className="legal-lead">
            ClarityXO is a non-custodial, on-chain game. We are committed to being transparent about what
            data we collect, what we do not collect, and how the inherently public nature of blockchains
            affects your privacy.
          </p>

          <section className="legal-section">
            <h2 className="legal-h2">1. What We Collect</h2>
            <p>
              The ClarityXO frontend is a static web application. We do not operate an account system and
              we do not collect personally identifiable information such as names, email addresses, or
              phone numbers.
            </p>
            <p>The only data we may process:</p>
            <ul className="legal-list">
              <li>
                <strong>Stacks wallet address</strong> — stored locally in your browser's{" "}
                <code>localStorage</code> when you connect your wallet. This data never leaves your device
                through our Service.
              </li>
              <li>
                <strong>Leaderboard scores</strong> — win/loss/draw records submitted to our backend API
                to maintain the leaderboard. These are associated with your public Stacks address only.
              </li>
              <li>
                <strong>Standard server logs</strong> — if you access the hosted frontend, web server logs
                may capture your IP address, browser user-agent, and request timestamps. Logs are retained
                for up to 30 days for security and debugging purposes.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">2. Blockchain Data</h2>
            <p>
              Every move you make in ClarityXO is recorded on the Stacks blockchain as a transaction.
              Blockchain transactions are public, permanent, and cannot be deleted. Your wallet address
              and all associated game moves are permanently visible to anyone. This is an inherent property
              of blockchains and is outside our control.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">3. What We Do Not Collect</h2>
            <ul className="legal-list">
              <li>We do not use tracking cookies or fingerprinting.</li>
              <li>We do not integrate advertising networks or sell data to third parties.</li>
              <li>We do not collect private keys, seed phrases, or any wallet credentials.</li>
              <li>We do not build behavioral profiles of users.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">4. Third-Party Services</h2>
            <p>
              Interacting with ClarityXO involves third-party services that have their own privacy policies:
            </p>
            <ul className="legal-list">
              <li>
                <strong>Wallet providers (Leather, Xverse)</strong> — wallet connection is handled entirely
                by your chosen wallet extension. We never receive your private key or seed phrase.
              </li>
              <li>
                <strong>Stacks blockchain / Hiro API</strong> — on-chain reads and the Hiro Explorer
                are subject to{" "}
                <a
                  className="legal-link"
                  href="https://www.hiro.so/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hiro's privacy policy
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">5. Data Retention</h2>
            <p>
              Leaderboard records are retained for the duration of the active season and archived afterward.
              You may request removal of off-chain leaderboard data associated with your address by opening
              an issue on our GitHub repository. Blockchain data cannot be removed.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">6. Children's Privacy</h2>
            <p>
              The Service is not directed at anyone under 18 years of age. We do not knowingly collect
              data from minors. If you believe a minor has used the Service, please contact us.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will update the "Last updated" date
              at the top of this page when changes are made. Continued use of the Service after changes
              are posted constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-h2">8. Contact</h2>
            <p>
              For privacy-related inquiries, please open an issue at{" "}
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
