export interface MarketSessionInfo {
  isOpen: boolean;
  status: 'LIVE' | 'CLOSED';
  statusBadge: string;
  exchangeName: string;
  marketCode: 'NSE' | 'US' | 'FOREX';
  timezone: string;
  exchangeTime: string;
  details: string;
  nextSessionText: string;
  tradingHours: string;
  activeForexSession?: string;
}

export function getMarketSession(market: 'NSE' | 'US' | 'FOREX', now = new Date()): MarketSessionInfo {
  if (market === 'FOREX') {
    // 24/5 global FX market: Sunday 22:00 UTC to Friday 22:00 UTC
    const utcDay = now.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const utcCurrentMins = utcHours * 60 + utcMinutes;

    let isOpen = false;
    if (utcDay >= 1 && utcDay <= 4) {
      // Monday through Thursday is completely open
      isOpen = true;
    } else if (utcDay === 5) {
      // Friday: open until 22:00 UTC
      isOpen = utcCurrentMins < 22 * 60;
    } else if (utcDay === 0) {
      // Sunday: opens at 22:00 UTC (Sydney open)
      isOpen = utcCurrentMins >= 22 * 60;
    } else {
      // Saturday: closed
      isOpen = false;
    }

    // Determine active FX session(s)
    const activeSessions: string[] = [];
    // Sydney: 22:00 - 07:00 UTC
    if (utcHours >= 22 || utcHours < 7) activeSessions.push('Sydney');
    // Tokyo: 00:00 - 09:00 UTC
    if (utcHours >= 0 && utcHours < 9) activeSessions.push('Tokyo (Asian)');
    // London: 08:00 - 17:00 UTC
    if (utcHours >= 8 && utcHours < 17) activeSessions.push('London (European)');
    // New York: 13:00 - 22:00 UTC
    if (utcHours >= 13 && utcHours < 22) activeSessions.push('New York (US)');

    let sessionDetail = 'Global 24/5 FX Interbank Market';
    if (isOpen) {
      if (utcHours >= 13 && utcHours < 17) {
        sessionDetail = 'London & New York Overlap • Peak Liquidity';
      } else if (activeSessions.length > 0) {
        sessionDetail = `Active Sessions: ${activeSessions.join(' + ')}`;
      }
    } else {
      sessionDetail = 'Weekend • Global FX Markets Closed';
    }

    let nextSessionText = '';
    if (isOpen) {
      if (utcDay === 5) {
        const untilClose = 22 * 60 - utcCurrentMins;
        const h = Math.floor(untilClose / 60);
        const m = untilClose % 60;
        nextSessionText = `Closes for weekend in ${h}h ${m}m (22:00 UTC)`;
      } else {
        nextSessionText = 'Continuous 24h trading active';
      }
    } else {
      if (utcDay === 6) {
        nextSessionText = 'Opens Sunday 22:00 UTC (Sydney)';
      } else {
        const untilOpen = 22 * 60 - utcCurrentMins;
        const h = Math.floor(untilOpen / 60);
        const m = untilOpen % 60;
        nextSessionText = `Opens in ${h}h ${m}m (22:00 UTC)`;
      }
    }

    const utcTimeStr = now.toLocaleTimeString('en-US', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return {
      isOpen,
      status: isOpen ? 'LIVE' : 'CLOSED',
      statusBadge: isOpen ? 'MARKET LIVE' : 'MARKET CLOSED',
      exchangeName: 'Global Interbank Forex (FX)',
      marketCode: 'FOREX',
      timezone: 'UTC',
      exchangeTime: `${utcTimeStr} UTC`,
      details: sessionDetail,
      nextSessionText,
      tradingHours: '24/5 Sun 22:00 UTC – Fri 22:00 UTC',
      activeForexSession: activeSessions.join(' & ') || 'Closed',
    };
  }

  if (market === 'NSE') {
    // Nairobi Securities Exchange (EAT: UTC+3)
    const nairobiTimeStr = now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });
    const nairobiDate = new Date(nairobiTimeStr);
    const dayOfWeek = nairobiDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const hours = nairobiDate.getHours();
    const minutes = nairobiDate.getMinutes();
    const currentMins = hours * 60 + minutes;

    const openMins = 9 * 60; // 09:00 AM
    const closeMins = 15 * 60; // 03:00 PM

    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isOpen = isWeekday && currentMins >= openMins && currentMins < closeMins;

    const formattedTime = nairobiDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let nextSessionText = '';
    let details = '';

    if (isOpen) {
      const remainingMins = closeMins - currentMins;
      const remH = Math.floor(remainingMins / 60);
      const remM = remainingMins % 60;
      nextSessionText = `Closes in ${remH > 0 ? `${remH}h ` : ''}${remM}m (15:00 EAT)`;
      details = 'NSE Continuous Trading Session Active';
    } else {
      if (dayOfWeek === 6) {
        nextSessionText = 'Opens Monday at 09:00 EAT';
        details = 'Weekend • Market Closed';
      } else if (dayOfWeek === 0) {
        nextSessionText = 'Opens Monday at 09:00 EAT';
        details = 'Weekend • Market Closed';
      } else if (currentMins < openMins) {
        const untilOpen = openMins - currentMins;
        const remH = Math.floor(untilOpen / 60);
        const remM = untilOpen % 60;
        nextSessionText = `Opens in ${remH > 0 ? `${remH}h ` : ''}${remM}m (09:00 EAT)`;
        details = 'Pre-market • Session Closed';
      } else {
        if (dayOfWeek === 5) {
          nextSessionText = 'Opens Monday at 09:00 EAT';
        } else {
          nextSessionText = 'Opens tomorrow at 09:00 EAT';
        }
        details = 'Post-market • Session Closed';
      }
    }

    return {
      isOpen,
      status: isOpen ? 'LIVE' : 'CLOSED',
      statusBadge: isOpen ? 'MARKET LIVE' : 'MARKET CLOSED',
      exchangeName: 'Nairobi Securities Exchange (NSE)',
      marketCode: 'NSE',
      timezone: 'EAT (UTC+3)',
      exchangeTime: `${formattedTime} EAT`,
      details,
      nextSessionText,
      tradingHours: 'Mon–Fri 09:00 – 15:00 EAT',
    };
  }

  // US Markets (NYSE / NASDAQ - Eastern Time)
  const nyTimeStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const nyDate = new Date(nyTimeStr);
  const dayOfWeek = nyDate.getDay();
  const hours = nyDate.getHours();
  const minutes = nyDate.getMinutes();
  const currentMins = hours * 60 + minutes;

  const openMins = 9 * 60 + 30; // 09:30 AM
  const closeMins = 16 * 60; // 04:00 PM

  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isOpen = isWeekday && currentMins >= openMins && currentMins < closeMins;

  const formattedTime = nyDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  let nextSessionText = '';
  let details = '';

  if (isOpen) {
    const remainingMins = closeMins - currentMins;
    const remH = Math.floor(remainingMins / 60);
    const remM = remainingMins % 60;
    nextSessionText = `Closes in ${remH > 0 ? `${remH}h ` : ''}${remM}m (16:00 ET)`;
    details = 'US Regular Trading Session Active';
  } else {
    if (dayOfWeek === 6 || dayOfWeek === 0) {
      nextSessionText = 'Opens Monday at 09:30 ET';
      details = 'Weekend • US Markets Closed';
    } else if (currentMins >= 4 * 60 && currentMins < openMins) {
      const untilOpen = openMins - currentMins;
      const remH = Math.floor(untilOpen / 60);
      const remM = untilOpen % 60;
      nextSessionText = `Regular opens in ${remH > 0 ? `${remH}h ` : ''}${remM}m (09:30 ET)`;
      details = 'US Pre-Market Trading Active';
    } else if (currentMins >= closeMins && currentMins < 20 * 60) {
      nextSessionText = dayOfWeek === 5 ? 'Opens Monday at 09:30 ET' : 'Opens tomorrow at 09:30 ET';
      details = 'US After-Hours Trading Active';
    } else if (currentMins < 4 * 60) {
      nextSessionText = 'Pre-market opens at 04:00 ET';
      details = 'Overnight • Market Closed';
    } else {
      nextSessionText = dayOfWeek === 5 ? 'Opens Monday at 09:30 ET' : 'Opens tomorrow at 09:30 ET';
      details = 'Market Closed for Session';
    }
  }

  return {
    isOpen,
    status: isOpen ? 'LIVE' : 'CLOSED',
    statusBadge: isOpen ? 'MARKET LIVE' : 'MARKET CLOSED',
    exchangeName: 'NYSE / NASDAQ (Wall Street)',
    marketCode: 'US',
    timezone: 'ET (New York)',
    exchangeTime: `${formattedTime} ET`,
    details,
    nextSessionText,
    tradingHours: 'Mon–Fri 09:30 – 16:00 ET',
  };
}
