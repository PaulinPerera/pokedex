import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useNav } from '../navigation';
import { Card, FadeIn, Pokeball, Tap, PokeImage } from '../components/Ui';
import { getSpecies } from '../services/pokeApi';

const SHORTCUTS = [
  { route: 'Dex', label: 'Pokédex completa', icon: 'book' },
  { route: 'PC', label: 'Pokémon / PC', icon: 'albums' },
  { route: 'Bag', label: 'Bag', icon: 'bag-handle' },
  { route: 'Identity', label: 'Identidade', icon: 'id-card' },
  { route: 'Randomize', label: 'Sorteio diário', icon: 'shuffle' },
  { route: 'Settings', label: 'Configurações', icon: 'settings' },
];

export default function HomeScreen() {
  const { colors, profile, game, pc } = useApp();
  const { navigate } = useNav();
  const starter = game.starterDone ? pc.find((p) => p.instanceId === game.starterInstanceId) : null;
  const starterSpecies = starter ? getSpecies(starter.speciesId) : null;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <FadeIn>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.hero}>
          <Text style={styles.hi}>Olá, {profile.username}!</Text>
          <Text style={styles.heroText}>
            {game.starterDone ? 'Continue sua jornada: sorteie um Pokémon por dia e monte seu PC.' : 'Sua aventura começa agora. Escolha seu primeiro parceiro!'}
          </Text>

          {!game.starterDone ? (
            <Tap onPress={() => navigate('Starter')} label="Escolher inicial" style={styles.ballWrap}>
              <Pokeball size={110} animated />
              <Text style={styles.ballText}>Toque na Poké Bola para escolher seu inicial</Text>
            </Tap>
          ) : starterSpecies ? (
            <View style={styles.starterBox}>
              <PokeImage slug={starterSpecies.slug} size={90} animated />
              <View style={{ flex: 1 }}>
                <Text style={styles.starterLabel}>SEU INICIAL</Text>
                <Text style={styles.starterName}>{starter.nickname || starterSpecies.name}</Text>
                {starter.nickname ? <Text style={styles.starterLabel}>{starterSpecies.name}</Text> : null}
              </View>
            </View>
          ) : null}
        </LinearGradient>
      </FadeIn>

      <Text style={[styles.section, { color: colors.primary }]}>ATALHOS</Text>
      <View style={styles.grid}>
        {SHORTCUTS.map((s, i) => (
          <FadeIn key={s.route} delay={80 + i * 50} style={{ width: '48%' }}>
            <Tap onPress={() => navigate(s.route)} label={s.label} style={[styles.shortcut, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.shortIcon, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name={s.icon} size={24} color={colors.primary} />
              </View>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 13, flex: 1 }}>{s.label}</Text>
            </Tap>
          </FadeIn>
        ))}
      </View>
      <Card style={{ marginTop: 6 }}>
        <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
          Dica: a Pokédex alternativa (barra inferior) funciona como um aparelho retrô: digite um nome ou número e use os botões.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 24, padding: 20, alignItems: 'center', elevation: 6 },
  hi: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  heroText: { color: '#FFFFFFDD', textAlign: 'center', marginTop: 4, fontSize: 13, lineHeight: 19 },
  ballWrap: { alignItems: 'center', marginTop: 20, padding: 8 },
  ballText: { color: '#FFF', fontWeight: '800', marginTop: 14, textAlign: 'center', fontSize: 13 },
  starterBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, backgroundColor: '#00000033', borderRadius: 18, padding: 10, alignSelf: 'stretch' },
  starterLabel: { color: '#FFFFFFB0', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  starterName: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  section: { fontSize: 13, fontWeight: '900', letterSpacing: 1.2, marginTop: 20, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginBottom: 12 },
  shortcut: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 16, padding: 10, minHeight: 60 },
  shortIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
