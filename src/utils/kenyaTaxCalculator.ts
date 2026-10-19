export interface TaxBreakdown {
  grossSalary: number;
  nssfTier1: number;
  nssfTier2: number;
  totalNssf: number;
  taxablePay: number;
  grossPaye: number;
  personalRelief: number;
  netPaye: number;
  housingLevy: number;
  shif: number;
  totalDeductions: number;
  netSalary: number;
  effectiveTaxRatePercent: number;
}

export function calculateKenyaPaye(grossSalary: number): TaxBreakdown {
  if (grossSalary <= 0) {
    return {
      grossSalary: 0,
      nssfTier1: 0,
      nssfTier2: 0,
      totalNssf: 0,
      taxablePay: 0,
      grossPaye: 0,
      personalRelief: 2400,
      netPaye: 0,
      housingLevy: 0,
      shif: 0,
      totalDeductions: 0,
      netSalary: 0,
      effectiveTaxRatePercent: 0,
    };
  }

  // 1. NSSF Deductions
  // Tier 1: 6% of lower limit (up to KES 7,000) -> max 420
  const nssfTier1 = Math.min(grossSalary, 7000) * 0.06;

  // Tier 2: 6% of salary between 7,001 and 36,000 -> max 1,740
  const tier2Earnings = Math.max(0, Math.min(grossSalary, 36000) - 7000);
  const nssfTier2 = tier2Earnings * 0.06;
  const totalNssf = Math.round(nssfTier1 + nssfTier2);

  // 2. Taxable Pay = Gross - NSSF
  const taxablePay = Math.max(0, grossSalary - totalNssf);

  // 3. Progressive PAYE Bands
  let remainingTaxable = taxablePay;
  let grossPaye = 0;

  // Band 1: First KES 24,000 @ 10%
  const b1 = Math.min(remainingTaxable, 24000);
  grossPaye += b1 * 0.10;
  remainingTaxable -= b1;

  // Band 2: Next KES 8,333 (24,001 - 32,333) @ 25%
  if (remainingTaxable > 0) {
    const b2 = Math.min(remainingTaxable, 8333.33);
    grossPaye += b2 * 0.25;
    remainingTaxable -= b2;
  }

  // Band 3: Next KES 467,667 (32,334 - 500,000) @ 30%
  if (remainingTaxable > 0) {
    const b3 = Math.min(remainingTaxable, 467666.67);
    grossPaye += b3 * 0.30;
    remainingTaxable -= b3;
  }

  // Band 4: Next KES 300,000 (500,001 - 800,000) @ 32.5%
  if (remainingTaxable > 0) {
    const b4 = Math.min(remainingTaxable, 300000);
    grossPaye += b4 * 0.325;
    remainingTaxable -= b4;
  }

  // Band 5: Above KES 800,000 @ 35%
  if (remainingTaxable > 0) {
    grossPaye += remainingTaxable * 0.35;
  }

  // 4. Reliefs
  const personalRelief = 2400; // Monthly personal tax relief
  const netPaye = Math.max(0, Math.round(grossPaye - personalRelief));

  // 5. Affordable Housing Levy (1.5% of Gross)
  const housingLevy = Math.round(grossSalary * 0.015);

  // 6. Social Health Insurance Fund (SHIF: 2.75% of Gross, min KES 300)
  const shif = Math.round(Math.max(300, grossSalary * 0.0275));

  // 7. Totals & Net Pay
  const totalDeductions = netPaye + totalNssf + housingLevy + shif;
  const netSalary = Math.max(0, Math.round(grossSalary - totalDeductions));
  const effectiveTaxRatePercent = grossSalary > 0 ? parseFloat(((totalDeductions / grossSalary) * 100).toFixed(1)) : 0;

  return {
    grossSalary,
    nssfTier1: Math.round(nssfTier1),
    nssfTier2: Math.round(nssfTier2),
    totalNssf,
    taxablePay: Math.round(taxablePay),
    grossPaye: Math.round(grossPaye),
    personalRelief,
    netPaye,
    housingLevy,
    shif,
    totalDeductions,
    netSalary,
    effectiveTaxRatePercent,
  };
}
