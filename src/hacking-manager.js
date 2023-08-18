import { getAverageMoneyPerSec, isHWGWLoopPossible } from './lib/analyze.js';
import { getToolsAvailable, scanRec } from './lib/hacking.js';

// GLOBAL CONST ZONE
const maxScanDepth = 15;
const stealPercentForEstimation = 0.5;
const hwgwDelay = 300;

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');
  ns.tail();
  while (true) {
    // Step 1. update targets and resources
    const [botnet, targets] = analyzeNetwork(ns, maxScanDepth);
    //const targets = getHackingTargets(ns);
    ns.print('botnet: ' + botnet.join(' '));
    ns.print('targets: ' + targets.join(' '));

    // Step 2. Fill action queue
    const actionQueue = fillActionQueue(ns, botnet, targets);
    // Step 3. Execute actions across net

    await ns.sleep(20000);
  }
}

/** @param {NS} ns
 *  @param {Array<Server>} botnet
 *  @param {Array<Target>} targets
 */
function fillActionQueue(ns, botnet, targets) {
  let freeRam = 0;
  for (const s of botnet) {
    freeRam += s.freeRam;
  }
  for (const t of targets) {
    const possible = isHWGWLoopPossible(ns, t.name, stealPercentForEstimation, hwgwDelay, freeRam);
    ns.printf('Batch for %s is %s', t.name, possible);
    freeRam -= ns.getServerMaxRam(t.name);
  }
}

/** @param {NS} ns
 *  @param {number} depth
 *  @return {Array}
 */
function analyzeNetwork(ns, depth) {
  const rootedServers = new Set();
  const botnet = getBotNet(ns, depth, rootedServers);
  const targets = getHackingTargets(ns, rootedServers);
  return [botnet, targets];
}

/** @param {NS} ns
 *  @param {number} depth
 *  @param {Set} rootedServers
 *  @return {Array}
 */
function getBotNet(ns, depth, rootedServers) {
  const tools = getToolsAvailable(ns);
  scanRec(ns, 'home', 0, depth, rootedServers, new Set(), tools);
  const botnet = [];

  for (const name of rootedServers) {
    if (ns.getServerMaxRam(name) > 0) {
      botnet.push(new Server(name, ns.getServerMaxRam(name) - ns.getServerUsedRam(name)));
    }
  }

  return botnet.sort((a, b) => b.freeRam - a.freeRam);
}

/** @param {NS} ns
 *  @param {Set} rootedServers
 *  @returns {Array<Target>}
 */
function getHackingTargets(ns, rootedServers) {
  const targets = [];
  const filteredList = Array.of(...rootedServers)
    .filter((e) => ns.getServerMaxMoney(e) > 0)
    .filter((e) => ns.hackAnalyzeChance(e) > 0.6);
  ns.print('a' + filteredList.length);
  for (const name of filteredList) {
    targets.push(new Target(name, getAverageMoneyPerSec(ns, name, stealPercentForEstimation)));
  }

  return targets.sort((a, b) => b.gain - a.gain);
}

class Server {
  /**
   * @param {string} name
   * @param {number} freeRam
   */
  constructor(name, freeRam) {
    this.name = name;
    this.freeRam = freeRam;
  }

  toString() {
    return `[${this.name} : ${this.freeRam}GB]`;
  }
}

class Target {
  /**
   * @param {string} name
   * @param {number} gain
   */
  constructor(name, gain) {
    this.name = name;
    this.gain = gain;
  }

  toString() {
    return `[${this.name} (${this.gain}$)]`;
  }
}
