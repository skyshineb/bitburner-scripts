import { Colors } from './lib/output.js';

/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  //ns.tail();
  const securityThresh = ns.getServerMinSecurityLevel(target);
  ns.print('optimizing server...');
  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      await ns.weaken(target);
    } else if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
      await ns.grow(target);
    } else {
      break;
    }
  }
  ns.printf(`${Colors.cyan} finished...`);
}
