"use client";
import Flag from "./Flag";

type Props = { countryName?: string; flagField?: string; className?: string };

export default function CountryFlag({ countryName = "", flagField = "", className = "" }: Props) {
  // Utilise le champ flag (emoji/ISO) s'il est utile sinon le nom du pays
  const key = (flagField || countryName || "").trim();
  return <Flag country={key} className={className} size={28} />;
}

