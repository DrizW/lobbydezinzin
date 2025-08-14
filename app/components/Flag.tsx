"use client";
import React from "react";

type FlagProps = {
  country: string; // nom ("Nigeria"), clé région ("nigeria") ou code ISO/emoji
  className?: string;
  size?: number; // pixels
};

const NAME_TO_ISO: Record<string, string> = {
  // ISO 3166-1 alpha-2 en minuscules
  "south-africa": "za",
  "afrique du sud": "za",
  "south africa": "za",
  nigeria: "ng",
  taiwan: "tw",
  morocco: "ma",
  maroc: "ma",
  thailand: "th",
  thaïlande: "th",
  kenya: "ke",
};

function regionalIndicatorToISO(flagEmoji: string): string | null {
  try {
    const codePoints = Array.from(flagEmoji);
    if (codePoints.length < 2) return null;
    const cp1 = codePoints[0].codePointAt(0)!;
    const cp2 = codePoints[1].codePointAt(0)!;
    const A = 0x1f1e6; // regional indicator symbol letter A
    if (cp1 < A || cp2 < A) return null;
    const c1 = String.fromCharCode(65 + (cp1 - A));
    const c2 = String.fromCharCode(65 + (cp2 - A));
    return (c1 + c2).toLowerCase();
  } catch {
    return null;
  }
}

export default function Flag({ country, className = "", size = 28 }: FlagProps) {
  const raw = (country || "").trim();
  const key = raw.toLowerCase();
  // 1) Déjà un code ISO à 2 lettres
  let iso: string | null = /^[a-z]{2}$/i.test(raw) ? raw.toLowerCase() : null;
  // 2) Emoji -> ISO
  if (!iso && /\p{RI}/u.test(raw)) {
    iso = regionalIndicatorToISO(raw);
  }
  // 3) Mapping par nom/clé
  if (!iso) {
    const normalized = key.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    iso = NAME_TO_ISO[key] || NAME_TO_ISO[normalized] || null;
  }

  if (!iso) {
    // Fallback: ne rien afficher (ou on pourrait afficher l'emoji brut si fourni)
    return <span className={className} style={{ width: size, height: size, display: "inline-block" }} />;
  }
  const src = `https://flagcdn.com/${iso}.svg`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Drapeau ${country}`}
      width={size}
      height={size}
      className={`inline-block rounded-sm shadow-sm ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}


