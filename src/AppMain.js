import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
  const ActiveScreen = TAB_SCREENS[activeTab];
  const currentTab = TAB_CONFIG.find((tab) => tab.id === activeTab);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <PlannerProvider>
        {started ? (
          <AppShell
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            title="Daycare Centre"
            subtitle={currentTab ? `${currentTab.label} decision model` : 'Mathematical decision models'}
          >
            <ActiveScreen />
          </AppShell>
        ) : (
          <WelcomeScreen onStart={() => setStarted(true)} />
        )}
      </PlannerProvider>
    </SafeAreaProvider>
  );
}
