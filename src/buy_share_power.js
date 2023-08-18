/** @param {NS} ns */
export async function main(ns) {
  ns.tail();
  ns.disableLog('ALL');
  ns.clearLog();

  const maxServerRam = 1048576;
  const servName = 'pserv-share';
  ns.purchaseServer(servName, maxServerRam);
  ns.scp(['share.js'], servName);
  const shareThreads = maxServerRam / ns.getScriptRam('share.js', 'home');
  ns.exec('share.js', servName, { threads: shareThreads });
  ns.print('Share power: ' + ns.getSharePower());
}
