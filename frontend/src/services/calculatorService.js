/**
 * Client-side EMI Calculator Service
 * Pure deterministic math — no API calls needed for instant interactivity.
 */

/**
 * Calculate EMI using reducing balance formula.
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 */
export const calculateEMI = (principal, annualRate, tenureMonths, moratoriumMonths = 0) => {
  if (principal <= 0 || annualRate < 0 || tenureMonths <= 0) return null;

  const monthlyRate = annualRate / 100 / 12;
  const repaymentMonths = tenureMonths - moratoriumMonths;
  if (repaymentMonths <= 0) return null;

  const moratoriumInterestPerMonth = Math.round(principal * monthlyRate);

  let emi;
  if (monthlyRate === 0) {
    emi = principal / repaymentMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, repaymentMonths);
    emi = principal * monthlyRate * factor / (factor - 1);
  }
  emi = Math.round(emi);

  // Amortization schedule
  const schedule = [];
  let balance = principal;

  for (let m = 1; m <= moratoriumMonths; m++) {
    const interest = Math.round(balance * monthlyRate);
    schedule.push({ month: m, type: 'MORATORIUM', payment: interest, principal: 0, interest, balance });
  }

  for (let m = 1; m <= repaymentMonths; m++) {
    const interest = Math.round(balance * monthlyRate);
    const princ = Math.round(emi - interest);
    balance = Math.max(0, balance - princ);
    schedule.push({
      month: moratoriumMonths + m,
      type: 'EMI',
      payment: emi,
      principal: princ,
      interest,
      balance: Math.round(balance)
    });
  }

  const totalInterest = schedule.reduce((sum, r) => sum + r.interest, 0);
  const totalPayment = (moratoriumInterestPerMonth * moratoriumMonths) + (emi * repaymentMonths);

  return {
    emi,
    totalInterest,
    totalPayment: Math.round(totalPayment),
    totalPrincipal: principal,
    moratoriumMonths,
    repaymentMonths,
    moratoriumInterestPerMonth,
    schedule,
    yearlySummary: generateYearlySummary(schedule)
  };
};

const generateYearlySummary = (schedule) => {
  const years = {};
  for (const row of schedule) {
    const year = Math.ceil(row.month / 12);
    if (!years[year]) years[year] = { year, totalPayment: 0, totalPrincipal: 0, totalInterest: 0, closingBalance: 0 };
    years[year].totalPayment += row.payment;
    years[year].totalPrincipal += row.principal;
    years[year].totalInterest += row.interest;
    years[year].closingBalance = row.balance;
  }
  return Object.values(years).map(y => ({
    year: y.year,
    totalPayment: Math.round(y.totalPayment),
    totalPrincipal: Math.round(y.totalPrincipal),
    totalInterest: Math.round(y.totalInterest),
    closingBalance: Math.round(y.closingBalance)
  }));
};

/**
 * Calculate subsidy breakdown for a project.
 */
export const calculateSubsidy = (projectCost, subsidyPercent, marginPercent = 0) => {
  const subsidyAmount = Math.round(projectCost * subsidyPercent / 100);
  const marginMoney = Math.round(projectCost * marginPercent / 100);
  const loanComponent = projectCost - subsidyAmount;
  const ownContribution = Math.round(projectCost * Math.max(0, 100 - marginPercent - subsidyPercent) / 100);

  return {
    projectCost,
    subsidyPercent,
    subsidyAmount,
    marginPercent,
    marginMoney,
    loanComponent,
    ownContribution,
    govtTotal: subsidyAmount + marginMoney,
    govtPercent: Math.round((subsidyAmount + marginMoney) / projectCost * 100)
  };
};

/**
 * Format INR amount in Indian locale
 */
export const formatINR = (amount) => {
  if (!amount && amount !== 0) return '—';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

/**
 * Parse scheme financial parameters from raw scheme data.
 */
export const parseSchemeFinancials = (scheme) => {
  const fb = scheme.financialBenefits || scheme;
  
  let interestRateMin = 8, interestRateMax = 8;
  const rateStr = String(fb.interestRate || fb.interestRateRaw || '');
  const rates = rateStr.match(/(\d+\.?\d*)\s*%/g);
  if (rates?.length >= 1) {
    interestRateMin = parseFloat(rates[0]);
    interestRateMax = rates.length >= 2 ? parseFloat(rates[rates.length - 1]) : interestRateMin;
  }

  let maxTenureYears = 5;
  const tenureStr = String(fb.repaymentPeriod || fb.repaymentPeriodRaw || '');
  const years = tenureStr.match(/(\d+)\s*year/gi);
  if (years?.length > 0) {
    maxTenureYears = Math.max(...years.map(y => parseInt(y)));
  }

  let subsidyPercent = 0;
  const subsidyStr = String(fb.subsidy || fb.subsidyRaw || '');
  const sPercents = subsidyStr.match(/(\d+\.?\d*)\s*%/g);
  if (sPercents) subsidyPercent = Math.max(...sPercents.map(p => parseFloat(p)));

  let marginPercent = 0;
  const marginStr = String(fb.marginMoney || fb.marginMoneyRaw || '');
  const mPercents = marginStr.match(/(\d+\.?\d*)\s*%/g);
  if (mPercents) marginPercent = Math.max(...mPercents.map(p => parseFloat(p)));

  return {
    minimumLoan: fb.minimumLoan || 10000,
    maximumLoan: fb.maximumLoan || 1000000,
    interestRateMin,
    interestRateMax,
    maxTenureYears,
    maxTenureMonths: maxTenureYears * 12,
    subsidyPercent,
    marginPercent
  };
};
