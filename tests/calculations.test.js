const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateStaffing,
  calculateCostModel,
  calculateBreakEven,
  calculateGrowth,
  calculateProfit,
  allocateMarketing,
} = require('../src/utils/calculations');

test('calculateStaffing computes ratio-derived roles via driver map', () => {
  const result = calculateStaffing({
    children: { infant: 5, toddler: 7, preschool: 9, schoolage: 7 },
    ageGroups: [
      { id: 'infant', ratio: 3, rate: 26000 },
      { id: 'toddler', ratio: 4, rate: 30000 },
      { id: 'preschool', ratio: 6, rate: 34000 },
      { id: 'schoolage', ratio: 10, rate: 34000 },
    ],
    staffRoles: [
      { id: 'manager', salary: 46000, required: 1, fixedCount: true },
      { id: 'teacher', salary: 34000, driver: 'teacher' },
      { id: 'baby', salary: 26000, driver: 'infant' },
      { id: 'helper', salary: 30000, driver: 'toddler' },
      { id: 'security', salary: 28000, required: 1, fixedCount: true },
    ],
    budgetCap: 400000,
  });

  assert.equal(result.totalChildren, 28);
  assert.equal(result.roleAllocations.find((r) => r.id === 'baby').required, 2);
  assert.equal(result.roleAllocations.find((r) => r.id === 'helper').required, 2);
  assert.equal(result.roleAllocations.find((r) => r.id === 'teacher').required, 2 + 1);
  const total = result.totalStaffCost;
  assert.equal(total, 46000 + 3 * 34000 + 2 * 26000 + 2 * 30000 + 28000);
});

test('calculateCostModel applies staff floor and enforces budget check', () => {
  const result = calculateCostModel({
    enrolment: 28,
    budgetCap: 450000,
    staffFloor: 200000,
    fixedCategories: [
      { id: 'rent', min: 55000, max: 85000 },
      { id: 'utilities', min: 12500, max: 20000 },
    ],
    perChildCategories: [
      { id: 'food', min: 400, max: 600 },
    ],
  });

  assert.equal(result.minimumTotal, 55000 + 12500 + 200000 + 400 * 28);
  assert.equal(result.maximumTotal, 85000 + 20000 + 200000 + 600 * 28);
  assert.equal(result.withinBudget, true);
});

test('calculateBreakEven returns units from contribution margin', () => {
  const result = calculateBreakEven({ fixedCost: 12500, variableCostPerChild: 1200, tuition: 1600, capacity: 60 });
  assert.equal(result.contributionMargin, 400);
  assert.equal(result.breakevenUnits, 32);
});

test('calculateGrowth reports break-even month when reachable', () => {
  const result = calculateGrowth({ capacity: 60, initialEnrolment: 8, growthRate: 0.18, months: 36, breakevenUnits: 20 });
  assert.ok(result.breakevenMonth !== null);
  assert.ok(result.breakevenMonth <= 36);
  assert.equal(result.points.length, 37);
});

test('calculateProfit derives accounting BE, payback, and ROI from live inputs', () => {
  const result = calculateProfit({
    enrolment: 30,
    tuition: 13000,
    fixedCost: 300000,
    variableCostPerChild: 1200,
    assets: [
      { id: 'reno', cost: 800000, life: 10 },
      { id: 'furniture', cost: 450000, life: 7 },
    ],
    nonDepreciable: [{ id: 'legal', cost: 120000 }],
  });

  assert.equal(result.revenue, 390000);
  assert.equal(result.operatingCost, 300000 + 1200 * 30);
  assert.ok(result.totalDepreciation > 0);
  assert.equal(result.totalInvestment, 1250000);
  assert.equal(result.totalNonDepreciableOutlay, 120000);
  assert.equal(result.totalCapex, 1370000);
  assert.ok(Number.isFinite(result.accountingBreakevenUnits));
  assert.ok(result.paybackMonths > 0);
  const expectedRoi = (result.netProfit * 12 / result.totalCapex) * 100;
  assert.ok(Math.abs(result.roi - expectedRoi) < 1e-9);
});

test('allocateMarketing splits a total by weight', () => {
  const rows = allocateMarketing(10000, [
    { id: 'a', weight: 3 },
    { id: 'b', weight: 1 },
    { id: 'c', weight: 1 },
  ]);
  assert.equal(rows[0].allocation, 6000);
  assert.equal(rows[1].allocation, 2000);
  assert.equal(rows[2].allocation, 2000);
});
