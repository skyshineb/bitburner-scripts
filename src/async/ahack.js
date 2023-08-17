/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const hackThreads = ns.args[1];
  const sleepMS = ns.args[2];
  const pid = ns.args[3];

  //ns.disableLog("ALL");

  if (target == undefined) {
    ns.print('ERROR Empty first argument! Please provide a server to hack.');
    return;
  }

  if (hackThreads == undefined) {
    ns.print('ERROR Empty second argument! Please provide a thread count.');
    return;
  }

  if (sleepMS == undefined) {
    ns.print('ERROR Empty third argument! Please provide a sleep ms.');
    return;
  }

  ns.printf('ahack start: %s', Date.now());
  await ns.sleep(sleepMS);
  ns.printf('ahack real start: %s; server sec is %s', Date.now(), ns.getServerSecurityLevel(target));
  await ns.hack(target, { threads: hackThreads });
  ns.printf('ahack end: %s; server sec is %s', Date.now(), ns.getServerSecurityLevel(target));
}
