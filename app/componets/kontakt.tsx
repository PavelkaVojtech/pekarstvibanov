import React from 'react';
import { FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import KontaktFormular from './kontaktniFormular';
import Image from 'next/image';

const KontaktSekce = () => {

  const infoItemClasses = "flex items-start space-x-4 p-4 rounded-xl bg-gray-900/70 shadow-lg border border-gray-700/50 transition duration-300 hover:border-amber-400";

  return (
    <section className="bg-gray-950 py-16 md:py-24 relative overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-gray-800 opacity-90"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        <h2 className="text-4xl md:text-6xl font-extrabold text-white text-center mb-16 uppercase tracking-widest drop-shadow-lg">
          Máme rádi kontakt s vámi
        </h2>

        <div className="
          grid grid-cols-1 lg:grid-cols-2 
          gap-0 
          rounded-2xl 
          overflow-hidden
          shadow-[0_20px_60px_-15px_rgba(20,20,20,0.8)] 
          border border-gray-700
        ">
          
          <div className="p-8 md:p-12 lg:p-16 bg-gray-900/95">
            <KontaktFormular />
          </div>

          <div className="relative p-8 md:p-12 lg:p-16 bg-gray-800/95 flex flex-col justify-center">
             
            <div className="absolute inset-0">
              <Image
                src="/images/pekar_a_bochnik_mezisekce.webp"
                alt="Pekař kontroluje chléb"
                fill={true}
                style={{ objectFit: 'cover' }}
                className="opacity-15 select-none pointer-events-none"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gray-800/80"></div>
            </div>

            <div className="relative z-20">
              <h3 className="text-4xl font-serif text-amber-400 mb-8 drop-shadow-md border-b-2 border-amber-400/50 pb-4">
                Kde nás najdete
              </h3>
              
              <p className="text-gray-300 mb-10 text-lg">
                  Jsme hrdí na naši tradiční rodinnou pekárnu. Ať už si chcete vyzvednout objednávku nebo se jen zeptat na složení, najdete nás zde:
              </p>

              <div className="space-y-6 text-white">
                
                <div className={infoItemClasses}>
                  <FaMapMarkerAlt className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-lg uppercase tracking-wider">ADRESA PROVOZOVNY</p>
                    <p className="text-gray-400">Bánov 52, 687 54 Bánov, Česká republika</p>
                  </div>
                </div>

                <div className={infoItemClasses}>
                  <FaPhone className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-lg uppercase tracking-wider">TELEFON</p>
                    <p className="text-gray-400">+420 735 290 268</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-gray-900/70 shadow-lg border border-gray-700/50 transition duration-300 hover:border-amber-400">
                    <FaClock className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-lg uppercase tracking-wider">OTEVÍRACÍ DOBA</p>
                      <p className="text-gray-400">Pondělí - Pátek: <span className="font-medium text-white">7:00 – 15:30</span></p>
                      <p className="text-gray-400">Sobota: <span className="font-medium text-white">7:00 – 10:00</span></p>
                    </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KontaktSekce;