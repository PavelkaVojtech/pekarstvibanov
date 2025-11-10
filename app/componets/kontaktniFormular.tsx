'use client';

import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

// Definice stavu pro formulář
interface FormData {
  name: string;
  email: string;
  message: string;
}

// Props pro tlačítko odeslání
const SubmitButton: React.FC<{ loading: boolean }> = ({ loading }) => (
  <button
    type="submit"
    disabled={loading}
    className={`
      w-full flex items-center justify-center space-x-3
      py-3 px-6 mt-6 
      font-semibold text-lg uppercase tracking-wider
      rounded-lg 
      transition-all duration-300
      ${loading
        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
        : 'bg-amber-400 text-gray-900 hover:bg-amber-500 shadow-md hover:shadow-lg shadow-amber-400/30'
      }
      focus:outline-none focus:ring-4 focus:ring-amber-500/50
    `}
  >
    {loading ? (
      <>
        <span className="animate-spin h-5 w-5 border-4 border-t-amber-400 border-white rounded-full"></span>
        <span>Odesílám...</span>
      </>
    ) : (
      <>
        <FaPaperPlane className="w-5 h-5" />
        <span>Odeslat Zprávu</span>
      </>
    )}
  </button>
);


const KontaktniFormular = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    
    console.log("Simulace odeslání dat:", formData);

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (formData.name.toLowerCase().includes('chyba')) { 
        setStatus('error');
        setError('Omlouváme se, došlo k simulované chybě odesílání.');
    } else {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
    }
  };

  const inputClasses = `
    w-full p-3 
    bg-gray-700 border border-gray-600 
    rounded-md 
    text-white 
    placeholder-gray-400 
    focus:border-amber-400 focus:ring-1 focus:ring-amber-400 
    transition duration-200
  `;

  return (
    <section className="bg-gray-900 py-16 md:py-24 border-t border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            
            <div className="bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl max-w-2xl mx-auto border border-gray-700">

                <h3 className="text-4xl font-serif text-amber-400 mb-2 text-center drop-shadow-md uppercase tracking-wider">
                    NAPIŠTE NÁM
                </h3>
                <p className="text-gray-400 text-center mb-10">
                    Máte dotaz, speciální požadavek nebo zpětnou vazbu? Ozvěte se nám!
                </p>

                {status === 'success' && (
                    <div className="p-4 mb-4 text-sm font-semibold text-green-300 bg-green-900/50 rounded-lg border border-green-700" role="alert">
                        Zpráva úspěšně odeslána! Děkujeme. Brzy se vám ozveme.
                    </div>
                )}
                {status === 'error' && (
                    <div className="p-4 mb-4 text-sm font-semibold text-red-300 bg-red-900/50 rounded-lg border border-red-700" role="alert">
                        Chyba při odesílání: {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                            Jméno
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={inputClasses}
                            placeholder="Vaše jméno"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                            E-mail
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={inputClasses}
                            placeholder="vas.email@priklad.cz"
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                            Zpráva
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            rows={5}
                            value={formData.message}
                            onChange={handleChange}
                            required
                            className={`${inputClasses} resize-none`}
                            placeholder="Napište nám vaši zprávu..."
                        />
                    </div>

                    <SubmitButton loading={status === 'loading'} />

                </form>
            </div>
        </div>
    </section>
  );
};

export default KontaktniFormular;