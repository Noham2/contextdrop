import Link from "next/link";
import { Logo } from "@/app/components/Logo";

export const metadata = {
  title: "Mentions légales — ContextDrop",
};

export default function MentionsLegales() {
  return (
    <div className="legal-page">
      <nav className="site-nav">
        <Logo />
      </nav>

      <div className="legal-inner">
        <div className="section-label">Informations légales</div>
        <h1>Mentions <em>légales</em></h1>

        <div className="legal-section">
          <h2>Éditeur du site</h2>
          <p>
            <strong>Raison sociale :</strong> [À compléter]<br />
            <strong>Adresse :</strong> [À compléter]<br />
            <strong>SIRET :</strong> [À compléter]<br />
            <strong>Email :</strong> contact@contextdrop.fr
          </p>
        </div>

        <div className="legal-section">
          <h2>Directeur de publication</h2>
          <p>
            <strong>Nom :</strong> [À compléter]<br />
            <strong>Qualité :</strong> Fondateur
          </p>
        </div>

        <div className="legal-section">
          <h2>Hébergeur</h2>
          <p>
            <strong>Société :</strong> Vercel Inc.<br />
            <strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
            <strong>Site web :</strong> vercel.com
          </p>
        </div>

        <div className="legal-section">
          <h2>Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus présents sur ContextDrop (textes, images, logos, code source)
            sont la propriété exclusive de l&apos;éditeur et sont protégés par le droit d&apos;auteur.
            Toute reproduction, même partielle, est interdite sans autorisation préalable.
          </p>
        </div>

        <div className="legal-section">
          <h2>Limitation de responsabilité</h2>
          <p>
            ContextDrop s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations
            diffusées sur ce site. Cependant, ContextDrop ne peut garantir l&apos;exactitude,
            la précision ou l&apos;exhaustivité des informations mises à disposition.
          </p>
        </div>

        <div className="legal-back">
          <Link href="/" className="btn-primary" style={{ fontSize: 14, padding: "10px 20px" }}>
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
