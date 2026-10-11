import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Image, TextInput, Pressable, Animated, Easing, ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { AVATARS, STAT_LABELS, STAT_KEYS, TYPE_COLORS, TYPE_NAMES } from '../data/meta';
import { spriteCandidates } from '../services/pokeApi';
import { takePhoto, pickPhoto } from '../services/photo';

// ---------- Animações utilitárias ----------
export function useLoop(enabled, duration = 1600) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) { v.setValue(0); return undefined; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [enabled, duration, v]);
  return v;
}

export function FadeIn({ delay = 0, children, style }) {
  const { settings } = useApp();
  const v = useRef(new Animated.Value(settings.animations ? 0 : 1)).current;
  useEffect(() => {
    if (!settings.animations) return undefined;
    const a = Animated.timing(v, { toValue: 1, duration: 320, delay, useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [delay, settings.animations, v]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

// Toque com resposta visual (escala).
export function Tap({ onPress, style, containerStyle, children, disabled, label, hitSlop = 6 }) {
  const { settings } = useApp();
  const scale = useRef(new Animated.Value(1)).current;
  const to = (val) => {
    if (!settings.animations) return;
    Animated.spring(scale, { toValue: val, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };
  return (
    <Pressable
      onPress={onPress} onPressIn={() => to(0.95)} onPressOut={() => to(1)} disabled={disabled}
      accessibilityRole="button" accessibilityLabel={label} hitSlop={hitSlop} style={containerStyle}
    >
      <Animated.View style={[style, { transform: [{ scale }], opacity: disabled ? 0.5 : 1 }]}>{children}</Animated.View>
    </Pressable>
  );
}

// ---------- Botões e campos ----------
export function Button({ title, onPress, icon, variant = 'primary', disabled, loading, style }) {
  const { colors } = useApp();
  const primary = variant === 'primary';
  const fg = primary ? colors.onPrimary : variant === 'danger' ? colors.danger : colors.primary;
  const inner = (
    <View style={styles.btnRow}>
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
      <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
    </View>
  );
  return (
    <Tap onPress={onPress} disabled={disabled || loading} label={title} style={style}>
      {primary ? (
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.btn}>{inner}</LinearGradient>
      ) : (
        <View style={[styles.btn, { borderWidth: 2, borderColor: variant === 'danger' ? colors.danger : colors.primary, backgroundColor: colors.surface }]}>
          {inner}
        </View>
      )}
    </Tap>
  );
}

export function IconButton({ name, onPress, label, color, size = 24, style }) {
  const { colors } = useApp();
  return (
    <Tap onPress={onPress} label={label} style={[styles.iconBtn, style]}>
      <Ionicons name={name} size={size} color={color || colors.text} />
    </Tap>
  );
}

export function Field({ label, error, secure, style, ...props }) {
  const { colors } = useApp();
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {label ? <Text style={[styles.label, { color: colors.muted }]}>{label}</Text> : null}
      <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }]}>
        <TextInput
          {...props}
          secureTextEntry={hidden}
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text }]}
          accessibilityLabel={label}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}>
            <Ionicons name={hidden ? 'eye' : 'eye-off'} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

export function SearchBar({ value, onChangeText, placeholder }) {
  const { colors } = useApp();
  return (
    <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name="search" size={18} color={colors.muted} />
      <TextInput
        value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted}
        style={[styles.searchInput, { color: colors.text }]} autoCapitalize="none" autoCorrect={false}
        returnKeyType="search" accessibilityLabel={placeholder}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} accessibilityLabel="Limpar busca">
          <Ionicons name="close-circle" size={18} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Chip({ label, active, onPress, color }) {
  const { colors } = useApp();
  const bg = active ? (color || colors.primary) : colors.surface;
  return (
    <Tap onPress={onPress} label={label} style={[styles.chip, { backgroundColor: bg, borderColor: active ? bg : colors.border }]}>
      <Text style={{ color: active ? '#FFF' : colors.text, fontWeight: '700', fontSize: 12 }}>{label}</Text>
    </Tap>
  );
}

export function Card({ children, style }) {
  const { colors } = useApp();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children }) {
  const { colors } = useApp();
  return <Text style={[styles.sectionTitle, { color: colors.primary }]}>{children}</Text>;
}

export function Empty({ icon = 'sad-outline', title, text, actionLabel, onAction }) {
  const { colors } = useApp();
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={46} color={colors.muted} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      {text ? <Text style={[styles.emptyText, { color: colors.muted }]}>{text}</Text> : null}
      {actionLabel ? <Button title={actionLabel} onPress={onAction} variant="outline" style={{ marginTop: 14 }} /> : null}
    </View>
  );
}

