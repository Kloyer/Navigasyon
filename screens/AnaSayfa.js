import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, ScrollView, SafeAreaView, Modal, Image
} from 'react-native';
import restoranlar from '../data/restoranlar';
import kategoriler from '../data/kategoriler';

export default function AnaSayfa({ navigation }) {
  const [arama, setArama] = useState('');
  const [seciliKategori, setSeciliKategori] = useState('Tümü');
  const [siralama, setSiralama] = useState('puan');
  const [qrModal, setQrModal] = useState(false);

  const filtrelenmis = restoranlar
    .filter(r => {
      const aramaUygun = r.isim.toLowerCase().includes(arama.toLowerCase());
      const kategoriUygun = seciliKategori === 'Tümü' || r.kategori === seciliKategori;
      return aramaUygun && kategoriUygun;
    })
    .sort((a, b) => {
      if (siralama === 'puan') return b.puan - a.puan;
      if (siralama === 'yorum') return b.yorumSayisi - a.yorumSayisi;
      if (siralama === 'sure') return parseInt(a.teslimatSuresi) - parseInt(b.teslimatSuresi);
      return 0;
    });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerBaslik}>🍽️ Ne yemek istersin?</Text>
          <TouchableOpacity style={styles.qrBtn} onPress={() => setQrModal(true)}>
            <Text style={styles.qrBtnText}>📷</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Restoran veya yemek ara..."
          placeholderTextColor="#999"
          value={arama}
          onChangeText={setArama}
        />
      </View>

      {/* Kategoriler */}
      <View style={{ height: 80 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kategoriler}>
          {kategoriler.map(kat => (
            <TouchableOpacity
              key={kat.id}
              style={[styles.kategoriBtn, seciliKategori === kat.isim && styles.kategoriAktif]}
              onPress={() => setSeciliKategori(kat.isim)}
            >
              <Text style={styles.kategoriEmoji}>{kat.emoji}</Text>
              <Text style={[styles.kategoriText, seciliKategori === kat.isim && styles.kategoriTextAktif]}>
                {kat.isim}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sıralama */}
      <View style={styles.siralamaRow}>
        <Text style={styles.siralamaBaslik}>Sırala:</Text>
        {[
          { key: 'puan', label: '⭐ Puan' },
          { key: 'yorum', label: '💬 Yorum' },
          { key: 'sure', label: '⏱️ Süre' },
        ].map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.siralamaBtn, siralama === s.key && styles.siralamaAktif]}
            onPress={() => setSiralama(s.key)}
          >
            <Text style={[styles.siralamaText, siralama === s.key && styles.siralamaTextAktif]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Restoran Listesi */}
      <FlatList
        data={filtrelenmis}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.liste}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.restoranKart}
            onPress={() => navigation.navigate('RestoranDetay', { restoran: item })}
          >
            <View style={styles.restoranEmoji}>
              <Text style={{ fontSize: 50 }}>{item.emoji}</Text>
            </View>
            <View style={styles.restoranBilgi}>
              <Text style={styles.restoranIsim}>{item.isim}</Text>
              <Text style={styles.restoranKategori}>{item.kategori}</Text>
              <View style={styles.restoranAlt}>
                <Text style={styles.puan}>⭐ {item.puan}</Text>
                <Text style={styles.yorum}>({item.yorumSayisi} yorum)</Text>
                <Text style={styles.sure}>🕐 {item.teslimatSuresi}</Text>
              </View>
              <Text style={styles.minSiparis}>Min. sipariş: {item.minSiparis}₺</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* QR Code Modal */}
      <Modal visible={qrModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalKutu}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalBaslik}>📷 QR Kodu Tara</Text>
              <TouchableOpacity onPress={() => setQrModal(false)}>
                <Text style={styles.kapat}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalAlt}>Kodu okutarak sitemizi ziyaret edebilirsin</Text>
            <View style={styles.qrWrapper}>
              <Image
                source={require('../assets/qr.png')}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity style={styles.kapatBtn} onPress={() => setQrModal(false)}>
              <Text style={styles.kapatBtnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#E8340A', padding: 15, paddingTop: 10 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerBaslik: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  qrBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBtnText: { fontSize: 20 },
  searchBar: {
    backgroundColor: '#fff', borderRadius: 10, padding: 10,
    fontSize: 14, color: '#333',
  },
  kategoriler: { paddingVertical: 10, paddingLeft: 10 },
  kategoriBtn: {
    alignItems: 'center', marginRight: 10, paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#ddd', minWidth: 70,
  },
  kategoriAktif: { backgroundColor: '#E8340A', borderColor: '#E8340A' },
  kategoriEmoji: { fontSize: 18 },
  kategoriText: { fontSize: 12, color: '#555' },
  kategoriTextAktif: { color: '#fff' },
  siralamaRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginBottom: 5 },
  siralamaBaslik: { fontSize: 13, color: '#555', marginRight: 8 },
  siralamaBtn: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15,
    backgroundColor: '#fff', marginRight: 6, borderWidth: 1, borderColor: '#ddd',
  },
  siralamaAktif: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  siralamaText: { fontSize: 12, color: '#555' },
  siralamaTextAktif: { color: '#fff' },
  liste: { padding: 10 },
  restoranKart: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  restoranEmoji: {
    width: 100, backgroundColor: '#FFF3E0',
    alignItems: 'center', justifyContent: 'center',
  },
  restoranBilgi: { flex: 1, padding: 12 },
  restoranIsim: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  restoranKategori: { fontSize: 12, color: '#888', marginBottom: 6 },
  restoranAlt: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  puan: { fontSize: 13, color: '#F4A200', fontWeight: 'bold' },
  yorum: { fontSize: 12, color: '#888' },
  sure: { fontSize: 12, color: '#555' },
  minSiparis: { fontSize: 12, color: '#E8340A', marginTop: 4 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalKutu: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 24, alignItems: 'center', width: 300,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', width: '100%', marginBottom: 6,
  },
  modalBaslik: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  kapat: { fontSize: 20, color: '#888', padding: 4 },
  modalAlt: { fontSize: 13, color: '#888', marginBottom: 20, textAlign: 'center' },
  qrWrapper: {
    padding: 16, backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1, borderColor: '#eee',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  kapatBtn: {
    marginTop: 20, backgroundColor: '#E8340A',
    paddingHorizontal: 40, paddingVertical: 12, borderRadius: 10,
  },
  kapatBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});