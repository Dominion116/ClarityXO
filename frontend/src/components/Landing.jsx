import React, { useEffect } from "react";
import LandingHeader    from "./landing/LandingHeader";
import Ticker           from "./landing/Ticker";
import Hero             from "./landing/Hero";
import SectionDivider   from "./landing/SectionDivider";
import HowItWorks       from "./landing/HowItWorks";
import Features         from "./landing/Features";
import NFTSection       from "./landing/NFTSection";
import LeaderboardPreview from "./landing/LeaderboardPreview";
import ContractSection  from "./landing/ContractSection";
import FinalCTA         from "./landing/FinalCTA";
import LandingFooter    from "./landing/LandingFooter";

export default function Landing({ onLaunch }) {
  useEffect(() => {
    const targets = document.querySelectorAll(".lp-step, .lp-feature, .lp-nft-tier");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(12px)";
      el.style.transition = "opacity .5s ease, transform .5s ease";
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lp-root">
      <div className="lp-scanlines" aria-hidden="true"></div>
      <LandingHeader onLaunch={onLaunch} />
      <Ticker />
      <Hero onLaunch={onLaunch} />
      <SectionDivider label="Protocol" num="01" />
      <HowItWorks />
      <SectionDivider label="Features" num="02" />
      <Features />
      <SectionDivider label="Rewards" num="03" />
      <NFTSection />
      <SectionDivider label="Rankings" num="04" />
      <LeaderboardPreview />
      <SectionDivider label="Protocol" num="05" />
      <ContractSection />
      <FinalCTA onLaunch={onLaunch} />
      <LandingFooter />
    </div>
  );
}
