import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa'; 

const Footer = () => {
  const animatedLinkClasses = `
    relative 
    text-gray-400 
    hover:text-amber-400 
    transition-colors 
    duration-300
    before:content-[''] 
    before:absolute 
    before:-bottom-0.5 
    before:left-0 
    before:w-0 
    before:h-0.5 
    before:bg-amber-400 
    before:transition-all 
    before:duration-300 
    hover:before:w-full 
    text-sm
    font-light
    block // Důležité pro svislé uspořádání
  `;

  // Odkazy do sekcí
  const quickLinks = [
    { name: 'PRODUKTY', link: '/produkty' },
    { name: 'O NÁS', link: '/o-nas' },
  ];

  return (
    <footer className="bg-gray-900 text-white border-t border-gray-700 mt-10">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div>
            <h3 className="text-2xl font-bold text-amber-400 tracking-wider mb-4">PEKAŘSTVÍ</h3>
            <p className="text-gray-400 text-sm">
              Pečeme s láskou a respektem k tradici. Objevte náš čerstvý a křupavý sortiment.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">RYCHLÉ ODKAZY</h4>
            <ul className="space-y-2">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <a href={item.link} className={animatedLinkClasses}>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">KONTAKT</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="mailto:info@pekarnabanov.cz" className="hover:text-amber-400 transition duration-300">
                  info@pekarnabanov.cz
                </a>
              </li>
              <li>+420 735 290 268</li>
              <li className="pt-2">
                Bánov 52, 687 54 Bánov, Česká republika
              </li>
            </ul>
          </div>
          
          {/* Sekce 4: Sociální sítě a Akce */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Sledujte nás</h4>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-amber-400 transition duration-300 transform hover:scale-125">
                {<FaFacebookF className="w-6 h-6" />}
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-amber-400 transition duration-300 transform hover:scale-125">
                {<FaInstagram className="w-6 h-6" />}
              </a>
            </div>
            
            {/* Přihlášení/Registrace */}
            <div className="mt-6 space-y-3">
                <a href="/prihlaseni" className="w-full md:w-auto inline-block text-center py-2 px-4 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900 transition duration-300 text-sm font-semibold rounded-lg">
                    Přihlášení
                </a>
                <a href="/registrace" className="w-full md:w-auto inline-block text-center py-2 px-4 border border-transparent bg-amber-400 text-gray-900 hover:bg-amber-500 transition duration-300 text-sm font-semibold rounded-lg ml-3">
                    Registrace
                </a>
            </div>

          </div>
        </div>
        
        {/* Copyright a spodní linky */}
        <div className="border-t border-gray-700 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} PEKAŘSTVÍ BÁNOV. Všechna práva vyhrazena.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
             <a href="/obchodni-podminky" className="text-gray-500 hover:text-amber-400 text-xs">Obchodní podmínky</a>
             <a href="/ochrana-dat" className="text-gray-500 hover:text-amber-400 text-xs">Ochrana osobních údajů</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;