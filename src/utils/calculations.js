function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function calculateStaffing({
  children,
  ageGroups,
  staffRoles = [],
  marketingChannels = [],
  budgetCap = 0,
}) {
  const staffByGroup = ageGroups.map((group) => {
    const count = safeNumber(children[group.id], 0);
    const staffNeeded = Math.ceil(count / safeNumber(group.ratio, 1));
    const staffCost = staffNeeded * safeNumber(group.rate, 0);
    return {
      ...group,
      count,
      staffNeeded,
      staffCost,
    };
  });

  const totalChildren = staffByGroup.reduce((sum, group) => sum + group.count, 0);
  const totalRatioStaff = staffByGroup.reduce((sum, group) => sum + group.staffNeeded, 0);

  const groupCounts = staffByGroup.reduce((acc, group) => {
    acc[group.id] = group.staffNeeded;
    return acc;
  }, {});

  const roleAllocations = staffRoles.map((role) => {
    let required;
    if (role.fixedCount) required = safeNumber(role.required, 0);
    else if (role.requiredFromChildren) required = totalRatioStaff;
    else if (role.driver === 'teacher') {
      required = (groupCounts.preschool || 0) + (groupCounts.schoolage || 0);
    } else if (role.driver && groupCounts[role.driver] !== undefined) {
      required = groupCounts[role.driver];
    } else required = safeNumber(role.required, 0);
    const monthlyCost = required * safeNumber(role.salary, 0);
    return { ...role, required, monthlyCost };
  });

  const totalStaffCost = roleAllocations.reduce((sum, role) => sum + role.monthlyCost, 0);
  const activeChannels = marketingChannels.filter((channel) => channel.active);
  const marketingCost = activeChannels.reduce((sum, channel) => sum + safeNumber(channel.cost, 0), 0);
  const marketingEnrollments = activeChannels.reduce((sum, channel) => sum + safeNumber(channel.enrollments, 0), 0);
  const totalCost = totalStaffCost + marketingCost;

  return {
    staffByGroup,
    roleAllocations,
    totalChildren,
    totalRatioStaff,
    totalStaffCost,
    marketingCost,
    marketingEnrollments,
    totalCost,
    budgetCap,
    budgetGap: budgetCap - totalCost,
    overBudget: totalCost > budgetCap,
  };
}

function calculateCostModel({
  enrolment,
  budgetCap,
  fixedCategories = [],
  perChildCategories = [],
  staffFloor = 0,
}) {
  const minFixed = fixedCategories.reduce((sum, category) => sum + safeNumber(category.min, 0), 0);
  const maxFixed = fixedCategories.reduce((sum, category) => sum + safeNumber(category.max, 0), 0);
  const minPerChild = perChildCategories.reduce((sum, category) => sum + safeNumber(category.min, 0), 0);
  const maxPerChild = perChildCategories.reduce((sum, category) => sum + safeNumber(category.max, 0), 0);

  const minimumTotal = minFixed + staffFloor + minPerChild * enrolment;
  const maximumTotal = maxFixed + staffFloor + maxPerChild * enrolment;
  const midpointTotal = Math.round((minimumTotal + maximumTotal) / 2);

  return {
    minimumTotal,
    maximumTotal,
    midpointTotal,
    remainingBudget: budgetCap - minimumTotal,
    withinBudget: minimumTotal <= budgetCap,
    categories: [
      ...fixedCategories.map((category) => ({
        ...category,
        sourceType: 'fixed',
        midpoint: Math.round((safeNumber(category.min, 0) + safeNumber(category.max, 0)) / 2),
      })),
      ...perChildCategories.map((category) => ({
        ...category,
        sourceType: 'perChild',
        midpoint: Math.round((safeNumber(category.min, 0) + safeNumber(category.max, 0)) / 2),
      })),
    ],
  };
}

