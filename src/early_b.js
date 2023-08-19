import { Ports } from './lib/constants.js';

/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];

  ns.tail();
  if (target == undefined) {
    ns.print('ERROR Empty 0 argument! Please provide a server to hack.');
    return;
  }

  const handle = ns.getPortHandle(Ports.hack_seq);
  const percentToSteal = 0.6;
  const moneyToHack = ns.getServerMaxMoney(target) * percentToSteal;

  const securityThresh = ns.getServerMinSecurityLevel(target) + 4;

  while (true) {
    const inc = ns.getScriptIncome('early_b.js', ns.getHostname(), ...ns.args);
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      handle.write(`${target} ${Date.now()} weaken ${ns.getHostname()} ${inc}`);
      await ns.weaken(target);
    } else if (ns.getServerMoneyAvailable(target) < moneyToHack) {
      handle.write(`${target} ${Date.now()} grow ${ns.getHostname()} ${inc}`);
      await ns.grow(target);
    } else {
      handle.write(`${target} ${Date.now()} hack ${ns.getHostname()} ${inc}`);
      await ns.hack(target);
    }
  }
}
