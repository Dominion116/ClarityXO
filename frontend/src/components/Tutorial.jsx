import React from 'react';

export default function Tutorial({ step, currentStep, totalSteps, onNext, onPrev, onSkip }) {
  if (!currentStep) return null;

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Tutorial">
      <div className="tutorial-card">
        <div className="tutorial-progress">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`tutorial-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
          ))}
        </div>

        <div className="tutorial-step-label">Step {step + 1} of {totalSteps}</div>
        <div className="tutorial-title">{currentStep.title}</div>
        <div className="tutorial-body">{currentStep.body}</div>

        <div className="tutorial-actions">
          <button className="ghost-btn tutorial-skip" onClick={onSkip}>
            Skip Tutorial
          </button>
          <div className="tutorial-nav">
            {step > 0 && (
              <button className="ghost-btn" onClick={onPrev}>← Back</button>
            )}
            <button className="btn btn-primary tutorial-next" onClick={onNext}>
              {step === totalSteps - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
