import Link from "next/link";
import { Logo } from "@/app/components/Logo";

export const metadata = {
  title: "Politique de confidentialité — ContextDrop",
};

export default function Confidentialite() {
  return (
    <div className="legal-page">
      <nav className="site-nav">
        <Logo />
      </nav>

      <div className="legal-inner">
        <div className="section-label">Vie privée</div>
        <h1>Politique de <em>confidentialité</em></h1>

        <div className="legal-section">
          <h2>Données collectées</h2>
          <p>Dans le cadre de l&apos;utilisation de ContextDrop, nous collectons les données suivantes :</p>
          <ul>
            <li><strong>Adresse email :</strong> lors de la création de compte ou de la connexion</li>
            <li><strong>Projets et briefs :</strong> les données saisies lors de la création de briefs clients</li>
            <li><strong>Données de navigation :</strong> pages visitées, durée de session (données anonymisées)</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Finalité du traitement</h2>
          <p>Les données collectées sont utilisées pour :</p>
          <ul>
            <li>Fournir et améliorer le service ContextDrop</li>
            <li>Gérer votre compte et vos briefs</li>
            <li>Vous envoyer des notifications liées à votre utilisation du service</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Durée de conservation</h2>
          <p>
            Vos données sont conservées pendant toute la durée d&apos;utilisation du service,
            et supprimées dans un délai de <strong>30 jours</strong> suivant la résiliation
            de votre compte. Les données de facturation sont conservées 10 ans conformément
            aux obligations légales.
          </p>
        </div>

        <div className="legal-section">
          <h2>Vos droits (RGPD)</h2>
          <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d&apos;accès :</strong> obtenir une copie de vos données personnelles</li>
            <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
            <li><strong>Droit à l&apos;effacement :</strong> demander la suppression de vos données</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
            <li><strong>Droit d&apos;opposition :</strong> vous opposer au traitement de vos données</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Contact</h2>
          <p>
            Pour exercer vos droits ou pour toute question relative à la protection de vos données,
            contactez notre délégué à la protection des données :<br />
            <strong>Email :</strong> privacy@contextdrop.fr
          </p>
        </div>

        <div className="legal-section">
          <h2>Cookies</h2>
          <p>
            ContextDrop utilise des cookies techniques nécessaires au fonctionnement du service
            (préférences de thème, session). Vous pouvez gérer vos préférences via le bandeau
            affiché lors de votre première visite.
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
