import { Ports } from '../lib/constants.js';

/** @param {NS} ns */
export async function main(ns) {
  
  // target, tnt.hackThreads, tnt.hTime, tnt.hSleep, cycles
  const target = ns.args[0];
  const threads = ns.args[1];
  const hackTime = ns.args[2];
  const hackSleep = ns.args[3];
  const cycle = ns.args[4];
  
  const handle = ns.getPortHandle(Ports.hack_debug);
  
  const start = Date.now();
  await ns.sleep(hackSleep);
  await ns.hack(target, { threads: threads });
  const finish = Date.now();
  handle.write(`hack ${cycle} ${finish - start}`);
}
