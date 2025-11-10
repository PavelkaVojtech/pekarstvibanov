import React from 'react';
import Layout from '../componets/layout';
import { FaBreadSlice, FaSeedling, FaUsers } from 'react-icons/fa';

const hodnoty = [
  {
    icon: <FaBreadSlice className="w-10 h-10" />,
    title: 'Tradiční receptury',
    description: 'Vracíme se ke kořenům poctivého pekařského řemesla a používáme osvědčené postupy.',
  },
  {
    icon: <FaSeedling className="w-10 h-10" />,
    title: 'Čerstvé suroviny',
    description: 'Každý den vybíráme ty nejlepší lokální suroviny, protože na kvalitě záleží.',
  },
  {
    icon: <FaUsers className="w-10 h-10" />,
    title: 'Rodinný přístup',
    description: 'Jsme rodinná pekárna a naši zákazníci jsou pro nás jako součást rodiny.',
  },
];

const ONasPage = () => {
  const adresaPekarny = "Bánov 52, 687 54 Bánov, Česká republika";
  // Pro účely vývoje a zabezpečení se doporučuje používat správnou embed URL s API klíčem, 
const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(adresaPekarny)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
      <div className="bg-gray-950 text-gray-200">
        
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center max-w-3xl mx-auto space-y-6 mb-16">
                 <h2 className="text-4xl font-serif text-amber-400 drop-shadow-md">
                    Vůně, která spojuje generace
                 </h2>
                 <p className="text-xl text-gray-300 leading-relaxed">
                    Naše pekařství z Bánova vzniklo z jedné jednoduché myšlenky - vrátit lidem chuť na **opravdové, poctivé pečivo**. Každé ráno začínáme dřív než slunce, v naší malé pekárně to voní moukou, kváskem a poctivou prací.
                 </p>
                 <p className="text-lg text-gray-400">
                    Jsme hrdí na naši tradiční rodinnou pekárnu, kde se láska k řemeslu dědí z generace na generaci.
                 </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {hodnoty.map((item) => (
                    <div 
                        key={item.title} 
                        className="bg-gray-900 p-8 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-amber-400 hover:scale-[1.03] flex flex-col items-center"
                    >
                        <div className="flex justify-center text-amber-400 mb-6">
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3 uppercase tracking-wide">
                            {item.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>

        <section className="bg-gray-900 border-t border-gray-700 py-16 md:py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl md:text-5xl font-serif text-white text-center mb-12 uppercase tracking-wider drop-shadow-md">
                    NAJDETE NÁS ZDE
                </h2>
                <p className="text-center text-gray-400 mb-8 text-lg">
                    {adresaPekarny}.
                </p>
                <div className="overflow-hidden rounded-xl border-4 border-amber-400 shadow-2xl shadow-amber-400/20">
                    <iframe
                        src={mapEmbedUrl}
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Mapa s adresou ${adresaPekarny}`}
                        className="grayscale-[50%] contrast-125"
                    ></iframe>
                </div>
            </div>
        </section>

      </div>
  );
};

export default ONasPage;