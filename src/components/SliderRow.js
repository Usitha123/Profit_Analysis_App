import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';

function tapHaptic() {
  try { Haptics.selectionAsync(); } catch (_) { /* ignore */ }
}

export default function SliderRow({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  accent = '#3d6ea5',
  formatValue,
  suffix = '',
  unit = '',
  description,
  plain = false,
}) {
  const displayValue = formatValue ? formatValue(value) : value;
  const labelText = unit ? `${label} (${unit})` : label;

  return (
    <View style={plain ? styles.rowPlain : styles.row}>
      <View style={styles.header}>
        <View style={styles.labelWrap}>
          <Text style={styles.label}>{labelText}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
        <Text style={[styles.value, { color: accent, backgroundColor: plain ? 'transparent' : `${accent}1f`, minWidth: plain ? 0 : 92 }]}>
          {displayValue}{suffix}
        </Text>
      </View>
      <Slider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        accent={accent}
        style={styles.slider}
      />
    </View>
  );
}

function safeClamp(val, min, max, fallback = min) {
  const n = Number(val);
  if (isNaN(n) || !isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function Slider({ value, onChange, min, max, step, accent, style }) {
  const rawPct = ((value - min) / (max - min)) * 100;
  const percentage = isNaN(rawPct) || !isFinite(rawPct)
    ? 0
    : Math.max(0, Math.min(100, rawPct));

  const trackWidthRef = useRef(280);
  const startXRef = useRef(0);
  const startValueRef = useRef(value);
  const lastEmittedRef = useRef(value);

  // Refs kept fresh every render so PanResponder never sees a stale closure.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const rangeRef = useRef({ min, max, step });
  rangeRef.current = { min, max, step };
  const valueRef = useRef(value);
  valueRef.current = value;

  const handleLayout = useCallback((event) => {
    const w = event.nativeEvent.layout.width;
    if (w > 0) trackWidthRef.current = w;
  }, []);

  const emit = (val) => {
    if (val === lastEmittedRef.current) return;
    lastEmittedRef.current = val;
    onChangeRef.current(val);
    tapHaptic();
  };

  const computeValue = (locationX) => {
    const { min: mi, max: ma, step: st } = rangeRef.current;
    const x = typeof locationX === 'number' && !isNaN(locationX) ? locationX : 0;
    const trackWidth = trackWidthRef.current || 1;
    const ratio = Math.max(0, Math.min(1, x / trackWidth));
    const raw = mi + ratio * (ma - mi);
    const stepped = Math.round(raw / st) * st;
    return safeClamp(stepped, mi, ma, mi);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const locationX = evt.nativeEvent?.locationX;
        const initialValue = computeValue(locationX);
        startValueRef.current = initialValue;
        startXRef.current = typeof locationX === 'number' && !isNaN(locationX) ? locationX : 0;
        lastEmittedRef.current = valueRef.current;
        emit(initialValue);
      },
      onPanResponderMove: (_, gestureState) => {
        const dx = typeof gestureState?.dx === 'number' && !isNaN(gestureState.dx) ? gestureState.dx : 0;
        const trackWidth = trackWidthRef.current || 1;
        const { min: mi, max: ma, step: st } = rangeRef.current;
        const currentX = startXRef.current + dx;
        const ratio = Math.max(0, Math.min(1, currentX / trackWidth));
        const rawVal = mi + ratio * (ma - mi);
        const stepped = Math.round(rawVal / st) * st;
        const clamped = safeClamp(stepped, mi, ma, startValueRef.current);
        emit(clamped);
      },
    })
  ).current;

  return (
    <View
      style={[styles.trackContainer, style]}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      <View style={styles.track} pointerEvents="none">
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: accent }]} />
      </View>
      <View style={[styles.thumb, { left: `${percentage}%`, borderColor: accent }]} pointerEvents="none" />
    </View>
  );
}

