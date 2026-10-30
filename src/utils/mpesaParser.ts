import { ExpenseItem, ParsedMpesaMessage, MpesaSpendingBreakdown, MpesaAuditAdvice } from '../types/finance.ts';

export function parseMpesaSms(smsText: string): ParsedMpesaMessage | null {
  if (!smsText || typeof smsText !== 'string') return null;

  const text = smsText.trim();

  // 1. Transaction Code (e.g. QBK82X91P, TK74H9Q87Z, etc.)
  const codeMatch = text.match(/^([A-Z0-9]{8,12})\s+Confirmed/i) || text.match(/([A-Z0-9]{8,12})\s+Confirmed/i) || text.match(/\b([A-Z0-9]{8,12})\b/);
  const refCode = codeMatch ? codeMatch[1].toUpperCase() : 'MPESA-' + Date.now().toString(36).toUpperCase();

  // 2. Amount: Ksh3,450.00 or Ksh 3,450 or KES 3450
  const amountMatch = text.match(/Ksh\s*([\d,]+\.?\d*)/i) || text.match(/KES\s*([\d,]+\.?\d*)/i) || text.match(/Ksh\.?\s*([\d,]+\.?\d*)/i);
  if (!amountMatch) return null;
  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  if (isNaN(amount) || amount <= 0) return null;

  // 3. Type & Channel detection
  let type: ParsedMpesaMessage['type'] = 'paid';
  let channel: ParsedMpesaMessage['channel'] = 'Till / Buy Goods';

  if (/received\s+Ksh/i.test(text) || /You have received/i.test(text) || /credited/i.test(text) || /deposit/i.test(text)) {
    type = 'received';
    channel = 'Received Money';
  } else if (/withdraw/i.test(text) || /from agent/i.test(text) || /ATM/i.test(text)) {
    type = 'withdraw';
    channel = 'Agent Withdrawal';
  } else if (/sent to\s+.*bank/i.test(text) || /transferred to.*bank/i.test(text) || /account\s+\d{6,}/i.test(text)) {
    type = 'paid';
    channel = /bank/i.test(text) ? 'Bank Transfer' : 'Paybill';
  } else if (/paid to/i.test(text) || /paybill/i.test(text)) {
    type = 'paid';
    channel = /for account|acc\./i.test(text) ? 'Paybill' : 'Till / Buy Goods';
  } else if (/sent to/i.test(text)) {
    type = 'sent';
    channel = 'Send Money';
  }

  // 4. Counterparty / Merchant
  let counterparty = 'M-Pesa Merchant';
  let accountNumber: string | undefined;

  const accMatch = text.match(/for account\s+([A-Za-z0-9\-]+)/i) || text.match(/acc\.?\s*([A-Za-z0-9\-]+)/i);
  if (accMatch) {
    accountNumber = accMatch[1].trim();
  }

  if (type === 'received') {
    const fromMatch = text.match(/from\s+([^0-9\.]+?)(?:\s+\d{10,12}|\s+on|\.)/i);
    if (fromMatch) counterparty = fromMatch[1].trim();
  } else if (type === 'sent') {
    const toMatch = text.match(/sent to\s+([^0-9\.]+?)(?:\s+\d{10,12}|\s+for|\s+on|\.)/i);
    if (toMatch) counterparty = toMatch[1].trim();
  } else if (type === 'paid') {
    const paidMatch = text.match(/(?:paid to|sent to)\s+([^.]+?)(?:\s+for account|\s+on|\.)/i);
    if (paidMatch) counterparty = paidMatch[1].trim();
  } else if (type === 'withdraw') {
    const agentMatch = text.match(/from\s+([^.]+?)(?:\s+on|\.)/i);
    if (agentMatch) counterparty = `Agent: ${agentMatch[1].trim()}`;
  }

  // Clean up counterparty
  counterparty = counterparty.replace(/for account.*$/i, '').replace(/acc\..*$/i, '').trim();
  if (!counterparty) counterparty = 'M-Pesa Entity';

  // 5. Date & Time
  const dateMatch = text.match(/on\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+at\s+([\d:]+\s*(?:AM|PM)?)/i) ||
                    text.match(/(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\s+([\d:]+\s*(?:AM|PM)?)/i);
  let date = new Date().toISOString().split('T')[0];
  let time = '12:00 PM';

  if (dateMatch) {
    const rawDate = dateMatch[1];
    time = dateMatch[2] || '12:00 PM';
    if (rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        let year = parts[2];
        if (year.length === 2) year = '20' + year;
        const month = parts[1].padStart(2, '0');
        const day = parts[0].padStart(2, '0');
        date = `${year}-${month}-${day}`;
      }
    } else if (rawDate.includes('-')) {
      const parts = rawDate.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          date = rawDate;
        } else {
          let year = parts[2];
          if (year.length === 2) year = '20' + year;
          const month = parts[1].padStart(2, '0');
          const day = parts[0].padStart(2, '0');
          date = `${year}-${month}-${day}`;
        }
      }
    }
  }

  // 6. Balance if present
  let balance: number | undefined;
  const balanceMatch = text.match(/balance is Ksh\s*([\d,]+\.?\d*)/i) || text.match(/balance\s*:\s*Ksh\s*([\d,]+\.?\d*)/i);
  if (balanceMatch) {
    balance = parseFloat(balanceMatch[1].replace(/,/g, ''));
  }

  // 7. Safaricom Fee (Transaction Cost)
  let fee: number | undefined;
  const feeMatch = text.match(/Transaction cost,?\s*Ksh\s*([\d,]+\.?\d*)/i) || text.match(/cost,?\s*Ksh\s*([\d,]+\.?\d*)/i);
  if (feeMatch) {
    fee = parseFloat(feeMatch[1].replace(/,/g, ''));
  } else if (type === 'withdraw') {
    // Standard Safaricom agent withdrawal tariff estimate
    if (amount <= 100) fee = 10;
    else if (amount <= 500) fee = 28;
    else if (amount <= 1000) fee = 29;
    else if (amount <= 2500) fee = 31;
    else if (amount <= 5000) fee = 69;
    else if (amount <= 10000) fee = 115;
    else if (amount <= 20000) fee = 185;
    else fee = 205;
  } else if (type === 'sent') {
    // Send money tariff estimate
    if (amount <= 100) fee = 0;
    else if (amount <= 500) fee = 7;
    else if (amount <= 1000) fee = 13;
    else if (amount <= 2500) fee = 34;
    else if (amount <= 5000) fee = 57;
    else fee = 75;
  } else {
    // Buy goods till is usually free for customer
    fee = 0;
  }

  // 8. Auto categorize based on counterparty name
  const suggestedCategory = categorizeMerchant(counterparty);

  return {
    refCode,
    amount,
    type,
    channel,
    counterparty,
    accountNumber,
    date,
    time,
    suggestedCategory,
    balance,
    fee,
  };
}

