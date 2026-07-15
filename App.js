import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Dimensions, Animated, Platform, StatusBar, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TAB_CONFIG, getAccent } from './src/constants/theme';
import LPScreen from './src/screens/LPScreen';
import COScreen from './src/screens/COScreen';
import BEScreen from './src/screens/BEScreen';
import GRScreen from './src/screens/GRScreen';
import PFScreen from './src/screens/PFScreen';

const SCREEN_WIDTH = Dimensions.get('window').width;

const TAB_SCREENS = {
  lp: LPScreen,
  co: COScreen,
  be: BEScreen,
  gr: GRScreen,
  pf: PFScreen,
};

const TAB_ICONS = {
  lp: '👥',
  co: '💰',
  be: '📊',
  gr: '📈',
  pf: '💎',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('lp');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const switchTab = (tabId) => {
    const currentIndex = TAB_CONFIG.findIndex((t) => t.id === activeTab);
    const newIndex = TAB_CONFIG.findIndex((t) => t.id === tabId);
    const direction = newIndex > currentIndex ? 1 : -1;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(tabId);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const ActiveScreen = TAB_SCREENS[activeTab];
  const activeAccent = getAccent(activeTab);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundPage} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >

        {/* Header / Masthead */}
        <View style={styles.masthead}>
          <View style={[styles.badge, { backgroundColor: activeAccent }]}>
            <Text style={styles.badgeText}>
              {TAB_ICONS[activeTab]}
            </Text>
          </View>
          <View style={styles.mastheadText}>
            <Text style={styles.title}>Daycare Centre</Text>
            <Text style={styles.subtitle}>Mathematical Decision Models</Text>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  isActive && {
                    borderTopColor: tab.accent,
                    backgroundColor: '#fff',
                    borderColor: COLORS.borderPrimary,
                    borderBottomColor: '#fff',
                  },
                ]}
                onPress={() => switchTab(tab.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.tabIcon}>{TAB_ICONS[tab.id]}</Text>
                <Text
                  style={[
                    styles.tabLabel,
                    isActive && { color: COLORS.textPrimary },
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View
                    style={[styles.tabIndicator, { backgroundColor: tab.accent }]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Banner */}
        <View style={[styles.banner, { backgroundColor: `${activeAccent}10` }]}>
          <View style={[styles.bannerDot, { backgroundColor: activeAccent }]} />
          <Text style={styles.bannerText}>
            {activeTab === 'lp' && 'Staffing & Marketing Optimisation'}
            {activeTab === 'co' && 'Cost Optimisation & Budgeting'}
            {activeTab === 'be' && 'Break-Even Point Analysis'}
            {activeTab === 'gr' && 'Enrolment Growth Projection'}
            {activeTab === 'pf' && 'Profit, Depreciation & ROI'}
          </Text>
        </View>

        {/* Sheet / Content */}
        <View style={[styles.sheet, { borderTopColor: activeAccent, borderLeftColor: `${activeAccent}40`, borderRightColor: `${activeAccent}40`, borderBottomColor: `${activeAccent}40` }]}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <ActiveScreen />
          </Animated.View>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.backgroundPage,
  },
  masthead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 4,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  badgeText: {
    fontSize: 22,
  },
  mastheadText: {
    flex: 1,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderPrimary,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomWidth: 0,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    position: 'relative',
    borderTopWidth: 3,
    borderTopColor: 'transparent',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.1,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '20%',
    right: '20%',
    height: 3,
    borderRadius: 1.5,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bannerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderTopWidth: 3,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
});
