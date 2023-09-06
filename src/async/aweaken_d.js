import { Ports } from '../lib/constants.js';

/** @param {NS} ns */
export async function main(ns) {
  
  const target = ns.args[0];
  const threads = ns.args[1];
  const weakenTime = ns.args[2];
  const weakenSleep = ns.args[3];
  const order = ns.args[4];
  const cycle = ns.args[5];

  const handle = ns.getPortHandle(Ports.hack_debug);
  
  const start = Date.now();
  await ns.sleep(weakenSleep);
  await ns.weaken(target);
  const finish = Date.now();
  handle.write(`${order} ${cycle} ${finish - start}`);
}
