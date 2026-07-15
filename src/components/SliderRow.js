import React, { useRef, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, PanResponder } from 'react-native';

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
}) {
  const displayValue = formatValue ? formatValue(value) : value;
  const labelText = unit ? `${label} (${unit})` : label;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{labelText}</Text>
      <Slider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        accent={accent}
        style={styles.slider}
      />
      <Text style={[styles.value, { backgroundColor: `${accent}1f`, color: accent }]}>
        {displayValue}{suffix}
      </Text>
    </View>
  );
}

// Clamp a value to [min, max] safely, returning fallback if result is NaN
function safeClamp(val, min, max, fallback = min) {
  const n = Number(val);
  if (isNaN(n) || !isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// Custom Slider component using PanResponder and layout dimensions
function Slider({ value, onChange, min, max, step, accent, style }) {
  const rawPct = ((value - min) / (max - min)) * 100;
  const percentage = isNaN(rawPct) || !isFinite(rawPct)
    ? 0
    : Math.max(0, Math.min(100, rawPct));

  const trackWidthRef = useRef(280);
  const startXRef = useRef(0);
  const startValueRef = useRef(value);

  const handleLayout = useCallback((event) => {
    const w = event.nativeEvent.layout.width;
    if (w > 0) trackWidthRef.current = w;
  }, []);

  const computeValue = useCallback((locationX) => {
    const x = typeof locationX === 'number' && !isNaN(locationX) ? locationX : 0;
    const trackWidth = trackWidthRef.current || 1;
    const ratio = Math.max(0, Math.min(1, x / trackWidth));
    const raw = min + ratio * (max - min);
    const stepped = Math.round(raw / step) * step;
    return safeClamp(stepped, min, max, min);
  }, [min, max, step]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const locationX = evt.nativeEvent?.locationX;
        const initialValue = computeValue(locationX);
        onChange(initialValue);
        startValueRef.current = initialValue;
        startXRef.current = typeof locationX === 'number' && !isNaN(locationX)
          ? locationX
          : 0;
      },
      onPanResponderMove: (evt, gestureState) => {
        const dx = typeof gestureState?.dx === 'number' && !isNaN(gestureState.dx)
          ? gestureState.dx
          : 0;
        const trackWidth = trackWidthRef.current || 1;
        const currentX = startXRef.current + dx;
        const ratio = Math.max(0, Math.min(1, currentX / trackWidth));
        const rawVal = min + ratio * (max - min);
        const stepped = Math.round(rawVal / step) * step;
        const clamped = safeClamp(stepped, min, max, startValueRef.current);
        onChange(clamped);
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
      <View
        style={[styles.thumb, { left: `${percentage}%`, borderColor: accent }]}
        pointerEvents="none"
      />
    </View>
  );
}

export function DualSlider({
  label, value1, value2, onChange1, onChange2,
  min = 0, max = 100, step = 1, accent = '#3d6ea5',
}) {
  const rawP1 = ((value1 - min) / (max - min)) * 100;
  const rawP2 = ((value2 - min) / (max - min)) * 100;
  const p1 = isNaN(rawP1) || !isFinite(rawP1) ? 0 : Math.max(0, Math.min(100, rawP1));
  const p2 = isNaN(rawP2) || !isFinite(rawP2) ? 0 : Math.max(0, Math.min(100, rawP2));

  const trackWidthRef = useRef(280);
  const activeThumbRef = useRef(null);
  const startXRef = useRef(0);

  const handleLayout = useCallback((event) => {
    const w = event.nativeEvent.layout.width;
    if (w > 0) trackWidthRef.current = w;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const locationX = evt.nativeEvent?.locationX;
        const x = typeof locationX === 'number' && !isNaN(locationX) ? locationX : 0;
        const trackWidth = trackWidthRef.current || 1;
        const ratio = Math.max(0, Math.min(1, x / trackWidth));
        const touchValue = min + ratio * (max - min);
        const dist1 = Math.abs(touchValue - value1);
        const dist2 = Math.abs(touchValue - value2);
        activeThumbRef.current = dist1 <= dist2 ? 'thumb1' : 'thumb2';
        startXRef.current = x;
        const stepped = Math.round(touchValue / step) * step;
        const val = safeClamp(stepped, min, max, min);
        if (activeThumbRef.current === 'thumb1' && val < value2) onChange1(val);
        else if (activeThumbRef.current === 'thumb2' && val > value1) onChange2(val);
      },
      onPanResponderMove: (evt, gestureState) => {
        const dx = typeof gestureState?.dx === 'number' && !isNaN(gestureState.dx)
          ? gestureState.dx
          : 0;
        const trackWidth = trackWidthRef.current || 1;
        const currentX = startXRef.current + dx;
        const ratio = Math.max(0, Math.min(1, currentX / trackWidth));
        const rawVal = min + ratio * (max - min);
        const steppedVal = Math.round(rawVal / step) * step;
        if (activeThumbRef.current === 'thumb1') {
          const val = safeClamp(steppedVal, min, value2 - step, min);
          onChange1(val);
        } else {
          const val = safeClamp(steppedVal, value1 + step, max, max);
          onChange2(val);
        }
      },
    })
  ).current;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={styles.dualContainer}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        <View style={styles.track} pointerEvents="none">
          <View
            style={[styles.dualFill, {
              left: `${p1}%`,
              width: `${Math.max(0, p2 - p1)}%`,
              backgroundColor: accent,
            }]}
          />
        </View>
        <View style={[styles.thumb, { left: `${p1}%`, borderColor: accent }]} pointerEvents="none" />
        <View style={[styles.thumb, { left: `${p2}%`, borderColor: accent }]} pointerEvents="none" />
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
        <Text style={styles.dualSep}>–</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 11,
  },
  label: {
    fontSize: 13,
    color: '#6b7178',
    minWidth: 140,
    flex: 1,
  },
  slider: {
    flex: 1,
  },
  value: {
    fontFamily: 'System',
    fontSize: 12.5,
    fontWeight: '700',
    minWidth: 82,
    textAlign: 'right',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  trackContainer: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: '#e6e0d0',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  dualFill: {
    position: 'absolute',
    top: 0,
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    borderWidth: 2,
    marginLeft: -7,
    top: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  dualContainer: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
    position: 'relative',
  },
  dualNums: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 160,
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
