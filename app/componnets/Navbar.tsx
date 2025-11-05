import React from 'react';
//import { FaBreadSlice } from 'react-icons/fa'; 

const Navbar = () => {
  const navItems = [
    { name: 'PRODUKTY', link: '/produkty' },
    { name: 'O NÁS', link: '/o-nas' },
    { name: 'KONTAKT', link: '/kontakt' },
  ];

  const animatedLinkClasses = `
    relative 
    text-gray-200 
    text-lg 
    font-medium 
    tracking-wider 
    transition-colors 
    duration-300
    before:content-[''] 
    before:absolute 
    before:-bottom-1 
    before:left-0 
    before:w-0 
    before:h-0.5 
    before:bg-amber-400 
    before:transition-all 
    before:duration-300 
    hover:text-amber-400 
    hover:before:w-full
  `;

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-xl">
      <div className="container mx-auto flex justify-between items-center">
        
        <div className="flex-1 text-left">
          <a 
            href={navItems[0].link} 
            className={animatedLinkClasses}
          >
            {navItems[0].name}
          </a>
        </div>

        <div className="flex-1 text-center">
          <a href="/" className="inline-flex items-center text-amber-400 hover:text-amber-300 transition duration-300">
            <span className="ml-3 text-2xl font-bold tracking-wider">
              PEKAŘSTVÍ
            </span>
          </a>
        </div>

        <div className="flex-1 text-right space-x-6">
          <a 
            href={navItems[1].link} 
            className={animatedLinkClasses}
          >
            {navItems[1].name}
          </a>
          <a 
            href={navItems[2].link} 
            className={animatedLinkClasses}
          >
            {navItems[2].name}
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;