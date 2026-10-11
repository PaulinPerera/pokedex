// Pokédex alternativa: aparelho retrô inspirado no protótipo, com busca em todo o catálogo carregado.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, Animated, Easing, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { findInCatalog, loadCatalog } from '../services/pokeApi';
import { CONFIG } from '../config';
import { PokeImage, TypePill, Empty } from '../components/Ui';
import { useApp } from '../context/AppContext';

function Btn({ onPress, style, children, label }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}
      style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.92 }], opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

export default function AltDexScreen() {
  const { settings } = useApp();
  const [catalog, setCatalog] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [input, setInput] = useState('');
  const [pokemon, setPokemon] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [shiny, setShiny] = useState(false);

  const led = useRef(new Animated.Value(1)).current;
  const pokeAnim = useRef(new Animated.Value(0)).current;
  const scanRotate = useRef(new Animated.Value(0)).current;
  const scanLine = useRef(new Animated.Value(0)).current;
  const loops = useRef([]);
  const timer = useRef(null);

  const load = useCallback(() => {
    setLoadError(false);
    loadCatalog().then(setCatalog).catch(() => setLoadError(true));
  }, []);
  useEffect(load, [load]);

  const stopScan = useCallback(() => {
    clearTimeout(timer.current);
    loops.current.forEach((l) => l.stop());
    loops.current = [];
    scanRotate.setValue(0);
    scanLine.setValue(0);
  }, [scanRotate, scanLine]);

  // LED piscando + limpeza total ao sair da tela.
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(led, { toValue: 0.15, duration: 800, useNativeDriver: true }),
      Animated.timing(led, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]));
    if (settings.animations) l.start();
    return () => { l.stop(); stopScan(); pokeAnim.stopAnimation(); };
  }, [led, settings.animations, stopScan, pokeAnim]);

  const show = useCallback((species) => {
    setPokemon(species);
    setNotFound(!species);
    if (species) {
      pokeAnim.setValue(settings.animations ? 0 : 1);
      if (settings.animations) Animated.spring(pokeAnim, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
    }
  }, [pokeAnim, settings.animations]);

  const run = useCallback((resolve) => {
    if (!catalog) return;
    stopScan();
    setScanning(true); setNotFound(false); setPokemon(null); setShiny(false);
    if (settings.animations) {
      const a = Animated.loop(Animated.timing(scanRotate, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true }));
      const b = Animated.loop(Animated.timing(scanLine, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true }));
      loops.current = [a, b];
      a.start(); b.start();
    }
    timer.current = setTimeout(() => {
      stopScan();
      setScanning(false);
      show(resolve());
    }, settings.animations ? CONFIG.SCAN_DURATION_MS : 0);
  }, [catalog, settings.animations, scanRotate, scanLine, stopScan, show]);

  const buscar = () => { if (input.trim()) run(() => findInCatalog(input, catalog)); };
  const step = (dir) => {
    if (!catalog || !catalog.length) return;
    const idx = pokemon ? catalog.findIndex((s) => s.id === pokemon.id) : -1;
    const next = catalog[(idx + dir + catalog.length) % catalog.length];
    setInput(next.name);
    run(() => next);
  };
  const aleatorio = () => {
    if (!catalog || !catalog.length) return;
    const s = catalog[Math.floor(Math.random() * catalog.length)];
    setInput(s.name);
    run(() => s);
  };
  const limpar = () => { stopScan(); setScanning(false); setPokemon(null); setNotFound(false); setInput(''); setShiny(false); };

  if (loadError) return <Empty icon="cloud-offline" title="Falha ao carregar os dados" text="Não foi possível carregar o catálogo." actionLabel="Tentar de novo" onAction={load} />;

  const spin = scanRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const lineY = scanLine.interpolate({ inputRange: [0, 1], outputRange: [-250, 250] });

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#FF2222', '#CC0000', '#AA0000']} style={styles.device} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <LinearGradient colors={['#FF4444', '#DD1111']} style={styles.topHalf}>
          <View style={styles.headerBar}>
            <LinearGradient colors={['#AADDFF', '#2299FF', '#0044BB']} style={styles.bigLens}><View style={styles.lensGlare} /></LinearGradient>
            <View style={styles.smallLeds}>
              <Animated.View style={[styles.smallLed, styles.ledR, { opacity: led }]} />
              <View style={[styles.smallLed, styles.ledY]} />
              <View style={[styles.smallLed, styles.ledG]} />
            </View>
          </View>

          <View style={styles.screenWrap}>
            <View style={styles.screenBezel}>
              <View style={styles.screen}>
                {scanning ? <Animated.View style={[styles.scanline, { transform: [{ translateY: lineY }] }]} /> : null}
                {!catalog && !scanning ? (
                  <Text style={styles.idleLabel}>CARREGANDO...</Text>
                ) : null}
                {catalog && !scanning && !pokemon && !notFound ? (
                  <View style={styles.center}>
                    <Text style={styles.idleQuestion}>?</Text>
                    <Text style={styles.idleLabel}>{'AGUARDANDO\nDADOS...'}</Text>
                  </View>
                ) : null}
                {scanning ? (
                  <View style={styles.center}>
                    <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
                    <Text style={styles.scanLabel}>ANALISANDO...</Text>
                  </View>
                ) : null}
                {notFound && !scanning ? (
                  <View style={styles.center}>
                    <Text style={styles.noIcon}>✕</Text>
                    <Text style={styles.noLabel}>{'NÃO\nENCONTRADO'}</Text>
                  </View>
                ) : null}
                {pokemon && !scanning ? (
                  <Animated.View style={[styles.pokeDisplay, { opacity: pokeAnim, transform: [{ scale: pokeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]}>
                    <Text style={styles.pokeNum}>#{String(pokemon.id).padStart(3, '0')}{shiny ? '  ✨' : ''}</Text>
                    <PokeImage slug={pokemon.slug} size={140} shiny={shiny} animated />
                  </Animated.View>
                ) : null}
              </View>
              {pokemon && !scanning ? (
                <Animated.View style={[styles.infoStrip, { opacity: pokeAnim }]}>
                  <Text style={styles.pokeName}>{pokemon.name}</Text>
                  <View style={styles.typesRow}>{pokemon.types.map((t) => <TypePill key={t} type={t} small />)}</View>
                  <Text style={styles.pokeDesc}>{pokemon.desc}</Text>
                </Animated.View>
              ) : null}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.hinge}><View style={styles.hingeDots}>{[...Array(6)].map((_, i) => <View key={i} style={styles.hingeDot} />)}</View></View>

        <View style={styles.bottomHalf}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput} placeholder="Nome ou nº do Pokémon..." placeholderTextColor="rgba(255,255,255,0.45)"
              value={input} onChangeText={setInput} onSubmitEditing={buscar} returnKeyType="search" autoCapitalize="none" autoCorrect={false}
              accessibilityLabel="Buscar Pokémon"
            />
            <Btn onPress={buscar} label="Buscar" style={styles.searchOk}><Text style={styles.searchOkText}>BUSCAR</Text></Btn>
          </View>

          <View style={styles.controlsRow}>
            <View style={styles.dpad}>
              <Btn label="Anterior" onPress={() => step(-1)} style={[styles.dpadBtn, { top: 0, left: 23 }]}><Text style={styles.dpadText}>▲</Text></Btn>
              <Btn label="Próximo" onPress={() => step(1)} style={[styles.dpadBtn, { bottom: 0, left: 23 }]}><Text style={styles.dpadText}>▼</Text></Btn>
              <Btn label="Anterior" onPress={() => step(-1)} style={[styles.dpadBtn, { left: 0, top: 23 }]}><Text style={styles.dpadText}>◀</Text></Btn>
              <Btn label="Próximo" onPress={() => step(1)} style={[styles.dpadBtn, { right: 0, top: 23 }]}><Text style={styles.dpadText}>▶</Text></Btn>
              <View style={styles.dpadCenter} />
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Btn label="A: buscar" onPress={buscar} style={[styles.actionBtn, { backgroundColor: '#FF4444' }]}><Text style={styles.actionBtnText}>A</Text></Btn>
                <Btn label="B: limpar" onPress={limpar} style={[styles.actionBtn, { backgroundColor: '#4444FF' }]}><Text style={styles.actionBtnText}>B</Text></Btn>
              </View>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                <Btn label="Select: alternar shiny" onPress={() => pokemon && setShiny((s) => !s)} style={styles.selectStart}><Text style={styles.selectStartText}>SHINY</Text></Btn>
                <Btn label="Start: aleatório" onPress={aleatorio} style={styles.selectStart}><Text style={styles.selectStartText}>RANDOM</Text></Btn>
              </View>
            </View>
          </View>
          <Text style={styles.help}>▲▼◀▶ navegam pelo catálogo • A busca • B limpa</Text>
        </View>
      </LinearGradient>
      <View style={styles.bottomHinge} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 12 },
  device: { width: '100%', maxWidth: 380, borderRadius: 24, borderWidth: 3, borderColor: '#880000', elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.6, shadowRadius: 18, overflow: 'hidden' },
  topHalf: { borderTopLeftRadius: 21, borderTopRightRadius: 21, paddingBottom: 14, borderBottomWidth: 3, borderBottomColor: '#880000' },
  headerBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10, gap: 8 },
  bigLens: { width: 48, height: 48, borderRadius: 24, borderWidth: 4, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', elevation: 4 },
  lensGlare: { position: 'absolute', top: 8, left: 10, width: 14, height: 8, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.7)', transform: [{ rotate: '-30deg' }] },
  smallLeds: { flexDirection: 'row', gap: 6, marginLeft: 4 },
  smallLed: { width: 14, height: 14, borderRadius: 7 },
  ledR: { backgroundColor: '#FF4444', borderWidth: 2, borderColor: '#660000' },
  ledY: { backgroundColor: '#FFCC00', borderWidth: 2, borderColor: '#AA8800' },
  ledG: { backgroundColor: '#44CC44', borderWidth: 2, borderColor: '#228822' },
  screenWrap: { paddingHorizontal: 14 },
  screenBezel: { backgroundColor: '#C8C8C8', borderRadius: 10, padding: 10, borderWidth: 2, borderColor: '#999' },
  screen: { backgroundColor: '#0D1F0D', borderRadius: 6, height: 200, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#000' },
  scanline: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(100,255,100,0.08)', zIndex: 2 },
  center: { alignItems: 'center' },
  idleQuestion: { fontSize: 60, color: 'rgba(51,255,51,0.2)', lineHeight: 68 },
  idleLabel: { fontSize: 9, color: 'rgba(51,255,51,0.45)', fontWeight: '900', letterSpacing: 2, textAlign: 'center', lineHeight: 16, fontFamily: 'monospace' },
  spinner: { width: 40, height: 40, borderWidth: 3, borderColor: 'rgba(100,255,100,0.6)', borderTopColor: '#44FF44', borderRadius: 20, marginBottom: 12 },
  scanLabel: { fontSize: 9, color: 'rgba(51,255,51,0.85)', fontWeight: '900', letterSpacing: 2, fontFamily: 'monospace' },
  noIcon: { fontSize: 40, color: '#FF4444', marginBottom: 8 },
  noLabel: { fontSize: 9, color: '#FF6666', fontWeight: '900', letterSpacing: 2, textAlign: 'center', lineHeight: 18, fontFamily: 'monospace' },
  pokeDisplay: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  pokeNum: { position: 'absolute', top: 8, left: 10, fontSize: 10, color: 'rgba(51,255,51,0.6)', fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace' },
  infoStrip: { marginTop: 8, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  pokeName: { fontSize: 16, fontWeight: '900', color: '#FFF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 },
  typesRow: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  pokeDesc: { fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 16 },
  hinge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 10, backgroundColor: '#660000' },
  hingeDots: { flexDirection: 'row', gap: 6 },
  hingeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' },
  bottomHalf: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 14 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  searchInput: { flex: 1, height: 42, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, color: '#FFF', fontSize: 13, fontWeight: '700' },
  searchOk: { height: 42, paddingHorizontal: 12, backgroundColor: '#0055CC', borderRadius: 8, borderWidth: 2, borderColor: '#003399', alignItems: 'center', justifyContent: 'center' },
  searchOkText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace' },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dpad: { width: 73, height: 73 },
  dpadBtn: { position: 'absolute', width: 27, height: 27, backgroundColor: '#333', borderRadius: 4, borderWidth: 1, borderColor: '#222', alignItems: 'center', justifyContent: 'center' },
  dpadText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  dpadCenter: { position: 'absolute', top: 23, left: 23, width: 27, height: 27, backgroundColor: '#333' },
  actionBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
  selectStart: { height: 20, paddingHorizontal: 8, borderRadius: 10, backgroundColor: '#444', borderWidth: 1, borderColor: '#222', alignItems: 'center', justifyContent: 'center' },
  selectStartText: { color: 'rgba(255,255,255,0.7)', fontSize: 8, fontFamily: 'monospace', fontWeight: '700' },
  help: { color: 'rgba(255,255,255,0.55)', fontSize: 9, textAlign: 'center', fontFamily: 'monospace' },
  bottomHinge: { height: 12, backgroundColor: '#660000', width: '86%', maxWidth: 330, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, elevation: 4 },
});