export function categorizeMerchant(merchant: string): ExpenseItem['category'] {
  const m = merchant.toUpperCase();

  if (
    m.includes('NAIVAS') ||
    m.includes('CARREFOUR') ||
    m.includes('QUICKMART') ||
    m.includes('QUICK MART') ||
    m.includes('CHANDARANA') ||
    m.includes('CLEANSHELF') ||
    m.includes('GROCER') ||
    m.includes('MARKET') ||
    m.includes('BUTCHERY') ||
    m.includes('BAKERY') ||
    m.includes('FOOD') ||
    m.includes('GREENS') ||
    m.includes('MAMA MBOGA') ||
    m.includes('EGG')
  ) {
    return 'Food & Groceries';
  }

  if (
    m.includes('TOTAL') ||
    m.includes('SHELL') ||
    m.includes('RUBIS') ||
    m.includes('OLA') ||
    m.includes('PETROL') ||
    m.includes('FUEL') ||
    m.includes('EXPRESSWAY') ||
    m.includes('MOJA') ||
    m.includes('UBER') ||
    m.includes('BOLT') ||
    m.includes('LITTLE') ||
    m.includes('MATATU') ||
    m.includes('STAGE') ||
    m.includes('SAFARI') ||
    m.includes('TRANS')
  ) {
    return 'Transport & Fuel';
  }

  if (
    m.includes('KPLC') ||
    m.includes('TOKEN') ||
    m.includes('POWER') ||
    m.includes('FIBER') ||
    m.includes('SAFARICOM HOME') ||
    m.includes('ZUKU') ||
    m.includes('WATER') ||
    m.includes('NAWASCO') ||
    m.includes('NCWSC') ||
    m.includes('AIRTIME') ||
    m.includes('POSTPAID') ||
    m.includes('DSTV') ||
    m.includes('GOTV') ||
    m.includes('STARTIMES') ||
    m.includes('NETFLIX') ||
    m.includes('SPOTIFY')
  ) {
    return 'Utilities & Bills';
  }

  if (
    m.includes('RESTAURANT') ||
    m.includes('JAVA') ||
    m.includes('ARTCAFFE') ||
    m.includes('CAFE') ||
    m.includes('LOUNGE') ||
    m.includes('BAR') ||
    m.includes('GRILL') ||
    m.includes('CINEMA') ||
    m.includes('CARNIVORE') ||
    m.includes('CLUB') ||
    m.includes('CHOMA') ||
    m.includes('PIZZA') ||
    m.includes('KFC') ||
    m.includes('DOMINOS') ||
    m.includes('BURGER') ||
    m.includes('HOTEL') ||
    m.includes('PUB') ||
    m.includes('BETIKA') ||
    m.includes('SPORTPESA')
  ) {
    return 'Entertainment & Dining';
  }

  if (
    m.includes('HOSPITAL') ||
    m.includes('PHARMACY') ||
    m.includes('CLINIC') ||
    m.includes('CHEMIST') ||
    m.includes('MED') ||
    m.includes('AGA KHAN') ||
    m.includes('GERTRUDES') ||
    m.includes('MATER') ||
    m.includes('DENTAL') ||
    m.includes('OPTICAL')
  ) {
    return 'Healthcare';
  }

  if (
    m.includes('SCHOOL') ||
    m.includes('UNIVERSITY') ||
    m.includes('ACADEMY') ||
    m.includes('COLLEGE') ||
    m.includes('BOOKSHOP') ||
    m.includes('TEXT BOOK') ||
    m.includes('KASNEB') ||
    m.includes('KCA')
  ) {
    return 'Education';
  }

  if (
    m.includes('RENT') ||
    m.includes('CARETAKER') ||
    m.includes('PROPERTIES') ||
    m.includes('HOMES') ||
    m.includes('ESTATE') ||
    m.includes('LANDLORD') ||
    m.includes('APARTMENTS')
  ) {
    return 'Rent & Housing';
  }

  if (
    m.includes('MUM') ||
    m.includes('DAD') ||
    m.includes('SHOSHO') ||
    m.includes('UPCOUNTRY') ||
    m.includes('BROTHER') ||
    m.includes('SISTER') ||
    m.includes('HOME SUPPORT')
  ) {
    return 'Family & Support';
  }

  if (
    m.includes('JUMIA') ||
    m.includes('KILIMALL') ||
    m.includes('BOUTIQUE') ||
    m.includes('FASHION') ||
    m.includes('CLOTH') ||
    m.includes('STORE') ||
    m.includes('MALL') ||
    m.includes('ELECTRONICS')
  ) {
    return 'Shopping';
  }

  return 'Other';
}

