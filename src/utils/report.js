import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  AGE_GROUPS, STAFF_ROLES, ACTIVITIES, BE_MKT_CHANNELS,
  FIXED_COST_RANGES, PER_CHILD_COST_RANGES, DEP_ASSETS, NON_DEPRECIABLE_OUTLAY,
  CO_AGE_MIX,
} from '../constants/modelData';
import {
  calculateStaffing, calculateGrowth, calculateProfit, allocateMarketing,
} from './calculations';

const rs = (n) => `Rs. ${Math.round(Number(n) || 0).toLocaleString()}`;

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function staffFloorForEnrolment(n) {
  const infant = Math.round(n * CO_AGE_MIX.infant);
  const toddler = Math.round(n * CO_AGE_MIX.toddler);
  const preschool = Math.round(n * CO_AGE_MIX.preschool);
  const schoolage = Math.max(0, n - infant - toddler - preschool);
  const teachers = Math.ceil(preschool / 6) + Math.ceil(schoolage / 10);
  const caretakers = Math.ceil(infant / 3);
  const helpers = Math.ceil(toddler / 4);
  return STAFF_ROLES.reduce((sum, role) => {
    if (role.id === 'manager' || role.id === 'security') return sum + role.salary;
    if (role.id === 'teacher') return sum + teachers * role.salary;
    if (role.id === 'baby') return sum + caretakers * role.salary;
    if (role.id === 'helper') return sum + helpers * role.salary;
    return sum;
  }, 0);
}

