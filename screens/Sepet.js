import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, TextInput, ScrollView, Animated, Dimensions
} from 'react-native';
import { useSepet } from '../context/SepetContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// ── Animasyonlu Sipariş Onay Ekranı ─────────────────────────────────────────
function SiparisOnayEkrani({ onBitis }) {
  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1, tension: 50, friction: 5, useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim,   { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    const timer = setTimeout(onBitis, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={onayStyles.container}>
      <Animated.View style={[onayStyles.cerceve, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={onayStyles.tik}>✓</Text>
      </Animated.View>
      <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
        <Text style={onayStyles.baslik}>Siparişiniz Alındı!</Text>
        <Text style={onayStyles.alt}>Siparişiniz hazırlanıyor 🍽️</Text>
        <Text style={onayStyles.alt2}>Yakında kapınızda olacak</Text>
        <View style={onayStyles.bilgiKutu}>
          <Text style={onayStyles.bilgiSatir}>🛵  Tahmini teslimat: 30-45 dk</Text>
          <Text style={onayStyles.bilgiSatir}>📱  SMS ile bilgilendirileceksiniz</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const onayStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 25 },
  cerceve: {
    width: 130, height: 130, borderRadius: 65, backgroundColor: '#28a745',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#28a745', shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
  },
  tik:    { fontSize: 65, color: '#fff', fontWeight: 'bold' },
  baslik: { fontSize: 28, fontWeight: 'bold', color: '#222', marginTop: 10 },
  alt:    { fontSize: 16, color: '#555', marginTop: 6 },
  alt2:   { fontSize: 14, color: '#888', marginTop: 4 },
  bilgiKutu: {
    marginTop: 20, backgroundColor: '#f4f4f4',
    borderRadius: 14, padding: 18, width: width * 0.75, gap: 12,
  },
  bilgiSatir: { fontSize: 14, color: '#444' },
});

// ── Ana Sepet Ekranı ─────────────────────────────────────────────────────────
export default function Sepet() {
  const navigation = useNavigation();
  const { sepet, sepetiBosalt, toplamFiyat, adetGuncelle, sepettenSil } = useSepet();

  const [odemeSayfasi, setOdemeSayfasi]   = useState(false);
  const [siparisAlindi, setSiparisAlindi] = useState(false);
  const [adres, setAdres]                 = useState('');
  const [odemeYontemi, setOdemeYontemi]   = useState(null);
  const [kartIsim, setKartIsim]           = useState('');
  const [kartNo, setKartNo]               = useState('');
  const [kartSKT, setKartSKT]             = useState('');
  const [kartCVV, setKartCVV]             = useState('');
  const [kuponKod, setKuponKod]           = useState('');
  const [indirimOrani, setIndirimOrani]   = useState(0);

  const indirimTutari = Math.round(toplamFiyat * indirimOrani);
  const sonToplam     = toplamFiyat - indirimTutari + 10;

  // Animasyon bitti → sıfırla
  const onayBitti = () => {
    sepetiBosalt();
    setSiparisAlindi(false);
    setOdemeSayfasi(false);
    setAdres(''); setOdemeYontemi(null);
    setKartIsim(''); setKartNo(''); setKartSKT(''); setKartCVV('');
    setKuponKod(''); setIndirimOrani(0);
    navigation.navigate('AnaSayfa');
  };

  // Animasyon göster
  if (siparisAlindi) return <SiparisOnayEkrani onBitis={onayBitti} />;

  // Adet azalt: 0 olunca sil
  const adetAzalt = (index, item) => {
    if (item.adet === 1) {
      sepettenSil(index);
    } else {
      adetGuncelle(index, item.adet - 1);
    }
  };

  const kuponUygula = () => {
    const kod = kuponKod.trim().toUpperCase();
    if (kod === 'YEM10') {
      setIndirimOrani(0.10);
    } else if (kod === 'ILK20') {
      setIndirimOrani(0.20);
    } else {
      setIndirimOrani(0);
    }
  };

  // Siparişi onayla → direkt animasyon, kontrol yok
  const siparisOnayla = () => {
    setSiparisAlindi(true);
  };

  // ── Boş Sepet ───────────────────────────────────────────────────────────────
  if (sepet.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>🛒 Sepetim</Text>
        </View>
        <View style={styles.bosContainer}>
          <Text style={styles.bosEmoji}>🛒</Text>
          <Text style={styles.bosText}>Sepetiniz boş</Text>
          <Text style={styles.bosAlt}>Restoran seçip ürün ekleyin</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Sepet Listesi ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {odemeSayfasi ? '💳 Ödeme ve Adres' : '🛒 Sepetim'}
        </Text>
      </View>

      {!odemeSayfasi ? (
        <>
          <FlatList
            data={sepet}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.liste}
            renderItem={({ item, index }) => (
              <View style={styles.urunKart}>
                <View style={styles.urunBilgi}>
                  <Text style={styles.urunIsim}>{item.isim}</Text>
                  <Text style={styles.urunRestoran}>{item.restoran}</Text>
                  {item.icecek    && <Text style={styles.secimDetay}>🥤 {item.icecek}</Text>}
                  {item.promosyon && <Text style={styles.secimDetay}>📦 {item.promosyon}</Text>}
                  {item.cikarilan?.length > 0 && (
                    <Text style={styles.secimDetay}>🚫 {item.cikarilan.join(', ')} yok</Text>
                  )}
                  <Text style={styles.urunFiyat}>
                    {(item.toplamFiyat || item.fiyat) * item.adet}₺
                  </Text>
                </View>

                <View style={styles.adetKontrol}>
                  <TouchableOpacity style={styles.adetBtn} onPress={() => adetAzalt(index, item)}>
                    <Text style={styles.adetBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.adetSayi}>{item.adet}</Text>
                  <TouchableOpacity
                    style={[styles.adetBtn, styles.ekleBtn]}
                    onPress={() => adetGuncelle(index, item.adet + 1)}
                  >
                    <Text style={styles.ekleBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <View style={styles.ozetAlt}>
            <View style={styles.ozetSatir}>
              <Text style={styles.ozetLabel}>Ara Toplam</Text>
              <Text style={styles.ozetDeger}>{toplamFiyat}₺</Text>
            </View>
            <View style={styles.ozetSatir}>
              <Text style={styles.ozetLabel}>Teslimat</Text>
              <Text style={styles.ozetDeger}>10₺</Text>
            </View>
            <View style={[styles.ozetSatir, { marginBottom: 15 }]}>
              <Text style={styles.toplamLabel}>Toplam</Text>
              <Text style={styles.toplamDeger}>{toplamFiyat + 10}₺</Text>
            </View>
            <TouchableOpacity style={styles.anaBtn} onPress={() => setOdemeSayfasi(true)}>
              <Text style={styles.anaBtnMetin}>Ödeme Sayfasına Git →</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // ── Ödeme Sayfası ──────────────────────────────────────────────────────
        <ScrollView style={styles.liste} showsVerticalScrollIndicator={false}>

          <View style={styles.bolum}>
            <Text style={styles.bolumBaslik}>📍 Teslimat Adresi</Text>
            <TextInput
              style={styles.input}
              placeholder="Mahalle, sokak, bina no, daire..."
              multiline numberOfLines={3}
              value={adres} onChangeText={setAdres}
            />
          </View>

          <View style={styles.bolum}>
            <Text style={styles.bolumBaslik}>🎟️ Kupon Kodu</Text>
            <View style={styles.kuponSatir}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Örn: YEM10"
                value={kuponKod}
                onChangeText={setKuponKod}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.siyahBtn} onPress={kuponUygula}>
                <Text style={styles.siyahBtnMetin}>Uygula</Text>
              </TouchableOpacity>
            </View>
            {indirimOrani > 0 && (
              <Text style={styles.indirimUyg}>✅ %{indirimOrani * 100} indirim uygulandı!</Text>
            )}
          </View>

          <View style={styles.bolum}>
            <Text style={styles.bolumBaslik}>💳 Ödeme Yöntemi</Text>
            <TouchableOpacity
              style={[styles.secenekKart, odemeYontemi === 'Kapida' && styles.secenekAktif]}
              onPress={() => setOdemeYontemi('Kapida')}
            >
              <Text style={styles.secenekMetin}>🏠 Kapıda Ödeme</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secenekKart, odemeYontemi === 'Online' && styles.secenekAktif]}
              onPress={() => setOdemeYontemi('Online')}
            >
              <Text style={styles.secenekMetin}>💳 Online Kredi Kartı</Text>
            </TouchableOpacity>

            {odemeYontemi === 'Online' && (
              <View style={styles.kartKutu}>
                <TextInput style={styles.input} placeholder="Kart Üzerindeki İsim"
                  value={kartIsim} onChangeText={setKartIsim} />
                <TextInput style={styles.input} placeholder="Kart Numarası (16 hane)"
                  keyboardType="numeric" maxLength={16}
                  value={kartNo} onChangeText={setKartNo} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="AA/YY"
                    value={kartSKT} onChangeText={setKartSKT} maxLength={5} />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="CVV"
                    secureTextEntry maxLength={3} keyboardType="numeric"
                    value={kartCVV} onChangeText={setKartCVV} />
                </View>
              </View>
            )}
          </View>

          <View style={styles.finalOzetKutu}>
            <View style={styles.ozetSatir}>
              <Text style={styles.ozetLabel}>Sepet Toplamı</Text>
              <Text style={styles.ozetDeger}>{toplamFiyat}₺</Text>
            </View>
            <View style={styles.ozetSatir}>
              <Text style={styles.ozetLabel}>Teslimat Ücreti</Text>
              <Text style={styles.ozetDeger}>10₺</Text>
            </View>
            {indirimTutari > 0 && (
              <View style={styles.ozetSatir}>
                <Text style={[styles.ozetLabel, { color: 'green' }]}>İndirim</Text>
                <Text style={[styles.ozetDeger, { color: 'green' }]}>-{indirimTutari}₺</Text>
              </View>
            )}
            <View style={[styles.ozetSatir, styles.toplamSatir]}>
              <Text style={styles.toplamLabel}>TOPLAM</Text>
              <Text style={styles.toplamDeger}>{sonToplam}₺</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.tamamlaBtn} onPress={siparisOnayla}>
            <Text style={styles.anaBtnMetin}>✅ Siparişi Onayla</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setOdemeSayfasi(false)} style={styles.geriDon}>
            <Text style={styles.geriDonMetin}>← Sepete Geri Dön</Text>
          </TouchableOpacity>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f5f5' },
  header:       { backgroundColor: '#E8340A', padding: 15 },
  headerText:   { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  liste:        { padding: 15 },

  bosContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bosEmoji:     { fontSize: 60, marginBottom: 15 },
  bosText:      { fontSize: 20, fontWeight: 'bold', color: '#333' },
  bosAlt:       { fontSize: 14, color: '#888', marginTop: 5 },

  urunKart: {
    backgroundColor: '#fff', padding: 15, borderRadius: 15,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
  },
  urunBilgi:    { flex: 1 },
  urunIsim:     { fontSize: 16, fontWeight: 'bold', color: '#222' },
  urunRestoran: { fontSize: 12, color: '#888', marginTop: 2 },
  secimDetay:   { fontSize: 11, color: '#666', marginTop: 2 },
  urunFiyat:    { fontSize: 15, color: '#E8340A', fontWeight: 'bold', marginTop: 5 },

  adetKontrol:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  adetBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center',
  },
  ekleBtn:      { backgroundColor: '#E8340A' },
  ekleBtnText:  { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  adetBtnText:  { fontSize: 20, fontWeight: 'bold', color: '#333' },
  adetSayi:     { fontSize: 16, fontWeight: 'bold', minWidth: 20, textAlign: 'center' },

  ozetAlt: {
    backgroundColor: '#fff', padding: 20,
    borderTopLeftRadius: 25, borderTopRightRadius: 25, elevation: 5,
  },
  ozetSatir:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  ozetLabel:   { fontSize: 14, color: '#555' },
  ozetDeger:   { fontSize: 14, color: '#333', fontWeight: 'bold' },
  toplamLabel: { fontSize: 17, fontWeight: 'bold', color: '#222' },
  toplamDeger: { fontSize: 19, fontWeight: 'bold', color: '#E8340A' },
  toplamSatir: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginTop: 4 },

  anaBtn:      { backgroundColor: '#E8340A', padding: 18, borderRadius: 15, alignItems: 'center' },
  anaBtnMetin: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  bolum:       { marginBottom: 20 },
  bolumBaslik: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 10 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 14,
  },
  kuponSatir:    { flexDirection: 'row', gap: 10 },
  siyahBtn:      { backgroundColor: '#333', paddingHorizontal: 20, borderRadius: 10, justifyContent: 'center' },
  siyahBtnMetin: { color: '#fff', fontWeight: 'bold' },
  indirimUyg:    { color: 'green', fontSize: 13, marginTop: 6 },

  secenekKart: {
    backgroundColor: '#fff', padding: 15, borderRadius: 10,
    borderWidth: 1, borderColor: '#ddd', marginBottom: 8,
  },
  secenekAktif: { borderColor: '#E8340A', backgroundColor: '#FFF0EE' },
  secenekMetin: { fontSize: 15, color: '#333' },
  kartKutu:     { padding: 10, backgroundColor: '#fafafa', borderRadius: 10, marginTop: 5 },

  finalOzetKutu: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15 },

  tamamlaBtn: {
    backgroundColor: '#28a745', padding: 18,
    borderRadius: 15, alignItems: 'center', marginBottom: 10,
  },
  geriDon:      { alignItems: 'center', padding: 15, marginBottom: 20 },
  geriDonMetin: { color: '#888', fontSize: 14 },
});