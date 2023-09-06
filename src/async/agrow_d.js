import { Ports } from '../lib/constants.js';

/** @param {NS} ns */
export async function main(ns) {
  
  const target = ns.args[0];
  const threads = ns.args[1];
  const growTime = ns.args[2];
  const growSleep = ns.args[3];
  const cycle = ns.args[4];
  
  const handle = ns.getPortHandle(Ports.hack_debug);

  const start = Date.now();
  await ns.sleep(growSleep);
  await ns.grow(target);
  const finish = Date.now();
  handle.write(`grow ${cycle} ${finish - start}`);
}
