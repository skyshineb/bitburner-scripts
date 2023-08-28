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

  // stock market data
  const constants = market.getConstants();
  const fee = 100000;
  const tradeFee = fee * 2;

  const symbols = market.getSymbols();
  const papers = new Map();
  for (const s of symbols) {
    papers.set(s, new Paper(market, s));
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
