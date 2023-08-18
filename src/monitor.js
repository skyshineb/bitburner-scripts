import { Colors } from './lib/output.js';

/** @param {NS} ns */
export async function main(ns) {
  ns.tail();
  ns.disableLog('ALL');

  const hackPort = 1;
  const handle = ns.getPortHandle(hackPort);
  const reports = new Map();
  while (true) {
    while (!handle.empty()) {
      const vals = handle.read().split(' ');
      // report format
      // targetName cycle updTime BlkLen RamCost AvgIncome
      const targetName = vals[0];
      const cycle = vals[1];
      const updTime = vals[2];
      const BlkLen = vals[3];
      const RamCost = vals[4];
      const AvgIncome = vals[5];
      const report = new HackReport(ns, targetName, cycle, updTime, BlkLen, RamCost, AvgIncome);

      reports.set(targetName, [AvgIncome, report]);
    }

    ns.clearLog();
    ns.print(`${Colors.white}\t\t Hacking...`);

    Array.of(...reports.values())
      .sort((a, b) => b[0] - a[0])
      .forEach((value) => {
        ns.print(`${value[1]}`);
      });

    await ns.sleep(3000);
  }
}

class HackReport {
  /**
   * @param {NS} ns
   * @param {string} targetName
   * @param {string} cycle
   * @param {string} updTime
   * @param {string} blockLength
   * @param {string} ramCost
   * @param {string} avgIncome
   */
  constructor(ns, targetName, cycle, updTime, blockLength, ramCost, avgIncome) {
    this.ns = ns;
    this.targetName = targetName;
    this.cycle = cycle;
    this.updTime = updTime;
    this.blockLength = blockLength;
    this.ramCost = ramCost;
    this.avgIncome = avgIncome;
  }

  toString() {
    if (Date.now() - parseInt(this.updTime, 10) > 1000 * 60 * 1) {
      return `${Colors.grey}[+${this.ns.formatNumber(this.avgIncome, 2)}/s]\t${this.targetName}[${this.cycle}] [block ${
        this.blockLength
      } sec / ${Math.floor(this.ramCost)} GB] [lastUPD = ${new Date(parseInt(this.updTime, 10)).toLocaleTimeString(
        'it-IT',
      )}]`;
    } else {
      return `[${Colors.green}+${this.ns.formatNumber(this.avgIncome, 2)}/s${Colors.reset}]\t${this.targetName}[${
        Colors.magneta
      }${this.cycle}${Colors.reset}] [block ${Colors.yellow}${this.blockLength} sec${Colors.reset} / ${Math.floor(
        this.ramCost,
      )} GB] [lastUPD = ${Colors.cyan}${new Date(parseInt(this.updTime, 10)).toLocaleTimeString('it-IT')}${
        Colors.reset
      }]`;
    }
  }
}
