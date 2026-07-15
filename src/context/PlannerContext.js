import React, { createContext, useContext, useMemo, useState } from 'react';

const DEFAULT_STATE = {
  fee: 11000,
  addFee: 2000,
  addFeeOn: true,
  rent: 68000,
  utilities: 17500,
  staffSalaries: 202000,
  otherFixed: 11500,
  marketingFixed: 7300,
  variableFood: 500,
  variableEducation: 250,
  variableActivity: 165,
  variableMaintenance: 210,
  activitiesMonthly: 15000,
  enrolment: 30,
  capacity: 90,
  initialEnrolment: 12,
  growthRate: 0.18,
};

const PlannerContext = createContext(null);

export function PlannerProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);

  const update = (patch) => setState((current) => ({ ...current, ...patch }));

  const derived = useMemo(() => {
    const effectiveFee = state.fee + (state.addFeeOn ? state.addFee : 0);
    const fixedCost = state.rent + state.utilities + state.staffSalaries
      + state.otherFixed + state.marketingFixed + state.activitiesMonthly;
    const variableCost = state.variableFood + state.variableEducation
      + state.variableActivity + state.variableMaintenance;
    const contribution = effectiveFee - variableCost;
    const breakevenUnits = contribution > 0 ? fixedCost / contribution : Infinity;
    return { effectiveFee, fixedCost, variableCost, contribution, breakevenUnits };
  }, [state]);

  const value = useMemo(() => ({ ...state, ...derived, update, setState }), [state, derived]);

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used inside PlannerProvider');
  return ctx;
}
