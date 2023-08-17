/** @param {NS} ns */
export async function main(ns) {
  const tar = ns.args[0];
  const hackThreads = ns.args[1];

  ns.tail();

  if (tar == undefined) {
    ns.print('ERROR Empty 0 argument! Please provide a server to hack.');
    return;
  }

  if (hackThreads == undefined) {
    ns.print('ERROR Empty 1 argument! Please provide a max threads to hack.');
    return;
  }

  ns.disableLog('ALL');

  const target = tar;
  const moneyThresh = ns.getServerMaxMoney(target) * 0.85;
  const securityThresh = ns.getServerMinSecurityLevel(target) + 3;

  let grows = 0;
  let weakens = 0;
  let hackReturned = 0;
  let startTime = performance.now();

  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      ns.print(
        'WARN hack chance is: ' +
          ns.formatNumber(ns.hackAnalyzeChance(target), 2) +
          ' for security lvl: ' +
          ns.getServerSecurityLevel(target) +
          ' weaken time: ' +
          ns.formatNumber(ns.getWeakenTime(target) / 1000, 2) +
          ' sec',
      );
      await ns.weaken(target);
      weakens++;
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      ns.printf(
        'current money is %s $, growing time : %s sec',
        ns.formatNumber(ns.getServerMoneyAvailable(target), 0),
        ns.formatNumber(ns.getGrowTime(target) / 1000, 2),
      );
      await ns.grow(target);
      grows++;
    } else {
      ns.printf(
        'INFO hacking... money: %s, chance: %s, secLvl: %s, time: %s sec',
        ns.getServerMoneyAvailable(target),
        ns.formatNumber(ns.hackAnalyzeChance(target), 2),
        ns.formatNumber(ns.getServerSecurityLevel(target), 1),
        ns.formatNumber(ns.getHackTime(target) / 1000, 2),
      );
      hackReturned = await ns.hack(target, { threads: hackThreads });
      ns.printf('INFO hacked after %d grows and %d weakens for %s $$$', grows, weakens, hackReturned);
      let endTime = performance.now();
      ns.printf('INFO full cycle took %s sec', ns.formatNumber((endTime - startTime) / 1000, 0));
      startTime = performance.now();
      grows = 0;
      weakens = 0;
    }
  }
}
