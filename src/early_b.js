/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];

  ns.tail();
  if (target == undefined) {
    ns.print('ERROR Empty 0 argument! Please provide a server to hack.');
    return;
  }

  const percentToSteal = 0.6;

  const moneyToHack = ns.getServerMaxMoney(target) * percentToSteal;

  const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

  if (ns.fileExists('BruteSSH.exe', 'home')) {
    ns.brutessh(target);
  }

  // Get root access to target server
  ns.nuke(target);

  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      await ns.weaken(target);
    } else if (ns.getServerMoneyAvailable(target) < moneyToHack) {
      await ns.grow(target);
    } else {
      await ns.hack(target);
    }
  }
}
