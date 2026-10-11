import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { getSpecies, moveType } from '../services/pokeApi';
import { ivTotal } from '../services/collection';
import { CONFIG } from '../config';
import { GEN_ROMAN, RARITY_LABEL, STAT_KEYS, STAT_LABELS, TYPE_COLORS } from '../data/meta';
import {
  Button, Card, FadeIn, IconButton, PokeImage, SectionTitle, StatBar, StatsBlock, Tap, TypePill, Field,
} from './Ui';

export function Sheet({ visible, onClose, title, children }) {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
        <View style={styles.sheetHeader}>
          <IconButton name="chevron-down" label="Fechar" onPress={onClose} color={colors.primary} size={28} />
          <Text style={[styles.sheetTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

function Hero({ species, shiny, name, subtitle }) {
  const main = TYPE_COLORS[species.types[0]] || '#888';
  return (
    <FadeIn>
      <LinearGradient colors={[main, '#00000055']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroNum}>#{String(species.id).padStart(3, '0')}</Text>
        {shiny ? (
          <View style={styles.shinyBadge}><Ionicons name="sparkles" size={14} color="#6A4A00" /><Text style={styles.shinyText}>SHINY</Text></View>
        ) : null}
        <PokeImage slug={species.slug} size={170} shiny={shiny} animated />
        <Text style={styles.heroName}>{name}</Text>
        {subtitle ? <Text style={styles.heroSub}>{subtitle}</Text> : null}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
          {species.types.map((t) => <TypePill key={t} type={t} />)}
        </View>
      </LinearGradient>
    </FadeIn>
  );
}

function EvolutionLine({ species }) {
  const { colors } = useApp();
  const { ids, niveis } = species.linha;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      {ids.map((id, i) => {
        const s = getSpecies(id);
        const current = id === species.id;
        return (
          <React.Fragment key={id}>
            {i > 0 ? (
              <View style={{ alignItems: 'center', marginHorizontal: 2 }}>
                <Ionicons name="arrow-forward" size={16} color={colors.muted} />
                <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '700' }}>Nv. {niveis[i - 1]}</Text>
              </View>
            ) : null}
            <View style={[styles.evoItem, current && { backgroundColor: colors.surfaceAlt, borderColor: colors.primary }]}>
              <PokeImage slug={s.slug} size={64} />
              <Text style={{ color: colors.text, fontSize: 11, fontWeight: current ? '800' : '600' }}>{s.name}</Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

function Forms({ species }) {
  const { colors } = useApp();
  if (!species.formas.length) return null;
  return (
    <Card>
      <SectionTitle>Formas e variantes</SectionTitle>
      {species.formas.map((f) => (
        <View key={f.nome} style={[styles.formRow, { borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14 }}>{f.nome}</Text>
          <View style={{ flexDirection: 'row', gap: 4, marginVertical: 4 }}>{f.tipos.map((t) => <TypePill key={t} type={t} small />)}</View>
          <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 17 }}>{f.nota}</Text>
          {f.stats ? <View style={{ marginTop: 8 }}><StatsBlock stats={f.stats} showTotal /></View> : null}
        </View>
      ))}
    </Card>
  );
}

// Dados da ESPÉCIE (iguais para todos os exemplares).
function SpeciesSections({ species }) {
  const { colors } = useApp();
  return (
    <>
      <Card>
        <SectionTitle>Descrição</SectionTitle>
        <Text style={{ color: colors.text, fontSize: 14, lineHeight: 21 }}>{species.desc}</Text>
        <View style={styles.infoRow}>
          <Info label="Altura" value={species.altura} />
          <Info label="Peso" value={species.peso} />
          <Info label="Geração" value={GEN_ROMAN[species.gen]} />
          <Info label="Categoria" value={RARITY_LABEL[species.category]} />
        </View>
      </Card>
      <Card>
        <SectionTitle>Estatísticas-base</SectionTitle>
        <StatsBlock stats={species.stats} showTotal />
      </Card>
      <Card>
        <SectionTitle>Linha evolutiva</SectionTitle>
        <EvolutionLine species={species} />
      </Card>
      <Forms species={species} />
    </>
  );
}

function Info({ label, value }) {
  const { colors } = useApp();
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '700' }}>{label.toUpperCase()}</Text>
      <Text style={{ color: colors.text, fontWeight: '800', marginTop: 2, fontSize: 13 }}>{value}</Text>
    </View>
  );
}

// ---------- Detalhe da espécie (Pokédex completa) ----------
export function SpeciesSheet({ species, onClose }) {
  if (!species) return null;
  return (
    <Sheet visible onClose={onClose} title={species.name}>
      <Hero species={species} name={species.name} />
      <View style={{ height: 12 }} />
      <SpeciesSections species={species} />
    </Sheet>
  );
}

// ---------- Detalhe do exemplar (PC) ----------
export function InstanceSheet({ instance, onClose }) {
  const { colors, renameInstance } = useApp();
  const [nick, setNick] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setNick(instance ? instance.nickname : ''); setSaved(false); }, [instance]);
  if (!instance) return null;
  const species = getSpecies(instance.speciesId);

  const save = async () => {
    setBusy(true);
    try { await renameInstance(instance.instanceId, nick); setSaved(true); } catch (e) {
      Alert.alert('Não foi possível salvar', 'Tente novamente.');
    } finally { setBusy(false); }
  };

  const total = ivTotal(instance.ivs);
  const max = CONFIG.IV_MAX * STAT_KEYS.length;
  const date = new Date(instance.obtainedAt).toLocaleDateString('pt-BR');

  return (
    <Sheet visible onClose={onClose} title={instance.nickname || species.name}>
      <Hero species={species} shiny={instance.shiny} name={instance.nickname || species.name}
        subtitle={instance.nickname ? `(${species.name})` : null} />
      <View style={{ height: 12 }} />
      <Card>
        <SectionTitle>Apelido</SectionTitle>
        <Field value={nick} onChangeText={(t) => { setNick(t); setSaved(false); }} placeholder={species.name} maxLength={CONFIG.NICKNAME_MAX} />
        <Button title={saved ? 'Salvo!' : 'Salvar apelido'} icon={saved ? 'checkmark-circle' : 'save'} onPress={save} loading={busy} />
      </Card>
      <Card>
        <SectionTitle>Dados do exemplar</SectionTitle>
        <View style={styles.infoRow}>
          <Info label="Origem" value={instance.origin === 'inicial' ? 'Inicial' : 'Sorteio'} />
          <Info label="Obtido em" value={date} />
          <Info label="Shiny" value={instance.shiny ? 'Sim' : 'Não'} />
        </View>
      </Card>
      <Card>
        <SectionTitle>IVs deste exemplar</SectionTitle>
        {STAT_KEYS.map((k) => <StatBar key={k} label={STAT_LABELS[k]} value={instance.ivs[k]} max={CONFIG.IV_MAX} color={colors.success} />)}
        <Text style={{ color: colors.muted, fontWeight: '700', marginTop: 4 }}>
          Total: {total}/{max} ({Math.round((total / max) * 100)}%)
        </Text>
      </Card>
      <Card>
        <SectionTitle>Golpes</SectionTitle>
        <View style={{ gap: 8 }}>
          {instance.moves.map((m) => (
            <View key={m} style={[styles.move, { backgroundColor: TYPE_COLORS[moveType(m)] }]}>
              <Text style={{ color: '#FFF', fontWeight: '800' }}>{m}</Text>
            </View>
          ))}
        </View>
      </Card>
      <Text style={[styles.divider, { color: colors.muted }]}>DADOS DA ESPÉCIE</Text>
      <SpeciesSections species={species} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  sheetHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  sheetTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  hero: { borderRadius: 22, alignItems: 'center', paddingVertical: 18 },
  heroNum: { position: 'absolute', top: 12, left: 14, color: '#FFFFFFCC', fontWeight: '900', fontSize: 16 },
  heroName: { color: '#FFF', fontSize: 26, fontWeight: '900', textShadowColor: '#0006', textShadowRadius: 4, textShadowOffset: { width: 1, height: 1 } },
  heroSub: { color: '#FFFFFFCC', fontSize: 13, fontWeight: '700' },
  shinyBadge: { position: 'absolute', top: 10, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFD54F', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  shinyText: { color: '#6A4A00', fontWeight: '900', fontSize: 11 },
  infoRow: { flexDirection: 'row', marginTop: 12 },
  evoItem: { alignItems: 'center', padding: 6, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  formRow: { borderTopWidth: 1, paddingTop: 10, marginTop: 10 },
  move: { borderRadius: 10, paddingVertical: 9, paddingHorizontal: 14 },
  divider: { textAlign: 'center', fontWeight: '900', letterSpacing: 1.5, marginVertical: 10, fontSize: 12 },
});
