import React, { useEffect } from "react";
import LandingHeader      from "./landing/LandingHeader";
import Ticker             from "./landing/Ticker";
import Hero               from "./landing/Hero";
import HowItWorks         from "./landing/HowItWorks";
import Features           from "./landing/Features";
import NFTSection         from "./landing/NFTSection";
import LeaderboardPreview from "./landing/LeaderboardPreview";
import ContractSection    from "./landing/ContractSection";
import FinalCTA           from "./landing/FinalCTA";
import LandingFooter      from "./landing/LandingFooter";
import FAQ                from "./landing/FAQ";

export default function Landing({ onLaunch }) {
  // Single reveal-on-scroll observer for everything tagged .cxo-reveal.
  // Replaces the per-element inline-style juggling the old version did and
  // degrades gracefully (no IntersectionObserver → content shown immediately).
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".cxo-reveal"));
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lp-root">
      <div className="lp-scanlines" aria-hidden="true"></div>
      <LandingHeader onLaunch={onLaunch} />
      <Ticker />
      <main id="main-content">
        <Hero onLaunch={onLaunch} />
        <HowItWorks />
        <Features />
        <NFTSection />
        <LeaderboardPreview onLaunch={onLaunch} />
        <ContractSection />
        <FinalCTA onLaunch={onLaunch} />
        <FAQ />
      </main>
      <LandingFooter />
    </div>
  );
}
