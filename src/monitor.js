import { Colors } from './lib/output.js';
import { Ports } from './lib/constants.js';

/** @param {NS} ns */
export async function main(ns) {
  ns.tail();
  ns.disableLog('ALL');

  const handleHWGW = ns.getPortHandle(Ports.hack_hwgw);
  const handleSeq = ns.getPortHandle(Ports.hack_seq);
  const reportsHWGW = new Map();
  const reportsSeq = new Map();
  while (true) {
    // read hwgw scripts
    while (!handleHWGW.empty()) {
      const vals = handleHWGW.read().split(' ');
      // report format
      // targetName cycle updTime BlkLen RamCost AvgIncome
      const targetName = vals[0];
      const cycle = vals[1];
      const updTime = vals[2];
      const BlkLen = vals[3];
      const RamCost = vals[4];
      const avgIncome = vals[5];
      const report = new HackReport(ns, targetName, cycle, updTime, BlkLen, RamCost, avgIncome);

      reportsHWGW.set(targetName, [avgIncome, report]);
    }
    // read good old sequential scripts
    while (!handleSeq.empty()) {
      const vals = handleSeq.read().split(' ');
      // report format
      // target ${Date.now()} weaken income
      const targetName = vals[0];
      const updTime = vals[1];
      const opType = vals[2];
      const hostname = vals[3];
      const avgIncome = vals[4];
      const report = new OldReport(ns, targetName, updTime, opType, hostname, avgIncome);

      reportsSeq.set(targetName, [avgIncome, report]);
    }

    ns.clearLog();
    ns.print(`${Colors.white}\t\t Hacking...`);

    Array.of(...reportsHWGW.values())
      .sort((a, b) => b[0] - a[0])
      .forEach((value) => {
        ns.print(`${value[1]}`);
      });

    if (reportsSeq.size > 0) {
      ns.print(`${Colors.white}\t -------------------------`);
      Array.of(...reportsSeq.values())
        .sort((a, b) => b[0] - a[0])
        .forEach((value) => {
          ns.print(`${value[1]}`);
        });
    }

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
    if (Date.now() - parseInt(this.updTime, 10) > 1000 * 60 * 5) {
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

class OldReport {
  /**
   * @param {NS} ns
   * @param {string} targetName
   * @param {string} updTime
   * @param {string} opType
   * @param {string} hostname
   * @param {string} avgIncome
   */
  constructor(ns, targetName, updTime, opType, hostname, avgIncome) {
    this.ns = ns;
    this.targetName = targetName;
    this.updTime = updTime;
    this.opType = opType;
    this.hostname = hostname;
    this.avgIncome = avgIncome;
  }

  toString() {
    let opColor;
    if (this.opType === 'hack') opColor = Colors.magneta;
    else if (this.opType === 'weaken') opColor = Colors.orange;
    else opColor = Colors.yellow_bright;
    return `[${Colors.green}+${this.ns.formatNumber(this.avgIncome, 2)}/s${Colors.reset}]\t${
      this.targetName
    }[${opColor}${this.opType}${Colors.reset}] [host: ${this.hostname}] [lastUPD = ${Colors.cyan}${new Date(
      parseInt(this.updTime, 10),
    ).toLocaleTimeString('it-IT')}${Colors.reset}]`;
  }
}
