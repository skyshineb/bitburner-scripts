import { Colors } from './lib/output.js';

/** @param {NS} ns */
export async function main(ns) {
  smartOptimize(ns, ns.args);
}

/** @param {NS} ns
 *  @param {Array} args
 */
export async function smartOptimize(ns, args) {
  const base = args[0];
  const target = args[1];

  // do some checks
  if (args.length != 2) {
    ns.tail();
    ns.print('Not provided enough args');
  }

  // work
  const cores = ns.getServer(base).cpuCores;

  let wTime = ns.getWeakenTime(target);
  let gTime = ns.getGrowTime(target);

  const growThreadsOld = Math.round(
    ns.growthAnalyze(target, ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target), cores),
  );
  const serv = ns.getServer(target);
  let growThreadsNew = growThreadsOld;
  if (ns.fileExists('Formulas.exe', 'home')) {
    growThreadsNew = ns.formulas.hacking.growThreads(serv, ns.getPlayer(), serv.moneyMax, cores);
  }

  const growThreads = Math.max(growThreadsOld, growThreadsNew, 1);

  const weakenEffect = ns.weakenAnalyze(1, cores);
  const securityIncr = ns.growthAnalyzeSecurity(growThreads);
  const weakenThreads1 = Math.round((serv.hackDifficulty - serv.minDifficulty) / weakenEffect) + 1;
  const weakenThreads2 = Math.round(securityIncr / weakenEffect) + 1;

  const weakenThreads = Math.max(weakenThreads1, weakenThreads2);

  const delayMS = 200;

  const delays = [1 * delayMS, 2 * delayMS, 3 * delayMS];
  // backwards order of delays
  const tWithDelays = [delays[0] + wTime, delays[1] + gTime, delays[2] + wTime];
  const maxTime = Math.max(...tWithDelays);
  const sleepTime = [maxTime - tWithDelays[0], maxTime - tWithDelays[1], maxTime - tWithDelays[2]];

  let w1Sleep = sleepTime[2];
  let gSleep = sleepTime[1];
  let w2Sleep = sleepTime[0];

  const gMem = ns.getScriptRam('/async/agrow.js') * growThreads;
  const wMem = ns.getScriptRam('/async/aweaken.js') * weakenThreads;
  const costOfCycle = gMem + wMem * 2;

  // decision table
  let executed = false;
  let freeRam = ns.getServerMaxRam(base) - ns.getServerUsedRam(base);
  if (costOfCycle < freeRam) {
    ns.print(`[${Colors.cyan}Batch${Colors.reset}] optimizing...`);
    ns.exec('/async/aweaken.js', base, weakenThreads, target, w1Sleep, 0);
    ns.exec('/async/agrow.js', base, growThreads, target, gSleep, 0);
    ns.exec('/async/aweaken.js', base, weakenThreads, target, w2Sleep, 0);
    await ns.sleep(maxTime);
    executed = true;
  }

  // gradual optimizing
  if (!executed) {
    let isDiffMin = false;
    let isMoneyMax = false;
    ns.print(`[${Colors.cyan}Cyclic${Colors.reset}] optimizing...`);
    while (!(isDiffMin && isMoneyMax)) {
      if (ns.getServerSecurityLevel(target) > serv.minDifficulty) {
        isDiffMin = false;
        const threads = calculateWeakenThreads(ns, base);
        const time = ns.getWeakenTime(target);
        ns.exec('/async/aweaken.js', base, threads, target, 0, 0);
        await ns.sleep(time);
      } else {
        isDiffMin = true;
      }
      if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
        isMoneyMax = false;
        const threads = calculateGrowThreads(ns, base, target);
        const time = ns.getGrowTime(target);
        ns.exec('/async/agrow.js', base, threads, target, 0, 0);
        await ns.sleep(time);
      } else {
        isMoneyMax = true;
      }
    }
    await ns.sleep(300);
  }
}

/** @param {NS} ns */
function calculateWeakenThreads(ns, host) {
  const wMem = ns.getScriptRam('/async/aweaken.js');
  const servMem = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
  let threads = Math.floor(servMem / wMem);
  if (threads < 1) threads = 1;
  return threads;
}

/** @param {NS} ns */
function calculateGrowThreads(ns, host, target) {
  const gMem = ns.getScriptRam('/async/agrow.js');
  const servMem = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
  let threads = ns.formulas.hacking.growThreads(ns.getServer(target), ns.getPlayer(), ns.getServerMaxMoney(target), 1);
  threads = Math.min(Math.floor(servMem / gMem), threads);
  if (threads < 1) threads = 1;
  return threads;
}
