import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getSpecies } from '../services/pokeApi';
import { norm } from '../data/meta';
import { Empty, FadeIn, PokeImage, SearchBar, Tap } from '../components/Ui';
import { InstanceSheet } from '../components/Detail';

const COLS = 3;

const Slot = React.memo(function Slot({ item, onPress, colors }) {
  const sp = getSpecies(item.speciesId);
  return (
    <Tap onPress={() => onPress(item)} label={`${item.nickname || sp.name}`} containerStyle={{ flex: 1 / COLS }}
      style={[styles.slot, { backgroundColor: colors.surface, borderColor: item.shiny ? '#FFC107' : colors.border }]}>
      {item.shiny ? <Ionicons name="sparkles" size={14} color="#FFC107" style={styles.star} /> : null}
      <PokeImage slug={sp.slug} size={72} shiny={item.shiny} />
      <Text numberOfLines={1} style={{ color: colors.text, fontWeight: '800', fontSize: 12 }}>{item.nickname || sp.name}</Text>
      {item.nickname ? <Text numberOfLines={1} style={{ color: colors.muted, fontSize: 10 }}>{sp.name}</Text> : null}
    </Tap>
  );
});

export default function PCScreen() {
  const { colors, pc } = useApp();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const unique = useMemo(() => new Set(pc.map((p) => p.speciesId)).size, [pc]);
  const results = useMemo(() => {
    const q = norm(query);
    const list = [...pc].reverse(); // mais recentes primeiro
    if (!q) return list;
    return list.filter((p) => norm(p.nickname).includes(q) || norm(getSpecies(p.speciesId).name).includes(q));
  }, [pc, query]);

  const selected = useMemo(() => pc.find((p) => p.instanceId === selectedId) || null, [pc, selectedId]);
  const onPress = useCallback((p) => setSelectedId(p.instanceId), []);
  const renderItem = useCallback(({ item }) => <Slot item={item} onPress={onPress} colors={colors} />, [onPress, colors]);

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.boxHeader, { backgroundColor: colors.primary }]}>
        <Ionicons name="albums" size={22} color="#FFF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.boxTitle}>CAIXA DO TREINADOR</Text>
          <Text style={styles.boxSub}>{unique} espécie(s) única(s)</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalNum}>{pc.length}</Text>
          <Text style={styles.totalLabel}>no PC</Text>
        </View>
      </View>
      <View style={{ padding: 12, paddingBottom: 4 }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar por espécie ou apelido" />
      </View>

      {pc.length === 0 ? (
        <Empty icon="albums-outline" title="Seu PC está vazio" text="Escolha seu inicial na tela inicial e faça o sorteio diário para guardar Pokémon aqui." />
      ) : results.length === 0 ? (
        <Empty icon="search" title="Nada encontrado" text="Nenhum Pokémon com esse nome ou apelido." />
      ) : (
        <FadeIn style={{ flex: 1 }}>
          <FlatList
            data={results} keyExtractor={(p) => p.instanceId} renderItem={renderItem} numColumns={COLS}
            contentContainerStyle={{ padding: 10, paddingBottom: 24 }} columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
            initialNumToRender={15} windowSize={7} keyboardShouldPersistTaps="handled"
          />
        </FadeIn>
      )}
      <InstanceSheet instance={selected} onClose={() => setSelectedId(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  boxHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 12, marginTop: 12, borderRadius: 16, padding: 12, elevation: 3 },
  boxTitle: { color: '#FFF', fontWeight: '900', letterSpacing: 1.2, fontSize: 14 },
  boxSub: { color: '#FFFFFFCC', fontSize: 11 },
  totalBadge: { alignItems: 'center', backgroundColor: '#00000033', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  totalNum: { color: '#FFF', fontWeight: '900', fontSize: 20 },
  totalLabel: { color: '#FFFFFFCC', fontSize: 10, fontWeight: '700' },
  slot: { alignItems: 'center', borderRadius: 16, borderWidth: 2, paddingVertical: 8, paddingHorizontal: 4 },
  star: { position: 'absolute', top: 6, right: 6, zIndex: 1 },
});
