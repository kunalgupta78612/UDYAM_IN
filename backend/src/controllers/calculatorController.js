/**
 * Financial Calculator Controller
 * 
 * Provides deterministic EMI and subsidy calculations using scheme-specific
 * parameters from the verified scheme database. No LLM involved.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Scheme } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedSchemes = null;
const getSeedSchemesFallback = () => {
  if (!cachedSchemes) {
    const raw = fs.readFileSync(path.join(__dirname, '../../seed/schemes.json'), 'utf8');
    cachedSchemes = JSON.parse(raw);
  }
  return cachedSchemes;
};

/**
 * Core EMI calculation using reducing balance method.
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 * 
 * @param {number} principal - Loan amount in INR
 * @param {number} annualRate - Annual interest rate (e.g. 6.5 for 6.5%)
 * @param {number} tenureMonths - Total tenure in months
 * @param {number} moratoriumMonths - Interest-only moratorium period
 * @returns {Object} EMI details with amortization
 */
const calculateEMI = (principal, annualRate, tenureMonths, moratoriumMonths = 0) => {
  if (principal <= 0 || annualRate < 0 || tenureMonths <= 0) {
    return null;
  }

  const monthlyRate = annualRate / 100 / 12;
  const repaymentMonths = tenureMonths - moratoriumMonths;

  if (repaymentMonths <= 0) {
    return null;
  }

  // Interest during moratorium (interest-only payments)
  const moratoriumInterestPerMonth = principal * monthlyRate;
  const totalMoratoriumInterest = moratoriumInterestPerMonth * moratoriumMonths;

  // EMI calculation (reducing balance)
  let emi;
  if (monthlyRate === 0) {
    emi = principal / repaymentMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, repaymentMonths);
    emi = principal * monthlyRate * factor / (factor - 1);
  }

  emi = Math.round(emi * 100) / 100;

  // Generate amortization schedule
  const amortization = [];
  let balance = principal;

  // Moratorium period entries
  for (let m = 1; m <= moratoriumMonths; m++) {
    const interest = Math.round(balance * monthlyRate * 100) / 100;
    amortization.push({
      month: m,
      type: 'MORATORIUM',
      payment: Math.round(interest * 100) / 100,
      principal: 0,
      interest,
      balance: Math.round(balance * 100) / 100
    });
  }

  // Repayment period entries
  for (let m = 1; m <= repaymentMonths; m++) {
    const interest = Math.round(balance * monthlyRate * 100) / 100;
    const principalPaid = Math.round((emi - interest) * 100) / 100;
    balance = Math.max(0, balance - principalPaid);

    amortization.push({
      month: moratoriumMonths + m,
      type: 'EMI',
      payment: Math.round(emi * 100) / 100,
      principal: principalPaid,
      interest,
      balance: Math.round(balance * 100) / 100
    });
  }

  const totalInterest = amortization.reduce((sum, row) => sum + row.interest, 0);
  const totalPayment = totalMoratoriumInterest + (emi * repaymentMonths);

  return {
    emi: Math.round(emi),
    monthlyRate: Math.round(monthlyRate * 10000) / 10000,
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    totalPrincipal: principal,
    moratoriumMonths,
    repaymentMonths,
    totalMonths: tenureMonths,
    moratoriumInterestPerMonth: Math.round(moratoriumInterestPerMonth),
    amortization: amortization.slice(0, 60), // Cap at 5 years of detail
    yearlySummary: generateYearlySummary(amortization)
  };
};

/**
 * Generates yearly summary from amortization schedule
 */
