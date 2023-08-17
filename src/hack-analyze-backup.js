/** @param {NS} ns */
export async function main(ns) {
  const tar = ns.args[0];
  if (tar == undefined) {
    ns.tail();
    ns.print('ERROR Empty argument! Please provide a server to hack.');
    return;
  }

  //   ns.disableLog("getServerMaxMoney");
  // ns.disableLog("getServerMinSecurityLevel");
  //    ns.disableLog("getServerSecurityLevel");
  //    ns.disableLog("weaken");
  //    ns.disableLog("getServerMoneyAvailable");
  //    ns.disableLog("grow");
  ns.disableLog('ALL');

  const target = tar;
  const moneyThresh = ns.getServerMaxMoney(target) * 0.8;
  const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

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
        'INFO hacking... chance: %s, secLvl: %s, time: %s sec',
        ns.formatNumber(ns.hackAnalyzeChance(target), 2),
        ns.formatNumber(ns.getServerSecurityLevel(target), 1),
        ns.formatNumber(ns.getHackTime(target) / 1000, 2),
      );
      const recommendedThreads = ns.hackAnalyzeThreads(target, 500000000);
      hackReturned = await ns.hack(target, { threads: recommendedThreads });
      ns.printf('INFO hacked after %d grows and %d weakens for %s $$$', grows, weakens, hackReturned);
      let endTime = performance.now();
      ns.printf('INFO full cycle took %s sec', ns.formatNumber((endTime - startTime) / 1000, 0));
      startTime = performance.now();
      grows = 0;
      weakens = 0;
    }
  }
}
