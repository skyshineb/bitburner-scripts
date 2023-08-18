import { Colors } from './lib/output.js';

/** @param {NS} ns */
export async function main(ns) {
  const daysBeforeReset = ns.args[0];

  ns.tail();
  ns.disableLog('ALL');
  if (daysBeforeReset == undefined) {
    ns.print('ERROR Empty 0 argument! Please provide amount of days before reset the game.');
    return;
  }
  const msBeforeReset = daysBeforeReset * 24 * 60 * 60 * 1000;
  const deadlineTime = Date.now() + msBeforeReset;
  const constants = ns.formulas.hacknetNodes.constants();
  const maxNodes = ns.hacknet.maxNumNodes();
  const mults = ns.getPlayer().mults;
  while (true) {
    let upgradePurchased = false;
    let ownedNodes = ns.hacknet.numNodes();
    if (ownedNodes < maxNodes) {
      const cost = ns.hacknet.getPurchaseNodeCost() * mults.hacknet_node_purchase_cost;
      if (cost < ns.getServerMoneyAvailable('home') * 0.01) {
        ns.print(`Purchasing next HackNet Node for ${ns.hacknet.getPurchaseNodeCost()}`);
        ns.hacknet.purchaseNode();
        ownedNodes++;
        upgradePurchased = true;
      }
    }
    let moneyAvailable = ns.getServerMoneyAvailable('home') * 0.05;
    const timeLeft = deadlineTime - Date.now();
    for (let i = 0; i < ownedNodes; i++) {
      let nodeStats = ns.hacknet.getNodeStats(i);

      // cores
      if (nodeStats.cores < constants.MaxCores) {
        const newProduction = ns.formulas.hacknetNodes.moneyGainRate(
          nodeStats.level,
          nodeStats.ram,
          nodeStats.cores + 1,
          mults.hacknet_node_money,
        );
        const gain = newProduction - nodeStats.production;
        const cost = ns.hacknet.getCoreUpgradeCost(i) * mults.hacknet_node_core_cost;
        if (cost < moneyAvailable && gain * (timeLeft / 1000) > cost * 2) {
          ns.print(
            `[${Colors.red}Node #${i}${Colors.reset}]Upgraded cores ${nodeStats.cores} -> ${
              nodeStats.cores + 1
            } for ${cost}`,
          );
          ns.hacknet.upgradeCore(i);
          moneyAvailable -= cost;
          nodeStats = ns.hacknet.getNodeStats(i);
          upgradePurchased = true;
        }
      }

      // ram
      if (nodeStats.ram < constants.MaxRam) {
        const newProduction = ns.formulas.hacknetNodes.moneyGainRate(
          nodeStats.level,
          nodeStats.ram + 1,
          nodeStats.cores,
          mults.hacknet_node_money,
        );
        const gain = newProduction - nodeStats.production;
        const cost = ns.hacknet.getRamUpgradeCost(i) * mults.hacknet_node_ram_cost;
        if (cost < moneyAvailable && gain * (timeLeft / 1000) > cost * 2) {
          ns.print(
            `[${Colors.red}Node #${i}${Colors.reset}]Upgraded ram ${nodeStats.ram} -> ${nodeStats.ram + 1} for ${cost}`,
          );
          ns.hacknet.upgradeRam(i);
          moneyAvailable -= cost;
          nodeStats = ns.hacknet.getNodeStats(i);
          upgradePurchased = true;
        }
      }

      // level
      if (nodeStats.level < constants.MaxLevel) {
        const newProduction = ns.formulas.hacknetNodes.moneyGainRate(
          nodeStats.level + 1,
          nodeStats.ram,
          nodeStats.cores,
          mults.hacknet_node_money,
        );
        const gain = newProduction - nodeStats.production;
        const cost = ns.hacknet.getLevelUpgradeCost(i) * mults.hacknet_node_level_cost;
        if (cost < moneyAvailable && gain * (timeLeft / 1000) > cost * 2) {
          ns.print(
            `[${Colors.red}Node #${i}${Colors.reset}]Upgraded level ${nodeStats.level} -> ${
              nodeStats.level + 1
            } for ${cost}`,
          );
          ns.hacknet.upgradeLevel(i);
          moneyAvailable -= cost;
          nodeStats = ns.hacknet.getNodeStats(i);
          upgradePurchased = true;
        }
      }
    }
    if (upgradePurchased) {
      await ns.sleep(100);
    } else {
      await ns.sleep(5000);
    }
  }
}
