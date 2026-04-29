export default function SectionDivider({ label, num }) {
  return (
    <div className="lp-section-divider">
      <div className="lp-divider-label">{label}</div>
      <div className="lp-divider-line"></div>
      <div className="lp-divider-num">{num}</div>
    </div>
  );
}
