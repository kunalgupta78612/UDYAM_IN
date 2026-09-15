import React, { useState, useEffect, useMemo } from 'react';
import { Calculator as CalcIcon, IndianRupee, Clock, TrendingDown, PieChart, ChevronDown, ChevronUp, ArrowRight, Sparkles } from 'lucide-react';
import { useChatContext } from '../context/ChatContext.jsx';
import { api } from '../services/api.js';
import { calculateEMI, calculateSubsidy, formatINR, parseSchemeFinancials } from '../services/calculatorService.js';

export const Calculator = () => {
  const { t } = useChatContext();
  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(8);
  const [tenureMonths, setTenureMonths] = useState(60);
  const [moratoriumMonths, setMoratoriumMonths] = useState(0);
  const [showAmortization, setShowAmortization] = useState(false);
  const [activeView, setActiveView] = useState('emi'); // 'emi' | 'subsidy'

  // Subsidy inputs
  const [projectCost, setProjectCost] = useState(1000000);
  const [subsidyPercent, setSubsidyPercent] = useState(25);
  const [marginPercent, setMarginPercent] = useState(90);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const data = await api.getCalculatorSchemes();
        if (data.schemes) setSchemes(data.schemes);
      } catch (err) {
        console.warn('Calculator schemes load failed, using defaults');
      }
    };
    fetchSchemes();
  }, []);

  // Auto-fill when scheme selected
  useEffect(() => {
    if (!selectedSchemeId) return;
    const scheme = schemes.find(s => s.schemeId === selectedSchemeId);
    if (scheme) {
      setInterestRate(scheme.interestRateMin || 8);
      setLoanAmount(Math.min(loanAmount, scheme.maximumLoan || 5000000));
      setTenureMonths(Math.min(tenureMonths, scheme.maxTenureMonths || 120));
      if (scheme.subsidyPercent) setSubsidyPercent(scheme.subsidyPercent);
      if (scheme.marginPercent) setMarginPercent(scheme.marginPercent);
    }
  }, [selectedSchemeId]);

  const selectedScheme = useMemo(() => schemes.find(s => s.schemeId === selectedSchemeId), [selectedSchemeId, schemes]);

  const emiResult = useMemo(() => calculateEMI(loanAmount, interestRate, tenureMonths, moratoriumMonths), [loanAmount, interestRate, tenureMonths, moratoriumMonths]);

  const subsidyResult = useMemo(() => calculateSubsidy(projectCost, subsidyPercent, marginPercent), [projectCost, subsidyPercent, marginPercent]);

  // Animated counters
  const [displayEMI, setDisplayEMI] = useState(0);
  useEffect(() => {
    if (!emiResult) return;
    const target = emiResult.emi;
    const step = Math.max(1, Math.ceil(Math.abs(target - displayEMI) / 20));
    const timer = setInterval(() => {
      setDisplayEMI(prev => {
        if (Math.abs(prev - target) < step) return target;
        return prev < target ? prev + step : prev - step;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [emiResult?.emi]);

  return (
    <div className="py-6 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md">
            <CalcIcon className="w-5 h-5" />
          </div>
          <span className="truncate">{t('calculator.title', 'Financial Calculator')}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1.5 sm:ml-12">
          {t('calculator.subtitle', 'Calculate EMI, subsidies, and repayment schedules for government MSME schemes')}
        </p>
      </div>

      {/* View Toggle */}
      <div className="grid grid-cols-2 sm:flex sm:space-x-1 bg-slate-100 p-1 rounded-2xl sm:rounded-xl w-full sm:w-fit gap-1">
        <button onClick={() => setActiveView('emi')} className={`py-2 px-3 sm:px-5 rounded-xl sm:rounded-lg text-xs font-bold transition-all justify-center ${activeView === 'emi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <span className="flex items-center justify-center space-x-1.5"><IndianRupee className="w-3.5 h-3.5" /><span className="truncate">{t('calculator.emiTab', 'EMI Calculator')}</span></span>
        </button>
        <button onClick={() => setActiveView('subsidy')} className={`py-2 px-3 sm:px-5 rounded-xl sm:rounded-lg text-xs font-bold transition-all justify-center ${activeView === 'subsidy' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <span className="flex items-center justify-center space-x-1.5"><PieChart className="w-3.5 h-3.5" /><span className="truncate">{t('calculator.subsidyTab', 'Subsidy Breakdown')}</span></span>
        </button>
      </div>

      {activeView === 'emi' ? (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-5 p-6 bg-white rounded-3xl border border-slate-200 shadow-lg">
            {/* Scheme Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('calculator.selectScheme', 'Select Scheme')}
              </label>
              <select
                value={selectedSchemeId}
                onChange={(e) => setSelectedSchemeId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">{t('calculator.customParams', '— Custom Parameters —')}</option>
                {schemes.map(s => (
                  <option key={s.schemeId} value={s.schemeId}>{s.name} ({s.organization})</option>
                ))}
              </select>
            </div>

            {/* Loan Amount */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('calculator.loanAmount', 'Loan Amount')} — {formatINR(loanAmount)}
              </label>
              <input
                type="range"
                min={10000}
                max={selectedScheme?.maximumLoan || 10000000}
                step={10000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-brand-200 to-brand-500 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>{formatINR(10000)}</span>
                <span>{formatINR(selectedScheme?.maximumLoan || 10000000)}</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('calculator.interestRate', 'Interest Rate')} — {interestRate}% p.a.
              </label>
              <input
                type="range"
                min={0}
                max={20}
                step={0.5}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-emerald-200 to-emerald-500 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              {selectedScheme && (
                <p className="text-[10px] text-amber-600 font-semibold mt-1">
                  Scheme range: {selectedScheme.interestRateMin}% - {selectedScheme.interestRateMax}% p.a.
                </p>
              )}
            </div>

            {/* Tenure */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('calculator.tenure', 'Loan Tenure')} — {tenureMonths} {t('calculator.months', 'months')} ({(tenureMonths / 12).toFixed(1)} {t('calculator.years', 'years')})
              </label>
              <input
                type="range"
                min={6}
                max={selectedScheme?.maxTenureMonths || 240}
                step={6}
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-indigo-200 to-indigo-500 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Moratorium */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('calculator.moratorium', 'Moratorium Period')} — {moratoriumMonths} {t('calculator.months', 'months')}
              </label>
              <input
                type="range"
                min={0}
                max={12}
                step={1}
                value={moratoriumMonths}
                onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-amber-200 to-amber-500 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">{t('calculator.moratoriumHint', 'Interest-only payments during moratorium period')}</p>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3 space-y-5">
            {emiResult ? (
              <>
                {/* EMI Hero Card */}
                <div className="p-8 rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <p className="text-brand-200 text-xs font-bold uppercase tracking-wider">{t('calculator.monthlyEMI', 'Monthly EMI')}</p>
                    <div className="text-5xl font-black mt-2 tracking-tight">
                      {formatINR(displayEMI)}
                    </div>
                    {moratoriumMonths > 0 && (
                      <p className="text-brand-200 text-[11px] mt-1.5">
                        {t('calculator.moratoriumPayment', 'During moratorium')}: {formatINR(emiResult.moratoriumInterestPerMonth)}/month (interest only)
                      </p>
                    )}
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{t('calculator.totalInterest', 'Total Interest')}</p>
                    <p className="text-lg font-black text-rose-600 mt-1">{formatINR(emiResult.totalInterest)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{t('calculator.totalPayment', 'Total Payment')}</p>
                    <p className="text-lg font-black text-slate-800 mt-1">{formatINR(emiResult.totalPayment)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{t('calculator.interestRatio', 'Interest Ratio')}</p>
                    <p className="text-lg font-black text-amber-600 mt-1">{Math.round(emiResult.totalInterest / emiResult.totalPrincipal * 100)}%</p>
                  </div>
                </div>

                {/* Interest vs Principal Visual */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">{t('calculator.breakdownTitle', 'Payment Breakdown')}</p>
                  <div className="flex rounded-xl overflow-hidden h-6">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
                      style={{ width: `${Math.round(emiResult.totalPrincipal / emiResult.totalPayment * 100)}%` }}
                    >
                      {t('calculator.principal', 'Principal')} {Math.round(emiResult.totalPrincipal / emiResult.totalPayment * 100)}%
                    </div>
                    <div
                      className="bg-gradient-to-r from-rose-400 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
                      style={{ width: `${Math.round(emiResult.totalInterest / emiResult.totalPayment * 100)}%` }}
                    >
                      {t('calculator.interest', 'Interest')} {Math.round(emiResult.totalInterest / emiResult.totalPayment * 100)}%
                    </div>
                  </div>
                </div>

                {/* Yearly Summary */}
                {emiResult.yearlySummary && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">{t('calculator.yearlySummary', 'Year-wise Summary')}</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="py-2 text-left font-bold text-slate-600">{t('calculator.year', 'Year')}</th>
                            <th className="py-2 text-right font-bold text-slate-600">{t('calculator.principalPaid', 'Principal')}</th>
                            <th className="py-2 text-right font-bold text-slate-600">{t('calculator.interestPaid', 'Interest')}</th>
                            <th className="py-2 text-right font-bold text-slate-600">{t('calculator.balance', 'Balance')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {emiResult.yearlySummary.map((yr) => (
                            <tr key={yr.year} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-2 font-semibold text-slate-800">Year {yr.year}</td>
                              <td className="py-2 text-right text-brand-700 font-semibold">{formatINR(yr.totalPrincipal)}</td>
                              <td className="py-2 text-right text-rose-600 font-semibold">{formatINR(yr.totalInterest)}</td>
                              <td className="py-2 text-right text-slate-700 font-semibold">{formatINR(yr.closingBalance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Amortization Toggle */}
                <button
                  onClick={() => setShowAmortization(!showAmortization)}
                  className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <span className="flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-brand-600" />
                    <span>{t('calculator.amortization', 'Amortization Schedule')}</span>
                  </span>
                  {showAmortization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAmortization && (
                  <div className="p-3 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm max-h-96 overflow-y-auto overflow-x-auto">
                    <table className="w-full min-w-[480px] text-[11px]">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-slate-200">
                          <th className="py-2 text-left font-bold text-slate-600">#</th>
                          <th className="py-2 text-center font-bold text-slate-600">Type</th>
                          <th className="py-2 text-right font-bold text-slate-600">Payment</th>
                          <th className="py-2 text-right font-bold text-slate-600">Principal</th>
                          <th className="py-2 text-right font-bold text-slate-600">Interest</th>
                          <th className="py-2 text-right font-bold text-slate-600">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emiResult.schedule.slice(0, 60).map((row) => (
                          <tr key={row.month} className={`border-b border-slate-50 ${row.type === 'MORATORIUM' ? 'bg-amber-50/50' : 'hover:bg-slate-50'}`}>
                            <td className="py-1.5 font-semibold text-slate-700">{row.month}</td>
                            <td className="py-1.5 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${row.type === 'MORATORIUM' ? 'bg-amber-100 text-amber-700' : 'bg-brand-50 text-brand-700'}`}>
                                {row.type}
                              </span>
                            </td>
                            <td className="py-1.5 text-right font-semibold">{formatINR(row.payment)}</td>
                            <td className="py-1.5 text-right text-brand-700">{formatINR(row.principal)}</td>
                            <td className="py-1.5 text-right text-rose-600">{formatINR(row.interest)}</td>
                            <td className="py-1.5 text-right font-semibold text-slate-700">{formatINR(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center text-slate-400 text-xs">
                {t('calculator.adjustSliders', 'Adjust sliders to calculate EMI')}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Subsidy View */
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-5 p-6 bg-white rounded-3xl border border-slate-200 shadow-lg">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('calculator.selectScheme', 'Select Scheme')}
              </label>
              <select value={selectedSchemeId} onChange={(e) => setSelectedSchemeId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-brand-500">
                <option value="">— Custom Parameters —</option>
                {schemes.map(s => <option key={s.schemeId} value={s.schemeId}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('calculator.projectCost', 'Project Cost')} — {formatINR(projectCost)}
              </label>
              <input type="range" min={50000} max={10000000} step={50000} value={projectCost} onChange={(e) => setProjectCost(Number(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-brand-200 to-brand-500 rounded-lg appearance-none cursor-pointer accent-brand-600" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('calculator.subsidyRate', 'Government Subsidy Rate')} — {subsidyPercent}%
              </label>
              <input type="range" min={0} max={50} step={1} value={subsidyPercent} onChange={(e) => setSubsidyPercent(Number(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-emerald-200 to-emerald-500 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('calculator.marginMoney', 'Loan / Margin Money Coverage')} — {marginPercent}%
              </label>
              <input type="range" min={0} max={100} step={5} value={marginPercent} onChange={(e) => setMarginPercent(Number(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-indigo-200 to-indigo-500 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
          </div>

          <div className="space-y-5">
            {subsidyResult && (
              <>
                <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-2xl">
                  <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider">{t('calculator.govtBenefit', 'Government Benefit')}</p>
                  <div className="text-4xl font-black mt-2">{formatINR(subsidyResult.govtTotal)}</div>
                  <p className="text-emerald-200 text-xs mt-1">{subsidyResult.govtPercent}% {t('calculator.ofProjectCost', 'of project cost covered')}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{t('calculator.subsidyAmount', 'Subsidy')}</p>
                    <p className="text-lg font-black text-emerald-600">{formatINR(subsidyResult.subsidyAmount)}</p>
                    <p className="text-[10px] text-slate-400">{subsidyResult.subsidyPercent}% grant</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{t('calculator.ownContribution', 'Own Contribution')}</p>
                    <p className="text-lg font-black text-slate-800">{formatINR(subsidyResult.ownContribution)}</p>
                    <p className="text-[10px] text-slate-400">{100 - marginPercent - subsidyPercent > 0 ? `${100 - marginPercent - subsidyPercent}%` : '0%'}</p>
                  </div>
                </div>

                {/* Visual Pie-like breakdown */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">{t('calculator.fundingBreakdown', 'Funding Breakdown')}</p>
                  <div className="flex rounded-xl overflow-hidden h-8">
                    {subsidyPercent > 0 && (
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${subsidyPercent}%` }}>
                        Subsidy {subsidyPercent}%
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${Math.max(0, marginPercent - subsidyPercent)}%` }}>
                      Loan
                    </div>
                    {100 - marginPercent > 0 && (
                      <div className="bg-gradient-to-r from-slate-400 to-slate-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${100 - marginPercent}%` }}>
                        Own {100 - marginPercent}%
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
