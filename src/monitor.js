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
      const reportString = `[${Colors.green}+${ns.formatNumber(AvgIncome, 2)}/s${Colors.reset}]\t${targetName}[${
        Colors.magneta
      }${cycle}${Colors.reset}] [block ${Colors.yellow}${BlkLen} sec${Colors.reset} / ${Math.floor(
        RamCost,
      )} GB] [lastUPD = ${Colors.cyan}${updTime}${Colors.reset}]`;
      reports.set(targetName, [AvgIncome, reportString]);
    }

    ns.clearLog();
    ns.print(`${Colors.white}\t\t Hacking...`);

    Array.of(...reports.values())
      .sort((a, b) => a[0] - b[0])
      .forEach((value) => {
        ns.print(`${value[1]}`);
      });

    await ns.sleep(3000);
  }
}

class HackReport {
  /**
   * @param {string} targetName
   * @param {string} cycle
   * @param {string} updTime
   * @param {string} blockLength
   * @param {string} ramCost
   * @param {string} avgIncome
   */
  constructor(targetName, cycle, updTime, blockLength, ramCost, avgIncome) {
    this.targetName = targetName;
    this.cycle = cycle;
    this.updTime = updTime;
    this.blockLength = blockLength;
    this.ramCost = ramCost;
    this.avgIncome = avgIncome;
  }

  toString() {
    return `[${Colors.green}+${this.avgIncome}/s${Colors.reset}]\t${this.targetName}[${Colors.magneta}${this.cycle}${
      Colors.reset
    }] [block ${Colors.yellow}${this.blockLength} sec${Colors.reset} / ${Math.floor(this.ramCost)} GB] [lastUPD = ${
      Colors.cyan
    }${this.updTime}${Colors.reset}]`;
  }
}
