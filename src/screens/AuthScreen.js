import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Button, Card, Field, FadeIn, Pokeball, AvatarPicker, SectionTitle, PokedexLights, ThemeToggle } from '../components/Ui';

export default function AuthScreen() {
  const { colors, login, register } = useApp();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ username: '', email: '', password: '', confirm: '', avatar: 'red', photo: null });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (v) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined, form: undefined })); };

  const submit = async () => {
    setBusy(true);
    try {
      const res = mode === 'login' ? await login(f) : await register(f);
      if (res.errors) setErrors(res.errors);
    } catch (e) {
      setErrors({ form: 'Não foi possível acessar o armazenamento local. Tente novamente.' });
    } finally { setBusy(false); }
  };

  const switchMode = () => { setMode((m) => (m === 'login' ? 'register' : 'login')); setErrors({}); };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[colors.primary, colors.primaryDark, colors.bg]} locations={[0, 0.35, 0.35]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, paddingHorizontal: 18 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <PokedexLights />
            <ThemeToggle />
          </View>
          <FadeIn style={{ alignItems: 'center', marginBottom: 18 }}>
            <Pokeball size={84} animated />
            <Text style={styles.title}>POKÉDEX</Text>
            <Text style={styles.subtitle}>{mode === 'login' ? 'Entre no seu perfil de treinador' : 'Crie seu perfil de treinador'}</Text>
          </FadeIn>

          <FadeIn delay={120}>
            <Card>
              {mode === 'register' ? (
                <Field label="Nome de usuário" value={f.username} onChangeText={set('username')} error={errors.username} autoCapitalize="none" maxLength={20} />
              ) : null}
              <Field label="E-mail" value={f.email} onChangeText={set('email')} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              <Field label="Senha" value={f.password} onChangeText={set('password')} error={errors.password} secure autoCapitalize="none" />
              {mode === 'register' ? (
                <>
                  <Field label="Confirmar senha" value={f.confirm} onChangeText={set('confirm')} error={errors.confirm} secure autoCapitalize="none" />
                  <AvatarPicker avatar={f.avatar} photo={f.photo} onChange={(avatar, photo) => setF((p) => ({ ...p, avatar, photo }))} />
                  <View style={{ height: 12 }} />
                </>
              ) : null}
              {errors.form ? <Text style={{ color: colors.danger, marginBottom: 8, fontWeight: '600' }}>{errors.form}</Text> : null}
              <Button title={mode === 'login' ? 'Entrar' : 'Criar conta'} icon={mode === 'login' ? 'log-in' : 'person-add'} onPress={submit} loading={busy} />
              <View style={{ height: 10 }} />
              <Button title={mode === 'login' ? 'Não tenho conta' : 'Já tenho conta'} variant="outline" onPress={switchMode} />
            </Card>
            <Text style={[styles.note, { color: colors.muted }]}>
              Conta local: os dados ficam somente neste aparelho (protótipo, sem servidor).
            </Text>
          </FadeIn>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: { color: '#FFF', fontSize: 30, fontWeight: '900', letterSpacing: 4, marginTop: 12 },
  subtitle: { color: '#FFFFFFD0', fontSize: 13, marginTop: 2 },
  note: { textAlign: 'center', fontSize: 11, marginTop: 4, paddingHorizontal: 16 },
});