function DualThumb({ side, value, otherValue, min, max, step, accent, trackWidthRef, onChange, zIndex }) {
  const startValueRef = useRef(value);
  const lastEmittedRef = useRef(value);

  // Refs refreshed on every render so PanResponder never has a stale closure.
  const otherRef = useRef(otherValue);
  otherRef.current = otherValue;
  const rangeRef = useRef({ min, max, step });
  rangeRef.current = { min, max, step };
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;

  const percent = (() => {
    const raw = ((value - min) / (max - min)) * 100;
    return isNaN(raw) || !isFinite(raw) ? 0 : Math.max(0, Math.min(100, raw));
  })();

  const emit = (val) => {
    if (val === lastEmittedRef.current) return;
    lastEmittedRef.current = val;
    onChangeRef.current(val);
    tapHaptic();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startValueRef.current = valueRef.current;
        lastEmittedRef.current = valueRef.current;
      },
      onPanResponderMove: (_, g) => {
        const { min: mi, max: ma, step: st } = rangeRef.current;
        const trackWidth = trackWidthRef.current || 1;
        const startRatio = (startValueRef.current - mi) / (ma - mi);
        const startX = startRatio * trackWidth;
        const nextX = startX + g.dx;
        const ratio = Math.max(0, Math.min(1, nextX / trackWidth));
        const rawVal = mi + ratio * (ma - mi);
        const stepped = Math.round(rawVal / st) * st;
        const other = otherRef.current;
        let clamped;
        if (side === 'low') {
          clamped = safeClamp(stepped, mi, other - st, mi);
        } else {
          clamped = safeClamp(stepped, other + st, ma, ma);
        }
        emit(clamped);
      },
    }),
  ).current;

  return (
    <View
      style={[styles.thumbHit, { left: `${percent}%`, zIndex }]}
      hitSlop={{ top: 14, bottom: 14, left: 18, right: 18 }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.thumbVisible, { borderColor: accent }]} />
    </View>
  );
}

export function DualSlider({
  label,
  value1,
  value2,
  onChange1,
  onChange2,
  min = 0,
  max = 100,
  step = 1,
  accent = '#3d6ea5',
  description,
  plain = false,
}) {
  const trackWidthRef = useRef(280);

  const rawP1 = ((value1 - min) / (max - min)) * 100;
  const rawP2 = ((value2 - min) / (max - min)) * 100;
  const p1 = isNaN(rawP1) || !isFinite(rawP1) ? 0 : Math.max(0, Math.min(100, rawP1));
  const p2 = isNaN(rawP2) || !isFinite(rawP2) ? 0 : Math.max(0, Math.min(100, rawP2));

  const handleLayout = useCallback((event) => {
    const w = event.nativeEvent.layout.width;
    if (w > 0) trackWidthRef.current = w;
  }, []);

  const lowOnTop = Math.abs(p2 - p1) < 8;

  return (
    <View style={plain ? styles.rowPlain : styles.row}>
      <View style={styles.labelWrap}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <View style={styles.dualContainer} onLayout={handleLayout}>
        <View style={styles.track} pointerEvents="none">
          <View
            style={[styles.dualFill, { left: `${p1}%`, width: `${Math.max(0, p2 - p1)}%`, backgroundColor: accent }]}
          />
        </View>
        <DualThumb
          side="low"
          value={value1}
          otherValue={value2}
          min={min} max={max} step={step}
          accent={accent}
          trackWidthRef={trackWidthRef}
          onChange={onChange1}
          zIndex={lowOnTop ? 20 : 10}
        />
        <DualThumb
          side="high"
          value={value2}
          otherValue={value1}
          min={min} max={max} step={step}
          accent={accent}
          trackWidthRef={trackWidthRef}
          onChange={onChange2}
          zIndex={lowOnTop ? 10 : 20}
        />
      </View>
      <View style={styles.dualNums}>
        <TextInput
          style={[styles.dualNum, { color: accent }]}
          value={String(value1)}
          onChangeText={(t) => {
            const v = Number(t);
            if (!isNaN(v) && v < value2) onChange1(safeClamp(v, min, max, min));
          }}
          keyboardType="numeric"
          placeholderTextColor="#6b7178"
        />
        <Text style={styles.dualSep}>-</Text>
        <TextInput
          style={[styles.dualNum, { color: accent }]}
          value={String(value2)}
          onChangeText={(t) => {
            const v = Number(t);
            if (!isNaN(v) && v > value1) onChange2(safeClamp(v, min, max, max));
          }}
          keyboardType="numeric"
          placeholderTextColor="#6b7178"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  rowPlain: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    fontSize: 13.5,
    lineHeight: 19,
    color: '#0d0f14',
    fontWeight: '700',
  },
  description: {
    marginTop: 2,
    fontSize: 11.5,
    lineHeight: 17,
    color: '#6b7280',
  },
  slider: {
    width: '100%',
  },
  value: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '800',
    minWidth: 92,
    textAlign: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  trackContainer: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    backgroundColor: '#e6e0d0',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  dualFill: {
    position: 'absolute',
    top: 0,
    height: 6,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    marginLeft: -11,
    top: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  dualContainer: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    marginTop: 8,
  },
  thumbHit: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 44,
    marginLeft: -22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbVisible: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  dualNums: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  dualNum: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 3,
    textAlign: 'right',
    minWidth: 72,
    borderWidth: 1.5,
    borderColor: '#d8d1bf',
  },
  dualSep: {
    color: '#6b7178',
    fontSize: 12,
  },
});
