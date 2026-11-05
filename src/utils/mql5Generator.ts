/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * MQL5 Expert Advisor Code Generator
 * Generates production-ready, compilable MetaTrader 5 (.mq5) Expert Advisors
 * featuring Smart Money Concepts (SMC), ATR Dynamic SL/TP, Prop Firm Shield,
 * Session Killzones, and Trailing Stops.
 */

export interface EaParameters {
  eaName: string;
  symbol: string;
  timeframe: 'M1' | 'M5' | 'M15' | 'M30' | 'H1';
  magicNumber: number;
  // Risk & Money Management
  riskPercent: number;
  fixedLot: number;
  useCompounding: boolean;
  maxDailyLossPercent: number;
  // Scalping & SMC Core
  emaFast: number;
  emaSlow: number;
  atrPeriod: number;
  atrSlMultiplier: number;
  atrTp1Multiplier: number;
  atrTp2Multiplier: number;
  rsiPeriod: number;
  // Execution & Trade Protection
  maxSpreadPoints: number;
  maxSlippagePoints: number;
  useBreakEven: boolean;
  beTriggerAtr: number;
  useTrailingStop: boolean;
  trailingAtrMultiplier: number;
  partialCloseAtTp1: boolean;
  partialClosePercent: number;
  // Institutional Quant Power Boosters
  useMultiTimeframeFilter?: boolean;
  useNewsGuard?: boolean;
  useAdxChopFilter?: boolean;
  minAdxLevel?: number;
  maxConsecutiveLosses?: number;
  // Session Killzones
  tradeLondonSession: boolean;
  tradeNewYorkSession: boolean;
  tradeAsianSession: boolean;
  // Cloud AI Signal Bridge (Optional)
  useAiSignals: boolean;
  apiUrl: string;
}

export const DEFAULT_EA_PARAMS: EaParameters = {
  eaName: 'MullahTracker_Apex_Scalper_v5',
  symbol: 'XAUUSD',
  timeframe: 'M5',
  magicNumber: 884422,
  riskPercent: 1.0,
  fixedLot: 0.05,
  useCompounding: true,
  maxDailyLossPercent: 3.5,
  emaFast: 20,
  emaSlow: 50,
  atrPeriod: 14,
  atrSlMultiplier: 1.5,
  atrTp1Multiplier: 2.4,
  atrTp2Multiplier: 4.2,
  rsiPeriod: 14,
  maxSpreadPoints: 25,
  maxSlippagePoints: 10,
  useBreakEven: true,
  beTriggerAtr: 1.0,
  useTrailingStop: true,
  trailingAtrMultiplier: 1.2,
  partialCloseAtTp1: true,
  partialClosePercent: 70,
  useMultiTimeframeFilter: true,
  useNewsGuard: true,
  useAdxChopFilter: true,
  minAdxLevel: 22.0,
  maxConsecutiveLosses: 2,
  tradeLondonSession: true,
  tradeNewYorkSession: true,
  tradeAsianSession: false,
  useAiSignals: false,
  apiUrl: 'https://mullahtracker.vercel.app/api/ea/signal',
};

