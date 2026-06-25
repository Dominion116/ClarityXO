import React, { useState } from 'react';
import { generateShareText, generateTwitterUrl, generateWarpcastUrl, copyToClipboard } from '../utils/share';

export default function ShareButton({ outcome, rank, pts, bnsName, gameMode }) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const text = generateShareText({ outcome, rank, pts, bnsName, gameMode });

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setMenuOpen(false);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTwitter = () => {
    window.open(generateTwitterUrl(text), '_blank', 'noopener');
    setMenuOpen(false);
  };

  const handleWarpcast = () => {
    window.open(generateWarpcastUrl(text), '_blank', 'noopener');
    setMenuOpen(false);
  };

  if (!outcome) return null;

  return (
    <div className="share-btn-wrap">
      <button className="ghost-btn share-btn" onClick={() => setMenuOpen((o) => !o)}>
        {copied ? 'Copied ✓' : '↗ Share'}
      </button>
      {menuOpen && (
        <div className="share-menu">
          <button className="share-menu-item" onClick={handleCopy}>Copy text</button>
          <button className="share-menu-item" onClick={handleTwitter}>Post on X / Twitter</button>
          <button className="share-menu-item" onClick={handleWarpcast}>Cast on Warpcast</button>
        </div>
      )}
    </div>
  );
}
