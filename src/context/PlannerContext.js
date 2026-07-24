import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AGE_GROUPS, STAFF_ROLES, FIXED_COST_RANGES, PER_CHILD_COST_RANGES,
  DEP_ASSETS, ACTIVITIES,
} from '../constants/modelData';

const STORAGE_KEY = '@daycare-planner:v1';

const DEFAULT_STATE = {
  // LP
  children: AGE_GROUPS.reduce((acc, g) => { acc[g.id] = g.default; return acc; }, {}),
  roles: STAFF_ROLES.map((r) => ({ id: r.id, salary: r.salary })),
  lpBudgetCap: 350000,

  // BE fees + fixed
  fee: 11000,
  addFee: 2000,
  addFeeOn: true,
  rent: 68000,
  utilities: 17500,
  staffSalaries: 202000,
  otherFixed: 11500,
  marketingFixed: 7300,

  // BE variable per child
  variableFood: 500,
  variableEducation: 250,
  variableActivity: 165,
  variableMaintenance: 210,

  // BE activities toggles + annual cost
  activities: ACTIVITIES.map((a) => ({ id: a.id, on: a.defaultOn, annualCost: a.annual })),

  // CO
  coFixedRanges: FIXED_COST_RANGES.map((r) => ({ id: r.id, min: r.min, max: r.max })),
  coPerChildRanges: PER_CHILD_COST_RANGES.map((r) => ({ id: r.id, min: r.min, max: r.max })),
  coBudgetCap: 450000,

  // GR
  capacity: 90,
  initialEnrolment: 12,
  growthRate: 0.18,

  // PF
  pfAssets: DEP_ASSETS.map((a) => ({ id: a.id, cost: a.cost, life: a.life })),
};

function mergeDefaults(saved) {
  // Deep-merge saved values with defaults so new fields added later don't break old saved payloads.
  if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
  const merged = { ...DEFAULT_STATE, ...saved };
  // Rehydrate array-shaped fields if user has new defaults with more/less items.
  if (!Array.isArray(merged.roles)) merged.roles = DEFAULT_STATE.roles;
  if (!Array.isArray(merged.activities)) merged.activities = DEFAULT_STATE.activities;
  if (!Array.isArray(merged.coFixedRanges)) merged.coFixedRanges = DEFAULT_STATE.coFixedRanges;
  if (!Array.isArray(merged.coPerChildRanges)) merged.coPerChildRanges = DEFAULT_STATE.coPerChildRanges;
  if (!Array.isArray(merged.pfAssets)) merged.pfAssets = DEFAULT_STATE.pfAssets;
  if (!merged.children || typeof merged.children !== 'object') merged.children = DEFAULT_STATE.children;
  return merged;
}

const PlannerContext = createContext(null);

export function PlannerProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef(null);

  // Load once.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try { setState(mergeDefaults(JSON.parse(raw))); } catch (_) { /* ignore parse errors */ }
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  // Save on change (debounced 400ms).
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }, 400);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state, hydrated]);

  const update = (patch) => setState((cur) => ({ ...cur, ...patch }));

  const derived = useMemo(() => {
    const effectiveFee = state.fee + (state.addFeeOn ? state.addFee : 0);
    const activitiesMonthly = Math.round(
      (state.activities || []).filter((a) => a.on).reduce((s, a) => s + (a.annualCost || 0), 0) / 12,
    );
    const fixedCost = state.rent + state.utilities + state.staffSalaries
      + state.otherFixed + state.marketingFixed + activitiesMonthly;
    const variableCost = state.variableFood + state.variableEducation
      + state.variableActivity + state.variableMaintenance;
    const contribution = effectiveFee - variableCost;
    const breakevenUnits = contribution > 0 ? fixedCost / contribution : Infinity;
    const totalChildren = Object.values(state.children).reduce((s, n) => s + (Number(n) || 0), 0);
    return { effectiveFee, activitiesMonthly, fixedCost, variableCost, contribution, breakevenUnits, totalChildren };
  }, [state]);

  const reset = () => {
    setState(DEFAULT_STATE);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  const value = useMemo(
    () => ({ ...state, ...derived, hydrated, update, setState, reset }),
    [state, derived, hydrated],
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used inside PlannerProvider');
  return ctx;
}