/**
 * Parses a full M-Pesa statement, PDF text extract, CSV, or multi-SMS paste
 */
export function parseMpesaStatement(statementText: string): ParsedMpesaMessage[] {
  if (!statementText || !statementText.trim()) return [];

  const raw = statementText.trim();
  const results: ParsedMpesaMessage[] = [];
  const seenRefs = new Set<string>();

  // 1. First attempt: standard Safaricom SMS confirmations
  const smsBlocks = raw
    .split(/\n\s*\n|(?=[A-Z0-9]{8,12}\s+Confirmed)|(?=Receipt\s*No:)/i)
    .map((b) => b.trim())
    .filter(Boolean);

  for (const block of smsBlocks) {
    const parsed = parseMpesaSms(block);
    if (parsed && !seenRefs.has(parsed.refCode)) {
      seenRefs.add(parsed.refCode);
      results.push(parsed);
    }
  }

  // 2. Second attempt: Check line-by-line for Safaricom PDF statement tables or CSV rows
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 5);

  lines.forEach((line, idx) => {
    // Check if line starts with or contains an M-PESA Receipt code (8-12 uppercase alphanumeric, e.g. TK74H9Q87Z, QBK82X91P)
    const refMatch = line.match(/\b([A-Z0-9]{8,12})\b/);
    if (!refMatch) return;

    const refCode = refMatch[1].toUpperCase();
    if (seenRefs.has(refCode)) return;

    // Check if it's a header line
    if (/Receipt\s*No|Completion\s*Time|Transaction\s*Status|Paid\s*In|Withdrawn/i.test(line)) {
      return;
    }

    // Try CSV parsing if line has commas
    if (line.includes(',')) {
      // Split by comma ignoring commas inside quotes
      const csvParts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((p) => p.replace(/^"|"$/g, '').trim());
      if (csvParts.length >= 5) {
        // Typical Safaricom CSV: Receipt No, Completion Time, Details, Status, Paid In, Withdrawn, Balance
        const dateStr = csvParts[1] || '';
        const details = csvParts[2] || '';
        const status = csvParts[3] || '';
        const paidInStr = csvParts[4]?.replace(/,/g, '') || '';
        const withdrawnStr = csvParts[5]?.replace(/,/g, '') || '';
        const balanceStr = csvParts[6]?.replace(/,/g, '') || '';

        const paidIn = parseFloat(paidInStr) || 0;
        const withdrawn = parseFloat(withdrawnStr) || 0;

        if (paidIn > 0 || withdrawn > 0) {
          seenRefs.add(refCode);
          const isIncome = paidIn > 0;
          const amount = isIncome ? paidIn : withdrawn;

          const isWithdraw = /withdraw|agent/i.test(details);
          const isSent = /sent to|transfer to/i.test(details);

          let channel: ParsedMpesaMessage['channel'] = isIncome
            ? 'Received Money'
            : isWithdraw
            ? 'Agent Withdrawal'
            : isSent
            ? 'Send Money'
            : /pay\s*bill|account|kplc|zuku/i.test(details)
            ? 'Paybill'
            : 'Till / Buy Goods';

          let counterparty = details
            .replace(/Customer Transfer (?:to|from)/i, '')
            .replace(/Pay Bill to/i, '')
            .replace(/Funds Transfer to/i, '')
            .replace(/Withdrawal at/i, '')
            .trim();

          if (!counterparty) counterparty = 'M-Pesa Transaction';

          // Parse date
          const dateMatch = dateStr.match(/(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/) || dateStr.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
          let date = new Date().toISOString().split('T')[0];
          if (dateMatch) {
            const rawD = dateMatch[1];
            if (rawD.includes('/')) {
              const parts = rawD.split('/');
              if (parts.length === 3) {
                let yr = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                date = `${yr}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            } else {
              date = rawD;
            }
          }

          results.push({
            refCode,
            amount,
            type: isIncome ? 'received' : isWithdraw ? 'withdraw' : isSent ? 'sent' : 'paid',
            channel,
            counterparty,
            date,
            time: dateStr.includes(' ') ? dateStr.split(' ')[1] : '12:00 PM',
            suggestedCategory: categorizeMerchant(counterparty),
            fee: isWithdraw ? 69 : isSent ? 25 : 0,
            balance: parseFloat(balanceStr) || undefined,
          });
          return;
        }
      }
    }

    // Safaricom PDF table row matching:
    // TK74H9Q87Z 2026-10-24 15:45:12 Customer Transfer to NAIVAS KILIMANI Completed - 4,500.00 38,250.00
    // TK44Q7P19M 2026-10-18 14:15:30 Customer Transfer from ACME TECH SOLUTIONS Completed 85,000.00 - 91,227.00
    const safaricomRowMatch = line.match(
      /^([A-Z0-9]{8,12})\s+(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})(?:\s+([\d:]+(?:\s*[AP]M)?))?\s+(.*?)\s+(?:Completed|COMPLETED)?\s+(-|[\d,]+\.?\d*)\s+(-|[\d,]+\.?\d*)(?:\s+([\d,]+\.?\d*))?$/i
    );

    if (safaricomRowMatch) {
      const parsedDate = safaricomRowMatch[2];
      const parsedTime = safaricomRowMatch[3] || '12:00 PM';
      const details = safaricomRowMatch[4]?.trim() || '';
      const colPaidIn = safaricomRowMatch[5]?.trim();
      const colWithdrawn = safaricomRowMatch[6]?.trim();
      const colBalance = safaricomRowMatch[7]?.trim();

      const paidIn = colPaidIn && colPaidIn !== '-' ? parseFloat(colPaidIn.replace(/,/g, '')) : 0;
      const withdrawn = colWithdrawn && colWithdrawn !== '-' ? parseFloat(colWithdrawn.replace(/,/g, '')) : 0;

      if (paidIn > 0 || withdrawn > 0) {
        seenRefs.add(refCode);
        const isIncome = paidIn > 0;
        const amount = isIncome ? paidIn : withdrawn;
        const isWithdraw = /withdraw|agent/i.test(details);
        const isSent = /sent to|transfer to/i.test(details);

        let channel: ParsedMpesaMessage['channel'] = isIncome
          ? 'Received Money'
          : isWithdraw
          ? 'Agent Withdrawal'
          : isSent
          ? 'Send Money'
          : /pay\s*bill|account|kplc|zuku/i.test(details)
          ? 'Paybill'
          : 'Till / Buy Goods';

        let counterparty = details
          .replace(/Customer Transfer (?:to|from)/i, '')
          .replace(/Pay Bill to/i, '')
          .replace(/Funds Transfer to/i, '')
          .replace(/Withdrawal at/i, '')
          .trim();

        if (!counterparty) counterparty = 'M-Pesa Transaction';

        let formattedDate = new Date().toISOString().split('T')[0];
        if (parsedDate.includes('/')) {
          const parts = parsedDate.split('/');
          if (parts.length === 3) {
            let yr = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            formattedDate = `${yr}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        } else {
          formattedDate = parsedDate;
        }

        results.push({
          refCode,
          amount,
          type: isIncome ? 'received' : isWithdraw ? 'withdraw' : isSent ? 'sent' : 'paid',
          channel,
          counterparty,
          date: formattedDate,
          time: parsedTime,
          suggestedCategory: categorizeMerchant(counterparty),
          fee: isWithdraw ? 69 : isSent ? 25 : 0,
          balance: colBalance ? parseFloat(colBalance.replace(/,/g, '')) : undefined,
        });
        return;
      }
    }

    // Generic line fallback:
    const amtMatch = line.match(/(?:Ksh|KES)\s*([\d,]+(?:\.\d{2})?)/i) || line.match(/([\d,]+\.\d{2})/);
    if (amtMatch) {
      const amount = parseFloat(amtMatch[1].replace(/,/g, ''));
      if (amount > 0) {
        seenRefs.add(refCode);

        const isIncome = /received|credited|deposit|inflow|from\s+client|dividend|salary/i.test(line);
        const isWithdraw = /withdraw|agent/i.test(line);
        const isSent = /sent to|transfer to/i.test(line);

        let type: ParsedMpesaMessage['type'] = isIncome ? 'received' : isWithdraw ? 'withdraw' : isSent ? 'sent' : 'paid';
        let channel: ParsedMpesaMessage['channel'] = isIncome
          ? 'Received Money'
          : isWithdraw
          ? 'Agent Withdrawal'
          : isSent
          ? 'Send Money'
          : /account|paybill/i.test(line)
          ? 'Paybill'
          : 'Till / Buy Goods';

        // Extract date
        const dateMatch = line.match(/(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/) || line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        let date = new Date().toISOString().split('T')[0];
        if (dateMatch) {
          const rawD = dateMatch[1];
          if (rawD.includes('/')) {
            const parts = rawD.split('/');
            if (parts.length === 3) {
              let yr = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
              date = `${yr}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          } else {
            date = rawD;
          }
        }

        // Extract merchant description
        let counterparty = line
          .replace(/\b[A-Z0-9]{8,12}\b/g, '')
          .replace(/(?:Ksh|KES)\s*[\d,]+(?:\.\d{2})?/gi, '')
          .replace(/[\d,]+\.\d{2}/g, '')
          .replace(/\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/g, '')
          .replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g, '')
          .replace(/completed|confirmed|receipt\s*no:?/gi, '')
          .replace(/[\|\-]/g, ' ')
          .trim();

        if (counterparty.length < 3) counterparty = 'M-Pesa Transaction';
        if (counterparty.length > 35) counterparty = counterparty.slice(0, 35) + '...';

        results.push({
          refCode,
          amount,
          type,
          channel,
          counterparty,
          date,
          time: '12:00 PM',
          suggestedCategory: categorizeMerchant(counterparty),
          fee: isWithdraw ? 69 : isSent ? 25 : 0,
        });
      }
    }
  });

  return results;
}

/**
 * Calculates comprehensive forensic spending statistics from parsed transactions
 */
export function calculateMpesaSpending(transactions: ParsedMpesaMessage[]): MpesaSpendingBreakdown {
  let totalInflow = 0;
  let totalOutflow = 0;
  let totalFees = 0;

  const categoryMap = new Map<ExpenseItem['category'], { amount: number; count: number }>();
  const channelMap = new Map<string, { amount: number; count: number }>();
  const merchantMap = new Map<string, { amount: number; count: number }>();
  const dates = new Set<string>();

  transactions.forEach((tx) => {
    if (tx.date) dates.add(tx.date);

    if (tx.fee && tx.fee > 0) {
      totalFees += tx.fee;
    }

    if (tx.type === 'received') {
      totalInflow += tx.amount;
    } else {
      totalOutflow += tx.amount;

      // Category aggregation
      const cat = tx.suggestedCategory || 'Other';
      const existingCat = categoryMap.get(cat) || { amount: 0, count: 0 };
      categoryMap.set(cat, {
        amount: existingCat.amount + tx.amount,
        count: existingCat.count + 1,
      });

      // Channel aggregation
      const ch = tx.channel || (tx.type === 'withdraw' ? 'Agent Withdrawal' : 'Till / Buy Goods');
      const existingCh = channelMap.get(ch) || { amount: 0, count: 0 };
      channelMap.set(ch, {
        amount: existingCh.amount + tx.amount,
        count: existingCh.count + 1,
      });

      // Merchant aggregation
      const merchant = tx.counterparty.replace(/^Agent:\s*/i, '').trim();
      const existingMerch = merchantMap.get(merchant) || { amount: 0, count: 0 };
      merchantMap.set(merchant, {
        amount: existingMerch.amount + tx.amount,
        count: existingMerch.count + 1,
      });
    }
  });

  const netCashflow = totalInflow - totalOutflow;
  const savingsRatePercent = totalInflow > 0 ? Math.round(((totalInflow - totalOutflow) / totalInflow) * 100) : 0;

  // Category breakdown list
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => {
      const percentage = totalOutflow > 0 ? Math.round((data.amount / totalOutflow) * 1000) / 10 : 0;
      return {
        category,
        amount: Math.round(data.amount * 100) / 100,
        percentage,
        count: data.count,
        isHighBurn: percentage > 25,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Channel breakdown list
  const channelBreakdown = Array.from(channelMap.entries())
    .map(([channel, data]) => {
      const percentage = totalOutflow > 0 ? Math.round((data.amount / totalOutflow) * 1000) / 10 : 0;
      return {
        channel,
        amount: Math.round(data.amount * 100) / 100,
        percentage,
        count: data.count,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Top 5 Merchants
  const topMerchants = Array.from(merchantMap.entries())
    .map(([name, data]) => ({
      name,
      amount: Math.round(data.amount * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // 50/30/20 Needs vs Wants vs Savings
  const needsCategories: ExpenseItem['category'][] = [
    'Rent & Housing',
    'Food & Groceries',
    'Utilities & Bills',
    'Transport & Fuel',
    'Healthcare',
    'Education',
  ];
  const wantsCategories: ExpenseItem['category'][] = [
    'Entertainment & Dining',
    'Shopping',
    'Family & Support',
    'Other',
  ];

  let needsAmount = 0;
  let wantsAmount = 0;

  categoryBreakdown.forEach((c) => {
    if (needsCategories.includes(c.category)) {
      needsAmount += c.amount;
    } else {
      wantsAmount += c.amount;
    }
  });

  const baseFor503020 = totalInflow > 0 ? totalInflow : totalOutflow;
  const needsPercent = baseFor503020 > 0 ? Math.round((needsAmount / baseFor503020) * 100) : 0;
  const wantsPercent = baseFor503020 > 0 ? Math.round((wantsAmount / baseFor503020) * 100) : 0;
  const savingsAmount = Math.max(0, netCashflow);
  const savingsPercent = baseFor503020 > 0 ? Math.round((savingsAmount / baseFor503020) * 100) : 0;

  const daysSpan = Math.max(1, dates.size);
  const dailyBurnRate = Math.round((totalOutflow / daysSpan) * 100) / 100;

  return {
    totalInflow,
    totalOutflow,
    netCashflow,
    savingsRatePercent,
    totalFees,
    dailyBurnRate,
    daysSpan,
    categoryBreakdown,
    channelBreakdown,
    topMerchants,
    needsWantsSavings: {
      needsAmount,
      needsPercent,
      wantsAmount,
      wantsPercent,
      savingsAmount,
      savingsPercent,
    },
  };
}

/**
 * Deterministic local forensic advice generator providing instant, actionable advice
 */
export function generateLocalMpesaAdvice(breakdown: MpesaSpendingBreakdown): MpesaAuditAdvice {
  const { totalInflow, totalOutflow, totalFees, categoryBreakdown, channelBreakdown, dailyBurnRate } = breakdown;

  const whatToReduce: MpesaAuditAdvice['whatToReduce'] = [];
  const whatToOptimize: MpesaAuditAdvice['whatToOptimize'] = [];
  const whatToDo: MpesaAuditAdvice['whatToDo'] = [];
  const recommendedBudgetCaps: MpesaAuditAdvice['recommendedBudgetCaps'] = [];
  let monthlyPotentialSavings = 0;

  // 1. Check for Entertainment & Dining
  const dining = categoryBreakdown.find((c) => c.category === 'Entertainment & Dining');
  if (dining && dining.amount > 0) {
    const cutAmount = Math.round(dining.amount * 0.35);
    monthlyPotentialSavings += cutAmount;
    whatToReduce.push({
      title: 'Trim Entertainment & Dining Outflows',
      reason: `Entertainment & restaurants make up ${dining.percentage}% (KSh ${dining.amount.toLocaleString()}) of your spending. Pre-planning social weekends and cooking at home 2 extra nights a week cuts this significantly.`,
      targetSaving: cutAmount,
      severity: dining.percentage > 20 ? 'critical' : 'warning',
    });
  }

  // 2. Check for Safaricom Transaction Tariff Fees
  if (totalFees > 150) {
    const feeSavings = Math.round(totalFees * 0.7);
    monthlyPotentialSavings += feeSavings;
    whatToReduce.push({
      title: 'Eliminate Agent Cash Withdrawal & Tariff Fees',
      reason: `You spent KSh ${totalFees.toLocaleString()} on Safaricom fees alone! Paying merchants directly via Lipa Na M-Pesa Buy Goods Till is 100% FREE for buyers and eliminates unnecessary agent cash withdrawal charges.`,
      targetSaving: feeSavings,
      severity: 'warning',
    });
  }

  // 3. Check for Shopping
  const shopping = categoryBreakdown.find((c) => c.category === 'Shopping');
  if (shopping && shopping.amount > 3000) {
    const shopCut = Math.round(shopping.amount * 0.3);
    monthlyPotentialSavings += shopCut;
    whatToReduce.push({
      title: 'Pause Non-Essential Impulse Shopping',
      reason: `Shopping accounted for KSh ${shopping.amount.toLocaleString()}. Enforce a 48-hour cooling off rule before checkout for impulse clothes or gadgets.`,
      targetSaving: shopCut,
      severity: 'info',
    });
  }

  // Optimizations
  const util = categoryBreakdown.find((c) => c.category === 'Utilities & Bills');
  if (util) {
    whatToOptimize.push({
      title: 'Batch Buy KPLC Tokens & Utility Bills',
      action: 'Purchase electricity tokens once per month in a single batch.',
      potentialSavingTip: 'Avoids multiple paybill transaction fees (KSh 23-45 per token buy) and prevents mid-month emergency blackout surcharges.',
    });
  }

  const food = categoryBreakdown.find((c) => c.category === 'Food & Groceries');
  if (food) {
    whatToOptimize.push({
      title: 'Bulk Wholesale Grocery Sourcing',
      action: 'Source non-perishables (rice, flour, oil) from wholesale marts or fresh food markets.',
      potentialSavingTip: 'Saves 15-20% compared to frequent daily mini-mart basket additions.',
    });
  }

  whatToOptimize.push({
    title: 'Direct Till Payments (Buy Goods) Over Cash',
    action: 'Always ask for Buy Goods Till or M-Pesa QR code instead of withdrawing cash from agents.',
    potentialSavingTip: 'Zero customer charge on Till payments, saving up to KSh 200 per cash withdrawal.',
  });

  // What to Do Strategic Steps
  whatToDo.push({
    stepNumber: 1,
    title: 'Lock In Category Budget Ceilings',
    description: 'Set strict monthly caps on your top spending categories inside NjiaFedha so you receive alerts before you overspend.',
  });

  whatToDo.push({
    stepNumber: 2,
    title: 'Automate a 20% Pay-Yourself-First Transfer',
    description: `As soon as M-Pesa income enters your wallet, transfer ${Math.round(totalInflow > 0 ? totalInflow * 0.2 : 5000).toLocaleString()} KSh to an MMF or SACCO account before spending begins.`,
  });

  whatToDo.push({
    stepNumber: 3,
    title: 'Build a Liquid Emergency Runway',
    description: `At your current burn rate of KSh ${dailyBurnRate.toLocaleString()}/day, target a 3-month buffer of KSh ${Math.round(dailyBurnRate * 90).toLocaleString()} in a separate high-yield emergency wallet.`,
  });

  // Recommended budget caps
  categoryBreakdown.forEach((c) => {
    let factor = 1.0;
    let reason = 'Maintain current healthy spending pace.';

    if (c.category === 'Entertainment & Dining') {
      factor = 0.7;
      reason = '30% reduction to curb weekend leakage.';
    } else if (c.category === 'Shopping') {
      factor = 0.75;
      reason = '25% reduction for essential-only purchases.';
    } else if (c.category === 'Food & Groceries') {
      factor = 0.9;
      reason = '10% reduction through meal planning.';
    }

    const recommendedCap = Math.round(c.amount * factor);
    recommendedBudgetCaps.push({
      category: c.category,
      recommendedCap,
      currentSpent: c.amount,
      reason,
    });
  });

  const verdictBadge =
    totalOutflow > totalInflow && totalInflow > 0
      ? 'Critical Deficit Burn'
      : dining && dining.percentage > 22
      ? 'High Discretionary Leakage'
      : totalFees > 300
      ? 'Tariff Fee Bleed'
      : 'Cashflow Positive & Optimizable';

  const actionChecklist = [
    'Stop cash withdrawals at agents — pay directly via Buy Goods Till for free.',
    'Set a weekly KSh 2,500 spending ceiling on restaurants and weekend outings.',
    'Buy full month electricity tokens at the start of next month.',
    `Transfer KSh ${monthlyPotentialSavings.toLocaleString()} into your High-Yield MMF / Emergency Fund.`,
  ];

  return {
    verdictBadge,
    monthlyPotentialSavings: Math.max(2500, monthlyPotentialSavings),
    whatToReduce,
    whatToOptimize,
    whatToDo,
    recommendedBudgetCaps,
    emergencyFundRecommendation: {
      recommended3Month: Math.round(dailyBurnRate * 90),
      recommended6Month: Math.round(dailyBurnRate * 180),
      rationale: `Based on your actual daily burn rate of KSh ${dailyBurnRate.toLocaleString()}, this keeps you safe from job interruptions or medical emergencies without accumulating debt.`,
    },
    actionChecklist,
  };
}
