import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useNav } from '../navigation';
import { CONFIG } from '../config';
import { getStarters } from '../services/pokeApi';
import { GEN_ROMAN } from '../data/meta';
import { Button, Card, Field, FadeIn, IconButton, PokeImage, Tap, TypePill, useLoop } from '../components/Ui';

const STARTERS = getStarters();

function StarterCard({ species, onPress, delay }) {
  const { colors, settings } = useApp();
  const v = useLoop(settings.animations, 1300 + delay);
  const sway = v.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] });
  const bob = v.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  return (
    <Tap onPress={onPress} label={`Escolher ${species.name}`} containerStyle={{ flex: 1 }}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Animated.View style={{ transform: [{ translateY: bob }, { rotate: sway }] }}>
        <PokeImage slug={species.slug} size={110} animated />
      </Animated.View>
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16, marginTop: 6 }}>{species.name}</Text>
      <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>{species.types.map((t) => <TypePill key={t} type={t} small />)}</View>
      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6, fontWeight: '700' }}>Geração {GEN_ROMAN[species.gen]}</Text>
    </Tap>
  );
}

export default function StarterScreen() {
  const { colors, game, chooseStarter } = useApp();
  const { goHome } = useNav();
  const [start, setStart] = useState(0); // mostra STARTERS[start] e STARTERS[start+1]
  const [picked, setPicked] = useState(null);
  const [nick, setNick] = useState('');
  const [busy, setBusy] = useState(false);

  // A escolha só existe enquanto o inicial não foi concluído.
  useEffect(() => { if (game.starterDone) goHome(); }, [game.starterDone, goHome]);

  const confirm = async () => {
    setBusy(true);
    try {
      await chooseStarter(picked.id, nick);
      goHome();
    } catch (e) {
      Alert.alert('Não foi possível salvar', e.message || 'Tente novamente.');
      setBusy(false);
    }
  };

  const pair = STARTERS.slice(start, start + 2);
  const canPrev = start > 0;
  const canNext = start + 2 < STARTERS.length;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {!picked ? (
          <FadeIn>
            <Text style={[styles.title, { color: colors.text }]}>Escolha seu parceiro</Text>
            <Text style={[styles.sub, { color: colors.muted }]}>Toque em um Pokémon. Use as setas para ver os iniciais de outras gerações.</Text>
            <View style={styles.row}>
              <IconButton name="chevron-back-circle" size={38} label="Anteriores" color={canPrev ? colors.primary : colors.border} onPress={() => canPrev && setStart((s) => s - 1)} />
              <View key={start} style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
                {pair.map((s, i) => <StarterCard key={s.id} species={s} delay={i * 250} onPress={() => { setPicked(s); setNick(''); }} />)}
              </View>
              <IconButton name="chevron-forward-circle" size={38} label="Próximos" color={canNext ? colors.primary : colors.border} onPress={() => canNext && setStart((s) => s + 1)} />
            </View>
            <View style={styles.dots}>
              {STARTERS.slice(0, STARTERS.length - 1).map((_, i) => (
                <View key={i} style={[styles.dot, { backgroundColor: i === start ? colors.primary : colors.border }]} />
              ))}
            </View>
          </FadeIn>
        ) : (
          <FadeIn>
            <Card style={{ alignItems: 'center' }}>
              <PokeImage slug={picked.slug} size={150} animated />
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>{picked.name}</Text>
              <Text style={{ color: colors.muted, textAlign: 'center', marginVertical: 8, fontSize: 13, lineHeight: 19 }}>{picked.desc}</Text>
              <View style={{ alignSelf: 'stretch', marginTop: 8 }}>
                <Field label="Apelido (opcional)" value={nick} onChangeText={setNick} placeholder={picked.name} maxLength={CONFIG.NICKNAME_MAX} />
              </View>
              <Button title="Confirmar escolha" icon="checkmark-circle" onPress={confirm} loading={busy} style={{ alignSelf: 'stretch' }} />
              <View style={{ height: 8 }} />
              <Button title="Voltar" variant="outline" onPress={() => setPicked(null)} disabled={busy} style={{ alignSelf: 'stretch' }} />
            </Card>
          </FadeIn>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginTop: 6 },
  sub: { textAlign: 'center', marginTop: 4, marginBottom: 18, fontSize: 13, lineHeight: 19 },
  row: { flexDirection: 'row', alignItems: 'center' },
  card: { alignItems: 'center', borderRadius: 20, borderWidth: 1.5, paddingVertical: 16, paddingHorizontal: 6, elevation: 3 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 18 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
