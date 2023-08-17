/** @param {NS} ns */
export async function main(ns) {
  ns.tail();
  const limit = ns.getPurchasedServerLimit();
  const factor = ns.args[0];

  if (factor == 0) {
    ns.print('Enter factor as arg');
  }
  for (let i = 0; i < factor; i++) {
    const one = ns.getPurchasedServerCost(Math.pow(2, i));
    const cost = ns.formatNumber(limit * one);
    ns.print('Servers with ' + Math.pow(2, i) + ' Gb costs (25): ' + cost + ' (1): ' + ns.formatNumber(one));
  }
}
