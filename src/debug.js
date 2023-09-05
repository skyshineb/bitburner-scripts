import { Colors } from './lib/output.js';
import { Ports } from './lib/constants.js';
import { HWGWTimings } from './lib/helpers.js';
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
  if (!ns.fileExists('Formulas.exe', 'home')) {
    ns.print("Formulas.exe not found on home.");
    return;
  }

  ns.disableLog('ALL');
  const handle = ns.getPortHandle(Ports.hack_hwgw);
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

  const formulas = ns.formulas.hacking;
  
  function getTimingsAndThreads() {
    const player = ns.getPlayer();
    const targetServ = ns.getServer(target);

    // hack
    const hackThreads = Math.floor(
      ns.hackAnalyzeThreads(target, targetServ.moneyMax * moneyPercentageToSteal),
      );

    targetServ.hackDifficulty = targetServ.minDifficulty;
    const percentStolenBySingleThread = formulas.hackPercent(targetServ, player);
    const moneyAfterHack = targetServ.moneyMax - (percentStolenBySingleThread * hackThreads * targetServ.moneyMax);
    const hSecIncrease = ns.hackAnalyzeSecurity(hackThreads, target);
    const hTime = ns.getHackTime(target);

    // weaken 1
    const weakenEffect = ns.weakenAnalyze(1, cores);
    const weakenThreads1 = Math.round(hSecIncrease / weakenEffect);
    targetServ.hackDifficulty = targetServ.minDifficulty + hSecIncrease;
    const wTime1 = formulas.weakenTime(targetServ, player);

    // grow
    targetServ.moneyAvailable = moneyAfterHack;
    const growThreads = Math.round(formulas.growThreads(targetServ, player, targetServ.moneyMax, cores));
    targetServ.hackDifficulty = targetServ.minDifficulty;
    const gTime = ns.formulas.hacking.growTime(targetServ, player);
    const gSecIncrease = ns.growthAnalyzeSecurity(growThreads);
    
    // weaken 2
    const weakenThreads2 = Math.round(gSecIncrease / weakenEffect);
    targetServ.hackDifficulty = targetServ.minDifficulty + gSecIncrease;
    const wTime2 = formulas.weakenTime(targetServ, player);
    
    return new HWGWTimings(hackThreads, weakenThreads1, growThreads, weakenThreads2, hTime, wTime1, gTime, wTime2);
  }

  const delayMS = 300;
  function getDelays(hTime, wTime1, gTime, wTime2) {
    const delays = [1 * delayMS, 2 * delayMS, 3 * delayMS, 4 * delayMS];
    // backwards order of delays
    const tWithDelays = [delays[0] + wTime2, delays[1] + gTime, delays[2] + wTime1, delays[3] + hTime];
    const maxTime = Math.max(...tWithDelays);
    const sleepTime = [
      maxTime - tWithDelays[0],
      maxTime - tWithDelays[1],
      maxTime - tWithDelays[2],
      maxTime - tWithDelays[3],
      ];

    const hSleep = sleepTime[3];
    const wSleep1 = sleepTime[2];
    const gSleep = sleepTime[1];
    const wSleep2 = sleepTime[0];
    
    return [hSleep, wSleep1, gSleep, wSleep2];
  }

  function getRamForCycle(hThreads, wThreads1, gThreads, wThreads2) {
    const hMem = ns.getScriptRam('/async/ahack.js') * hThreads;
    const wMem1 = ns.getScriptRam('/async/aweaken.js') * wThreads1;
    const gMem = ns.getScriptRam('/async/agrow.js') * gThreads;
    const wMem2 = ns.getScriptRam('/async/aweaken.js') * wThreads2;
    return hMem + wMem1 + gMem + wMem2;
  }

  let cycles = 0;
  // hack -> weaken -> grow -> weaken
  while (true) {
    // collect info for new cycle
    const tnt = getTimingsAndThreads();
    const delays = getDelays(tnt.hTime, tnt.wTime1, tnt.gTime, tnt.wTime2);
    const ramNeeded = getRamForCycle(tnt.hackThreads, tnt.weakenThreads1, tnt.growThreads, tnt.weakenThreads2);
    const freeMem = ns.getServerMaxRam(base) - ns.getServerUsedRam(base);
    if (freeMem > ramNeeded) {
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
        `${target} ${cycles} ${Date.now()} ${ns.formatNumber(maxTime / 1000, 0)} ${costOfCycle - 100} ${inc}`,
      );
      
      //ns.printf("cycle startTime: %s",Date.now());
      ns.exec('/async/ahack.js', base, recommendedThreads, target, recommendedThreads, hSleep, cycles);
      ns.exec('/async/aweaken.js', base, weakenThreads, target, w1Sleep, cycles);
      ns.exec('/async/agrow.js', base, growThreads, target, gSleep, cycles);
      ns.exec('/async/aweaken.js', base, weakenThreads, target, w2Sleep, cycles);
      
      cycles++;
      //if(cycles == 60) break;
    } else {
      await ns.sleep(Math.max(1000, delayMS * 4));
    }
    await ns.sleep(delayMS * 5);
  }
}