function calculateBreakEven({
  fixedCost,
  variableCostPerChild,
  tuition,
  capacity,
}) {
  const contributionMargin = tuition - variableCostPerChild;
  const breakevenUnits = contributionMargin > 0 ? Math.ceil(fixedCost / contributionMargin) : Infinity;
  const breakevenRevenue = Number.isFinite(breakevenUnits) ? breakevenUnits * tuition : Infinity;
  const maxChildren = Math.max(capacity, Number.isFinite(breakevenUnits) ? breakevenUnits : capacity);
  const points = [];

  for (let children = 0; children <= maxChildren; children += 1) {
    const revenue = children * tuition;
    const totalCost = fixedCost + children * variableCostPerChild;
    points.push({
      children,
      revenue,
      totalCost,
      profit: revenue - totalCost,
    });
  }

  return {
    contributionMargin,
    breakevenUnits,
    breakevenRevenue,
    points,
  };
}

function calculateGrowth({
  capacity,
  initialEnrolment,
  growthRate,
  months,
  breakevenUnits,
}) {
  const cappedInitial = Math.max(1, Math.min(initialEnrolment, capacity - 1));
  const points = [];

  for (let month = 0; month <= months; month += 1) {
    const enrolment = capacity / (1 + ((capacity - cappedInitial) / cappedInitial) * Math.exp(-growthRate * month));
    points.push({
      month,
      enrolment: Math.round(enrolment),
    });
  }

  const target95 = Math.round(capacity * 0.95);
  const monthsTo95 = points.find((point) => point.enrolment >= target95)?.month ?? months;
  const finalEnrolment = points.at(-1)?.enrolment ?? 0;
  const breakevenMonth = Number.isFinite(breakevenUnits)
    ? (points.find((point) => point.enrolment >= breakevenUnits)?.month ?? null)
    : null;

  return {
    points,
    monthsTo95,
    finalEnrolment,
    breakevenMonth,
    totalGrowth: finalEnrolment - cappedInitial,
    averageMonthlyGrowth: months > 0 ? (finalEnrolment - cappedInitial) / months : 0,
  };
}

function calculateProfit({
  enrolment,
  tuition,
  fixedCost,
  variableCostPerChild = 0,
  operatingCost,
  assets = [],
  nonDepreciable = [],
}) {
  const revenue = enrolment * tuition;
  const derivedOperating = fixedCost !== undefined
    ? fixedCost + variableCostPerChild * enrolment
    : safeNumber(operatingCost, 0);
  const totalDepreciation = assets.reduce((sum, asset) => {
    const cost = safeNumber(asset.cost, 0);
    const life = safeNumber(asset.life, 0);
    const annualDepreciation = life > 0 ? cost / life : cost;
    return sum + annualDepreciation / 12;
  }, 0);

  const ebitda = revenue - derivedOperating;
  const netProfit = ebitda - totalDepreciation;
  const totalInvestment = assets.reduce((sum, asset) => sum + safeNumber(asset.cost, 0), 0);
  const totalNonDepreciableOutlay = nonDepreciable.reduce((sum, item) => sum + safeNumber(item.cost, 0), 0);
  const totalCapex = totalInvestment + totalNonDepreciableOutlay;
  const roi = totalCapex > 0 ? (netProfit * 12 / totalCapex) * 100 : 0;
  const paybackMonths = netProfit > 0 ? totalCapex / netProfit : Infinity;

  let accountingBreakevenUnits = null;
  if (tuition !== undefined && variableCostPerChild !== undefined && fixedCost !== undefined) {
    const contribution = tuition - variableCostPerChild;
    accountingBreakevenUnits = contribution > 0
      ? Math.ceil((fixedCost + totalDepreciation) / contribution)
      : Infinity;
  }

  return {
    revenue,
    operatingCost: derivedOperating,
    totalDepreciation,
    ebitda,
    netProfit,
    totalInvestment,
    totalNonDepreciableOutlay,
    totalCapex,
    roi,
    paybackMonths,
    accountingBreakevenUnits,
    profitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
  };
}

function allocateMarketing(totalBudget, channels) {
  const totalWeight = channels.reduce((sum, ch) => sum + safeNumber(ch.weight, 0), 0);
  if (totalWeight <= 0) return channels.map((ch) => ({ ...ch, allocation: 0 }));
  return channels.map((ch) => ({
    ...ch,
    allocation: Math.round((safeNumber(ch.weight, 0) / totalWeight) * totalBudget),
  }));
}

module.exports = {
  calculateStaffing,
  calculateCostModel,
  calculateBreakEven,
  calculateGrowth,
  calculateProfit,
  allocateMarketing,
};
