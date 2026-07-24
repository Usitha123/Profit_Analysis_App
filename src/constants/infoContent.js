import { COST_REFERENCE, STAFFING_REFERENCE, FURNITURE_REFERENCE } from './modelData';

// Info drawer content, one entry per tab. Loaded into the drawer opened via the top-right info button.
export const TAB_INFO = {
  lp: {
    title: 'Staffing model',
    subtitle: 'Linear programming - minimise staff cost under ratio constraints and a monthly budget.',
    sections: [
      {
        type: 'variables',
        title: 'Variables to determine',
        items: [
          { label: 'Child mix', text: 'Expected infants, toddlers, pre-school, school-age enrolment.' },
          { label: 'Role salaries', text: 'Replace defaults with your actual hiring estimates.' },
          { label: 'Budget cap', text: 'Monthly staffing ceiling you can sustain before scale-up.' },
        ],
      },
      {
        type: 'equation',
        title: 'Optimisation',
        text: 'Minimise Z = S_mgr*m + S_teach*t + S_baby*b + S_help*h + S_sec*s\nSubject to:\n  baby carers   >= ceil(infants / 3)\n  helpers       >= ceil(toddlers / 4)\n  teachers      >= ceil(pre / 6) + ceil(school / 10)\n  manager = 1, security = 1\n  Z <= Budget cap',
      },
      {
        type: 'reference',
        title: 'Reference examples',
        items: STAFFING_REFERENCE,
      },
    ],
  },

  co: {
    title: 'Cost optimisation',
    subtitle: 'Allocate the whole monthly operating budget across every category at a target enrolment.',
    sections: [
      {
        type: 'variables',
        title: 'How this model is built',
        items: [
          { label: 'Staff floor', text: 'Recomputed from ratios at the chosen enrolment. Not guessed.' },
          { label: 'Fixed costs', text: 'Do not scale per child but widen as centre size grows.' },
          { label: 'Variable costs', text: 'Food, supplies, materials, maintenance scale with enrolment.' },
          { label: 'Objective', text: 'Positive coefficients bind every category at its floor for min cost.' },
        ],
      },
      {
        type: 'equation',
        title: 'Cost structure',
        text: 'Minimise C = Rent + Util + Ins + Mkt + Activities\n            + Staff floor(n)\n            + (Food + Edu + Act + Maint) * n\nSubject to each term >= floor and C <= Budget cap',
      },
      { type: 'reference', title: 'Reference (survey of 12 centres)', items: COST_REFERENCE },
      {
        type: 'reference',
        title: 'Furniture and material examples',
        items: FURNITURE_REFERENCE.map((f) => ({ label: f.label, value: f.range, icon: 'sofa-outline' })),
      },
      { type: 'note', title: 'Capital note', text: 'Furniture is one-off capital, depreciated in the Profit tab. Not a monthly cost.' },
    ],
  },

  be: {
    title: 'Break-even',
    subtitle: 'Enrolment n where revenue equals total cost. Powers Growth and Profit tabs.',
    sections: [
      {
        type: 'variables',
        title: 'How this model works',
        items: [
          { label: 'Fixed cost', text: 'Rent, utilities, staff salaries, insurance, marketing, amortised activities.' },
          { label: 'Variable cost', text: 'Food, education, activity materials, maintenance. Scales per child.' },
          { label: 'Fee', text: 'Monthly tuition plus optional recurring add-on (transport, meals, hours).' },
          { label: 'Downstream', text: 'Growth tab draws BE line from these values. Profit tab pulls fee and cost.' },
        ],
      },
      {
        type: 'equation',
        title: 'Break-even equation',
        text: 'fee = base + (addOn ? addFee : 0)\nfc  = rent + util + salaries + insurance + marketing + activities/12\nvc  = food + edu + activity + maintenance\n\nRevenue(n) = fee * n\nCost(n)    = fc + vc * n\nn*         = fc / (fee - vc)',
      },
      {
        type: 'note',
        title: 'Interpretation',
        text: 'n* is enrolment where the centre stops losing money at the operating level, before depreciation and capital recovery.',
      },
    ],
  },

  gr: {
    title: 'Growth projection',
    subtitle: 'Logistic S-curve. Enrolment accelerates early, plateaus near capacity K.',
    sections: [
      {
        type: 'variables',
        title: 'Variables to determine',
        items: [
          { label: 'Capacity K', text: 'Licensed or physically possible child count. Not aspirational.' },
          { label: 'Initial enrolment N0', text: 'Realistic launch-month enrolment after pre-sales and first tours.' },
          { label: 'Growth rate r', text: 'Higher = faster parent acquisition and word-of-mouth spread.' },
        ],
      },
      {
        type: 'equation',
        title: 'Logistic equation',
        text: 'N(t) = K / (1 + ((K - N0) / N0) * e^(-r * t))\n\nBreak-even month = first t where N(t) >= n*  (n* from BE tab)',
      },
      {
        type: 'note',
        title: 'Reading the chart',
        text: 'Red dashed line = capacity. Green dashed line = break-even enrolment. When the S-curve crosses the green line, the centre stops losing money.',
      },
    ],
  },

  pf: {
    title: 'Profit and depreciation',
    subtitle: 'Net profit = Revenue - Operating cost - Depreciation. Pulls fee and cost live from BE tab.',
    sections: [
      {
        type: 'variables',
        title: 'Variables to determine',
        items: [
          { label: 'Capital items', text: 'Replace every cost and useful life with your actual quotation.' },
          { label: 'Non-depreciable outlay', text: 'Legal fees, launch marketing, working capital reserve. Real cash out but not depreciated.' },
          { label: 'Interpretation', text: 'Positive net profit != recovered startup cash. Payback tracks that separately.' },
        ],
      },
      {
        type: 'equation',
        title: 'Profit equations',
        text: 'EBITDA(n)     = fee * n - (fc + vc * n)\nMonthly dep.  = sum(cost_i / life_i) / 12\nNet profit(n) = EBITDA(n) - Monthly dep.\n\nAccounting BE = (fc + Monthly dep.) / (fee - vc)\nPayback       = Total capex / Net profit\nAnnual ROI    = (Net profit * 12 / Total capex) * 100',
      },
      {
        type: 'note',
        title: 'Chart legend',
        text: 'Green vertical = cash break-even (BE tab). Purple vertical = accounting break-even including depreciation. Purple curve = net profit vs enrolment.',
      },
    ],
  },
};
