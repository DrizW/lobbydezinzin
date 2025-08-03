import CountrySelector from "../components/CountrySelector";
import ClientOnly from "../components/ClientOnly";

export default function CountriesPage() {
  return (
    <ClientOnly>
      <CountrySelector />
    </ClientOnly>
  );
} 