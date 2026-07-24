import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TAB_CONFIG } from './constants/theme';
import { PlannerProvider } from './context/PlannerContext';
import AppShell from './components/AppShell';
import WelcomeScreen from './components/WelcomeScreen';
import LPScreen from './screens/LPScreen';
import COScreen from './screens/COScreen';
import BEScreen from './screens/BEScreen';
import GRScreen from './screens/GRScreen';
import PFScreen from './screens/PFScreen';

const TAB_SCREENS = {
  lp: LPScreen,
  co: COScreen,
  be: BEScreen,
  gr: GRScreen,
  pf: PFScreen,
};

export default function AppMain() {
  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('lp');
  const [, forceRender] = useState(0);
  const ActiveScreen = TAB_SCREENS[activeTab];
  const currentTab = TAB_CONFIG.find((tab) => tab.id === activeTab);

  // Load MaterialCommunityIcons font in background. Don't block render —
  // once loaded, force a re-render so glyph boxes swap to real icons.
  useEffect(() => {
    let cancelled = false;
    Font.loadAsync(MaterialCommunityIcons.font)
      .then(() => { if (!cancelled) forceRender((n) => n + 1); })
      .catch(() => { /* ignore, icons remain boxes */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <PlannerProvider>
          {started ? (
            <AppShell
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              title="Daycare Center"
            >
              <ActiveScreen />
            </AppShell>
          ) : (
            <WelcomeScreen onStart={() => setStarted(true)} />
          )}
        </PlannerProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