export function Loading({ text = 'Carregando...' }) {
  const { colors } = useApp();
  return (
    <View style={styles.empty}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.emptyText, { color: colors.muted, marginTop: 10 }]}>{text}</Text>
    </View>
  );
}

// ---------- Pokémon ----------
export function TypePill({ type, small }) {
  return (
    <View style={[styles.pill, { backgroundColor: TYPE_COLORS[type] || '#888' }, small && { paddingHorizontal: 7, paddingVertical: 1 }]}>
      <Text style={[styles.pillText, small && { fontSize: 9 }]}>{(TYPE_NAMES[type] || type).toUpperCase()}</Text>
    </View>
  );
}

const POKEBALL_IMG = require('../../assets/pokeball.png');

// Poké Bola em pixel art (usada em todas as telas).
export function Pokeball({ size = 96, animated = false, style }) {
  const { settings } = useApp();
  const v = useLoop(animated && settings.animations, 900);
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '12deg'] });
  const lift = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -8, 0] });
  return (
    <Animated.Image
      source={POKEBALL_IMG} resizeMode="contain" accessibilityIgnoresInvertColors
      style={[{ width: size, height: size, transform: [{ translateY: lift }, { rotate }] }, style]}
    />
  );
}

function Led({ color, border, duration }) {
  const { settings } = useApp();
  const v = useLoop(settings.animations, duration);
  return (
    <Animated.View
      style={{
        width: 9, height: 9, borderRadius: 5, backgroundColor: color, borderWidth: 1.5, borderColor: border,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.2] }),
      }}
    />
  );
}

// Lente azul + LEDs piscando, como na Pokédex.
export function PokedexLights({ size = 30 }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <LinearGradient
        colors={['#AADDFF', '#2299FF', '#0044BB']}
        style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2.5, borderColor: '#FFFFFF', overflow: 'hidden' }}
      >
        <View style={{ position: 'absolute', top: size * 0.15, left: size * 0.2, width: size * 0.3, height: size * 0.18, borderRadius: size * 0.09, backgroundColor: 'rgba(255,255,255,0.75)', transform: [{ rotate: '-30deg' }] }} />
      </LinearGradient>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <Led color="#FF5252" border="#7A0000" duration={700} />
        <Led color="#FFD600" border="#8A6D00" duration={900} />
        <Led color="#4CAF50" border="#1B5E20" duration={1100} />
      </View>
    </View>
  );
}

// Botão de alternar tema claro/escuro (usado no topo de todas as telas).
export function ThemeToggle({ color = '#FFFFFF' }) {
  const { settings, updateSettings } = useApp();
  const dark = settings.theme === 'dark';
  return (
    <IconButton
      name={dark ? 'sunny' : 'moon'} color={color}
      label={dark ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'}
      onPress={() => updateSettings({ theme: dark ? 'light' : 'dark' })}
    />
  );
}

function SpriteInner({ urls, size, colors }) {
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  if (idx >= urls.length) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
        <Pokeball size={size * 0.5} />
      </View>
    );
  }
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={{ uri: urls[idx] }} style={{ width: size, height: size }} resizeMode="contain" fadeDuration={150}
        onLoadEnd={() => setLoading(false)} onError={() => { setLoading(true); setIdx((i) => i + 1); }}
        accessibilityIgnoresInvertColors
      />
      {loading ? <ActivityIndicator style={StyleSheet.absoluteFill} color={colors.primary} /> : null}
    </View>
  );
}

export function PokeImage({ slug, size = 80, shiny = false, animated = false }) {
  const { colors } = useApp();
  const urls = useMemo(() => spriteCandidates(slug, { shiny, animated }), [slug, shiny, animated]);
  return <SpriteInner key={urls.join('|')} urls={urls} size={size} colors={colors} />;
}

