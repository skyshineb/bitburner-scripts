/** @param {NS} ns */
export async function main(ns) {
  let i = 0;
  while (i < ns.getPurchasedServerLimit()) {
    ns.killall('pserv-' + i);
    ns.deleteServer('pserv-' + i);
    i++;
  }
}
