import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Animated, Easing, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { CONFIG } from '../config';
import { getSpecies, moveType } from '../services/pokeApi';
import { formatCountdown, nextMidnight, todayKey, ivTotal } from '../services/collection';
import { STAT_KEYS, STAT_LABELS, TYPE_COLORS } from '../data/meta';
import { Button, Card, Field, FadeIn, Pokeball, PokeImage, SectionTitle, StatBar, TypePill } from '../components/Ui';

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function RandomizeScreen() {
  const { colors, settings, game, pc, rollDaily, finalizeDaily } = useApp();
  const now = useNow();
  const [shaking, setShaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [nick, setNick] = useState('');
  const shake = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  useEffect(() => () => { clearTimeout(timer.current); shake.stopAnimation(); }, [shake]);

  const last = game.lastDraw;
  const pending = last && last.pending;
  const drewToday = !!last && last.date === todayKey(now);
  const blocked = !CONFIG.DEV_UNLIMITED_DRAWS && drewToday && !pending;
  const lastInst = last && !pending ? pc.find((p) => p.instanceId === last.instanceId) : null;

  const draw = async () => {
    setBusy(true);
    setShaking(true); // antes do await, para não piscar a tela de resultado
    if (settings.animations) {
      Animated.loop(Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 120, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 120, easing: Easing.linear, useNativeDriver: true }),
      ])).start();
    }
    try {
      await rollDaily(); // resultado já fica gravado aqui
      timer.current = setTimeout(() => {
        shake.stopAnimation(); shake.setValue(0); setShaking(false); setBusy(false);
      }, settings.animations ? 1100 : 0);
    } catch (e) {
      shake.stopAnimation(); shake.setValue(0); setShaking(false); setBusy(false);
      Alert.alert('Sorteio indisponível', e.message || 'Tente novamente.');
    }
  };

  const finish = async (withNick) => {
    setBusy(true);
    try { await finalizeDaily(withNick ? nick : ''); setNick(''); } catch (e) {
      Alert.alert('Não foi possível salvar', e.message || 'Tente novamente.');
    } finally { setBusy(false); }
  };

  const rot = shake.interpolate({ inputRange: [-1, 1], outputRange: ['-18deg', '18deg'] });

  // ---- Resultado pendente: apelido ou pular ----
  if (pending && !shaking) {
    const sp = getSpecies(pending.speciesId);
    const total = ivTotal(pending.ivs);
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <FadeIn>
            <Card style={{ alignItems: 'center' }}>
              {pending.shiny ? (
                <View style={styles.shiny}><Ionicons name="sparkles" size={16} color="#6A4A00" /><Text style={styles.shinyText}>SHINY!</Text></View>
              ) : null}
              <Text style={{ color: colors.muted, fontWeight: '800', letterSpacing: 1 }}>VOCÊ ENCONTROU</Text>
              <PokeImage slug={sp.slug} size={170} shiny={pending.shiny} animated />
              <Text style={{ color: colors.text, fontSize: 26, fontWeight: '900' }}>{sp.name}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>{sp.types.map((t) => <TypePill key={t} type={t} />)}</View>
            </Card>
          </FadeIn>
          <FadeIn delay={150}>
            <Card>
              <SectionTitle>IVs ({total}/{CONFIG.IV_MAX * STAT_KEYS.length})</SectionTitle>
              {STAT_KEYS.map((k) => <StatBar key={k} label={STAT_LABELS[k]} value={pending.ivs[k]} max={CONFIG.IV_MAX} color={colors.success} />)}
              <SectionTitle>Golpes</SectionTitle>
              <View style={{ gap: 6 }}>
                {pending.moves.map((m) => (
                  <View key={m} style={{ backgroundColor: TYPE_COLORS[moveType(m)], borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 }}>
                    <Text style={{ color: '#FFF', fontWeight: '800' }}>{m}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </FadeIn>
          <FadeIn delay={300}>
            <Card>
              <Field label="Apelido (opcional)" value={nick} onChangeText={setNick} placeholder={sp.name} maxLength={CONFIG.NICKNAME_MAX} />
              <Button title="Enviar ao PC com apelido" icon="cloud-upload" onPress={() => finish(true)} loading={busy} disabled={!nick.trim()} />
              <View style={{ height: 8 }} />
              <Button title="Pular apelido e enviar ao PC" variant="outline" onPress={() => finish(false)} disabled={busy} />
            </Card>
          </FadeIn>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ---- Estados: sorteando / pronto / bloqueado ----
  const remaining = nextMidnight(now) - now;
  const lastSp = lastInst ? getSpecies(lastInst.speciesId) : null;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
      <FadeIn style={{ alignItems: 'center', alignSelf: 'stretch' }}>
        <Text style={[styles.title, { color: colors.text }]}>Sorteio diário</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>
          Um Pokémon aleatório por dia. IVs, golpes e a chance de ser shiny são sorteados na hora.
        </Text>
        <Animated.View style={{ marginVertical: 22, transform: [{ rotate: rot }] }}>
          <Pokeball size={140} animated={!blocked && !shaking} />
        </Animated.View>

        {blocked ? (
          <Card style={{ alignSelf: 'stretch', alignItems: 'center' }}>
            <Ionicons name="time" size={30} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '800', marginTop: 6 }}>Você já sorteou hoje</Text>
            <Text style={{ color: colors.primary, fontSize: 32, fontWeight: '900', marginTop: 4 }}>{formatCountdown(remaining)}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>para o próximo sorteio (à meia-noite)</Text>
            {lastSp ? (
              <View style={styles.lastRow}>
                <PokeImage slug={lastSp.slug} size={56} shiny={lastInst.shiny} />
                <Text style={{ color: colors.text, fontWeight: '700' }}>Hoje: {lastInst.nickname || lastSp.name}{lastInst.shiny ? ' ✨' : ''}</Text>
              </View>
            ) : null}
          </Card>
        ) : (
          <Button title={shaking ? 'Sorteando...' : 'Sortear Pokémon'} icon="shuffle" onPress={draw} loading={busy || shaking} style={{ alignSelf: 'stretch' }} />
        )}
      </FadeIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginTop: 6 },
  sub: { textAlign: 'center', marginTop: 4, fontSize: 13, lineHeight: 19, paddingHorizontal: 12 },
  shiny: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFD54F', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  shinyText: { color: '#6A4A00', fontWeight: '900' },
  lastRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
});
