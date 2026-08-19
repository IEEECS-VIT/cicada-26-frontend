import { Link } from "react-router-dom";

export default function ComingSoon({ pageName }) {
  return (
    <div className="coming-soon-page" role="main">
      {/* Decorative ring */}
      <div className="coming-soon-ring" aria-hidden="true" />

      {/* Badge */}
      <p className="coming-soon-badge" aria-label={`${pageName} section`}>
        {pageName}
      </p>

      {/* Title */}
      <h1 className="coming-soon-title">COMING SOON</h1>

      {/* Divider */}
      <div className="coming-soon-line" aria-hidden="true" />

      {/* Sub-text */}
      <p className="coming-soon-sub">
        This sector is currently classified.
        <br />
        Transmissions pending&hellip;
      </p>

      {/* Back to Home */}
      <Link
        to="/"
        id={`back-home-${pageName.toLowerCase().replace(/\s/g, "-")}`}
        className="coming-soon-back"
        aria-label="Return to home page"
      >
        ← RETURN TO BASE
      </Link>
    </div>
  );
}