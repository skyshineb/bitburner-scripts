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
  const costOfCycle = gMem + wMem * 2 + 10; // left 100 GB of free ram just in case

  let executed = false;
  while (!executed) {
    if (ns.getServerMaxRam(base) - ns.getServerUsedRam(base) > costOfCycle) {
      ns.print(`${Colors.cyan} optimizing in batch <o o>`);
      ns.exec('/async/aweaken.js', base, weakenThreads, target, w1Sleep, 0);
      ns.exec('/async/agrow.js', base, growThreads, target, gSleep, 0);
      ns.exec('/async/aweaken.js', base, weakenThreads, target, w2Sleep, 0);
      executed = true;
    } else {
      ns.print(`${Colors.cyan} optimizing gradually >-<`);
      if (
        ns.getServerSecurityLevel(target) > serv.minDifficulty &&
        ns.getServerMaxRam(base) - ns.getServerUsedRam(base) > wMem
      ) {
        ns.print(`${Colors.cyan} weakening with ${weakenThreads} threads`);
        ns.exec('/async/aweaken.js', base, weakenThreads, target, w1Sleep, 0);
        await ns.sleep(tWithDelays[0]);
      } else if (
        ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target) &&
        ns.getServerMaxRam(base) - ns.getServerUsedRam(base) > gMem
      ) {
        ns.print(`${Colors.cyan} growing with ${growThreads} threads`);
        ns.exec('/async/agrow.js', base, growThreads, target, gSleep, 0);
        await ns.sleep(tWithDelays[1]);
      }
    }
    await ns.sleep(300);
  }
  await ns.sleep(maxTime);
}
