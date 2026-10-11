import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Button, Card, Field, SectionTitle } from '../components/Ui';

function SwitchRow({ icon, title, text, value, onValueChange }) {
  const { colors } = useApp();
  return (
    <View style={styles.switchRow}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>{title}</Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{text}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFF" accessibilityLabel={title} />
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, settings, updateSettings, changePassword, logout, deleteAccount, profile } = useApp();
  const [pw, setPw] = useState({ current: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k) => (v) => { setPw((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); setOk(false); };

  const savePassword = async () => {
    setBusy(true);
    try {
      const res = await changePassword(pw);
      if (res.errors) setErrors(res.errors);
      else { setOk(true); setPw({ current: '', password: '', confirm: '' }); }
    } catch (e) { setErrors({ form: 'Não foi possível alterar a senha.' }); } finally { setBusy(false); }
  };

  const confirmLogout = () => Alert.alert('Sair da conta', 'Seus dados continuam salvos neste aparelho.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Sair', onPress: () => logout() },
  ]);

  const confirmDelete = () => Alert.alert(
    'Excluir conta e dados locais',
    `Isso apaga a conta de ${profile.username}, o PC e o progresso deste aparelho. Esta ação não pode ser desfeita.`,
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir tudo', style: 'destructive', onPress: () => deleteAccount().catch(() => Alert.alert('Erro', 'Não foi possível excluir. Tente novamente.')) },
    ],
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Card>
          <SectionTitle>Aparência</SectionTitle>
          <SwitchRow icon={settings.theme === 'dark' ? 'moon' : 'sunny'} title="Tema escuro" text="Alterna entre tema claro e escuro."
            value={settings.theme === 'dark'} onValueChange={(v) => updateSettings({ theme: v ? 'dark' : 'light' })} />
          <SwitchRow icon="sparkles" title="Animações" text="Transições e efeitos visuais." value={settings.animations}
            onValueChange={(v) => updateSettings({ animations: v })} />
        </Card>

        <Card>
          <SectionTitle>Alterar senha</SectionTitle>
          <Field label="Senha atual" value={pw.current} onChangeText={set('current')} error={errors.current} secure autoCapitalize="none" />
          <Field label="Nova senha" value={pw.password} onChangeText={set('password')} error={errors.password} secure autoCapitalize="none" />
          <Field label="Confirmar nova senha" value={pw.confirm} onChangeText={set('confirm')} error={errors.confirm} secure autoCapitalize="none" />
          {errors.form ? <Text style={{ color: colors.danger, marginBottom: 8 }}>{errors.form}</Text> : null}
          <Button title={ok ? 'Senha alterada!' : 'Alterar senha'} icon={ok ? 'checkmark-circle' : 'key'} onPress={savePassword} loading={busy} />
        </Card>

        <Card>
          <SectionTitle>Conta</SectionTitle>
          <Button title="Sair da conta" icon="log-out" variant="outline" onPress={confirmLogout} />
          <View style={{ height: 10 }} />
          <Button title="Excluir conta e dados locais" icon="trash" variant="danger" onPress={confirmDelete} />
          <Text style={{ color: colors.muted, fontSize: 11, marginTop: 10, lineHeight: 16 }}>
            Conta local de protótipo: tudo fica somente neste aparelho e não há recuperação de senha.
          </Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
});
