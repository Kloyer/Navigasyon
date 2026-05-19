import React, { createContext, useContext, useState } from 'react';

const SepetContext = createContext();

export function SepetProvider({ children }) {
  const [sepet, setSepet] = useState([]);

  const sepeteEkle = (urun, restoran) => {
    setSepet(prev => {
      const mevcutIndex = prev.findIndex(item =>
        item.id === urun.id &&
        item.icecek === urun.icecek &&
        item.promosyon === urun.promosyon &&
        item.restoran === restoran.isim
      );
      if (mevcutIndex > -1) {
        const yeniSepet = [...prev];
        yeniSepet[mevcutIndex] = {
          ...yeniSepet[mevcutIndex],
          adet: yeniSepet[mevcutIndex].adet + 1,
        };
        return yeniSepet;
      }
      return [...prev, { ...urun, adet: 1, restoran: restoran.isim }];
    });
  };

  const adetGuncelle = (index, yeniAdet) => {
    setSepet(prev => {
      const yeniSepet = [...prev];
      yeniSepet[index] = { ...yeniSepet[index], adet: yeniAdet };
      return yeniSepet;
    });
  };

  const sepettenSil = (index) => {
    setSepet(prev => prev.filter((_, i) => i !== index));
  };

  const sepetiBosalt = () => setSepet([]);

  const toplamFiyat = sepet.reduce(
    (toplam, item) => toplam + (item.toplamFiyat || item.fiyat) * item.adet, 0
  );
  const toplamAdet = sepet.reduce((toplam, item) => toplam + item.adet, 0);

  return (
    <SepetContext.Provider value={{
      sepet, sepeteEkle, adetGuncelle, sepettenSil, sepetiBosalt, toplamFiyat, toplamAdet,
    }}>
      {children}
    </SepetContext.Provider>
  );
}

export const useSepet = () => useContext(SepetContext);