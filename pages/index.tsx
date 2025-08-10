import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const { t } = useTranslation('common');

  // Récupère la liste des bénéfices de manière typée et sécurisée
  const benefitsRaw = t('benefits.items', { returnObjects: true }) as unknown;
  const benefitsItems: string[] = Array.isArray(benefitsRaw) ? (benefitsRaw as string[]) : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>LobbyDeZinzin</title>
        <meta name="description" content={t('description')} />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-6">
          {t('welcome')}
        </h1>
        
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">{t('home.title')}</h2>
          <p className="text-gray-700 mb-4">{t('home.subtitle')}</p>
          
          <div className="flex justify-center space-x-4">
            <Link href="/benefices" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition">
              {t('nav.benefits')}
            </Link>
            <Link href="/countries" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
              {t('nav.help')}
            </Link>
          </div>
        </div>

        <div className="mt-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4">{t('benefits.title')}</h3>
          <ul className="list-disc list-inside space-y-2">
            {benefitsItems.map((item: string, index: number) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fr', ['common'])),
    },
  };
};
