/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const sleepMS = ns.args[1];
  const pid = ns.args[2];

  //ns.disableLog("ALL");

  if (target == undefined) {
    ns.print('ERROR Empty first argument! Please provide a server to grow.');
    return;
  }

  if (sleepMS == undefined) {
    ns.print('ERROR Empty second argument! Please provide a sleep ms.');
    return;
  }

  ns.printf('agrow start: %s', Date.now());
  await ns.sleep(sleepMS);
  ns.printf('agrow real start: %s; server sec is %s', Date.now(), ns.getServerSecurityLevel(target));
  await ns.grow(target);
  ns.printf('agrow end: %s; server sec is %s', Date.now(), ns.getServerSecurityLevel(target));
}
