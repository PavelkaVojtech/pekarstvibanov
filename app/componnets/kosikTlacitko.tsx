'use client'
import React from 'react';
import { FaShoppingCart } from 'react-icons/fa'; 

// Props: itemCount - počet položek v košíku (číslo)
const KosikTlacitko = ({ itemCount = 0 }) => {
  const badgeClasses = `
    absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 
    bg-red-600 text-white 
    rounded-full 
    w-5 h-5 
    flex items-center justify-center 
    text-xs font-bold 
    transition-all duration-300 ease-out 
    ${itemCount > 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} 
  `;

  // Animace pro celé tlačítko košíku
  const buttonClasses = `
    relative 
    p-3 
    rounded-full 
    bg-gray-700 
    text-gray-200 
    hover:bg-amber-400 
    hover:text-gray-900 
    transition-all 
    duration-300 
    shadow-lg
    focus:outline-none 
    focus:ring-4 
    focus:ring-amber-500/50
  `;

  return (
    <button 
      className={buttonClasses}
      // sem přijde logina pro otevření košíku a přidání položek a pod.
      aria-label="Košík s položkami"
    >
      <FaShoppingCart className="w-5 h-5" />
      
      <div className={badgeClasses}>
        {itemCount}
      </div>
    </button>
  );
};

export default KosikTlacitko;