import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, ScrollView, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ITEMS, ITEM_CATEGORIES, itemImageUrl } from '../data/items';
import { norm } from '../data/meta';
import { Chip, Empty, FadeIn, SearchBar, Tap } from '../components/Ui';

function ItemImage({ item, catIcon, colors }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <View style={styles.imgBox}><Ionicons name={catIcon} size={28} color={colors.primary} /></View>;
  return <Image source={{ uri: itemImageUrl(item.slug) }} style={styles.imgBox} resizeMode="contain" onError={() => setFailed(true)} />;
}

export default function BagScreen() {
  const { colors } = useApp();
  const [cat, setCat] = useState(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);

  const results = useMemo(() => {
    const q = norm(query);
    return ITEMS.filter((i) => (!cat || i.category === cat) && (!q || norm(i.name).includes(q)));
  }, [cat, query]);

  const catOf = (id) => ITEM_CATEGORIES.find((c) => c.id === id);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12, paddingBottom: 4 }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar item pelo nome" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <Chip label="Todos" active={!cat} onPress={() => setCat(null)} />
          {ITEM_CATEGORIES.map((c) => <Chip key={c.id} label={c.label} active={cat === c.id} onPress={() => setCat(cat === c.id ? null : c.id)} />)}
        </ScrollView>
      </View>
      {results.length === 0 ? (
        <Empty icon="bag-outline" title="Nenhum item encontrado" text="Tente outro nome ou outra categoria." />
      ) : (
        <FadeIn style={{ flex: 1 }}>
          <FlatList
            data={results} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
            renderItem={({ item }) => {
              const c = catOf(item.category);
              const expanded = open === item.id;
              return (
                <Tap onPress={() => setOpen(expanded ? null : item.id)} label={item.name}
                  style={[styles.row, { backgroundColor: colors.surface, borderColor: expanded ? colors.primary : colors.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <ItemImage item={item} catIcon={c.icon} colors={colors} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>{c.label.toUpperCase()}</Text>
                      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>{item.name}</Text>
                      <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 17 }}>{item.description}</Text>
                    </View>
                    <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
                  </View>
                  {expanded ? (
                    <View style={[styles.use, { backgroundColor: colors.surfaceAlt }]}>
                      <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 11, letterSpacing: 1 }}>UTILIDADE</Text>
                      <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19, marginTop: 2 }}>{item.use}</Text>
                    </View>
                  ) : null}
                </Tap>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        </FadeIn>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { borderWidth: 1.5, borderRadius: 16, padding: 12 },
  imgBox: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  use: { marginTop: 10, borderRadius: 10, padding: 10 },
});
