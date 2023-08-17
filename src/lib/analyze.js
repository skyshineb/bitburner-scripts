/** @param {NS} ns
 * @param {Array} hackTargets
 */
export function getHackPriorityList(ns, hackTargets, stealPercent) {
  let mapped = hackTargets.map(function (key) {
    return [key, getAverageMoneyPerSec(ns, key, stealPercent)];
  });

  mapped.sort(function (first, second) {
    return second[1] - first[1];
  });

  return mapped;
}

/** Assume that we will have minimal possible security level.
 * @param {NS} ns */
export function getAverageMoneyPerSec(ns, target, stealPercent) {
  const serv = ns.getServer(target);
  serv.hackDifficulty = serv.minDifficulty;
  const hackLvl = ns.getHackingLevel();
  let hackNeeded = serv.requiredHackingSkill;

  if (hackNeeded > hackLvl) {
    return 0;
  }
  const maxMoney = serv.moneyMax;
  const secLvl = serv.minDifficulty;

  let hackChance = ns.hackAnalyzeChance(target);
  let hackTime = ns.getHackTime(target);
  if (ns.fileExists('Formulas.exe')) {
    hackChance = ns.formulas.hacking.hackChance(serv, ns.getPlayer());
    hackTime = ns.formulas.hacking.hackTime(serv, ns.getPlayer());
  }

  return (
    (Math.max(maxMoney * ((100 - secLvl / 100) * ((hackLvl - (hackNeeded - 1)) / hackLvl) * stealPercent), 0) *
      hackChance) /
    hackTime
  );
}

/**
 * @param {NS} ns
 * @param {string} target
 * @param {number} percentageToSteal
 * @param {number} delay
 * @param {number} memAvailable
 */
export function isHWGWLoopPossible(ns, target, percentageToSteal, delay, memAvailable) {
  // do all calculus on 1 core
  const cores = 1;
  let recommendedThreads = Math.floor(ns.hackAnalyzeThreads(target, ns.getServerMaxMoney(target) * percentageToSteal));

  let wTime = ns.getWeakenTime(target);
  let gTime = ns.getGrowTime(target);
  let hTime = ns.getHackTime(target);

  const partStolen = ns.hackAnalyze(target);
  const moneyAfterHack = ns.getServerMaxMoney(target) - partStolen * recommendedThreads * ns.getServerMaxMoney(target);
  let growMult = Math.max(1, ns.getServerMaxMoney(target) / moneyAfterHack);
  let growThreads = Math.round(ns.growthAnalyze(target, growMult));

  const weakenEffect = ns.weakenAnalyze(1, cores);
  const securityIncr = Math.max(ns.hackAnalyzeSecurity(recommendedThreads), ns.growthAnalyzeSecurity(growThreads));
  let weakenThreads = Math.round(securityIncr / weakenEffect) + 1;
  if (ns.fileExists('Formulas.exe')) {
    const player = ns.getPlayer();
    const serv = ns.getServer(target);
    const hSecIncrease = ns.hackAnalyzeSecurity(recommendedThreads);
    serv.hackDifficulty = serv.minDifficulty + hSecIncrease;
    wTime = ns.formulas.hacking.weakenTime(serv, player);
    gTime = ns.formulas.hacking.growTime(serv, player);
    hTime = ns.formulas.hacking.hackTime(serv, player);

    serv.moneyAvailable = moneyAfterHack;
    growThreads = ns.formulas.hacking.growThreads(serv, player, serv.moneyMax, cores);
  }
  const delays = [1 * delay, 2 * delay, 3 * delay, 4 * delay];
  // backwards order of delays
  const tWithDelays = [delays[0] + wTime, delays[1] + gTime, delays[2] + wTime, delays[3] + hTime];
  const cycleTime = Math.max(...tWithDelays);
  const nCycles = cycleTime / (delay * 5);
  const hMem = ns.getScriptRam('/async/ahack.js') * recommendedThreads;
  const gMem = ns.getScriptRam('/async/agrow.js') * growThreads;
  const wMem = ns.getScriptRam('/async/aweaken.js') * weakenThreads;
  const costOfCycle = hMem + gMem + wMem * 2;
  const totalMem = nCycles * costOfCycle;
  return totalMem < memAvailable;
}
