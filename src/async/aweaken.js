/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const sleepMS = ns.args[1];
  const pid = ns.args[2];

  //ns.disableLog("ALL");

  if (target == undefined) {
    ns.print('ERROR Empty first argument! Please provide a server to weaken.');
    return;
  }

  if (sleepMS == undefined) {
    ns.print('ERROR Empty second argument! Please provide a sleep ms.');
    return;
  }
  ns.printf('aweaken start: %s', Date.now());
  await ns.sleep(sleepMS);
  ns.printf('aweaken real start: %s; server sec is %s', Date.now(), ns.getServerSecurityLevel(target));
  await ns.weaken(target);
  ns.printf('aweaken end: %s', Date.now());
}
