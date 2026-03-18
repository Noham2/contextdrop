"use client";

import { useState, useEffect } from "react";

interface OnboardingModalProps {
  onOpenNewBrief?: () => void;
}

export function OnboardingModal({ onOpenNewBrief }: OnboardingModalProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("onboarding_seen");
    if (!seen) setVisible(true);
  }, []);

  function finish() {
    localStorage.setItem("onboarding_seen", "true");
    setVisible(false);
  }

  function next() {
    if (step === 1 && onOpenNewBrief) {
      onOpenNewBrief();
      finish();
      return;
    }
    if (step < 2) {
      setStep(step + 1);
    } else {
      finish();
    }
  }

  if (!visible) return null;

  const steps = [
    {
      title: "Bienvenue sur ContextDrop 👋",
      body: "Envoie un lien à ton client juste après ta visio. Il valide ce que vous avez dit. Tu reçois un brief signé.",
      cta: "Suivant",
    },
    {
      title: "Créez votre premier brief",
      body: "Donnez un nom à votre projet et obtenez un lien unique à envoyer à votre client en un clic.",
      cta: "Créer mon premier brief",
    },
    {
      title: "Partagez le lien à votre client",
      body: "Copiez le lien et envoyez-le juste après votre appel. Votre client n'a pas besoin de créer de compte.",
      cta: "Commencer",
    },
  ];

  const current = steps[step];

  return (
    <div className="new-project-overlay">
      <div className="new-project-modal onboarding-modal" onClick={(e) => e.stopPropagation()}>
        <div className="onboarding-steps">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`onboarding-step-dot${i === step ? " active" : i < step ? " done" : ""}`}
            />
          ))}
        </div>

        <h2>{current.title}</h2>
        <p style={{ color: "var(--theme-muted-text)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
          {current.body}
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
          {step > 0 ? (
            <button className="dark-btn-ghost" onClick={() => setStep(step - 1)}>
              Précédent
            </button>
          ) : (
            <button className="dark-btn-ghost" onClick={finish}>
              Passer
            </button>
          )}
          <button className="login-btn" style={{ width: "auto", padding: "10px 24px" }} onClick={next}>
            {current.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
