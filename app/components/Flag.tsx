"use client";
import React from "react";

type FlagProps = {
  country: string; // peut être nom ("Nigeria") ou clé région ("nigeria")
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

export default function Flag({ country, className = "", size = 28 }: FlagProps) {
  const key = (country || "").toLowerCase().trim();
  const iso = NAME_TO_ISO[key] || NAME_TO_ISO[key.normalize("NFD").replace(/\p{Diacritic}/gu, "")] || "";
  if (!iso) {
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


