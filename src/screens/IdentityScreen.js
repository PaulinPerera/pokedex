import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { getSpecies } from '../services/pokeApi';
import { Avatar, AvatarPicker, Button, Card, Field, FadeIn, SectionTitle } from '../components/Ui';

export default function IdentityScreen() {
  const { colors, profile, pc, game, updateProfile } = useApp();
    const [f, setF] = useState({ username: profile.username, email: profile.email, avatar: profile.avatar, photo: profile.photo || null });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k) => (v) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); setSaved(false); };
  const unique = new Set(pc.map((p) => p.speciesId)).size;
  const starter = pc.find((p) => p.instanceId === game.starterInstanceId);
  const since = new Date(profile.createdAt).toLocaleDateString('pt-BR');

  const save = async () => {
    setBusy(true);
    try {
      const res = await updateProfile(f);
      if (res.errors) setErrors(res.errors); else setSaved(true);
    } catch (e) { setErrors({ form: 'Não foi possível salvar. Tente novamente.' }); } finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <FadeIn>
          <LinearGradient colors={[colors.primary, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
            <Text style={styles.cardLabel}>CARTÃO DE TREINADOR</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 }}>
              <Avatar id={profile.avatar} photo={profile.photo} size={80} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{profile.username}</Text>
                <Text style={styles.mail} numberOfLines={1}>{profile.email}</Text>
                <Text style={styles.mail}>Treinador desde {since}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.stat}><Text style={styles.statNum}>{pc.length}</Text><Text style={styles.statLabel}>no PC</Text></View>
              <View style={styles.stat}><Text style={styles.statNum}>{unique}</Text><Text style={styles.statLabel}>espécies</Text></View>
              <View style={styles.stat}>
                <Text style={styles.statNum} numberOfLines={1}>{starter ? starter.nickname || getSpecies(starter.speciesId).name : '—'}</Text>
                <Text style={styles.statLabel}>inicial</Text>
              </View>
            </View>
          </LinearGradient>
        </FadeIn>

        <Card style={{ marginTop: 16 }}>
          <SectionTitle>Editar dados</SectionTitle>
          <Field label="Nome de usuário" value={f.username} onChangeText={set('username')} error={errors.username} maxLength={20} autoCapitalize="none" />
          <Field label="E-mail" value={f.email} onChangeText={set('email')} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <AvatarPicker avatar={f.avatar} photo={f.photo} onChange={(avatar, photo) => { setF((p) => ({ ...p, avatar, photo })); setSaved(false); }} />
          {errors.form ? <Text style={{ color: colors.danger, marginTop: 8 }}>{errors.form}</Text> : null}
          <View style={{ height: 14 }} />
          <Button title={saved ? 'Alterações salvas!' : 'Salvar alterações'} icon={saved ? 'checkmark-circle' : 'save'} onPress={save} loading={busy} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, padding: 18, elevation: 6 },
  cardLabel: { color: '#FFFFFFB0', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  name: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  mail: { color: '#FFFFFFCC', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  stat: { flex: 1, alignItems: 'center', backgroundColor: '#00000033', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 4 },
  statNum: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  statLabel: { color: '#FFFFFFB0', fontSize: 10, fontWeight: '700' },
});
