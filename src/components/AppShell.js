import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, Pressable, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, TAB_CONFIG } from '../constants/theme';
import { TAB_INFO } from '../constants/infoContent';
import InfoDrawer from './InfoDrawer';

function tap(style = 'light') {
  try {
    const map = { light: Haptics.ImpactFeedbackStyle.Light, medium: Haptics.ImpactFeedbackStyle.Medium };
    Haptics.impactAsync(map[style] || map.light);
  } catch (_) { /* ignore */ }
}

const TAB_ICONS = {
  lp: 'account-group-outline',
  co: 'cash-multiple',
  be: 'chart-line-variant',
  gr: 'chart-bell-curve-cumulative',
  pf: 'finance',
};

const TAB_WIDTH_INACTIVE = 54;
const TAB_WIDTH_ACTIVE = 132;
const PILL_INSET = 4;
const BAR_PAD = 6;

export default function AppShell({ activeTab, onChangeTab, title, subtitle, children }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const currentTab = TAB_CONFIG.find((t) => t.id === activeTab) || TAB_CONFIG[0];
  const info = TAB_INFO[activeTab];
  const activeIndex = TAB_CONFIG.findIndex((t) => t.id === activeTab);
  const pillX = useRef(new Animated.Value(activeIndex * TAB_WIDTH_INACTIVE + PILL_INSET)).current;

  useEffect(() => {
    Animated.spring(pillX, {
      toValue: activeIndex * TAB_WIDTH_INACTIVE + PILL_INSET,
      useNativeDriver: true,
      damping: 20,
      stiffness: 240,
      mass: 0.7,
    }).start();
  }, [activeIndex, pillX]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow} numberOfLines={1}>{title}</Text>
            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>{currentTab.heading}</Text>
            {currentTab.subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>{currentTab.subtitle}</Text>
            ) : null}
          </View>

          <Pressable
            onPress={() => { tap('medium'); setInfoOpen(true); }}
            style={({ pressed }) => [
              styles.infoBtn,
              { backgroundColor: currentTab.tint, opacity: pressed ? 0.85 : 1 },
            ]}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel="Show model information and formulas"
          >
            <MaterialCommunityIcons name="information-outline" size={22} color={currentTab.accent} />
          </Pressable>
        </View>

        <View style={styles.content}>{children}</View>

        <View style={styles.tabBarWrap} pointerEvents="box-none">
          <View style={styles.tabBar}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pill,
                {
                  width: TAB_WIDTH_ACTIVE - PILL_INSET * 2,
                  backgroundColor: currentTab.tint,
                  transform: [{ translateX: pillX }],
                },
              ]}
            />
            {TAB_CONFIG.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => { if (tab.id !== activeTab) { tap('light'); onChangeTab(tab.id); } }}
                  style={[styles.tabButton, { width: isActive ? TAB_WIDTH_ACTIVE : TAB_WIDTH_INACTIVE }]}
                  android_ripple={null}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`${tab.label} tab`}
                >
                  <MaterialCommunityIcons
                    name={TAB_ICONS[tab.id]}
                    size={22}
                    color={isActive ? tab.accent : 'rgba(255,255,255,0.85)'}
                  />
                  {isActive ? (
                    <Text
                      style={[styles.tabLabel, { color: tab.accent }]}
                      numberOfLines={1}
                    >
                      {tab.label}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </KeyboardAvoidingView>

      {info ? (
        <InfoDrawer
          visible={infoOpen}
          onClose={() => setInfoOpen(false)}
          title={info.title}
          subtitle={info.subtitle}
          accent={currentTab.accent}
          tint={currentTab.tint}
          sections={info.sections}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.backgroundPage },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: { flex: 1 },
  eyebrow: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  infoBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  content: { flex: 1 },
  tabBarWrap: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 22 : 14,
    paddingHorizontal: 12,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundInverse,
    borderRadius: RADIUS.pill,
    paddingHorizontal: BAR_PAD,
    paddingVertical: BAR_PAD,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: BAR_PAD,
    bottom: BAR_PAD,
    left: BAR_PAD - PILL_INSET,
    borderRadius: RADIUS.pill,
  },
  tabButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tabLabel: { fontSize: 14, fontWeight: '700' },
});
