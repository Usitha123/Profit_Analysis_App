import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
  Animated, Easing, LayoutAnimation, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, TAB_CONFIG } from '../constants/theme';
import { TAB_INFO } from '../constants/infoContent';
import InfoDrawer from './InfoDrawer';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TAB_ICONS = {
  lp: 'account-group-outline',
  co: 'cash-multiple',
  be: 'chart-line-variant',
  gr: 'chart-bell-curve-cumulative',
  pf: 'finance',
};

const LAYOUT_ANIM = {
  duration: 260,
  create: { type: 'easeInEaseOut', property: 'opacity' },
  update: { type: 'spring', springDamping: 0.82 },
  delete: { type: 'easeInEaseOut', property: 'opacity' },
};

function TabButton({ tab, isActive, onPress }) {
  const progress = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isActive ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isActive, progress]);

  const bg = progress.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255,255,255,0)', tab.tint] });
  const iconColor = isActive ? tab.accent : COLORS.textSecondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${tab.label} tab`}
    >
      <Animated.View style={[styles.tabButton, isActive && styles.tabButtonActive, { backgroundColor: bg }]}>
        <MaterialCommunityIcons name={TAB_ICONS[tab.id]} size={20} color={iconColor} />
        {isActive ? (
          <Animated.Text
            style={[
              styles.tabLabel,
              { color: tab.accent, opacity: progress },
            ]}
            numberOfLines={1}
          >
            {tab.label}
          </Animated.Text>
        ) : null}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function AppShell({ activeTab, onChangeTab, title, subtitle, children }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const currentTab = TAB_CONFIG.find((t) => t.id === activeTab) || TAB_CONFIG[0];
  const info = TAB_INFO[activeTab];

  const handleTabPress = (id) => {
    if (id === activeTab) return;
    LayoutAnimation.configureNext(LAYOUT_ANIM);
    onChangeTab(id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>{currentTab.label.toUpperCase()}</Text>
            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
            {subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> : null}
          </View>

          <TouchableOpacity
            onPress={() => setInfoOpen(true)}
            style={[styles.infoBtn, { backgroundColor: currentTab.tint }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Show model information and formulas"
          >
            <MaterialCommunityIcons name="information-outline" size={22} color={currentTab.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>{children}</View>

        <View style={styles.tabBarWrap} pointerEvents="box-none">
          <View style={styles.tabBar}>
            {TAB_CONFIG.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeTab}
                onPress={() => handleTabPress(tab.id)}
              />
            ))}
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
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
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
    gap: 4,
    backgroundColor: COLORS.backgroundInverse,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 10,
  },
  tabButton: {
    minHeight: 44,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabButtonActive: {
    paddingHorizontal: 16,
  },
  tabLabel: { fontSize: 12.5, fontWeight: '700' },
});
