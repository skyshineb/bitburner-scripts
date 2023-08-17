import { Colors } from './lib/output.js';

/** @param {NS} ns */
export async function main(ns) {
  const bitnode = ns.args[0];
  const lvl = ns.args[1];
  ns.tail();
  const multipliers = ns.getBitNodeMultipliers(bitnode, lvl);

  ns.print(`---STATS---`);
  printMultiplier(ns, `AgilityLevelMultiplier`, multipliers.AgilityLevelMultiplier);
  printMultiplier(ns, `DexterityLevelMultiplier`, multipliers.DexterityLevelMultiplier);
  printMultiplier(ns, `StrengthLevelMultiplier`, multipliers.StrengthLevelMultiplier);
  printMultiplier(ns, `CharismaLevelMultiplier`, multipliers.CharismaLevelMultiplier);
  ns.print(`---AUGS---`);
  printMultiplier(ns, `AugmentationMoneyCost`, multipliers.AugmentationMoneyCost);
  printMultiplier(ns, `AugmentationRepCost`, multipliers.AugmentationRepCost);
  ns.print(`---Reputation---`);
  printMultiplier(ns, `FactionPassiveRepGain`, multipliers.FactionPassiveRepGain);
  printMultiplier(ns, `FactionWorkRepGain`, multipliers.FactionWorkRepGain);
  ns.print(`---Hacking---`);
  printMultiplier(ns, `HackExpGain`, multipliers.HackExpGain);
  printMultiplier(ns, `HackingLevelMultiplier`, multipliers.HackingLevelMultiplier);
  printMultiplier(ns, `ScriptHackMoney`, multipliers.ScriptHackMoney);
  printMultiplier(ns, `ManualHackMoney`, multipliers.ManualHackMoney);
  printMultiplier(ns, `ScriptHackMoneyGain`, multipliers.ScriptHackMoneyGain);
  printMultiplier(ns, `ServerGrowthRate`, multipliers.ServerGrowthRate);
  printMultiplier(ns, `ServerWeakenRate`, multipliers.ServerWeakenRate);
  printMultiplier(ns, `ServerMaxMoney`, multipliers.ServerMaxMoney);
  printMultiplier(ns, `ServerStartingMoney`, multipliers.ServerStartingMoney);
  printMultiplier(ns, `ServerStartingSecurity`, multipliers.ServerStartingSecurity);
  ns.print(`---Hardware---`);
  printMultiplier(ns, `HomeComputerRamCost`, multipliers.HomeComputerRamCost);
  printMultiplier(ns, `HomeComputerRamCost`, multipliers.PurchasedServerCost);
  printMultiplier(ns, `PurchasedServerLimit`, multipliers.PurchasedServerLimit);
  printMultiplier(ns, `PurchasedServerMaxRam`, multipliers.PurchasedServerMaxRam);
  printMultiplier(ns, `PurchasedServerSoftcap`, multipliers.PurchasedServerSoftcap);
  ns.print(`---Other---`);
  printMultiplier(ns, `InfiltrationMoney`, multipliers.InfiltrationMoney);
  printMultiplier(ns, `InfiltrationRep`, multipliers.InfiltrationRep);

  printMultiplier(ns, `CompanyWorkMoney`, multipliers.CompanyWorkMoney);
  printMultiplier(ns, `CompanyWorkExpGain`, multipliers.CompanyWorkExpGain);

  printMultiplier(ns, `WorldDaemonDifficulty`, multipliers.WorldDaemonDifficulty);
}

/** @param {NS} ns */
function printMultiplier(ns, name, value) {
  const color = value == 1 ? Colors.reset : Colors.yellow;
  ns.print(`${color}${name}: ${value}`);
}