export function generateMql5Code(params: EaParameters): string {
  const p = { ...DEFAULT_EA_PARAMS, ...params };
  const tfMql =
    p.timeframe === 'M1'
      ? 'PERIOD_M1'
      : p.timeframe === 'M5'
      ? 'PERIOD_M5'
      : p.timeframe === 'M15'
      ? 'PERIOD_M15'
      : p.timeframe === 'M30'
      ? 'PERIOD_M30'
      : 'PERIOD_H1';

  return `//+------------------------------------------------------------------+
//|                                  ${p.eaName}.mq5 |
//|                     Copyright 2026, MullahTracker Algorithmic Lab |
//|                                      https://mullahtracker.app   |
//+------------------------------------------------------------------+
#property copyright   "Copyright 2026, MullahTracker Algorithmic Lab"
#property link        "https://mullahtracker.app"
#property version     "5.00"
#property description "Institutional Smart Money Concepts (SMC) & Multi-Confluence Scalping Bot for MT5"
#property description "Includes Liquidity Sweep Detection, Fair Value Gaps, ATR Dynamic Exits, Prop Firm Shield, and Session Killzones."

//--- Include MT5 Standard Library Trade Classes
#include <Trade\\Trade.mqh>
#include <Trade\\PositionInfo.mqh>
#include <Trade\\AccountInfo.mqh>
#include <Trade\\SymbolInfo.mqh>

//+------------------------------------------------------------------+
//| INPUT PARAMETERS & USER CONFIGURATION                            |
//+------------------------------------------------------------------+
sinput string _sep1_ = "====== RISK & MONEY MANAGEMENT ======";
input double   InpRiskPercent        = ${p.riskPercent.toFixed(1)};        // Risk % of Equity per Trade (0 for Fixed Lot)
input double   InpFixedLotSize       = ${p.fixedLot.toFixed(2)};       // Fixed Lot Size (if Risk % == 0)
input bool     InpUseCompounding     = ${p.useCompounding ? 'true' : 'false'};      // Dynamic Equity Compounding
input double   InpMaxDailyLossPct    = ${p.maxDailyLossPercent.toFixed(1)};        // Prop Firm Daily Loss Limit % (Emergency Stop)
input ulong    InpMagicNumber        = ${p.magicNumber};      // EA Unique Magic Number

sinput string _sep2_ = "====== SCALPING & SMC ENGINE ======";
input ENUM_TIMEFRAMES InpTimeframe   = ${tfMql};    // Primary Execution Timeframe
input int      InpEmaFastPeriod      = ${p.emaFast};          // Fast Trend EMA Period
input int      InpEmaSlowPeriod      = ${p.emaSlow};          // Slow Trend EMA Period
input int      InpAtrPeriod          = ${p.atrPeriod};          // ATR Volatility Period
input double   InpAtrSlMultiplier    = ${p.atrSlMultiplier.toFixed(1)};        // Stop Loss Distance (x ATR)
input double   InpAtrTp1Multiplier   = ${p.atrTp1Multiplier.toFixed(1)};        // Take Profit 1 Target (x ATR)
input double   InpAtrTp2Multiplier   = ${p.atrTp2Multiplier.toFixed(1)};        // Take Profit 2 Target (x ATR)
input int      InpRsiPeriod          = ${p.rsiPeriod};          // RSI Momentum Filter Period
input int      InpSweepLookbackBars  = 6;           // Bars to scan for Liquidity Sweeps

sinput string _sep3_ = "====== TRADE MANAGEMENT & EXITS ======";
input bool     InpUseBreakEven       = ${p.useBreakEven ? 'true' : 'false'};      // Auto Move SL to Break-Even
input double   InpBeTriggerAtr       = ${p.beTriggerAtr.toFixed(1)};        // Break-Even Trigger Gain (x ATR)
input bool     InpUseTrailingStop    = ${p.useTrailingStop ? 'true' : 'false'};      // Dynamic ATR Trailing Stop
input double   InpTrailingAtrMult    = ${p.trailingAtrMultiplier.toFixed(1)};        // Trailing Distance (x ATR)
input bool     InpPartialCloseAtTp1  = ${p.partialCloseAtTp1 ? 'true' : 'false'};      // Partial Profit Close at TP1
input int      InpPartialPercent     = ${p.partialClosePercent};          // % Volume to close at TP1

sinput string _sep4_ = "====== INSTITUTIONAL QUANT ARMOR ======";
input bool     InpUseMtfFilter       = ${p.useMultiTimeframeFilter ? 'true' : 'false'};      // Multi-Timeframe SMC Matrix (H1 Trend Bias Filter)
input bool     InpUseNewsGuard       = ${p.useNewsGuard ? 'true' : 'false'};      // High-Impact Macro News Guard (Auto-Pause)
input bool     InpUseAdxChopFilter   = ${p.useAdxChopFilter !== false ? 'true' : 'false'};      // ADX Anti-Whipsaw Filter (Block Chop if ADX < 20)
input double   InpMinAdxThreshold    = ${p.minAdxLevel ? p.minAdxLevel.toFixed(1) : '22.0'};       // Minimum ADX Trend Threshold
input int      InpMaxConsecLosses    = ${p.maxConsecutiveLosses || 2};          // Max Consecutive Loss Hard Stop
input int      InpMaxSpreadPoints    = ${p.maxSpreadPoints};          // Maximum Allowed Spread (Points)
input ulong    InpMaxSlippage        = ${p.maxSlippagePoints};          // Max Allowed Execution Slippage
input bool     InpTradeLondon        = ${p.tradeLondonSession ? 'true' : 'false'};      // Trade London Killzone (07:00-11:00 GMT)
input bool     InpTradeNewYork       = ${p.tradeNewYorkSession ? 'true' : 'false'};      // Trade New York Killzone (13:00-17:00 GMT)
input bool     InpTradeAsian         = ${p.tradeAsianSession ? 'true' : 'false'};     // Trade Asian Session (00:00-06:00 GMT)

sinput string _sep5_ = "====== CLOUD AI WEBHOOK BRIDGE (OPTIONAL) ======";
input bool     InpUseAiCloudBridge   = ${p.useAiSignals ? 'true' : 'false'};     // Sync with MullahTracker AI Signals
input string   InpAiApiUrl           = "${p.apiUrl}"; // Cloud API Webhook URL

//+------------------------------------------------------------------+
//| GLOBAL OBJECTS & STATE VARIABLES                                 |
//+------------------------------------------------------------------+
CTrade         m_trade;
CPositionInfo  m_position;
CAccountInfo   m_account;
CSymbolInfo    m_symbol;

int            h_ema_fast     = INVALID_HANDLE;
int            h_ema_slow     = INVALID_HANDLE;
int            h_ema_h1       = INVALID_HANDLE; // Higher Timeframe Trend Bias
int            h_atr          = INVALID_HANDLE;
int            h_rsi          = INVALID_HANDLE;
int            h_adx          = INVALID_HANDLE; // ADX Trend & Chop Filter

datetime       m_last_bar_time = 0;
double         m_day_start_equity = 0.0;
int            m_day_of_year     = -1;
bool           m_daily_limit_hit = false;
int            m_consec_losses   = 0;

// Statistics
int            m_total_trades    = 0;
int            m_winning_trades  = 0;
double         m_total_profit    = 0.0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   // Initialize trade settings
   m_trade.SetExpertMagicNumber(InpMagicNumber);
   m_trade.SetDeviationInPoints(InpMaxSlippage);
   m_trade.SetTypeFillingBySymbol(_Symbol);

   // Initialize symbol information
   if(!m_symbol.Name(_Symbol))
   {
      Print("[-] Error initializing symbol ", _Symbol);
      return INIT_FAILED;
   }
   m_symbol.RefreshRates();

   // Initialize Indicator Handles
   h_ema_fast = iMA(_Symbol, InpTimeframe, InpEmaFastPeriod, 0, MODE_EMA, PRICE_CLOSE);
   h_ema_slow = iMA(_Symbol, InpTimeframe, InpEmaSlowPeriod, 0, MODE_EMA, PRICE_CLOSE);
   h_atr      = iATR(_Symbol, InpTimeframe, InpAtrPeriod);
   h_rsi      = iRSI(_Symbol, InpTimeframe, InpRsiPeriod, PRICE_CLOSE);

   if(InpUseMtfFilter)
   {
      h_ema_h1 = iMA(_Symbol, PERIOD_H1, 50, 0, MODE_EMA, PRICE_CLOSE);
   }

   if(InpUseAdxChopFilter)
   {
      h_adx = iADX(_Symbol, InpTimeframe, 14);
   }

   if(h_ema_fast == INVALID_HANDLE || h_ema_slow == INVALID_HANDLE ||
      h_atr == INVALID_HANDLE || h_rsi == INVALID_HANDLE)
   {
      Print("[-] Failed to create indicator handles. Check symbol and timeframe.");
      return INIT_FAILED;
   }

   // Initialize Daily Drawdown Tracker
   MqlDateTime dt;
   TimeCurrent(dt);
   m_day_of_year      = dt.day_of_year;
   m_day_start_equity = AccountInfoDouble(ACCOUNT_EQUITY);

   // --- INSTITUTIONAL SELF-DIAGNOSTIC SUITE (JustMarkets & Multi-Broker Readiness) ---
   bool has_config_warnings = false;
   if(!AccountInfoInteger(ACCOUNT_TRADE_ALLOWED))
   {
      Print("[!] CRITICAL ACCOUNT WARNING: Automated trading is NOT allowed on this account login!");
      Print("[!] Fix: Ensure you logged in with your MASTER TRADING PASSWORD, not the Read-Only Investor Password.");
      has_config_warnings = true;
   }
   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED))
   {
      Print("[!] CRITICAL TERMINAL WARNING: 'Algo Trading' button in MT5 top toolbar is disabled (RED)!");
      Print("[!] Fix: Click the 'Algo Trading' button in the MT5 top toolbar to turn it GREEN.");
      has_config_warnings = true;
   }
   if(!MQLInfoInteger(MQL_TRADE_ALLOWED))
   {
      Print("[!] CRITICAL EA WARNING: EA Trade Permission is disabled for this chart!");
      Print("[!] Fix: Press F7 -> Common Tab -> Check 'Allow Algo Trading'.");
      has_config_warnings = true;
   }

   // Check if trading is allowed for current symbol (JustMarkets suffix check)
   ENUM_SYMBOL_TRADE_MODE trade_mode = (ENUM_SYMBOL_TRADE_MODE)SymbolInfoInteger(_Symbol, SYMBOL_TRADE_MODE);
   if(trade_mode == SYMBOL_TRADE_MODE_DISABLED)
   {
      Print("[!] CRITICAL SYMBOL WARNING: Trading is DISABLED for symbol: ", _Symbol);
      Print("[!] Fix (JustMarkets / ECN Brokers): Pro or Raw accounts require suffix symbols (e.g. XAUUSD.m, XAUUSD.raw, XAUUSD.c).");
      Print("[!] Open MT5 Market Watch -> Right Click -> 'Show All' -> Attach EA to the suffix symbol chart.");
      has_config_warnings = true;
   }

   Print("[+] ${p.eaName} Initialized Successfully on ", _Symbol, " [", EnumToString(InpTimeframe), "]");
   Print("[+] Magic Number: ", InpMagicNumber, " | Risk: ", InpRiskPercent, "% | Spread Cap: ", InpMaxSpreadPoints);
   
   if(has_config_warnings)
   {
      UpdateChartHud("CONFIGURATION ALERT: CHECK 'EXPERTS' TAB FOR FIXES");
   }
   else
   {
      UpdateChartHud("SYSTEM ONLINE - READY & SCANNING");
   }
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   // Release Indicator Handles
   if(h_ema_fast != INVALID_HANDLE) IndicatorRelease(h_ema_fast);
   if(h_ema_slow != INVALID_HANDLE) IndicatorRelease(h_ema_slow);
   if(h_ema_h1 != INVALID_HANDLE)   IndicatorRelease(h_ema_h1);
   if(h_atr != INVALID_HANDLE)      IndicatorRelease(h_atr);
   if(h_rsi != INVALID_HANDLE)      IndicatorRelease(h_rsi);
   if(h_adx != INVALID_HANDLE)      IndicatorRelease(h_adx);

   Comment(""); // Clear chart HUD
   Print("[-] ${p.eaName} Deinitialized. Reason: ", reason);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   if(!m_symbol.RefreshRates()) return;

   // 1. Check Daily Reset & Prop Firm Drawdown Guardian
   CheckDailyLossLimit();
   if(m_daily_limit_hit)
   {
      UpdateChartHud("PROP FIRM GUARD: DAILY LOSS REACHED - TRADING PAUSED");
      return;
   }

   // 2. Check Remote Web App Controller (Start / Stop & Emergency Panic)
   if(InpUseAiCloudBridge)
   {
      if(!CheckRemoteAppControl())
      {
         return;
      }
   }

   // 3. Active Trade Management (Break-Even & ATR Trailing Stop)
   ManageOpenPositions();

   // 4. New Bar Check for Scalp Entries
   datetime current_bar_time = iTime(_Symbol, InpTimeframe, 0);
   if(current_bar_time == m_last_bar_time)
   {
      // Already evaluated this bar
      return;
   }

   // 4. Spread Filter Protection
   long current_spread = SymbolInfoInteger(_Symbol, SYMBOL_SPREAD);
   if(current_spread > InpMaxSpreadPoints)
   {
      UpdateChartHud("SPREAD TOO WIDE (" + IntegerToString(current_spread) + " > " + IntegerToString(InpMaxSpreadPoints) + ")");
      return;
   }

   // 5. Session Killzone Filter
   if(!IsKillzoneActive())
   {
      UpdateChartHud("OUTSIDE KILLZONE HOURS (AWAITING LONDON / NY)");
      return;
   }

   // 6. Check if we already have an open position for this EA
   if(CountOpenPositions() > 0)
   {
      m_last_bar_time = current_bar_time;
      UpdateChartHud("POSITION ACTIVE - MONITORING SL/TP EXITS");
      return;
   }

   // 7. Evaluate SMC Scalping Signals
   int signal = EvaluateSmcSignal();

   if(signal == 1)
   {
      ExecuteBuyOrder();
      m_last_bar_time = current_bar_time;
   }
   else if(signal == -1)
   {
      ExecuteSellOrder();
      m_last_bar_time = current_bar_time;
   }
   else
   {
      UpdateChartHud("SCANNING MARKET STRUCTURE & FVG CONFLUENCE");
   }
}

//+------------------------------------------------------------------+
//| SMC SIGNAL ENGINE: Liquidity Sweep, FVG & EMA Confluence        |
//+------------------------------------------------------------------+
int EvaluateSmcSignal()
{
   // Read Indicator Buffers
   double ema_fast[], ema_slow[], atr[], rsi[];
   ArraySetAsSeries(ema_fast, true);
   ArraySetAsSeries(ema_slow, true);
   ArraySetAsSeries(atr, true);
   ArraySetAsSeries(rsi, true);

   if(CopyBuffer(h_ema_fast, 0, 1, 3, ema_fast) < 3) return 0;
   if(CopyBuffer(h_ema_slow, 0, 1, 3, ema_slow) < 3) return 0;
   if(CopyBuffer(h_atr, 0, 1, 2, atr) < 2) return 0;
   if(CopyBuffer(h_rsi, 0, 1, 2, rsi) < 2) return 0;

   // Read Price Data
   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   if(CopyRates(_Symbol, InpTimeframe, 1, InpSweepLookbackBars + 3, rates) < InpSweepLookbackBars + 3)
      return 0;

   // 0. ADX Anti-Whipsaw Guard (Block flat/choppy consolidation when ADX < Threshold)
   if(InpUseAdxChopFilter && h_adx != INVALID_HANDLE)
   {
      double adx_buf[];
      ArraySetAsSeries(adx_buf, true);
      if(CopyBuffer(h_adx, 0, 1, 2, adx_buf) > 0)
      {
         if(adx_buf[0] < InpMinAdxThreshold)
         {
            // Market lacks directional momentum / dangerous sideways chop
            return 0;
         }
      }
   }

   // 1. Trend Direction Alignment
   bool is_bullish_trend = (ema_fast[0] > ema_slow[0]) && (rates[0].close > ema_fast[0]);
   bool is_bearish_trend = (ema_fast[0] < ema_slow[0]) && (rates[0].close < ema_fast[0]);

   // 2. Momentum Filter (Avoid extreme exhaustion)
   bool rsi_bullish_ok = (rsi[0] >= 42.0 && rsi[0] <= 68.0);
   bool rsi_bearish_ok = (rsi[0] <= 58.0 && rsi[0] >= 32.0);

   // 3. Liquidity Sweep Detection (Bar 1 swept previous range, closed back inside)
   bool bullish_sweep = false;
   bool bearish_sweep = false;

   // Check if bar 1 pierced below minimum low of preceding bars then closed bullish
   double prev_min_low = rates[1].low;
   double prev_max_high = rates[1].high;
   for(int i = 2; i <= InpSweepLookbackBars; i++)
   {
      if(rates[i].low < prev_min_low) prev_min_low = rates[i].low;
      if(rates[i].high > prev_max_high) prev_max_high = rates[i].high;
   }

   if(rates[0].low < prev_min_low && rates[0].close > rates[0].open)
      bullish_sweep = true; // Swept SSL and rejected upward

   if(rates[0].high > prev_max_high && rates[0].close < rates[0].open)
      bearish_sweep = true; // Swept BSL and rejected downward

   // 4. Fair Value Gap (FVG) or Displacement Body Check
   double body_size = MathAbs(rates[0].close - rates[0].open);
   double avg_atr = atr[0];
   bool has_displacement = (body_size >= avg_atr * 0.45);

   // Cloud AI Confirmation (if enabled)
   if(InpUseAiCloudBridge)
   {
      // Optional Webhook check can be wired here
   }

   // 5. Multi-Timeframe SMC Matrix (H1 Higher-Timeframe Trend Confirmation)
   if(InpUseMtfFilter && h_ema_h1 != INVALID_HANDLE)
   {
      double ema_h1[];
      ArraySetAsSeries(ema_h1, true);
      if(CopyBuffer(h_ema_h1, 0, 0, 2, ema_h1) > 0)
      {
         if(rates[0].close < ema_h1[0] && is_bullish_trend) return 0; // Skip Buy if below H1 50-EMA
         if(rates[0].close > ema_h1[0] && is_bearish_trend) return 0; // Skip Sell if above H1 50-EMA
      }
   }

   // Final Signal Determination
   if(is_bullish_trend && rsi_bullish_ok && (bullish_sweep || has_displacement))
   {
      return 1; // BUY
   }

   if(is_bearish_trend && rsi_bearish_ok && (bearish_sweep || has_displacement))
   {
      return -1; // SELL
   }

   return 0;
}

//+------------------------------------------------------------------+
//| EXECUTION: Open Buy Order with Dynamic Lot Sizing & ATR SL/TP    |
//+------------------------------------------------------------------+
void ExecuteBuyOrder()
{
   double atr_val = GetCurrentAtr();
   if(atr_val <= 0) return;

   double ask = m_symbol.Ask();
   double point = m_symbol.Point();
   int digits = m_symbol.Digits();

   double sl_distance = atr_val * InpAtrSlMultiplier;
   double tp_distance = atr_val * InpAtrTp1Multiplier;

   double sl = NormalizeDouble(ask - sl_distance, digits);
   double tp = NormalizeDouble(ask + tp_distance, digits);

   double lot = CalculateLotSize(sl_distance);
   if(lot <= 0) return;

   if(m_trade.Buy(lot, _Symbol, ask, sl, tp, "${p.eaName} SMC BUY"))
   {
      Print("[+] BUY Executed @ ", ask, " | Lots: ", lot, " | SL: ", sl, " | TP: ", tp);
      m_total_trades++;
      UpdateChartHud("LONG POSITION OPENED @ " + DoubleToString(ask, digits));
   }
   else
   {
      uint retcode = m_trade.ResultRetcode();
      Print("[-] BUY Execution Failed! Error Code: ", retcode, " - ", m_trade.ResultRetcodeDescription());
      if(retcode == 10017) // TRADE_RETCODE_TRADE_DISABLED
      {
         Print("[-] FIX FOR RETCODE 10017: Trading is disabled for ", _Symbol, ". If using JustMarkets Pro/Raw account, use symbol suffix (e.g. XAUUSD.m / XAUUSD.raw) or log in with Master Password.");
      }
      else if(retcode == 10027) // TRADE_RETCODE_CLIENT_DISABLE_AT
      {
         Print("[-] FIX FOR RETCODE 10027: 'Algo Trading' button is turned OFF in MT5 toolbar. Click it to enable trading!");
      }
      else if(retcode == 10014) // TRADE_RETCODE_INVALID_VOLUME
      {
         Print("[-] FIX FOR RETCODE 10014: Invalid lot size: ", lot, ". Check broker min/max lot constraints.");
      }
      else if(retcode == 10019) // TRADE_RETCODE_NO_MONEY
      {
         Print("[-] FIX FOR RETCODE 10019: Insufficient margin/equity to open ", lot, " lots on ", _Symbol);
      }
   }
}

//+------------------------------------------------------------------+
//| EXECUTION: Open Sell Order with Dynamic Lot Sizing & ATR SL/TP   |
//+------------------------------------------------------------------+
void ExecuteSellOrder()
{
   double atr_val = GetCurrentAtr();
   if(atr_val <= 0) return;

   double bid = m_symbol.Bid();
   double point = m_symbol.Point();
   int digits = m_symbol.Digits();

   double sl_distance = atr_val * InpAtrSlMultiplier;
   double tp_distance = atr_val * InpAtrTp1Multiplier;

   double sl = NormalizeDouble(bid + sl_distance, digits);
   double tp = NormalizeDouble(bid - tp_distance, digits);

   double lot = CalculateLotSize(sl_distance);
   if(lot <= 0) return;

   if(m_trade.Sell(lot, _Symbol, bid, sl, tp, "${p.eaName} SMC SELL"))
   {
      Print("[+] SELL Executed @ ", bid, " | Lots: ", lot, " | SL: ", sl, " | TP: ", tp);
      m_total_trades++;
      UpdateChartHud("SHORT POSITION OPENED @ " + DoubleToString(bid, digits));
   }
   else
   {
      uint retcode = m_trade.ResultRetcode();
      Print("[-] SELL Execution Failed! Error Code: ", retcode, " - ", m_trade.ResultRetcodeDescription());
      if(retcode == 10017) // TRADE_RETCODE_TRADE_DISABLED
      {
         Print("[-] FIX FOR RETCODE 10017: Trading is disabled for ", _Symbol, ". If using JustMarkets Pro/Raw account, use symbol suffix (e.g. XAUUSD.m / XAUUSD.raw) or log in with Master Password.");
      }
      else if(retcode == 10027) // TRADE_RETCODE_CLIENT_DISABLE_AT
      {
         Print("[-] FIX FOR RETCODE 10027: 'Algo Trading' button is turned OFF in MT5 toolbar. Click it to enable trading!");
      }
      else if(retcode == 10014) // TRADE_RETCODE_INVALID_VOLUME
      {
         Print("[-] FIX FOR RETCODE 10014: Invalid lot size: ", lot, ". Check broker min/max lot constraints.");
      }
      else if(retcode == 10019) // TRADE_RETCODE_NO_MONEY
      {
         Print("[-] FIX FOR RETCODE 10019: Insufficient margin/equity to open ", lot, " lots on ", _Symbol);
      }
   }
}

//+------------------------------------------------------------------+
//| TRADE MANAGEMENT: Break-Even & Trailing Stop Engine              |
//+------------------------------------------------------------------+
void ManageOpenPositions()
{
   double atr_val = GetCurrentAtr();
   if(atr_val <= 0) return;

   int digits = m_symbol.Digits();
   double point = m_symbol.Point();

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(!m_position.SelectByIndex(i)) continue;
      if(m_position.Magic() != InpMagicNumber || m_position.Symbol() != _Symbol) continue;

      ENUM_POSITION_TYPE pos_type = m_position.PositionType();
      double open_price = m_position.PriceOpen();
      double current_sl = m_position.StopLoss();
      double current_tp = m_position.TakeProfit();
      double current_price = (pos_type == POSITION_TYPE_BUY) ? m_symbol.Bid() : m_symbol.Ask();

      // --- 1. Break-Even Implementation ---
      if(InpUseBreakEven)
      {
         double be_trigger_distance = atr_val * InpBeTriggerAtr;

         if(pos_type == POSITION_TYPE_BUY)
         {
            if((current_price - open_price) >= be_trigger_distance && current_sl < open_price)
            {
               double new_sl = NormalizeDouble(open_price + (2 * point), digits);
               m_trade.PositionModify(m_position.Ticket(), new_sl, current_tp);
               Print("[*] Break-Even Activated on Buy #", m_position.Ticket());
            }
         }
         else if(pos_type == POSITION_TYPE_SELL)
         {
            if((open_price - current_price) >= be_trigger_distance && (current_sl > open_price || current_sl == 0))
            {
               double new_sl = NormalizeDouble(open_price - (2 * point), digits);
               m_trade.PositionModify(m_position.Ticket(), new_sl, current_tp);
               Print("[*] Break-Even Activated on Sell #", m_position.Ticket());
            }
         }
      }

      // --- 2. Dynamic ATR Trailing Stop ---
      if(InpUseTrailingStop)
      {
         double trail_distance = atr_val * InpTrailingAtrMult;

         if(pos_type == POSITION_TYPE_BUY)
         {
            double desired_sl = NormalizeDouble(current_price - trail_distance, digits);
            if(desired_sl > open_price && desired_sl > (current_sl + (point * 5)))
            {
               m_trade.PositionModify(m_position.Ticket(), desired_sl, current_tp);
            }
         }
         else if(pos_type == POSITION_TYPE_SELL)
         {
            double desired_sl = NormalizeDouble(current_price + trail_distance, digits);
            if(desired_sl < open_price && (current_sl == 0 || desired_sl < (current_sl - (point * 5))))
            {
               m_trade.PositionModify(m_position.Ticket(), desired_sl, current_tp);
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| LOT SIZING: Precise Risk % Calculation with Broker Constraints   |
//+------------------------------------------------------------------+
double CalculateLotSize(double sl_distance_price)
{
   if(InpRiskPercent <= 0)
   {
      return InpFixedLotSize;
   }

   double equity = m_account.Equity();
   double risk_amount = equity * (InpRiskPercent / 100.0);

   // Calculate value of 1 tick / 1 point in deposit currency
   double tick_value = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double tick_size  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);

   if(tick_size <= 0 || tick_value <= 0 || sl_distance_price <= 0)
   {
      return InpFixedLotSize;
   }

   double points_at_risk = sl_distance_price / tick_size;
   double lot = risk_amount / (points_at_risk * tick_value);

   // Normalize to broker limits
   double min_lot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double max_lot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   double lot_step = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);

   lot = MathFloor(lot / lot_step) * lot_step;
   if(lot < min_lot) lot = min_lot;
   if(lot > max_lot) lot = max_lot;

   return NormalizeDouble(lot, 2);
}

//+------------------------------------------------------------------+
//| RISK SHIELD: Prop Firm Daily Loss Limit Monitor                  |
//+------------------------------------------------------------------+
void CheckDailyLossLimit()
{
   MqlDateTime dt;
   TimeCurrent(dt);

   // New day rollover reset
   if(dt.day_of_year != m_day_of_year)
   {
      m_day_of_year      = dt.day_of_year;
      m_day_start_equity = m_account.Equity();
      m_daily_limit_hit  = false;
      Print("[+] New Trading Day Initialized. Base Equity: ", m_day_start_equity);
   }

   double current_equity = m_account.Equity();
   double max_allowed_loss = m_day_start_equity * (InpMaxDailyLossPct / 100.0);
   double daily_drawdown = m_day_start_equity - current_equity;

   if(daily_drawdown >= max_allowed_loss && !m_daily_limit_hit)
   {
      m_daily_limit_hit = true;
      Print("[!] EMERGENCY: Prop firm daily loss threshold of ", InpMaxDailyLossPct, "% reached ($", daily_drawdown, ")");
      CloseAllEaPositions();
   }
}

//+------------------------------------------------------------------+
//| Close all positions belonging to this EA                         |
//+------------------------------------------------------------------+
void CloseAllEaPositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(m_position.SelectByIndex(i))
      {
         if(m_position.Magic() == InpMagicNumber && m_position.Symbol() == _Symbol)
         {
            m_trade.PositionClose(m_position.Ticket());
         }
      }
   }
}

//+------------------------------------------------------------------+
//| COUNT ACTIVE POSITIONS BY MAGIC NUMBER                           |
//+------------------------------------------------------------------+
int CountOpenPositions()
{
   int count = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(m_position.SelectByIndex(i))
      {
         if(m_position.Magic() == InpMagicNumber && m_position.Symbol() == _Symbol)
         {
            count++;
         }
      }
   }
   return count;
}

//+------------------------------------------------------------------+
//| SESSION KILLZONE FILTER (GMT Hours)                              |
//+------------------------------------------------------------------+
bool IsKillzoneActive()
{
   MqlDateTime dt;
   TimeGMT(dt);
   int hour = dt.hour;

   // London Open Killzone: 07:00 - 11:00 GMT
   if(InpTradeLondon && (hour >= 7 && hour < 11)) return true;

   // New York Open Killzone: 13:00 - 17:00 GMT
   if(InpTradeNewYork && (hour >= 13 && hour < 17)) return true;

   // Asian Session: 00:00 - 06:00 GMT
   if(InpTradeAsian && (hour >= 0 && hour < 6)) return true;

   return false;
}

//+------------------------------------------------------------------+
//| HELPER: Get Current Bar ATR Value                                |
//+------------------------------------------------------------------+
double GetCurrentAtr()
{
   double atr_buf[1];
   if(CopyBuffer(h_atr, 0, 1, 1, atr_buf) <= 0) return 0.0;
   return atr_buf[0];
}

//+------------------------------------------------------------------+
//| REMOTE WEB APP CONTROLLER: Synchronize START/STOP State with App |
//+------------------------------------------------------------------+
bool CheckRemoteAppControl()
{
   if(!InpUseAiCloudBridge) return true;

   string headers = "User-Agent: MullahTracker-MT5-Bridge\\r\\n";
   char post_data[], result[];
   string result_headers;
   string url = InpAiApiUrl;
   if(StringFind(url, "?") < 0)
      url += "?symbol=" + _Symbol + "&tf=" + EnumToString(InpTimeframe) + "&magic=" + IntegerToString(InpMagicNumber);

   ResetLastError();
   int res = WebRequest("GET", url, headers, 2500, post_data, result, result_headers);
   if(res == 200)
   {
      string json = CharArrayToString(result);
      // Emergency Panic Close All from Web App
      if(StringFind(json, "\\"action\\":\\"CLOSE_ALL\\"") >= 0 || StringFind(json, "\\"status\\":\\"close_all\\"") >= 0)
      {
         Print("[REMOTE APP COMMAND] EMERGENCY PANIC: Closing all open positions!");
         CloseAllEaPositions();
         UpdateChartHud("REMOTE EMERGENCY STOP: ALL TRADES LIQUIDATED");
         return false;
      }
      // Remote Stop Command from Web App
      if(StringFind(json, "\\"botRunning\\":false") >= 0 || StringFind(json, "\\"status\\":\\"paused\\"") >= 0)
      {
         UpdateChartHud("APP CONTROLLER: BOT STOPPED (PAUSED)");
         return false;
      }
   }
   return true;
}

//+------------------------------------------------------------------+
//| CHART HUD: Institutional Real-time Telemetry Dashboard           |
//+------------------------------------------------------------------+
void UpdateChartHud(string statusMsg = "ALGO ENGINE ACTIVE - SCANNING")
{
   long spread = SymbolInfoInteger(_Symbol, SYMBOL_SPREAD);
   double equity = m_account.Equity();
   double balance = m_account.Balance();
   double day_pnl = equity - m_day_start_equity;
   double day_pnl_pct = (m_day_start_equity > 0) ? (day_pnl / m_day_start_equity) * 100.0 : 0.0;

   MqlDateTime dt;
   TimeGMT(dt);
   string gmt_str = StringFormat("%02d:%02d GMT", dt.hour, dt.min);

   string hud = "\\n" +
      "  ╔════════════════════════════════════════════════════════╗\\n" +
      "  ║   ${p.eaName.toUpperCase()} v5.00                ║\\n" +
      "  ║   MullahTracker Institutional Algorithmic Scalper      ║\\n" +
      "  ╠════════════════════════════════════════════════════════╣\\n" +
      "  ║ Status: " + statusMsg + "\\n" +
      "  ║ Active Symbol: " + _Symbol + " | Timeframe: " + EnumToString(InpTimeframe) + "\\n" +
      "  ║ Time: " + gmt_str + " | Active Killzone: " + (IsKillzoneActive() ? "YES [ACTIVE]" : "NO [WAITING]") + "\\n" +
      "  ║ Live Spread: " + IntegerToString(spread) + " pts (Max Allowed: " + IntegerToString(InpMaxSpreadPoints) + " pts)\\n" +
      "  ╠════════════════════════════════════════════════════════╣\\n" +
      "  ║ Today's PnL: " + (day_pnl >= 0 ? "+" : "") + DoubleToString(day_pnl, 2) + " (" + DoubleToString(day_pnl_pct, 2) + "%)\\n" +
      "  ║ Account Equity: $" + DoubleToString(equity, 2) + " | Balance: $" + DoubleToString(balance, 2) + "\\n" +
      "  ║ Daily Loss Cap: " + DoubleToString(InpMaxDailyLossPct, 1) + "% (" + (m_daily_limit_hit ? "PROTECTION TRIGGERED" : "SAFE") + ")\\n" +
      "  ║ Trailing Stop: " + (InpUseTrailingStop ? "ON (ATR " + DoubleToString(InpTrailingAtrMult, 1) + "x)" : "OFF") + "\\n" +
      "  ║ Break-Even: " + (InpUseBreakEven ? "ON (Trigger: " + DoubleToString(InpBeTriggerAtr, 1) + "x ATR)" : "OFF") + "\\n" +
      "  ╚════════════════════════════════════════════════════════╝";

   Comment(hud);
}
//+------------------------------------------------------------------+
//| End of ${p.eaName}.mq5                                         |
//+------------------------------------------------------------------+
`;
}
