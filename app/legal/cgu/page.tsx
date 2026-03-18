import Link from "next/link";
import { Logo } from "@/app/components/Logo";

export const metadata = {
  title: "Conditions générales d'utilisation — ContextDrop",
};

export default function CGU() {
  return (
    <div className="legal-page">
      <nav className="site-nav">
        <Logo />
      </nav>

      <div className="legal-inner">
        <div className="section-label">Conditions d&apos;utilisation</div>
        <h1>Conditions générales <em>d&apos;utilisation</em></h1>

        <div className="legal-section">
          <h2>1. Objet du service</h2>
          <p>
            ContextDrop est un service en ligne permettant aux freelances de créer et partager
            des formulaires de brief interactifs avec leurs clients. L&apos;IA intégrée guide
            les clients dans la formulation de leur projet et génère un brief structuré.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. Conditions d&apos;accès</h2>
          <p>
            L&apos;accès au service est conditionné à la création d&apos;un compte avec une adresse
            email valide. Vous devez avoir au moins 18 ans pour utiliser ContextDrop.
            Vous êtes responsable de la confidentialité de vos identifiants de connexion.
          </p>
        </div>

        <div className="legal-section">
          <h2>3. Plans et tarifs</h2>
          <p>ContextDrop propose trois plans d&apos;abonnement :</p>
          <ul>
            <li><strong>Gratuit (0€/mois) :</strong> 3 briefs par mois, fonctionnalités de base</li>
            <li><strong>Solo (9€/mois) :</strong> 15 briefs par mois, PDF brandé, rappels automatiques</li>
            <li><strong>Agence (49€/mois) :</strong> Briefs illimités, multi-utilisateurs, intégrations</li>
          </ul>
          <p>
            Les tarifs sont indiqués en euros TTC. Le paiement est prélevé mensuellement ou annuellement
            selon la formule choisie. Une réduction de 20% s&apos;applique sur les abonnements annuels.
          </p>
        </div>

        <div className="legal-section">
          <h2>4. Résiliation</h2>
          <p>
            Vous pouvez résilier votre abonnement à tout moment depuis votre espace client.
            La résiliation prend effet à la fin de la période d&apos;abonnement en cours.
            Aucun remboursement partiel n&apos;est effectué pour les mois entamés.
          </p>
        </div>

        <div className="legal-section">
          <h2>5. Utilisation acceptable</h2>
          <p>
            Il est interdit d&apos;utiliser ContextDrop pour des activités illégales, frauduleuses
            ou portant atteinte aux droits de tiers. ContextDrop se réserve le droit de
            suspendre tout compte en cas de violation de ces conditions.
          </p>
        </div>

        <div className="legal-section">
          <h2>6. Limitation de responsabilité</h2>
          <p>
            ContextDrop est fourni &quot;en l&apos;état&quot;. Nous ne garantissons pas une disponibilité
            ininterrompue du service. En cas d&apos;interruption, ContextDrop ne pourra être tenu
            responsable des préjudices directs ou indirects qui en résulteraient.
            La responsabilité de ContextDrop est limitée au montant des sommes versées
            au cours des 12 derniers mois.
          </p>
        </div>

        <div className="legal-section">
          <h2>7. Droit applicable</h2>
          <p>
            Les présentes CGU sont soumises au droit français. En cas de litige,
            les tribunaux français seront seuls compétents.
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