const generateYearlySummary = (amortization) => {
  const years = {};
  for (const row of amortization) {
    const year = Math.ceil(row.month / 12);
    if (!years[year]) {
      years[year] = { year, totalPayment: 0, totalPrincipal: 0, totalInterest: 0, closingBalance: 0 };
    }
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
 * Parses scheme-specific financial parameters from the scheme document.
 */
const parseSchemeFinancials = (scheme) => {
  const fb = scheme.financialBenefits || {};
  
  // Parse interest rate (extract first numeric value from string like "6% to 9% p.a.")
  let interestRateMin = 8; // Default
  let interestRateMax = 8;
  if (fb.interestRate) {
    const rateStr = String(fb.interestRate);
    const rates = rateStr.match(/(\d+\.?\d*)\s*%/g);
    if (rates && rates.length >= 1) {
      interestRateMin = parseFloat(rates[0]);
      interestRateMax = rates.length >= 2 ? parseFloat(rates[rates.length - 1]) : interestRateMin;
    }
  }

  // Parse repayment period (extract years from string like "Up to 5 to 10 years")
  let maxTenureYears = 5;
  if (fb.repaymentPeriod) {
    const tenureStr = String(fb.repaymentPeriod);
    const years = tenureStr.match(/(\d+)\s*year/gi);
    if (years && years.length > 0) {
      const nums = years.map(y => parseInt(y));
      maxTenureYears = Math.max(...nums);
    }
  }

  // Parse subsidy percentage
  let subsidyPercent = 0;
  let subsidyMax = 0;
  if (fb.subsidy) {
    const subsidyStr = String(fb.subsidy);
    const percents = subsidyStr.match(/(\d+\.?\d*)\s*%/g);
    if (percents) {
      subsidyPercent = Math.max(...percents.map(p => parseFloat(p)));
    }
    const amounts = subsidyStr.match(/₹\s*([\d,]+)/g);
    if (amounts) {
      subsidyMax = Math.max(...amounts.map(a => parseInt(a.replace(/[₹,\s]/g, ''))));
    }
  }

  // Parse margin money
  let marginPercent = 0;
  if (fb.marginMoney) {
    const marginStr = String(fb.marginMoney);
    const percents = marginStr.match(/(\d+\.?\d*)\s*%/g);
    if (percents) {
      marginPercent = Math.max(...percents.map(p => parseFloat(p)));
    }
  }

  return {
    minimumLoan: fb.minimumLoan || 10000,
    maximumLoan: fb.maximumLoan || 1000000,
    interestRateMin,
    interestRateMax,
    maxTenureYears,
    maxTenureMonths: maxTenureYears * 12,
    subsidyPercent,
    subsidyMax,
    marginPercent,
    repaymentPeriodRaw: fb.repaymentPeriod || null,
    interestRateRaw: fb.interestRate || null,
    subsidyRaw: fb.subsidy || null,
    marginMoneyRaw: fb.marginMoney || null
  };
};

/**
 * POST /api/calculator/emi
 * Calculate EMI for a specific scheme or custom parameters
 */
export const calculateEMIEndpoint = async (req, res, next) => {
  try {
    const { schemeId, loanAmount, tenureMonths, interestRate, moratoriumMonths } = req.body;

    let schemeInfo = null;
    let financials = null;

    // If schemeId provided, load scheme-specific parameters
    if (schemeId) {
      const isDbConnected = mongoose.connection.readyState === 1;
      let scheme = null;

      if (isDbConnected) {
        try {
          scheme = await Scheme.findOne({ schemeId, status: 'ACTIVE' }).lean();
        } catch (err) {
          // fallback
        }
      }

      if (!scheme) {
        scheme = getSeedSchemesFallback().find(s => s.schemeId === schemeId);
      }

      if (scheme) {
        financials = parseSchemeFinancials(scheme);
        schemeInfo = {
          schemeId: scheme.schemeId,
          name: scheme.name,
          organization: scheme.organization?.name
        };
      }
    }

    // Determine calculation parameters
    const principal = loanAmount || (financials?.maximumLoan || 500000);
    const rate = interestRate || (financials?.interestRateMin || 8);
    const tenure = tenureMonths || (financials?.maxTenureMonths || 60);
    const moratorium = moratoriumMonths || 0;

    // Validate bounds
    if (financials) {
      if (principal > financials.maximumLoan) {
        return res.status(400).json({
          success: false,
          error: `Loan amount ₹${principal.toLocaleString('en-IN')} exceeds scheme maximum of ₹${financials.maximumLoan.toLocaleString('en-IN')}`
        });
      }
    }

    const result = calculateEMI(principal, rate, tenure, moratorium);

    if (!result) {
      return res.status(400).json({
        success: false,
        error: 'Invalid calculation parameters. Ensure loan amount > 0, rate >= 0, tenure > moratorium.'
      });
    }

    return res.json({
      success: true,
      scheme: schemeInfo,
      parameters: {
        loanAmount: principal,
        annualInterestRate: rate,
        tenureMonths: tenure,
        moratoriumMonths: moratorium
      },
      schemeFinancials: financials,
      calculation: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/calculator/subsidy
 * Calculate subsidy breakdown for a project under a specific scheme
 */
export const calculateSubsidyEndpoint = async (req, res, next) => {
  try {
    const { schemeId, projectCost, category, location } = req.body;

    if (!projectCost || projectCost <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid project cost.'
      });
    }

    let scheme = null;
    let financials = null;

    if (schemeId) {
      const isDbConnected = mongoose.connection.readyState === 1;
      if (isDbConnected) {
        try {
          scheme = await Scheme.findOne({ schemeId, status: 'ACTIVE' }).lean();
        } catch (err) {
          // fallback
        }
      }
      if (!scheme) {
        scheme = getSeedSchemesFallback().find(s => s.schemeId === schemeId);
      }
    }

    if (scheme) {
      financials = parseSchemeFinancials(scheme);
    }

    // Calculate subsidy components
    const subsidyPercent = financials?.subsidyPercent || 0;
    const marginPercent = financials?.marginPercent || 0;

    // Determine subsidy based on category and location (PMEGP-style tiered subsidy)
    let effectiveSubsidyPercent = subsidyPercent;
    if (scheme?.schemeId === 'pmegp_014') {
      // PMEGP special rules: SC/ST/Women get 35% (rural) / 25% (urban), General gets 25% (rural) / 15% (urban)
      const isSpecialCategory = ['SC', 'ST'].includes(category) || category === 'women';
      const isRural = location === 'rural';
      if (isSpecialCategory) {
        effectiveSubsidyPercent = isRural ? 35 : 25;
      } else {
        effectiveSubsidyPercent = isRural ? 25 : 15;
      }
    }

    const subsidyAmount = Math.min(
      Math.round(projectCost * effectiveSubsidyPercent / 100),
      financials?.subsidyMax || Infinity
    );
    const marginMoneyFromGovt = Math.round(projectCost * marginPercent / 100);
    const loanComponent = projectCost - subsidyAmount;
    const ownContribution = Math.max(0, projectCost - subsidyAmount - marginMoneyFromGovt - loanComponent);
    const effectiveLoan = loanComponent;

    const breakdown = {
      projectCost,
      subsidyPercent: effectiveSubsidyPercent,
      subsidyAmount,
      marginMoneyPercent: marginPercent,
      marginMoneyAmount: marginMoneyFromGovt,
      loanComponent: effectiveLoan,
      ownContribution: Math.round(projectCost * (100 - marginPercent - effectiveSubsidyPercent) / 100),
      governmentBenefitTotal: subsidyAmount + marginMoneyFromGovt,
      percentageCoveredByGovt: Math.round((subsidyAmount + marginMoneyFromGovt) / projectCost * 100)
    };

    return res.json({
      success: true,
      scheme: scheme ? {
        schemeId: scheme.schemeId,
        name: scheme.name,
        organization: scheme.organization?.name
      } : null,
      schemeFinancials: financials,
      breakdown
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/calculator/schemes
 * Returns all schemes with their parsed financial parameters for calculator dropdown
 */
export const getCalculatorSchemes = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let schemes = [];

    if (isDbConnected) {
      try {
        schemes = await Scheme.find({ status: 'ACTIVE' }).lean();
      } catch (err) {
        schemes = getSeedSchemesFallback();
      }
    } else {
      schemes = getSeedSchemesFallback();
    }

    const calculatorSchemes = schemes
      .filter(s => s.financialBenefits && (s.financialBenefits.maximumLoan || s.financialBenefits.interestRate))
      .map(s => ({
        schemeId: s.schemeId,
        name: s.name,
        organization: s.organization?.name,
        ...parseSchemeFinancials(s)
      }));

    return res.json({
      success: true,
      schemes: calculatorSchemes
    });
  } catch (error) {
    next(error);
  }
};
