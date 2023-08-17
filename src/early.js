import { Colors } from './lib/output.js';
import * as smartopt from './smart-optimize.js';

/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const stealP = ns.args[1];
  const base = ns.getHostname();

  ns.tail();
  if (target == undefined) {
    ns.print('ERROR Empty 0 argument! Please provide a server to hack.');
    return;
  }

  ns.disableLog('ALL');
  const hackPort = 1;
  const handle = ns.getPortHandle(hackPort);
  const securityThresh = ns.getServerMinSecurityLevel(target);

  const moneyPercentageToSteal = stealP == undefined ? 0.75 : stealP;

  const cores = ns.getServer(base).cpuCores;

  // grow and weaken the server first
  while (
    ns.getServerSecurityLevel(target) > securityThresh ||
    ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)
  ) {
    ns.printf(`${Colors.magneta}Optimizing server %s`, target);
    await smartopt.smartOptimize(ns, Array.of(base, target));
  }

  let recommendedThreads = Math.floor(
    ns.hackAnalyzeThreads(target, ns.getServerMaxMoney(target) * moneyPercentageToSteal),
  );

  // run optimized loop
  let wTime = ns.getWeakenTime(target);
  let gTime = ns.getGrowTime(target);
  let hTime = ns.getHackTime(target);

  const partStolen = ns.hackAnalyze(target);
  const moneyAfterHack = ns.getServerMaxMoney(target) - partStolen * recommendedThreads * ns.getServerMaxMoney(target);
  const growMult = Math.max(1, ns.getServerMaxMoney(target) / moneyAfterHack);
  let growThreads = Math.round(ns.growthAnalyze(target, growMult));

  const weakenEffect = ns.weakenAnalyze(1, cores);
  const securityIncr = Math.max(ns.hackAnalyzeSecurity(recommendedThreads), ns.growthAnalyzeSecurity(growThreads));
  let weakenThreads = Math.round(securityIncr / weakenEffect) + 1;

  if (ns.fileExists('Formulas.exe')) {
    const player = ns.getPlayer();
    const serv = ns.getServer(target);
    const hSecIncrease = ns.hackAnalyzeSecurity(recommendedThreads);
    const gSecIncrease = ns.growthAnalyzeSecurity(growThreads);
    serv.hackDifficulty = serv.minDifficulty + hSecIncrease;
    wTime = ns.formulas.hacking.weakenTime(serv, player);
    //serv.hackDifficulty = serv.minDifficulty + hSecIncrease;
    gTime = ns.formulas.hacking.growTime(serv, player);
    hTime = ns.formulas.hacking.hackTime(serv, player);

    serv.moneyAvailable = moneyAfterHack;
    growThreads = ns.formulas.hacking.growThreads(serv, player, serv.moneyMax, cores);
  }

  const delayMS = 300;

  const delays = [1 * delayMS, 2 * delayMS, 3 * delayMS, 4 * delayMS];
  // backwards order of delays
  const tWithDelays = [delays[0] + wTime, delays[1] + gTime, delays[2] + wTime, delays[3] + hTime];
  const maxTime = Math.max(...tWithDelays);
  const sleepTime = [
    maxTime - tWithDelays[0],
    maxTime - tWithDelays[1],
    maxTime - tWithDelays[2],
    maxTime - tWithDelays[3],
  ];

  ns.printf('maxTime: ' + maxTime);

  let hSleep = sleepTime[3];
  let w1Sleep = sleepTime[2];
  let gSleep = sleepTime[1];
  let w2Sleep = sleepTime[0];

  ns.printf('HackTime: %s, GrowTime: %s, WeakenTime: %s', hTime, gTime, wTime);
  ns.printf('HackSleep: %s, GrowSleep: %s, WeakenSleep1: %s, WeakenSleep1: %s', hSleep, gSleep, w1Sleep, w2Sleep);

  const hMem = ns.getScriptRam('/async/ahack.js') * recommendedThreads;
  const gMem = ns.getScriptRam('/async/agrow.js') * growThreads;
  const wMem = ns.getScriptRam('/async/aweaken.js') * weakenThreads;
  const costOfCycle = hMem + gMem + wMem * 2 + 100; // left 10 GB of free ram just in case
  ns.printf('INFO real cost of one cycle is %s GB', costOfCycle - 100);

  let cycles = 0;
  let hackLvl = ns.getHackingLevel();
  // hack -> weaken -> grow -> weaken
  while (true) {
    const freeMem = ns.getServerMaxRam(base) - ns.getServerUsedRam(base);
    if (freeMem > costOfCycle) {
      /*if (ns.getHackingLevel() != hackLvl) {
            recommendedThreads = Math.max(Math.floor(ns.hackAnalyzeThreads(target, ns.getServerMaxMoney(target) * moneyPercentageToSteal)), 1);

            const weakenEffect = ns.weakenAnalyze(1, cores);
            const securityIncr = Math.max(ns.hackAnalyzeSecurity(recommendedThreads), ns.growthAnalyzeSecurity(growThreads));
            weakenThreads = Math.round(securityIncr / weakenEffect) + 1;

            const player = ns.getPlayer();
            const serv = ns.getServer(target);
            const hSecIncrease = ns.hackAnalyzeSecurity(recommendedThreads);
            const gSecIncrease = ns.growthAnalyzeSecurity(growThreads);
            serv.hackDifficulty = serv.minDifficulty + hSecIncrease;
            wTime = ns.formulas.hacking.weakenTime(serv, player);
            //serv.hackDifficulty = serv.minDifficulty + hSecIncrease;
            gTime = ns.formulas.hacking.growTime(serv, player);
            hTime = ns.formulas.hacking.hackTime(serv, player);

            serv.moneyAvailable = moneyAfterHack;
            growThreads = ns.formulas.hacking.growThreads(serv, player, serv.moneyMax, cores);

            // calc sleeps
            const tWithDelays = [delays[0] + wTime, delays[1] + gTime, delays[2] + wTime, delays[3] + hTime];
            const maxTime = Math.max(...tWithDelays);
            const sleepTime = [maxTime - tWithDelays[0], maxTime - tWithDelays[1], maxTime - tWithDelays[2], maxTime - tWithDelays[3]];

            hSleep = sleepTime[3];
            w1Sleep = sleepTime[2];
            gSleep = sleepTime[1];
            w2Sleep = sleepTime[0];
            hackLvl = ns.getHackingLevel();
        }*/
      ns.clearLog();
      ns.printf(
        `${Colors.magneta}Hacking ${Colors.red}%s${Colors.reset} Cycle ${Colors.green}%d${Colors.reset} at %s`,
        target,
        cycles,
        new Date().toLocaleTimeString('it-IT'),
      );
      const inc = ns.getScriptIncome('early.js', base, ...ns.args);
      ns.printf(
        `Block length: %dsec Ram cost: %dG. Avg Income: %s`,
        maxTime / 1000,
        costOfCycle - 100,
        ns.formatNumber(inc, 2),
      );
      handle.write(
        `${target} ${cycles} ${new Date().toLocaleTimeString('it-IT')} ${ns.formatNumber(maxTime / 1000, 0)} ${
          costOfCycle - 100
        } ${inc}`,
      );
      //ns.printf(`${Colors.green}starting cycle %d${Colors.reset} at %s, free mem: %s`, cycles, new Date().toLocaleTimeString('it-IT'), freeMem);
      if (cycles % 200 == 0 && cycles != 0) {
        while (ns.ps(base).filter((p) => p.args[0] == target).length > 1) {
          await ns.sleep(500);
        }
        ns.exec('smart-optimize.js', base, 1, base, target);
        while (ns.ps(base).filter((p) => p.args[0] == target).length > 1) {
          await ns.sleep(500);
        }
      } else {
        //ns.printf("cycle startTime: %s",Date.now());
        ns.exec('/async/ahack.js', base, recommendedThreads, target, recommendedThreads, hSleep, cycles);
        ns.exec('/async/aweaken.js', base, weakenThreads, target, w1Sleep, cycles);
        ns.exec('/async/agrow.js', base, growThreads, target, gSleep, cycles);
        ns.exec('/async/aweaken.js', base, weakenThreads, target, w2Sleep, cycles);
      }
      cycles++;
      //if(cycles == 60) break;
    } else {
      await ns.sleep(Math.max(1000, delayMS * 4));
    }
    await ns.sleep(delayMS * 5);
  }
}
