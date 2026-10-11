import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import Shell from './src/components/Shell';
import AuthScreen from './src/screens/AuthScreen';
import { Pokeball } from './src/components/Ui';

function Root() {
  const { ready, profile, colors } = useApp();
  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Pokeball size={72} animated />
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
      </View>
    );
  }
  return profile ? <Shell /> : <AuthScreen />;
}

function Themed() {
  const { colors } = useApp();
  return (
    <>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <Root />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Themed />
      </AppProvider>
    </SafeAreaProvider>
  );
}
