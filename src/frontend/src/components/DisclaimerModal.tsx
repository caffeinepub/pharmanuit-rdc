import { useState } from "react";

const STORAGE_KEY = "pharmanuit_disclaimer_accepted";

function hasAccepted(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function useDisclaimer() {
  const [accepted, setAccepted] = useState<boolean>(hasAccepted);

  function accept() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setAccepted(true);
  }

  return { accepted, accept };
}

interface DisclaimerModalProps {
  onAccept: () => void;
}

export function DisclaimerModal({ onAccept }: DisclaimerModalProps) {
  return (
    <div
      data-ocid="disclaimer.modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "28px 24px",
          maxWidth: "440px",
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        {/* Logo / Title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: "50%",
              backgroundColor: "oklch(0.38 0.12 155)",
              marginBottom: "12px",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <path d="M9 22V12h6v10" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "oklch(0.18 0.02 150)",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            PharmaNuit RDC
          </h1>
          <p
            style={{
              fontSize: "0.8rem",
              color: "oklch(0.48 0.04 145)",
              margin: "2px 0 0",
            }}
          >
            Information importante
          </p>
        </div>

        {/* Message */}
        <p
          style={{
            fontSize: "0.95rem",
            lineHeight: 1.65,
            color: "oklch(0.25 0.02 150)",
            margin: "0 0 24px",
            textAlign: "left",
          }}
        >
          PharmaNuit RDC est une plateforme d'information qui aide les
          utilisateurs à trouver des pharmacies ouvertes. Les horaires et
          informations sont déclarés par les pharmacies. Les utilisateurs
          doivent toujours confirmer les informations par appel avant de se
          déplacer.
        </p>

        {/* Button */}
        <button
          type="button"
          onClick={onAccept}
          data-ocid="disclaimer.continuer_button"
          style={{
            width: "100%",
            minHeight: "52px",
            backgroundColor: "oklch(0.38 0.12 155)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
