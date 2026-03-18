"use client";

import { useState, useEffect } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  function refuse() {
    localStorage.setItem("cookie_consent", "refused");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <p className="cookie-text">
        ContextDrop utilise des cookies techniques pour le bon fonctionnement du service (thème, session).
        Aucun cookie publicitaire n&apos;est utilisé.
      </p>
      <div className="cookie-actions">
        <button className="cookie-btn-refuse" onClick={refuse}>Refuser</button>
        <button className="cookie-btn-accept" onClick={accept}>Accepter</button>
      </div>
    </div>
  );
}
