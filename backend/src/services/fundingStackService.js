/**
 * Funding Stack Generator: Discovers legal convergence between complementary schemes.
 */

export const generateFundingStacks = (eligibleSchemes = [], profile = {}) => {
  const stacks = [];

  const hasPmegp = eligibleSchemes.some(s => s.schemeId === 'pmegp_014');
  const hasMudra = eligibleSchemes.some(s => s.schemeId.startsWith('mudra_'));
  const hasVishwakarma = eligibleSchemes.some(s => s.schemeId === 'pm_vishwakarma_017');
  const hasSwarnima = eligibleSchemes.some(s => s.schemeId === 'nbcfdc_swarnima_005');
  const hasStandup = eligibleSchemes.some(s => s.schemeId === 'standup_india_011');
  const hasNsfdc = eligibleSchemes.some(s => s.schemeId.startsWith('nsfdc_'));

  // Stack 1: Subsidy + Low-Interest Term Loan (PMEGP + MUDRA / SCA)
  if (hasPmegp && (hasMudra || hasSwarnima || hasNsfdc)) {
    const loanPartner = eligibleSchemes.find(s => s.schemeId.startsWith('mudra_') || s.schemeId.startsWith('nbcfdc_') || s.schemeId.startsWith('nsfdc_'));
    stacks.push({
      stackId: 'stack_subsidy_loan',
      title: 'Capital Subsidy + Concessional Term Loan Stack',
      titleHi: 'पूंजीगत सब्सिडी + रियायती सावधि ऋण संयोजन',
      badge: 'High Financial Synergy',
      primaryScheme: 'PMEGP (15% - 35% Capital Subsidy)',
      secondaryScheme: loanPartner?.schemeName || 'MUDRA Loan',
      benefitSummary: 'Receive up to 35% government grant on capital investment, with remaining project finance covered by low-interest credit.',
      benefitSummaryHi: 'पूंजी निवेश पर 35% तक का सरकारी अनुदान प्राप्त करें, और शेष परियोजना लागत रियायती ऋण से पूरी करें।',
      legalClause: 'Operational under MoMSME & MoSJE Convergence Guidelines.'
    });
  }

  // Stack 2: Artisan Skill & Toolkit + Micro Credit (PM Vishwakarma + NBCFDC / NSFDC)
  if (hasVishwakarma && (hasSwarnima || hasNsfdc || hasMudra)) {
    stacks.push({
      stackId: 'stack_artisan_combo',
      title: 'Artisan Toolkit Incentive + Micro-Credit Expansion',
      titleHi: 'कारीगर टूलकिट प्रोत्साहन + माइक्रो-क्रेडिट विस्तार',
      badge: 'Zero-Collateral Synergy',
      primaryScheme: 'PM Vishwakarma (₹15,000 Toolkit + Skill Verification)',
      secondaryScheme: 'Micro Credit Yojana / Swarnima',
      benefitSummary: 'Combine modern toolkit grant and skill stipend with concessional working capital at 4%-5% p.a.',
      benefitSummaryHi: 'आधुनिक टूलकिट अनुदान और कौशल वजीफे को 4%-5% वार्षिक ब्याज पर कार्यशील पूंजी के साथ जोड़ें।',
      legalClause: 'Permissible across Central MSME & National Corporation schemes.'
    });
  }

  // Stack 3: Greenfield Venture + Margin Money Convergence
  if (hasStandup) {
    stacks.push({
      stackId: 'stack_greenfield',
      title: 'Greenfield MSME Composite Loan + State Margin Support',
      titleHi: 'ग्रीनफील्ड एमएसएमई समग्र ऋण + मार्जिन मनी समर्थन',
      badge: 'High-Value Enterprise Stack',
      primaryScheme: 'Stand-Up India (₹10 Lakh - ₹1 Crore Composite Loan)',
      secondaryScheme: 'State Channelizing Agency Margin Subsidy',
      benefitSummary: 'Up to 85% project loan financed with converged state subsidy counting towards your 15% margin money.',
      benefitSummaryHi: '85% तक परियोजना ऋण उपलब्ध, जिसमें राज्य सब्सिडी आपकी 15% मार्जिन मनी में गिनी जा सकती है।',
      legalClause: 'Stand-Up Mitra Guidelines Section 3.'
    });
  }

  return stacks;
};
