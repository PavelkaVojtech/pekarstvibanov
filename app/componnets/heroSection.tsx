import React from 'react';
import Image from 'next/image';
import HeroImg from '../images/HeroSection.webp';

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden"> 
      
      <div className="absolute inset-0">
        <Image
          src={HeroImg}
          alt="Pekařské prostředí"
          fill
          style={{ objectFit: 'cover' }}
          className="filter blur-sm brightness-75"
        />
      </div>

      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-white tracking-tight leading-none drop-shadow-lg">
          PEČEME S LÁSKOU
        </h1>
        <p className="mt-4 text-xl md:text-3xl font-light text-amber-400 uppercase tracking-widest">
          Vůně domova z Bánova
        </p>
      </div>

    </section>
  );
};

export default HeroSection;