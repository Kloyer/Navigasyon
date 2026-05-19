import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ScrollView, Modal, Alert
} from 'react-native';
import { useSepet } from '../context/SepetContext';

export default function RestoranDetay({ route, navigation }) {
  const { restoran } = route.params;
  const { sepeteEkle, sepet, toplamAdet } = useSepet();
  const [seciliKategori, setSeciliKategori] = useState('Tümü');
  const [modalGoster, setModalGoster] = useState(false);
  const [seciliUrun, setSeciliUrun] = useState(null);

  // Modal state
  const [adet, setAdet] = useState(1);
  const [seciliIcecek, setSeciliIcecek] = useState(null);
  const [seciliPromosyon, setSeciliPromosyon] = useState(null);
  const [cikarılanMalzemeler, setCikarilaniMalzemeler] = useState([]);

  const menuKategorileri = ['Tümü', ...new Set(restoran.menu.map(i => i.kategori))];
  const filtreliMenu = seciliKategori === 'Tümü'
    ? restoran.menu
    : restoran.menu.filter(i => i.kategori === seciliKategori);

  const urunAc = (urun) => {
    setSeciliUrun(urun);
    setAdet(1);
    setSeciliIcecek(urun.icecekler?.[0] || null);
    setSeciliPromosyon(urun.promosyonlar?.[0] || null);
    setCikarilaniMalzemeler([]);
    setModalGoster(true);
  };

  const malzemeToggle = (malzeme) => {
    setCikarilaniMalzemeler(prev =>
      prev.includes(malzeme)
        ? prev.filter(m => m !== malzeme)
        : [...prev, malzeme]
    );
  };

  const toplamHesapla = () => {
    if (!seciliUrun) return 0;
    const icecekFiyat = seciliIcecek?.fiyat || 0;
    const promosyonFiyat = seciliPromosyon?.fiyat || 0;
    return (seciliUrun.fiyat + icecekFiyat + promosyonFiyat) * adet;
  };

  const sepeteEkleModal = () => {
    const urunData = {
      ...seciliUrun,
      icecek: seciliIcecek?.isim !== 'İçecek Yok' ? seciliIcecek?.isim : null,
      promosyon: seciliPromosyon?.isim !== 'Promosyon Yok' ? seciliPromosyon?.isim : null,
      cikarilan: cikarılanMalzemeler,
      toplamFiyat: toplamHesapla(),
    };
    for (let i = 0; i < adet; i++) {
      sepeteEkle(urunData, restoran);
    }
    setModalGoster(false);
  };

  const getDinamikBaslik = (kat) => {
    if (kat === 'Pizzalar') return '🍕 Pizza Boyu Seç';
    if (kat === 'Burgerler') return '🍔 Burger Seçimi';
    if (kat === 'Dönerler') return '🥙 Dürüm/Porsiyon Seç';
    if (kat === 'Sushi') return '🍣 Roll Seçimi';
    if (kat === 'Tavuklar' || kat === 'Tavuk') return '🍗 Menü Seçimi';
    return '🎁 Seçenek Seç';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.geriBtn}>
          <Text style={styles.geriText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.emoji}>{restoran.emoji}</Text>
        <Text style={styles.isim}>{restoran.isim}</Text>
        <View style={styles.bilgiRow}>
          <Text style={styles.bilgi}>⭐ {restoran.puan}</Text>
          <Text style={styles.bilgi}>💬 {restoran.yorumSayisi} yorum</Text>
          <Text style={styles.bilgi}>🕐 {restoran.teslimatSuresi}</Text>
        </View>
      </View>

      {/* Kategori Filtreleri */}
      <View style={{ height: 55, backgroundColor: '#fff' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kategoriler}>
          {menuKategorileri.map(kat => (
            <TouchableOpacity
              key={kat}
              style={[styles.katBtn, seciliKategori === kat && styles.katBtnAktif]}
              onPress={() => setSeciliKategori(kat)}
            >
              <Text style={[styles.katText, seciliKategori === kat && styles.katTextAktif]}>{kat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menü */}
      <FlatList
        data={filtreliMenu}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.liste}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.urunKart} onPress={() => urunAc(item)}>
            <View style={styles.urunBilgi}>
              <Text style={styles.urunIsim}>{item.isim}</Text>
              <Text style={styles.urunAciklama}>{item.aciklama}</Text>
              <Text style={styles.urunFiyat}>{item.fiyat}₺</Text>
            </View>
            <View style={styles.sag}>
              {/* Buradaki badge kısmı tamamen kaldırıldı */}
              <TouchableOpacity style={styles.ekleBtn} onPress={() => urunAc(item)}>
                <Text style={styles.ekleBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Sepet Butonu */}
      {toplamAdet > 0 && (
        <TouchableOpacity 
          style={styles.sepetBtn} 
          onPress={() => navigation.navigate('Main', { screen: 'Sepet' })}
        >
          <Text style={styles.sepetBtnText}>🛒 Sepete Git ({toplamAdet} ürün)</Text>
        </TouchableOpacity>
      )}

      {/* MODAL */}
      <Modal visible={modalGoster} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalKutu}>
            <ScrollView showsVerticalScrollIndicator={false}>

              <View style={styles.modalHeader}>
                <Text style={styles.modalIsim}>{seciliUrun?.isim}</Text>
                <TouchableOpacity onPress={() => setModalGoster(false)}>
                  <Text style={styles.kapat}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalAciklama}>{seciliUrun?.aciklama}</Text>
              <Text style={styles.modalFiyat}>{seciliUrun?.fiyat}₺</Text>

              {seciliUrun?.promosyonlar?.length > 0 && (
                <View style={styles.bolum}>
                  <Text style={styles.bolumBaslik}>{getDinamikBaslik(seciliUrun.kategori)}</Text>
                  {seciliUrun.promosyonlar.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.secenekBtn, seciliPromosyon?.id === p.id && styles.secenekAktif]}
                      onPress={() => setSeciliPromosyon(p)}
                    >
                      <View style={styles.secenekIc}>
                        <View style={[styles.radio, seciliPromosyon?.id === p.id && styles.radioAktif]} />
                        <Text style={styles.secenekText}>{p.isim}</Text>
                      </View>
                      {p.fiyat > 0 && <Text style={styles.secenekFiyat}>+{p.fiyat}₺</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {seciliUrun?.icecekler?.length > 0 && (
                <View style={styles.bolum}>
                  <Text style={styles.bolumBaslik}>🥤 Soğuk İçecek Seç</Text>
                  {seciliUrun.icecekler.map(ic => (
                    <TouchableOpacity
                      key={ic.id}
                      style={[styles.secenekBtn, seciliIcecek?.id === ic.id && styles.secenekAktif]}
                      onPress={() => setSeciliIcecek(ic)}
                    >
                      <View style={styles.secenekIc}>
                        <View style={[styles.radio, seciliIcecek?.id === ic.id && styles.radioAktif]} />
                        <Text style={styles.secenekText}>{ic.isim}</Text>
                      </View>
                      {ic.fiyat > 0 && <Text style={styles.secenekFiyat}>+{ic.fiyat}₺</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {seciliUrun?.malzemeler?.length > 0 && (
                <View style={styles.bolum}>
                  <Text style={styles.bolumBaslik}>🥬 Malzeme Tercihi</Text>
                  <Text style={styles.bolumAlt}>İstemediğiniz malzemeleri çıkarın</Text>
                  <View style={styles.malzemeGrid}>
                    {seciliUrun.malzemeler.map(m => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.malzemeBtn, cikarılanMalzemeler.includes(m) && styles.malzemeCikarildi]}
                        onPress={() => malzemeToggle(m)}
                      >
                        <Text style={[styles.malzemeText, cikarılanMalzemeler.includes(m) && styles.malzemeTextCikarildi]}>
                          {cikarılanMalzemeler.includes(m) ? '✕ ' : ''}{m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.bolum}>
                <Text style={styles.bolumBaslik}>🔢 Sipariş Adedi</Text>
                <View style={styles.adetRow}>
                  <TouchableOpacity
                    style={styles.adetBtn}
                    onPress={() => setAdet(a => Math.max(1, a - 1))}
                  >
                    <Text style={styles.adetBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.adetSayi}>{adet}</Text>
                  <TouchableOpacity
                    style={[styles.adetBtn, styles.adetEkleBtn]}
                    onPress={() => setAdet(a => a + 1)}
                  >
                    <Text style={styles.adetBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </ScrollView>

            <TouchableOpacity style={styles.sepeteEkleBtn} onPress={sepeteEkleModal}>
              <Text style={styles.sepeteEkleBtnText}>
                🛒 Sepete Ekle — {toplamHesapla()}₺
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#E8340A', padding: 15, alignItems: 'center' },
  geriBtn: { alignSelf: 'flex-start', marginBottom: 8 },
  geriText: { color: '#fff', fontSize: 16 },
  emoji: { fontSize: 55 },
  isim: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 5 },
  bilgiRow: { flexDirection: 'row', gap: 15, marginTop: 8 },
  bilgi: { color: '#fff', fontSize: 13 },
  kategoriler: { paddingVertical: 10, paddingLeft: 10 },
  katBtn: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#f0f0f0', marginRight: 8, minWidth: 80, alignItems: 'center'
  },
  katBtnAktif: { backgroundColor: '#E8340A' },
  katText: { fontSize: 13, color: '#555' },
  katTextAktif: { color: '#fff' },
  liste: { padding: 10 },
  urunKart: {
    backgroundColor: '#fff', borderRadius: 12, padding: 15,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  urunBilgi: { flex: 1 },
  urunIsim: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  urunAciklama: { fontSize: 12, color: '#888', marginTop: 3 },
  urunFiyat: { fontSize: 15, color: '#E8340A', fontWeight: 'bold', marginTop: 5 },
  sag: { alignItems: 'center', gap: 6 },
  ekleBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#E8340A', alignItems: 'center', justifyContent: 'center',
  },
  ekleBtnText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  sepetBtn: {
    backgroundColor: '#FF6B00', margin: 15, padding: 16,
    borderRadius: 12, alignItems: 'center',
  },
  sepetBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalKutu: {
    backgroundColor: '#fff', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 20, maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalIsim: { fontSize: 20, fontWeight: 'bold', color: '#222', flex: 1 },
  kapat: { fontSize: 20, color: '#888', padding: 4 },
  modalAciklama: { fontSize: 13, color: '#888', marginTop: 6 },
  modalFiyat: { fontSize: 18, color: '#E8340A', fontWeight: 'bold', marginTop: 6, marginBottom: 10 },
  bolum: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 14 },
  bolumBaslik: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  bolumAlt: { fontSize: 12, color: '#888', marginBottom: 8 },
  secenekBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderRadius: 10, backgroundColor: '#f8f8f8', marginBottom: 6,
  },
  secenekAktif: { backgroundColor: '#FFF0EE', borderWidth: 1, borderColor: '#E8340A' },
  secenekIc: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#ccc',
  },
  radioAktif: { borderColor: '#E8340A', backgroundColor: '#E8340A' },
  secenekText: { fontSize: 14, color: '#333' },
  secenekFiyat: { fontSize: 13, color: '#E8340A', fontWeight: 'bold' },
  malzemeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  malzemeBtn: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#f0f0f0',
    borderWidth: 1, borderColor: '#ddd',
  },
  malzemeCikarildi: { backgroundColor: '#FFF0EE', borderColor: '#E8340A' },
  malzemeText: { fontSize: 13, color: '#444' },
  malzemeTextCikarildi: { color: '#E8340A', textDecorationLine: 'line-through' },
  adetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  adetBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center',
  },
  adetEkleBtn: { backgroundColor: '#E8340A' },
  adetBtnText: { fontSize: 20, color: '#333', fontWeight: 'bold' },
  adetSayi: { fontSize: 22, fontWeight: 'bold', color: '#222', minWidth: 40, textAlign: 'center' },
  sepeteEkleBtn: {
    backgroundColor: '#E8340A', padding: 16,
    borderRadius: 12, alignItems: 'center', marginTop: 16,
  },
  sepeteEkleBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});