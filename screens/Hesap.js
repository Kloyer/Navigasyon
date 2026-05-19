import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Alert
} from 'react-native';

const kuponlar = [
  { id: 1, kod: 'YEM10', aciklama: '%10 indirim', indirim: '10%', sonTarih: '31.05.2026', aktif: true },
  { id: 2, kod: 'ILK20', aciklama: 'İlk siparişe %20 indirim', indirim: '20%', sonTarih: '30.06.2026', aktif: true },
  { id: 3, kod: 'YAZA30', aciklama: 'Yaz kampanyası %30 indirim', indirim: '30%', sonTarih: '01.04.2026', aktif: false },
];

export default function Hesap() {
  const [aktifTab, setAktifTab] = useState('profil');

  const kuponKullan = (kupon) => {
    if (!kupon.aktif) {
      Alert.alert('❌ Kupon Süresi Dolmuş', 'Bu kuponun süresi maalesef dolmuş.');
      return;
    }
    Alert.alert('🎉 Kupon Kopyalandı!', `${kupon.kod} kodu sepette kullanabilirsiniz.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>👤 Hesabım</Text>
      </View>

      {/* Tab Seçici */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, aktifTab === 'profil' && styles.tabAktif]}
          onPress={() => setAktifTab('profil')}
        >
          <Text style={[styles.tabText, aktifTab === 'profil' && styles.tabTextAktif]}>
            👤 Profil
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, aktifTab === 'kuponlar' && styles.tabAktif]}
          onPress={() => setAktifTab('kuponlar')}
        >
          <Text style={[styles.tabText, aktifTab === 'kuponlar' && styles.tabTextAktif]}>
            🎟️ Kuponlar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.icerik}>
        {aktifTab === 'profil' ? (
          <View>
            {/* Profil Kartı */}
            <View style={styles.profilKart}>
              <Text style={styles.profilEmoji}>👤</Text>
              <Text style={styles.profilIsim}>Kullanıcı Adı</Text>
              <Text style={styles.profilEmail}>kullanici@email.com</Text>
            </View>

            {/* Menü Seçenekleri */}
            {[
              { emoji: '📦', baslik: 'Siparişlerim', alt: 'Geçmiş siparişleri görüntüle' },
              { emoji: '📍', baslik: 'Adreslerim', alt: 'Kayıtlı adreslerim' },
              { emoji: '💳', baslik: 'Ödeme Yöntemlerim', alt: 'Kayıtlı kartlarım' },
              { emoji: '🔔', baslik: 'Bildirimler', alt: 'Bildirim ayarları' },
              { emoji: '❓', baslik: 'Yardım', alt: 'Sık sorulan sorular' },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => Alert.alert(item.baslik, 'Bu özellik yakında eklenecek!')}
              >
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
                <View style={styles.menuBilgi}>
                  <Text style={styles.menuBaslik}>{item.baslik}</Text>
                  <Text style={styles.menuAlt}>{item.alt}</Text>
                </View>
                <Text style={styles.menuOk}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.kuponlarContainer}>
            <Text style={styles.kuponBaslik}>🎟️ Kuponlarım</Text>
            {kuponlar.map(kupon => (
              <TouchableOpacity
                key={kupon.id}
                style={[styles.kuponKart, !kupon.aktif && styles.kuponPasif]}
                onPress={() => kuponKullan(kupon)}
              >
                <View style={styles.kuponSol}>
                  <Text style={styles.kuponKod}>{kupon.kod}</Text>
                  <Text style={styles.kuponAciklama}>{kupon.aciklama}</Text>
                  <Text style={styles.kuponTarih}>Son: {kupon.sonTarih}</Text>
                </View>
                <View style={styles.kuponSag}>
                  <Text style={styles.kuponIndirim}>{kupon.indirim}</Text>
                  <Text style={styles.kuponDurum}>
                    {kupon.aktif ? '✅ Aktif' : '❌ Süresi Doldu'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#E8340A', padding: 15 },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  tabRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, padding: 14, alignItems: 'center' },
  tabAktif: { borderBottomWidth: 3, borderBottomColor: '#E8340A' },
  tabText: { fontSize: 14, color: '#888' },
  tabTextAktif: { color: '#E8340A', fontWeight: 'bold' },
  icerik: { flex: 1 },
  profilKart: {
    backgroundColor: '#fff', margin: 15, padding: 25,
    borderRadius: 15, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  profilEmoji: { fontSize: 60 },
  profilIsim: { fontSize: 20, fontWeight: 'bold', color: '#222', marginTop: 10 },
  profilEmail: { fontSize: 14, color: '#888', marginTop: 4 },
  menuItem: {
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
    padding: 15, marginHorizontal: 15, marginBottom: 8, borderRadius: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  menuEmoji: { fontSize: 24, marginRight: 12 },
  menuBilgi: { flex: 1 },
  menuBaslik: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  menuAlt: { fontSize: 12, color: '#888', marginTop: 2 },
  menuOk: { fontSize: 22, color: '#ccc' },
  kuponlarContainer: { padding: 15 },
  kuponBaslik: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 15 },
  kuponKart: {
    backgroundColor: '#fff', borderRadius: 12, padding: 15,
    marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between',
    borderLeftWidth: 5, borderLeftColor: '#E8340A',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  kuponPasif: { borderLeftColor: '#ccc', opacity: 0.6 },
  kuponSol: { flex: 1 },
  kuponKod: { fontSize: 18, fontWeight: 'bold', color: '#E8340A' },
  kuponAciklama: { fontSize: 13, color: '#555', marginTop: 4 },
  kuponTarih: { fontSize: 11, color: '#888', marginTop: 4 },
  kuponSag: { alignItems: 'center', justifyContent: 'center', paddingLeft: 15 },
  kuponIndirim: { fontSize: 24, fontWeight: 'bold', color: '#FF6B00' },
  kuponDurum: { fontSize: 11, color: '#888', marginTop: 4 },
});