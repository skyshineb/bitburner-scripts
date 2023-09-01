import { Colors } from './lib/output.js';
/** @param {NS} ns */
export async function main(ns) {
  const market = ns.stock;
  ns.disableLog('ALL');
  ns.tail();
  if (!market.hasWSEAccount() || !market.hasTIXAPIAccess() || !market.has4SData() || !market.has4SDataTIXAPI()) {
    ns.printf('You do not have full access to stock market. exiting...');
    ns.exit();
  }

  let history = ['', '', '', '', '', '', '', '', '', ''];

  function addHistory(msg) {
    if (history.length == 10) {
      for (let i = history.length - 1; i > 0; i--) {
        history[i] = history[i - 1];
      }
      history[0] = msg;
    }
  }

  function printHistory() {
    for (let i = history.length - 1; i >= 0; i--) {
      ns.print(history[i]);
    }
  }

  // stock market data
  const constants = market.getConstants();
  const fee = 100000;
  const tradeFee = fee * 2;

  const symbols = market.getSymbols();
  const papers = new Map();

  const safeMoneyMin = ns.getServerMoneyAvailable('home') * 0.3;
  const buyCoeff = 1;
  const tradeVolatility = 0.05;
  const longBuyForecast = 0.6;
  const longSellForecast = 0.55;
  const shortBuyForecast = 0.4;
  const shortSellForecast = 0.45;
  const enableShort = false;
  const tickTime = 4000;
  let portfolioWorth = 0;
  let cashProfit = 0;

  while (true) {
    portfolioWorth = 0;
    // update data
    for (const s of symbols) {
      const paper = new Paper(market, s);
      papers.set(s, paper);
      portfolioWorth += paper.priceBid * paper.longShares + paper.priceBid * paper.shortShares - tradeFee;
    }
    const sortedPapers = Array.from(papers.values()).sort((a, b) => b.profitChance - a.profitChance);

    const safeMoney = Math.max(ns.getServerMoneyAvailable('home') * 0.3, safeMoneyMin);

    // Sell if needed
    for (const p of sortedPapers) {
      if (p.longShares > 0 && p.forecast < longSellForecast) {
        const gain = market.sellStock(p.symbol, p.longShares);
        cashProfit += (gain * p.longShares) - fee;
        const log = `${Colors.red}Sold(Long)${Colors.reset} ${p.longShares} of [${p.symbol}] for ${ns.formatNumber(
          (gain * p.longShares) - fee,
        )}$`;
        addHistory(log);
        ns.toast(log);
      }
      if (enableShort && p.shortShares > 0 && p.forecast > shortSellForecast) {
        const gain = market.sellShort(p.symbol, p.shortShares);
        cashProfit += (gain * p.shortShares) - fee;
        const log = `${Colors.red}Sold(Short)${Colors.reset} ${p.shortShares} of [${p.symbol}] for ${ns.formatNumber(
          (gain * p.shortShares) - fee,
        )}$`;
        addHistory(log);
        ns.toast(log);
      }

      // Buy shares

      let playerMoney = ns.getServerMoneyAvailable('home');
      if (playerMoney < safeMoney) {
        break;
      }
      let maxShares = p.maxShares - p.longShares;
      // long
      if (p.forecast > longBuyForecast && p.volatility < tradeVolatility && p.longShares === 0) {
        let shareCount = Math.floor(Math.min((playerMoney - safeMoney - fee) / p.priceAsk, maxShares) * buyCoeff);
        if (shareCount * p.priceAsk < fee) continue;
        let boughtFor = market.buyStock(p.symbol, shareCount);
        cashProfit -= (boughtFor * shareCount) + fee;
        const log = `${Colors.yellow_bright}Bought(Long)${Colors.reset} ${shareCount} of [${
          p.symbol
        }] for ${ns.formatNumber((boughtFor * shareCount) + fee)}$`;
        addHistory(log);
        ns.toast(log);
      }
      // short
      if (enableShort && p.forecast <= shortBuyForecast && p.volatility < tradeVolatility && p.shortShares === 0) {
        let shareCount = Math.floor(Math.min((playerMoney - safeMoney - fee) / p.priceAsk, maxShares) * buyCoeff);
        if (shareCount * p.priceAsk < fee) continue;
        let boughtFor = market.buyShort(p.symbol, shareCount);
        cashProfit -= (boughtFor * shareCount) + fee;
        const log = `${Colors.yellow_bright}Bought(Short)${Colors.reset} ${shareCount} of [${
          p.symbol
        }] for ${ns.formatNumber((boughtFor * shareCount) + fee)}$`;
        addHistory(log);
        ns.toast(log);
      }
    }

    ns.clearLog();
    printHistory();
    ns.printf(`PortfolioWorth: ${ns.formatNumber(portfolioWorth, 2)}`);
    ns.printf(`Profit: ${ns.formatNumber(cashProfit, 2)}`);
    await ns.sleep(tickTime);
  }
}

class Paper {
  fee = 100000;
  tradeFee = this.fee * 2;

  constructor(market, symbol) {
    this.market = market;
    this.symbol = symbol;
    const pos = market.getPosition(symbol);
    this.longShares = pos[0];
    this.longPrice = pos[1];
    this.shortShares = pos[2];
    this.shortPrice = pos[3];
    this.priceAsk = market.getAskPrice(symbol);
    this.priceBid = market.getBidPrice(symbol);
    this.forecast = market.getForecast(symbol);
    this.maxShares = market.getMaxShares(symbol);
    this.organisation = market.getOrganization(symbol);
    this.price = market.getPrice(symbol);
    this.volatility = market.getVolatility(symbol);
    this.longProfit = this.longShares * (this.priceBid - this.longPrice) - this.tradeFee;
    this.shortProfit = this.shortShares * (this.shortPrice - this.priceAsk) - this.tradeFee;
    this.profit = this.longProfit + this.shortProfit;

    this.profitChance = Math.abs(this.forecast - 0.5);
    this.profitPotential = this.volatility * this.profitChance;
  }
}
