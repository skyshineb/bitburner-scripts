import { deepHackNetwork } from './lib/hacking.js';
import { getHackPriorityList, getAverageMoneyPerSec } from './lib/analyze.js';

/** @param {NS} ns */
export async function main(ns) {
  // const t = ns.formatNumber(Math.floor(ns.getServerMaxRam("home") / ns.getScriptRam("early.js")), 0);
  //ns.print(t);
  ns.tail();
  ns.disableLog('ALL');
  ns.clearLog();
  const servRooted = deepHackNetwork(ns, 'home', 10);
  const res = getHackPriorityList(ns, servRooted, 0.75);
  for (let i = 0; i < res.length; i++) {
    ns.printf('%s :\t %s', res[i][0], res[i][1]);
  }

  const servName = 'pserv-2';
  //ns.print('Server upgrade cost: ' + ns.formatNumber(ns.getPurchasedServerUpgradeCost(servName, 1048576), 2));
  ns.purchaseServer(servName, 1048576);
  //ns.upgradePurchasedServer(servName, 1048576);
  ns.scp(
    [
      'early.js',
      'smart-optimize.js',
      'lib/output.js',
      'async/ahack.js',
      'async/agrow.js',
      'async/aweaken.js',
      'share.js',
      'optimize.js',
    ],
    servName,
    'home',
  );

  //  ns.print(new Array(...res).join(' \n'));
  //  ns.print(getAverageMoneyPerSec(ns, 'phantasy', 0.4));

  //  ns.print(ns.scan('run4theh111z'));
  //  ns.print(ns.scan(ns.scan('run4theh111z')[0]));
  //  ns.print(ns.scan(ns.scan(ns.scan('run4theh111z')[0])[0]));
  //  ns.print(ns.scan(ns.scan(ns.scan(ns.scan('w0r1d_d43m0n')[0])[0])[0]));
  //  ns.print(ns.scan(ns.scan(ns.scan(ns.scan(ns.scan('w0r1d_d43m0n')[0])[0])[0])[0]));
  //  ns.print(ns.scan(ns.scan(ns.scan(ns.scan(ns.scan(ns.scan('w0r1d_d43m0n')[0])[0])[0])[0])[0]));
}
