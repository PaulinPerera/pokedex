import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Animated, BackHandler, Pressable, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { NavContext } from '../navigation';
import { Avatar, IconButton, Tap } from './Ui';
import HomeScreen from '../screens/HomeScreen';
import RandomizeScreen from '../screens/RandomizeScreen';
import AltDexScreen from '../screens/AltDexScreen';
import DexScreen from '../screens/DexScreen';
import PCScreen from '../screens/PCScreen';
import BagScreen from '../screens/BagScreen';
import IdentityScreen from '../screens/IdentityScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StarterScreen from '../screens/StarterScreen';

const SCREENS = {
  Home: { C: HomeScreen, title: 'Pokédex' },
  Randomize: { C: RandomizeScreen, title: 'Randomizar' },
  AltDex: { C: AltDexScreen, title: 'Pokédex' },
  Dex: { C: DexScreen, title: 'Pokédex completa' },
  PC: { C: PCScreen, title: 'Pokémon / PC' },
  Bag: { C: BagScreen, title: 'Bag' },
  Identity: { C: IdentityScreen, title: 'Identidade' },
  Settings: { C: SettingsScreen, title: 'Configurações' },
  Starter: { C: StarterScreen, title: 'Escolha seu inicial' },
};

// Exatamente três destinos na barra inferior.
const TABS = [
  { route: 'Home', label: 'Início', icon: 'home' },
  { route: 'Randomize', label: 'Randomizar', icon: 'shuffle' },
  { route: 'AltDex', label: 'Pokédex', icon: 'tablet-portrait' },
];

const MENU = [
  { route: 'Dex', label: 'Pokédex completa', icon: 'book' },
  { route: 'PC', label: 'Pokémon / PC', icon: 'albums' },
  { route: 'Bag', label: 'Bag', icon: 'bag-handle' },
  { route: 'Identity', label: 'Identidade', icon: 'id-card' },
  { route: 'Settings', label: 'Configurações', icon: 'settings' },
];

const DRAWER_W = Math.min(300, Dimensions.get('window').width * 0.8);

export default function Shell() {
  const { colors, settings, profile, pc } = useApp();
  const insets = useSafeAreaInsets();
  const [route, setRoute] = useState('Home');
  const [menuOpen, setMenuOpen] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const drawer = useRef(new Animated.Value(0)).current;

  const navigate = useCallback((r) => { setMenuOpen(false); setRoute(r); }, []);
  const goHome = useCallback(() => { setMenuOpen(false); setRoute('Home'); }, []);

  useEffect(() => {
    if (!settings.animations) { fade.setValue(1); return undefined; }
    fade.setValue(0);
    const a = Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [route, settings.animations, fade]);

  useEffect(() => {
    const a = Animated.timing(drawer, { toValue: menuOpen ? 1 : 0, duration: settings.animations ? 240 : 0, useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [menuOpen, settings.animations, drawer]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuOpen) { setMenuOpen(false); return true; }
      if (route !== 'Home') { setRoute('Home'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [menuOpen, route]);

  const nav = useMemo(() => ({ navigate, goHome, route }), [navigate, goHome, route]);
  const { C, title } = SCREENS[route];
  const fullScreen = route === 'Starter';

  return (
    <NavContext.Provider value={nav}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={[styles.header, { paddingTop: insets.top + 6 }]}>
          {fullScreen ? (
            <IconButton name="chevron-back" label="Voltar" onPress={goHome} color="#FFF" />
          ) : (
            <IconButton name="menu" label="Abrir menu" onPress={() => setMenuOpen(true)} color="#FFF" />
          )}
          <Text style={styles.headerTitle} numberOfLines={1} accessibilityRole="header">{title}</Text>
          <View style={styles.countBadge} accessibilityLabel={`${pc.length} Pokémon no PC`}>
            <Ionicons name="albums" size={14} color="#FFF" />
            <Text style={styles.countText}>{pc.length}</Text>
          </View>
        </LinearGradient>

        <Animated.View
          key={route}
          style={{ flex: 1, opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}
        >
          <C />
        </Animated.View>

        {!fullScreen ? (
          <View style={[styles.tabs, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 8) }]}>
            {TABS.map((t) => {
              const active = route === t.route;
              return (
                <Tap key={t.route} onPress={() => navigate(t.route)} label={t.label} containerStyle={{ flex: 1 }} style={styles.tab}>
                  <View style={[styles.tabIcon, active && { backgroundColor: colors.primary }]}>
                    <Ionicons name={t.icon} size={22} color={active ? '#FFF' : colors.muted} />
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: active ? '800' : '600', color: active ? colors.primary : colors.muted }}>{t.label}</Text>
                </Tap>
              );
            })}
          </View>
        ) : null}

        {/* Menu principal (drawer) */}
        <View pointerEvents={menuOpen ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay, opacity: drawer }]}>
            <Pressable style={{ flex: 1 }} onPress={() => setMenuOpen(false)} accessibilityLabel="Fechar menu" />
          </Animated.View>
          <Animated.View
            style={[styles.drawer, {
              width: DRAWER_W, backgroundColor: colors.surface, paddingTop: insets.top + 12,
              transform: [{ translateX: drawer.interpolate({ inputRange: [0, 1], outputRange: [-DRAWER_W, 0] }) }],
            }]}
          >
            <View style={styles.drawerProfile}>
              <Avatar id={profile.avatar} size={52} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16 }} numberOfLines={1}>{profile.username}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{pc.length} Pokémon no PC</Text>
              </View>
            </View>
            {MENU.map((m) => (
              <Tap key={m.route} onPress={() => navigate(m.route)} label={m.label}
                style={[styles.menuItem, route === m.route && { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name={m.icon} size={22} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{m.label}</Text>
              </Tap>
            ))}
          </Animated.View>
        </View>
      </View>
    </NavContext.Provider>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 8, elevation: 6 },
  headerTitle: { flex: 1, color: '#FFF', fontSize: 19, fontWeight: '900', letterSpacing: 0.5, marginLeft: 4 },
  countBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#00000033', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6 },
  countText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  tabs: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 6 },
  tab: { alignItems: 'center', gap: 2 },
  tabIcon: { width: 46, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  drawer: { position: 'absolute', top: 0, bottom: 0, left: 0, paddingHorizontal: 12, elevation: 12 },
  drawerProfile: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18, paddingHorizontal: 6 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 14, marginBottom: 4 },
});
