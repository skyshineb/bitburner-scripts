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
  const handle = ns.getPortHandle(Ports.hack_debug);
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
  
  /** @returns {HWGWTimings} */
  function getTimingsAndThreads() {
    const player = ns.getPlayer();
    const targetServ = ns.getServer(target);

    // hack
    targetServ.hackDifficulty = targetServ.minDifficulty;
    targetServ.moneyAvailable = targetServ.moneyMax;
    const percentStolenBySingleThread = formulas.hackPercent(targetServ, player);
    const hackThreads = Math.floor(moneyPercentageToSteal / percentStolenBySingleThread);

    const moneyAfterHack = targetServ.moneyMax - (percentStolenBySingleThread * hackThreads * targetServ.moneyMax);
    const hSecIncrease = ns.hackAnalyzeSecurity(hackThreads, target);
    const hTime = formulas.hackTime(targetServ, player);

    // weaken 1
    const weakenEffect = ns.weakenAnalyze(1, cores);
    const weakenThreads1 = Math.max(1, Math.round(hSecIncrease / weakenEffect));
    targetServ.hackDifficulty = targetServ.minDifficulty + hSecIncrease;
    const wTime1 = formulas.weakenTime(targetServ, player);

    // grow
    targetServ.moneyAvailable = moneyAfterHack;
    const growThreads = Math.round(formulas.growThreads(targetServ, player, targetServ.moneyMax, cores));
    targetServ.hackDifficulty = targetServ.minDifficulty;
    const gTime = formulas.growTime(targetServ, player);
    const gSecIncrease = ns.growthAnalyzeSecurity(growThreads);
    
    // weaken 2
    const weakenThreads2 = Math.max(1, Math.round(gSecIncrease / weakenEffect));
    targetServ.hackDifficulty = targetServ.minDifficulty + gSecIncrease;
    const wTime2 = formulas.weakenTime(targetServ, player);
    
    return new HWGWTimings(hackThreads, weakenThreads1, growThreads, weakenThreads2, hTime, wTime1, gTime, wTime2);
  }

  const delayMS = 300;
  /** @param {HWGWTimings} timings*/
  function setDelays(timings) {
    const delays = [1 * delayMS, 2 * delayMS, 3 * delayMS, 4 * delayMS];
    // backwards order of delays
    const tWithDelays = [delays[0] + timings.wTime2, delays[1] + timings.gTime, delays[2] + timings.wTime1, delays[3] + timings.hTime];
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
    
    timings.setDelays(hSleep, wSleep1, gSleep, wSleep2, maxTime);
  }

  function getRamForCycle(hThreads, wThreads1, gThreads, wThreads2) {
    const hMem = ns.getScriptRam('/async/ahack_d.js') * hThreads;
    const wMem1 = ns.getScriptRam('/async/aweaken_d.js') * wThreads1;
    const gMem = ns.getScriptRam('/async/agrow_d.js') * gThreads;
    const wMem2 = ns.getScriptRam('/async/aweaken_d.js') * wThreads2;
    return hMem + wMem1 + gMem + wMem2;
  }

  /** @type {Map<number, Event>} */
  const reports = new Map();

  let cycles = 0;
  let prevBlockMaxTime = 0;
  // hack -> weaken -> grow -> weaken
  while (true) {
    // collect info for new cycle
    const tnt = getTimingsAndThreads();
    setDelays(tnt);
    const ramNeeded = getRamForCycle(tnt.hackThreads, tnt.weakenThreads1, tnt.growThreads, tnt.weakenThreads2);
    const freeMem = ns.getServerMaxRam(base) - ns.getServerUsedRam(base);
    ns.clearLog();
    ns.printf(`\t\t\t[${target}]`);
    ns.printf(`HT: ${tnt.hTime} WT1: ${tnt.wTime1} GT: ${tnt.gTime} WT2: ${tnt.wTime2}`);
    ns.printf(`SHT: ${tnt.hSleep} SWT1: ${tnt.wSleep1} SGT: ${tnt.gSleep} SWT2: ${tnt.wSleep2}`);
    if (freeMem > ramNeeded) {
//      ns.printf(
//        `${Colors.magneta}Hacking ${Colors.red}%s${Colors.reset} Cycle ${Colors.green}%d${Colors.reset} at %s`,
//        target,
//        cycles,
//        new Date().toLocaleTimeString('it-IT'),
//      );
     
//      handle.write(
//        `${target} ${cycles} ${Date.now()} ${ns.formatNumber(maxTime / 1000, 0)} ${costOfCycle - 100} ${inc}`,
//      );
      
      ns.exec('/async/ahack_d.js', base, {threads: tnt.hackThreads - 1}, target, tnt.hackThreads - 1, tnt.hTime, tnt.hSleep, cycles);
      ns.exec('/async/aweaken_d.js', base, {threads: tnt.weakenThreads1}, target, tnt.weakenThreads1, tnt.wTime1, tnt.wSleep1, 'w1' ,cycles);
      ns.exec('/async/agrow_d.js', base, {threads: tnt.growThreads}, target, tnt.growThreads, tnt.gTime, tnt.gSleep, cycles);
      ns.exec('/async/aweaken_d.js', base, {threads: tnt.weakenThreads2}, target, tnt.weakenThreads2, tnt.wTime2, tnt.wSleep2, 'w2' ,cycles);
      
      cycles++;
      if (prevBlockMaxTime > tnt.maxTime) {
        await ns.sleep(prevBlockMaxTime - tnt.maxTime + delayMS);
      }
      prevBlockMaxTime = tnt.maxTime;
    }

    // do monitoring
    while (!handle.empty()) {
      const vals = handle.read().split(' ');
      const type = vals[0];
      const cycle = vals[1];
      const duration = vals[2];
      let event;
      if (reports.has(cycle)) {
        event = reports.get(cycle);
      } else {
        event = new Event();
        reports.set(cycle, event);
      }
      if (type === 'hack') {
        event.setHDuration(duration);
      } else if (type === 'w1') {
        event.setW1Duration(duration);
      } else if (type === 'grow') {
        event.setGDuration(duration);
      } else {
        event.setW2Duration(duration);
      }
    }
    ns.printf('-----------------');
    const strs = new Array(...reports.entries()).filter(e => e[1].isFilled()).sort((a, b) => a[0] - b[0]);
    for (const s of strs) {
      ns.printf(`[${s[0]}] H: ${s[1].hDuration} W1: ${s[1].w1Duration} G: ${s[1].gDuration} W2: ${s[1].w2Duration}`);
    }

    await ns.sleep(delayMS * 4);
  }
}

class Event {
  hDuration = undefined;
  w1Duration = undefined;
  gDuration = undefined;
  w2Duration = undefined;

  setHDuration(time) {
    this.hDuration = time;
  }
  setW1Duration(time) {
    this.w1Duration = time;
  }
  setGDuration(time) {
    this.gDuration = time;
  }
  setW2Duration(time) {
    this.w2Duration = time;
  }

  isFilled(){
    return this.hDuration !== undefined && this.w1Duration !== undefined && this.gDuration !== undefined && this.w2Duration !== undefined;
  }
  toString() {
    return `H: ${this.hDuration} W1: ${this.w1Duration} G: ${this.gDuration} W2: ${this.w2Duration}`;
  }
}

