import Link from "next/link";

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-inner">
        <div className="logo" style={{ marginBottom: 48 }}>
          Context<span>Drop</span>
        </div>

        <div className="notfound-drop">
          <svg width="64" height="80" viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M32 4 C18 4 8 16 8 28 C8 46 20 60 32 72 C44 60 56 46 56 28 C56 16 46 4 32 4Z"
              fill="var(--accent)"
              opacity="0.15"
            />
            <path
              d="M32 12 C22 12 14 20 14 30 C14 44 24 56 32 64 C40 56 50 44 50 30 C50 20 42 12 32 12Z"
              fill="var(--accent)"
              opacity="0.3"
            />
            <text x="32" y="36" textAnchor="middle" fill="var(--accent)" fontSize="18" fontWeight="600">404</text>
          </svg>
        </div>

        <h1 className="notfound-title">
          Ce brief s&apos;est perdu<br /><em>en route...</em>
        </h1>

        <p className="notfound-sub">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>

        <Link href="/" className="btn-primary">
          Retour à l&apos;accueil
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
