import { Colors } from './lib/output.js';
import { deepHackNetwork } from './lib/hacking.js';

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');
  ns.tail();
  // all hacked servers
  const all_open = deepHackNetwork(ns, 'home', 20);

  const player = ns.getPlayer();
  const servMinDiff = new Map();
  for (let i = 0; i < all_open.length; i++) {
    const target = all_open[i];
    const serv = ns.getServer(target);
    serv.hackDifficulty = serv.minDifficulty;
    const hackChance = ns.formatNumber(ns.formulas.hacking.hackChance(serv, player), 3);
    servMinDiff.set(target, serv);
  }
  const prepared = all_open
    .map((val) => [
      servMinDiff.get(val),
      ns.formatNumber(ns.formulas.hacking.hackChance(servMinDiff.get(val), player), 3),
    ])
    .sort((a, b) => b[0].moneyMax - a[0].moneyMax);
  for (const entry of prepared) {
    const maxTime = Math.max(
      ns.formulas.hacking.growTime(servMinDiff.get(entry[0].hostname), player),
      ns.formulas.hacking.hackTime(servMinDiff.get(entry[0].hostname), player),
      ns.formulas.hacking.weakenTime(servMinDiff.get(entry[0].hostname), player),
    );
    ns.printf(
      `[${ns.formatNumber(entry[0].moneyMax, 2)}] ${Colors.green}[${entry[0].hostname}]${Colors.reset} miDiff: ${
        entry[0].minDifficulty
      } With chance: ${Colors.yellow}${entry[1]}${Colors.reset} and est. time: ${Colors.yellow}${Math.floor(
        (maxTime + 300 * 4) / 1000,
      )}${Colors.reset}s.`,
    );
  }
}