export function StatBar({ label, value, max = 180, color }) {
  const { colors, settings } = useApp();
  const w = useRef(new Animated.Value(settings.animations ? 0 : 1)).current;
  const pct = Math.min(1, value / max);
  useEffect(() => {
    if (!settings.animations) { w.setValue(1); return undefined; }
    const a = Animated.timing(w, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    a.start();
    return () => a.stop();
  }, [settings.animations, w]);
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <View style={[styles.statTrack, { backgroundColor: colors.surfaceAlt }]}>
        <Animated.View style={{ height: '100%', borderRadius: 4, backgroundColor: color || colors.primary, width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${pct * 100}%`] }) }} />
      </View>
    </View>
  );
}

export function StatsBlock({ stats, max = 180, showTotal }) {
  const total = STAT_KEYS.reduce((s, k) => s + stats[k], 0);
  const { colors } = useApp();
  return (
    <View>
      {STAT_KEYS.map((k) => <StatBar key={k} label={STAT_LABELS[k]} value={stats[k]} max={max} />)}
      {showTotal ? <Text style={{ color: colors.muted, marginTop: 4, fontWeight: '700' }}>Total: {total}</Text> : null}
    </View>
  );
}

export function Avatar({ id, photo, size = 56 }) {
  const av = AVATARS.find((a) => a.id === id);
  const box = {
    width: size, height: size, borderRadius: size / 2, borderWidth: 3, borderColor: '#FFFFFF', overflow: 'hidden',
    backgroundColor: av ? `${av.color}55` : '#888', alignItems: 'center', justifyContent: 'center',
  };
  if (photo) return <View style={box}><Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} /></View>;
  if (av) return <View style={box}><Image source={av.bust} style={{ width: '100%', height: '100%' }} resizeMode="cover" /></View>;
  return <View style={box}><Ionicons name="person" size={size * 0.55} color="#FFFFFF" /></View>;
}

function PickerBtn({ icon, label, onPress, disabled, danger, fill }) {
  const { colors } = useApp();
  const c = danger ? colors.danger : colors.primary;
  return (
    <Tap onPress={onPress} disabled={disabled} label={label} containerStyle={fill ? { flex: 1 } : undefined}
      style={[pickerStyles.btn, { borderColor: c, backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={16} color={c} />
      <Text numberOfLines={1} style={{ color: c, fontWeight: '800', fontSize: 12 }}>{label}</Text>
    </Tap>
  );
}

// Foto (câmera/galeria) e protagonista são escolhas independentes. onChange(avatar, photo)
export function AvatarPicker({ avatar, photo, onChange }) {
  const { colors } = useApp();
  const [busy, setBusy] = useState(false);

  const getPhoto = async (fn) => {
    setBusy(true);
    try {
      const uri = await fn();
      if (uri) onChange(avatar, uri);
    } catch (e) {
      Alert.alert('Não foi possível usar a foto', e.message || 'Tente novamente.');
    } finally { setBusy(false); }
  };

  return (
    <View>
      <Text style={[pickerStyles.label, { color: colors.muted }]}>SUA FOTO (OPCIONAL)</Text>
      <View style={pickerStyles.photoRow}>
        <View style={{ flexShrink: 0 }}>
          <Avatar id={avatar} photo={photo} size={76} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PickerBtn fill icon="camera" label="Tirar foto" onPress={() => getPhoto(takePhoto)} disabled={busy} />
            <PickerBtn fill icon="images" label="Galeria" onPress={() => getPhoto(pickPhoto)} disabled={busy} />
          </View>
          {photo ? (
            <View style={{ marginTop: 8 }}>
              <PickerBtn icon="trash" label="Remover foto" danger onPress={() => onChange(avatar, null)} />
            </View>
          ) : null}
        </View>
      </View>

      <Text style={[pickerStyles.label, { color: colors.muted, marginTop: 18 }]}>ESCOLHA SEU PROTAGONISTA</Text>
      <View style={pickerStyles.grid}>
        {AVATARS.map((a) => {
          const sel = avatar === a.id;
          return (
            <Tap key={a.id} onPress={() => onChange(a.id, photo)} label={`Protagonista ${a.name}`} containerStyle={{ width: '31%' }}
              style={[pickerStyles.tile, { backgroundColor: colors.surfaceAlt, borderColor: sel ? colors.primary : colors.border }]}>
              <View style={{ height: 110, width: '100%' }}>
                <Image source={a.full} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              </View>
              <Text numberOfLines={1} style={{ color: sel ? colors.primary : colors.text, fontWeight: '800', fontSize: 12, marginTop: 6 }}>{a.name}</Text>
              {sel ? <View style={[pickerStyles.check, { backgroundColor: colors.primary }]}><Ionicons name="checkmark" size={12} color="#FFF" /></View> : null}
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderRadius: 12, minHeight: 42, paddingHorizontal: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { alignItems: 'center', borderWidth: 2, borderRadius: 16, paddingTop: 8, paddingBottom: 8, paddingHorizontal: 6 },
  check: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

const styles = StyleSheet.create({
  btn: { minHeight: 48, borderRadius: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 4, letterSpacing: 0.4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, minHeight: 48 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  error: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 12, minHeight: 46 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 8 },
  chip: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7, marginRight: 6 },
  card: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12, elevation: 2, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  sectionTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  empty: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '800', marginTop: 10, textAlign: 'center' },
  emptyText: { fontSize: 13, marginTop: 4, textAlign: 'center', lineHeight: 19 },
  pill: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  statLabel: { width: 78, fontSize: 12, fontWeight: '700' },
  statValue: { width: 34, fontSize: 13, fontWeight: '800' },
  statTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  avatarItem: { width: '23%', alignItems: 'center', paddingVertical: 8, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
});