function buildHtml(planner) {
  // Merge with defaults
  const roles = STAFF_ROLES.map((meta) => {
    const saved = (planner.roles || []).find((r) => r.id === meta.id);
    return { ...meta, salary: saved?.salary ?? meta.salary };
  });
  const activities = ACTIVITIES.map((meta) => {
    const saved = (planner.activities || []).find((a) => a.id === meta.id);
    return { ...meta, on: saved?.on ?? meta.defaultOn, annualCost: saved?.annualCost ?? meta.annual };
  });
  const fixedRanges = FIXED_COST_RANGES.map((meta) => {
    const saved = (planner.coFixedRanges || []).find((r) => r.id === meta.id);
    return { ...meta, min: saved?.min ?? meta.min, max: saved?.max ?? meta.max };
  });
  const perChildRanges = PER_CHILD_COST_RANGES.map((meta) => {
    const saved = (planner.coPerChildRanges || []).find((r) => r.id === meta.id);
    return { ...meta, min: saved?.min ?? meta.min, max: saved?.max ?? meta.max };
  });
  const assets = DEP_ASSETS.map((meta) => {
    const saved = (planner.pfAssets || []).find((a) => a.id === meta.id);
    return { ...meta, cost: saved?.cost ?? meta.cost, life: saved?.life ?? meta.life };
  });

  const lp = calculateStaffing({
    children: planner.children,
    ageGroups: AGE_GROUPS,
    staffRoles: roles,
    budgetCap: planner.lpBudgetCap,
  });
  const totalChildren = lp.totalChildren;
  const enrolment = Math.max(1, totalChildren || 1);

  const staffFloor = staffFloorForEnrolment(Math.max(10, totalChildren || 10));
  const coFixedMin = fixedRanges.reduce((s, i) => s + i.min, 0);
  const coFixedMax = fixedRanges.reduce((s, i) => s + i.max, 0);
  const coPcMin = perChildRanges.reduce((s, i) => s + i.min, 0);
  const coPcMax = perChildRanges.reduce((s, i) => s + i.max, 0);
  const coEnrol = Math.max(10, totalChildren || 10);
  const coMin = coFixedMin + staffFloor + coPcMin * coEnrol;
  const coMax = coFixedMax + staffFloor + coPcMax * coEnrol;

  const gr = calculateGrowth({
    capacity: planner.capacity,
    initialEnrolment: planner.initialEnrolment,
    growthRate: planner.growthRate,
    months: 36,
    breakevenUnits: planner.breakevenUnits,
  });
  const m6 = gr.points.find((p) => p.month === 6)?.enrolment ?? '—';
  const m12 = gr.points.find((p) => p.month === 12)?.enrolment ?? '—';

  const pf = calculateProfit({
    enrolment,
    tuition: planner.effectiveFee,
    fixedCost: planner.fixedCost,
    variableCostPerChild: planner.variableCost,
    assets,
    nonDepreciable: NON_DEPRECIABLE_OUTLAY,
  });

  const mktAlloc = allocateMarketing(planner.marketingFixed, BE_MKT_CHANNELS);
  const now = new Date();
  const genDate = `${now.toDateString()}`;

  const bepInt = Number.isFinite(planner.breakevenUnits) ? Math.ceil(planner.breakevenUnits) : null;
  const accBep = Number.isFinite(pf.accountingBreakevenUnits) ? pf.accountingBreakevenUnits : null;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Daycare Centre Plan</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a; margin: 0; font-size: 12px; line-height: 1.5;
  }
  h1 { font-size: 26px; letter-spacing: -0.5px; margin: 0 0 4px; font-weight: 800; }
  .eyebrow { color: #64748b; font-size: 12px; margin-bottom: 24px; }
  h2 { font-size: 15px; margin: 26px 0 10px; padding-bottom: 6px; border-bottom: 2px solid #0f172a; font-weight: 800; letter-spacing: -0.2px; }
  h3 { font-size: 12px; margin: 14px 0 6px; color: #334155; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 10px; font-size: 11.5px; }
  th, td { padding: 7px 8px; border-bottom: 1px solid #e5e7eb; text-align: left; vertical-align: top; }
  th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; background: #f8fafc; font-weight: 700; }
  td.num, th.num { font-family: 'Menlo', 'Courier New', monospace; text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .kpi-grid { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 12px; }
  .kpi { flex: 1 1 145px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; }
  .kpi .lbl { color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 700; }
  .kpi .val { font-size: 16px; font-weight: 800; margin-top: 4px; font-family: 'Menlo', 'Courier New', monospace; }
  .kpi.pos .val { color: #137048; }
  .kpi.neg .val { color: #b91c1c; }
  .note { color: #64748b; font-size: 11px; margin: 2px 0 6px; }
  .brand { display: flex; align-items: baseline; gap: 8px; }
  .brand .dot { width: 10px; height: 10px; border-radius: 3px; background: #2563eb; }
  .flag-ok { color: #137048; font-weight: 700; }
  .flag-warn { color: #b91c1c; font-weight: 700; }
</style>
</head>
<body>

<div class="brand">
  <span class="dot"></span>
  <span style="font-weight:700;letter-spacing:0.5px;color:#334155;font-size:11px;text-transform:uppercase;">Daycare Centre Planner</span>
</div>
<h1>Business plan report</h1>
<div class="eyebrow">Generated ${esc(genDate)}</div>

<h2>Executive summary</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="lbl">Total children</div><div class="val">${esc(totalChildren)}</div></div>
  <div class="kpi"><div class="lbl">Effective fee</div><div class="val">${esc(rs(planner.effectiveFee))}</div></div>
  <div class="kpi"><div class="lbl">Fixed cost / mo</div><div class="val">${esc(rs(planner.fixedCost))}</div></div>
  <div class="kpi"><div class="lbl">Variable / child</div><div class="val">${esc(rs(planner.variableCost))}</div></div>
  <div class="kpi"><div class="lbl">Break-even (cash)</div><div class="val">${bepInt ? esc(bepInt + ' children') : 'Not reachable'}</div></div>
  <div class="kpi ${pf.netProfit >= 0 ? 'pos' : 'neg'}"><div class="lbl">Net profit / mo</div><div class="val">${esc(rs(pf.netProfit))}</div></div>
  <div class="kpi"><div class="lbl">Total capex</div><div class="val">${esc(rs(pf.totalCapex))}</div></div>
  <div class="kpi ${pf.roi >= 0 ? 'pos' : 'neg'}"><div class="lbl">Annual ROI</div><div class="val">${(pf.roi).toFixed(1)}%</div></div>
  <div class="kpi"><div class="lbl">Payback</div><div class="val">${Number.isFinite(pf.paybackMonths) ? pf.paybackMonths.toFixed(1) + ' mo' : 'Not reached'}</div></div>
</div>

<h2>1. Staffing (LP)</h2>
<h3>Child enrolment</h3>
<table>
  <thead><tr><th>Age group</th><th>Ratio</th><th class="num">Children</th><th class="num">Staff needed</th></tr></thead>
  <tbody>
    ${AGE_GROUPS.map((g) => `<tr>
      <td>${esc(g.label)}</td>
      <td>1:${g.ratio}</td>
      <td class="num">${esc(planner.children[g.id] ?? 0)}</td>
      <td class="num">${esc(Math.ceil((planner.children[g.id] || 0) / g.ratio))}</td>
    </tr>`).join('')}
    <tr><td colspan="2"><b>Total</b></td><td class="num"><b>${esc(totalChildren)}</b></td><td class="num"><b>${esc(lp.totalRatioStaff)}</b></td></tr>
  </tbody>
</table>

<h3>Role allocation</h3>
<table>
  <thead><tr><th>Role</th><th class="num">Qty</th><th class="num">Salary / mo</th><th class="num">Monthly cost</th><th>Note</th></tr></thead>
  <tbody>
    ${lp.roleAllocations.map((r) => `<tr>
      <td>${esc(r.label)}</td>
      <td class="num">${esc(r.required)}</td>
      <td class="num">${esc(rs(r.salary))}</td>
      <td class="num">${esc(rs(r.monthlyCost))}</td>
      <td>${esc(r.note || '')}</td>
    </tr>`).join('')}
    <tr><td><b>Total</b></td><td class="num"><b>${esc(lp.roleAllocations.reduce((s, r) => s + r.required, 0))}</b></td><td></td><td class="num"><b>${esc(rs(lp.totalStaffCost))}</b></td><td></td></tr>
  </tbody>
</table>
<div class="note">Budget cap: ${esc(rs(planner.lpBudgetCap))}. Utilisation: ${esc(rs(lp.totalStaffCost))} = <span class="${lp.totalStaffCost <= planner.lpBudgetCap ? 'flag-ok' : 'flag-warn'}">${lp.totalStaffCost <= planner.lpBudgetCap ? 'within cap' : 'over cap'}</span>.</div>

<h2>2. Cost allocation (CO)</h2>
<h3>Fixed monthly ranges</h3>
<table>
  <thead><tr><th>Category</th><th class="num">Min</th><th class="num">Max</th></tr></thead>
  <tbody>
    ${fixedRanges.map((r) => `<tr>
      <td>${esc(r.label)}</td>
      <td class="num">${esc(rs(r.min))}</td>
      <td class="num">${esc(rs(r.max))}</td>
    </tr>`).join('')}
    <tr><td><b>Fixed total</b></td><td class="num"><b>${esc(rs(coFixedMin))}</b></td><td class="num"><b>${esc(rs(coFixedMax))}</b></td></tr>
  </tbody>
</table>

<h3>Per-child ranges (Rs. / child / month)</h3>
<table>
  <thead><tr><th>Category</th><th class="num">Min</th><th class="num">Max</th></tr></thead>
  <tbody>
    ${perChildRanges.map((r) => `<tr>
      <td>${esc(r.label)}</td>
      <td class="num">${esc(rs(r.min))}</td>
      <td class="num">${esc(rs(r.max))}</td>
    </tr>`).join('')}
    <tr><td><b>Per-child subtotal</b></td><td class="num"><b>${esc(rs(coPcMin))}</b></td><td class="num"><b>${esc(rs(coPcMax))}</b></td></tr>
  </tbody>
</table>

<div class="kpi-grid">
  <div class="kpi"><div class="lbl">Staff floor (n=${esc(coEnrol)})</div><div class="val">${esc(rs(staffFloor))}</div></div>
  <div class="kpi"><div class="lbl">Minimum feasible C*</div><div class="val">${esc(rs(coMin))}</div></div>
  <div class="kpi"><div class="lbl">Maximum plausible</div><div class="val">${esc(rs(coMax))}</div></div>
  <div class="kpi ${coMin <= planner.coBudgetCap ? 'pos' : 'neg'}"><div class="lbl">Budget cap</div><div class="val">${esc(rs(planner.coBudgetCap))}</div></div>
</div>

<h2>3. Break-even (BE)</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="lbl">Base fee</div><div class="val">${esc(rs(planner.fee))}</div></div>
  <div class="kpi"><div class="lbl">Add-on ${planner.addFeeOn ? 'on' : 'off'}</div><div class="val">${esc(planner.addFeeOn ? rs(planner.addFee) : '—')}</div></div>
  <div class="kpi"><div class="lbl">Effective fee</div><div class="val">${esc(rs(planner.effectiveFee))}</div></div>
  <div class="kpi"><div class="lbl">Contribution</div><div class="val">${esc(rs(planner.contribution))}</div></div>
  <div class="kpi"><div class="lbl">n* = FC / (fee - VC)</div><div class="val">${bepInt ? esc(bepInt + ' children') : 'Not reachable'}</div></div>
</div>

<h3>Fixed cost breakdown (Rs. / month)</h3>
<table>
  <tbody>
    <tr><td>Rent</td><td class="num">${esc(rs(planner.rent))}</td></tr>
    <tr><td>Utilities</td><td class="num">${esc(rs(planner.utilities))}</td></tr>
    <tr><td>Total staff salaries</td><td class="num">${esc(rs(planner.staffSalaries))}</td></tr>
    <tr><td>Insurance and other</td><td class="num">${esc(rs(planner.otherFixed))}</td></tr>
    <tr><td>Marketing</td><td class="num">${esc(rs(planner.marketingFixed))}</td></tr>
    <tr><td>Activities (amortised)</td><td class="num">${esc(rs(planner.activitiesMonthly))}</td></tr>
    <tr><td><b>Fixed cost total</b></td><td class="num"><b>${esc(rs(planner.fixedCost))}</b></td></tr>
  </tbody>
</table>

<h3>Variable cost per child</h3>
<table>
  <tbody>
    <tr><td>Food and supplies</td><td class="num">${esc(rs(planner.variableFood))}</td></tr>
    <tr><td>Educational supplies</td><td class="num">${esc(rs(planner.variableEducation))}</td></tr>
    <tr><td>Activity materials</td><td class="num">${esc(rs(planner.variableActivity))}</td></tr>
    <tr><td>Maintenance and contingency</td><td class="num">${esc(rs(planner.variableMaintenance))}</td></tr>
    <tr><td><b>Variable per child</b></td><td class="num"><b>${esc(rs(planner.variableCost))}</b></td></tr>
  </tbody>
</table>

<h3>Marketing mix allocation</h3>
<table>
  <thead><tr><th>Channel</th><th class="num">Budget / mo</th><th>Expected reach</th></tr></thead>
  <tbody>
    ${mktAlloc.map((c) => `<tr>
      <td>${esc(c.label)}</td>
      <td class="num">${esc(rs(c.allocation))}</td>
      <td>${esc(c.reach)}</td>
    </tr>`).join('')}
  </tbody>
</table>

<h3>Annual activities (amortised)</h3>
<table>
  <thead><tr><th>Activity</th><th>Included</th><th class="num">Annual cost</th></tr></thead>
  <tbody>
    ${activities.map((a) => `<tr>
      <td>${esc(a.label)}</td>
      <td>${a.on ? 'Yes' : 'No'}</td>
      <td class="num">${esc(rs(a.annualCost))}</td>
    </tr>`).join('')}
    <tr><td><b>Monthly equivalent</b></td><td></td><td class="num"><b>${esc(rs(planner.activitiesMonthly))}</b></td></tr>
  </tbody>
</table>

<h2>4. Growth projection (GR)</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="lbl">Capacity K</div><div class="val">${esc(planner.capacity)}</div></div>
  <div class="kpi"><div class="lbl">Initial enrolment N0</div><div class="val">${esc(planner.initialEnrolment)}</div></div>
  <div class="kpi"><div class="lbl">Growth rate r</div><div class="val">${(planner.growthRate).toFixed(2)}</div></div>
  <div class="kpi"><div class="lbl">Month 6</div><div class="val">${esc(m6)}</div></div>
  <div class="kpi"><div class="lbl">Month 12</div><div class="val">${esc(m12)}</div></div>
  <div class="kpi"><div class="lbl">Break-even month</div><div class="val">${gr.breakevenMonth != null ? 'M' + esc(gr.breakevenMonth) : 'Not reached'}</div></div>
  <div class="kpi"><div class="lbl">Months to 95% capacity</div><div class="val">${esc(gr.monthsTo95)}</div></div>
  <div class="kpi"><div class="lbl">Final enrolment (M36)</div><div class="val">${esc(gr.finalEnrolment)}</div></div>
</div>
<div class="note">N(t) = K / (1 + ((K − N0) / N0) · e<sup>−r·t</sup>)</div>

<h2>5. Profit and depreciation (PF)</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="lbl">Revenue / mo</div><div class="val">${esc(rs(pf.revenue))}</div></div>
  <div class="kpi"><div class="lbl">Operating cost / mo</div><div class="val">${esc(rs(pf.operatingCost))}</div></div>
  <div class="kpi ${pf.ebitda >= 0 ? 'pos' : 'neg'}"><div class="lbl">EBITDA / mo</div><div class="val">${esc(rs(pf.ebitda))}</div></div>
  <div class="kpi"><div class="lbl">Monthly depreciation</div><div class="val">${esc(rs(pf.totalDepreciation))}</div></div>
  <div class="kpi ${pf.netProfit >= 0 ? 'pos' : 'neg'}"><div class="lbl">Net profit / mo</div><div class="val">${esc(rs(pf.netProfit))}</div></div>
  <div class="kpi"><div class="lbl">Total capex</div><div class="val">${esc(rs(pf.totalCapex))}</div></div>
  <div class="kpi"><div class="lbl">Cash break-even</div><div class="val">${bepInt ? esc(bepInt + ' children') : 'Not reachable'}</div></div>
  <div class="kpi"><div class="lbl">Accounting break-even</div><div class="val">${accBep && Number.isFinite(accBep) ? esc(accBep + ' children') : 'Not reachable'}</div></div>
  <div class="kpi"><div class="lbl">Payback</div><div class="val">${Number.isFinite(pf.paybackMonths) ? pf.paybackMonths.toFixed(1) + ' mo' : 'Not reached'}</div></div>
  <div class="kpi ${pf.roi >= 0 ? 'pos' : 'neg'}"><div class="lbl">Annual ROI</div><div class="val">${(pf.roi).toFixed(1)}%</div></div>
</div>

<h3>Capital assets (depreciable, straight-line)</h3>
<table>
  <thead><tr><th>Asset</th><th class="num">Cost</th><th class="num">Life (yr)</th><th class="num">Monthly dep.</th></tr></thead>
  <tbody>
    ${assets.map((a) => {
      const md = a.life > 0 ? a.cost / (a.life * 12) : a.cost;
      return `<tr>
        <td>${esc(a.label)}</td>
        <td class="num">${esc(rs(a.cost))}</td>
        <td class="num">${esc(a.life)}</td>
        <td class="num">${esc(rs(md))}</td>
      </tr>`;
    }).join('')}
    <tr><td><b>Depreciable subtotal</b></td><td class="num"><b>${esc(rs(pf.totalInvestment))}</b></td><td></td><td class="num"><b>${esc(rs(pf.totalDepreciation))}</b></td></tr>
  </tbody>
</table>

<h3>Non-depreciable outlay</h3>
<table>
  <tbody>
    ${NON_DEPRECIABLE_OUTLAY.map((it) => `<tr>
      <td>${esc(it.label)}</td>
      <td class="num">${esc(rs(it.cost))}</td>
    </tr>`).join('')}
    <tr><td><b>Non-depreciable subtotal</b></td><td class="num"><b>${esc(rs(pf.totalNonDepreciableOutlay))}</b></td></tr>
    <tr><td><b>Total capital outlay</b></td><td class="num"><b>${esc(rs(pf.totalCapex))}</b></td></tr>
  </tbody>
</table>

<div style="margin-top:32px;padding-top:14px;border-top:1px solid #e5e7eb;color:#94a3b8;font-size:10px;">
  This report is derived from the inputs you entered into the app. All monetary values are in Sri Lankan Rupees. Enrolment across models is linked to the Staffing tab child mix.
</div>

</body>
</html>`;
}

export async function exportPlannerReport(planner) {
  const html = buildHtml(planner);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Daycare Centre plan',
      UTI: 'com.adobe.pdf',
    });
  }
  return uri;
}
