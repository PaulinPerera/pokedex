import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { CONFIG } from '../config';
import { loadCatalog } from '../services/pokeApi';
import { GENERATIONS, GEN_ROMAN, RARITIES, TYPE_COLORS, TYPE_NAMES, TYPE_ORDER, norm } from '../data/meta';
import { Chip, Empty, FadeIn, Loading, PokeImage, SearchBar, Tap } from '../components/Ui';
import { SpeciesSheet } from '../components/Detail';

const COLS = CONFIG.GRID_COLUMNS;

const Cell = React.memo(function Cell({ item, onPress, colors }) {
  return (
    <Tap onPress={() => onPress(item)} label={`${item.name}, número ${item.id}`} containerStyle={{ flex: 1 / COLS }}
      style={[styles.cell, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={{ color: colors.muted, fontSize: 9, fontWeight: '800' }}>#{String(item.id).padStart(3, '0')}</Text>
      <PokeImage slug={item.slug} size={52} />
      <Text numberOfLines={1} style={{ color: colors.text, fontSize: 9, fontWeight: '800' }}>{item.name}</Text>
    </Tap>
  );
});

export default function DexScreen() {
  const { colors } = useApp();
  const [state, setState] = useState({ status: 'loading', list: [] });
  const [query, setQuery] = useState('');
  const [type, setType] = useState(null);
  const [gen, setGen] = useState(null);
  const [rarity, setRarity] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setState({ status: 'loading', list: [] });
    loadCatalog().then((list) => setState({ status: 'ready', list })).catch(() => setState({ status: 'error', list: [] }));
  }, []);
  useEffect(load, [load]);

  const results = useMemo(() => {
    const q = norm(query).replace(/^#/, '');
    return state.list.filter((s) => {
      if (type && !s.types.includes(type)) return false;
      if (gen && s.gen !== gen) return false;
      if (rarity && s.category !== rarity) return false;
      if (!q) return true;
      return norm(s.name).includes(q) || String(s.id).padStart(3, '0').includes(q) || String(s.id) === q;
    });
  }, [state.list, query, type, gen, rarity]);

  const clear = () => { setQuery(''); setType(null); setGen(null); setRarity(null); };
  const hasFilter = !!(query || type || gen || rarity);
  const onPress = useCallback((s) => setSelected(s), []);
  const renderItem = useCallback(({ item }) => <Cell item={item} onPress={onPress} colors={colors} />, [onPress, colors]);

  if (state.status === 'loading') return <Loading text="Carregando Pokédex..." />;
  if (state.status === 'error') {
    return <Empty icon="cloud-offline" title="Não foi possível carregar a Pokédex" text="Verifique a fonte de dados e a conexão." actionLabel="Tentar de novo" onAction={load} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12, paddingBottom: 4 }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar por nome ou número" />
        <Text style={[styles.label, { color: colors.muted }]}>TIPO</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip label="Todos" active={!type} onPress={() => setType(null)} />
          {TYPE_ORDER.map((t) => <Chip key={t} label={TYPE_NAMES[t]} color={TYPE_COLORS[t]} active={type === t} onPress={() => setType(type === t ? null : t)} />)}
        </ScrollView>
        <Text style={[styles.label, { color: colors.muted }]}>GERAÇÃO</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip label="Todas" active={!gen} onPress={() => setGen(null)} />
          {GENERATIONS.map((g) => <Chip key={g} label={`Gen ${GEN_ROMAN[g]}`} active={gen === g} onPress={() => setGen(gen === g ? null : g)} />)}
        </ScrollView>
        <Text style={[styles.label, { color: colors.muted }]}>RARIDADE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip label="Todas" active={!rarity} onPress={() => setRarity(null)} />
          {RARITIES.map((r) => <Chip key={r.id} label={r.label} active={rarity === r.id} onPress={() => setRarity(rarity === r.id ? null : r.id)} />)}
        </ScrollView>
        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 8, fontWeight: '700' }}>
          {results.length} resultado(s) • {state.list.length} de {CONFIG.FULL_DEX_TOTAL} espécies disponíveis nesta fase
        </Text>
      </View>

      {results.length === 0 ? (
        <Empty icon="search" title="Nenhum Pokémon encontrado" text="Tente outro nome ou combinação de filtros." actionLabel={hasFilter ? 'Limpar filtros' : undefined} onAction={clear} />
      ) : (
        <FadeIn style={{ flex: 1 }}>
          <FlatList
            data={results} keyExtractor={(s) => String(s.id)} renderItem={renderItem} numColumns={COLS}
            key={`grid-${COLS}`} contentContainerStyle={{ padding: 8, paddingBottom: 24 }}
            columnWrapperStyle={{ gap: 6, marginBottom: 6 }} initialNumToRender={20} windowSize={7}
            removeClippedSubviews keyboardShouldPersistTaps="handled"
          />
        </FadeIn>
      )}
      <SpeciesSheet species={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 10, marginBottom: 4 },
  cell: { alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingVertical: 4, paddingHorizontal: 2 },
});
