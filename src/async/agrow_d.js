/** @param {NS} ns */
export async function main(ns) {
  
  const target = ns.args[0];
  const threads = ns.args[1];
  const growTime = ns.args[2];
  const growSleep = ns.args[3];
  const cycle = ns.args[4];
  
  await ns.sleep(growSleep);
  await ns.grow(target);
}
