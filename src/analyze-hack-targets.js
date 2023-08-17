import { Colors } from '/lib/output.js';

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');
  ns.tail();
  // all hacked servers
  const all_open = [
    'n00dles',
    'foodnstuff',
    'sigma-cosmetics',
    'joesguns',
    'nectar-net',
    'hong-fang-tea',
    'harakiri-sushi',
    'neo-net',
    'zer0',
    'max-hardware',
    'iron-gym',
    'phantasy',
    'silver-helix',
    'omega-net',
    'crush-fitness',
    'johnson-ortho',
    'the-hub',
    'computek',
    'netlink',
    'rothman-uni',
    'catalyst',
  ];

  const percentage = 0.4;
  const cores = 2;
  const hMem = ns.getScriptRam('/async/ahack.js');
  const gMem = ns.getScriptRam('/async/agrow.js');
  const wMem = ns.getScriptRam('/async/aweaken.js');

  for (let i = 0; i < all_open.length; i++) {
    const target = all_open[i];

    ns.hackAnalyzeChance(target);
    const serv = ns.getServer(target);
    const player = ns.getPlayer();
    serv.hackDifficulty = serv.minDifficulty;
    const hackChance = ns.formatNumber(ns.formulas.hacking.hackChance(serv, player), 3);
    ns.printf(
      `${Colors.green}[%s]${Colors.reset} min diff: %s has hack chance: ${Colors.cyan}%s`,
      target,
      serv.hackDifficulty,
      hackChance,
    );
    if (hackChance > 0.8) {
      const needThreadsToHack = Math.floor(percentage / ns.formulas.hacking.hackPercent(serv, player));
      serv.moneyAvailable = ns.getServerMaxMoney(target) * (1.0 - percentage);
      const needThreadsToGrow = ns.formulas.hacking.growThreads(serv, player, ns.getServerMaxMoney(target), cores);
      // simulate one cycle starting from min difficulty and max money
      const inc1 = ns.hackAnalyzeSecurity(needThreadsToHack, target);
      const inc2 = ns.growthAnalyzeSecurity(needThreadsToGrow, target, cores);
      const secIncrease = inc1 * inc2;

      const weakenValue = ns.weakenAnalyze(needThreadsToGrow, cores);
      const newSec = Math.min(serv.hackDifficulty * secIncrease - weakenValue, serv.minDifficulty);

      ns.printf(
        'To steal %s need %s Threads (%s GB).',
        percentage * 100 + '%',
        needThreadsToHack,
        hMem * needThreadsToHack,
      );
      ns.printf('To grow back need %s Threads (%s GB).', needThreadsToGrow, gMem * needThreadsToGrow);
      ns.printf('After one cycle of hack->grow->weaken security: %s', newSec);
    }
  }
}
