import { ExpenseItem, ParsedMpesaMessage } from '../types/finance.ts';

export function parseMpesaSms(smsText: string): ParsedMpesaMessage | null {
  if (!smsText || typeof smsText !== 'string') return null;

  const text = smsText.trim();

  // 1. Transaction Code (e.g. QBK82X91P, RBL992K81, etc.)
  const codeMatch = text.match(/^([A-Z0-9]{8,12})\s+Confirmed/i) || text.match(/([A-Z0-9]{8,12})\s+Confirmed/i);
  const refCode = codeMatch ? codeMatch[1].toUpperCase() : 'MPESA-' + Date.now().toString(36).toUpperCase();

  // 2. Amount: Ksh3,450.00 or Ksh 3,450 or KES 3450
  const amountMatch = text.match(/Ksh\s*([\d,]+\.?\d*)/i) || text.match(/KES\s*([\d,]+\.?\d*)/i);
  if (!amountMatch) return null;
  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

  // 3. Type detection: sent vs paid vs received vs withdraw
  let type: ParsedMpesaMessage['type'] = 'paid';
  if (/received\s+Ksh/i.test(text) || /You have received/i.test(text)) {
    type = 'received';
  } else if (/sent to/i.test(text)) {
    type = 'sent';
  } else if (/paid to/i.test(text)) {
    type = 'paid';
  } else if (/withdraw/i.test(text) || /Agent/i.test(text)) {
    type = 'withdraw';
  }

  // 4. Counterparty / Merchant
  let counterparty = 'M-Pesa Merchant';
  if (type === 'received') {
    const fromMatch = text.match(/from\s+([^0-9\.]+?)(?:\s+\d{10,12}|\s+on|\.)/i);
    if (fromMatch) counterparty = fromMatch[1].trim();
  } else if (type === 'sent') {
    const toMatch = text.match(/sent to\s+([^0-9\.]+?)(?:\s+\d{10,12}|\s+for|\s+on|\.)/i);
    if (toMatch) counterparty = toMatch[1].trim();
  } else if (type === 'paid') {
    const paidMatch = text.match(/paid to\s+([^.]+?)(?:\s+on|\.)/i);
    if (paidMatch) counterparty = paidMatch[1].trim();
  } else if (type === 'withdraw') {
    const agentMatch = text.match(/from\s+([^.]+?)(?:\s+on|\.)/i);
    if (agentMatch) counterparty = agentMatch[1].trim();
  }

  // Clean up counterparty
  counterparty = counterparty.replace(/for account.*$/i, '').trim();

  // 5. Date & Time
  const dateMatch = text.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+([\d:]+\s*(?:AM|PM)?)/i);
  let date = new Date().toISOString().split('T')[0];
  let time = '12:00 PM';

  if (dateMatch) {
    const rawDate = dateMatch[1];
    time = dateMatch[2];
    const parts = rawDate.split('/');
    if (parts.length === 3) {
      let year = parts[2];
      if (year.length === 2) year = '20' + year;
      const month = parts[1].padStart(2, '0');
      const day = parts[0].padStart(2, '0');
      date = `${year}-${month}-${day}`;
    }
  }

  // 6. Balance if present
  let balance: number | undefined;
  const balanceMatch = text.match(/balance is Ksh\s*([\d,]+\.?\d*)/i);
  if (balanceMatch) {
    balance = parseFloat(balanceMatch[1].replace(/,/g, ''));
  }

  // 7. Auto categorize based on counterparty name
  const suggestedCategory = categorizeMerchant(counterparty);

  return {
    refCode,
    amount,
    type,
    counterparty,
    date,
    time,
    suggestedCategory,
    balance,
  };
}

export function categorizeMerchant(merchant: string): ExpenseItem['category'] {
  const m = merchant.toUpperCase();

  if (
    m.includes('NAIVAS') ||
    m.includes('CARREFOUR') ||
    m.includes('QUICKMART') ||
    m.includes('CHANDARANA') ||
    m.includes('CLEANSHELF') ||
    m.includes('GROCER') ||
    m.includes('MARKET') ||
    m.includes('BUTCHERY') ||
    m.includes('BAKERY') ||
    m.includes('FOOD')
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
    m.includes('MATATU') ||
    m.includes('SAFARI')
  ) {
    return 'Transport & Fuel';
  }

  if (
    m.includes('KPLC') ||
    m.includes('TOKEN') ||
    m.includes('FIBER') ||
    m.includes('SAFARICOM HOME') ||
    m.includes('ZUKU') ||
    m.includes('WATER') ||
    m.includes('AIRTIME') ||
    m.includes('POSTPAID') ||
    m.includes('DSTV') ||
    m.includes('GOTV') ||
    m.includes('STARTIMES')
  ) {
    return 'Utilities & Bills';
  }

  if (
    m.includes('RESTAURANT') ||
    m.includes('JAVA') ||
    m.includes('CAFE') ||
    m.includes('LOUNGE') ||
    m.includes('BAR') ||
    m.includes('GRILL') ||
    m.includes('CINEMA') ||
    m.includes('CARNIVORE') ||
    m.includes('CLUB') ||
    m.includes('CHOMA') ||
    m.includes('PIZZA') ||
    m.includes('KFC')
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
    m.includes('MATER')
  ) {
    return 'Healthcare';
  }

  if (
    m.includes('SCHOOL') ||
    m.includes('UNIVERSITY') ||
    m.includes('ACADEMY') ||
    m.includes('COLLEGE') ||
    m.includes('BOOKSHOP') ||
    m.includes('TEXT BOOK')
  ) {
    return 'Education';
  }

  if (
    m.includes('RENT') ||
    m.includes('CARETAKER') ||
    m.includes('PROPERTIES') ||
    m.includes('HOMES') ||
    m.includes('ESTATE')
  ) {
    return 'Rent & Housing';
  }

  if (
    m.includes('MUM') ||
    m.includes('DAD') ||
    m.includes('SHOSHO') ||
    m.includes('UPCOUNTRY') ||
    m.includes('BROTHER') ||
    m.includes('SISTER')
  ) {
    return 'Family & Support';
  }

  if (
    m.includes('JUMIA') ||
    m.includes('KILIMALL') ||
    m.includes('BOUTIQUE') ||
    m.includes('FASHION') ||
    m.includes('CLOTH') ||
    m.includes('STORE')
  ) {
    return 'Shopping';
  }

  return 'Other';
}
