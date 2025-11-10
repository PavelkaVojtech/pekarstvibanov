import React from 'react';
import Image from 'next/image';

const Kategorie = [
  { 
    title: 'chléb', 
    link: '/produkty/chleby', 
    image: '/images/chleba.webp',
    alt: 'Fotka chleba',
  },
  { 
    title: 'běžné pečivo', 
    link: '/produkty/bezne-pecivo', 
    image: '/images/rohliky.jpg',
    alt: 'Fotka běžného pečiva',
  },
  { 
    title: 'jemné pečivo', 
    link: '/produkty/jemne-pecivo', 
    image: '/images/koblihy.webp',
    alt: 'Fotka jemného pečiva',
  },
];

const ProductCategory = () => {
  return (
    <section className="bg-gray-800 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        <h2 className="text-4xl md:text-5xl font-serif text-white text-center mb-12 uppercase tracking-wider drop-shadow-md">
          NÁŠ SORTIMENT
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {Kategorie.map((category) => (
            <a 
              key={category.title} 
              href={category.link}
              className="group relative block aspect-[4/3] rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.03] hover:shadow-amber-400/50"
            >
              
              <Image
                src={category.image}
                alt={category.alt}
                fill={true}
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-500 group-hover:scale-[1.05] brightness-75 group-hover:brightness-90"
                sizes="(max-width: 768px) 100vw, 33vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent"></div>

              <div className="absolute inset-0 flex items-center justify-center">
                <p className="
                  text-white 
                  text-3xl sm:text-4xl 
                  font-serif 
                  font-bold 
                  uppercase 
                  tracking-widest 
                  drop-shadow-lg
                  transition-colors duration-300 group-hover:text-amber-400
                ">
                  {category.title}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategory;