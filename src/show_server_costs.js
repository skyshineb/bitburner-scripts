import { Colors } from './lib/output.js';

/** @param {NS} ns */
export async function main(ns) {
  ns.tail();
  const limit = ns.getPurchasedServerLimit();
  const maxRam = ns.getPurchasedServerMaxRam();
  for (let i = 0; i <= Math.log2(maxRam); i++) {
    const ram = Math.pow(2, i);
    const one = ns.getPurchasedServerCost(ram);
    const fullCost = ns.formatNumber(limit * one);
    ns.print(
      `Servers with [${Colors.test}${ram}${Colors.reset}] GB costs: \x1b[38;5;32m(25): ${fullCost}${
        Colors.reset
      } \x1b[38;5;44m(1): ${ns.formatNumber(one)}`,
    );
  }
}
