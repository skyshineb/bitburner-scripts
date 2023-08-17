/** @param {NS} ns */
export async function main(ns) {
  const ram = 16384;

  ns.tail();

  if (ram == undefined) {
    ns.print('ERROR Empty 0 argument! Please provide a RAM value.');
    return;
  }

  // Iterator we'll use for our loop
  let i = 0;

  ns.disableLog('ALL');
  ns.enableLog('exec');
  ns.enableLog('purchaseServer');
  ns.tail();

  function copyAndRun(script, serv, ...args) {
    ns.scp(script, serv);
    ns.scriptKill(script, serv);
    const threads = ns.formatNumber(Math.floor(ns.getServerMaxRam(serv) / ns.getScriptRam(script)), 0);
    ns.exec(script, serv, threads, ...args);
  }

  const servList = ns.getPurchasedServers();
  /**   if (servList.length != 0) {
      for(let i = 0; i < servList.length; i++) {
        let serv = servList[i];
        if (ns.getServerMaxRam(serv) < ram) {
            ns.killall(serv);
            ns.deleteServer(serv);
        } 
      }
    }*/

  // Continuously try to purchase servers until we've reached the maximum
  // amount of servers
  while (i < ns.getPurchasedServerLimit()) {
    // Check if we have enough money to purchase a server
    if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram)) {
      // If we have enough money, then:
      //  1. Purchase the server
      //  2. Copy our hacking script onto the newly-purchased server
      //  3. Run our hacking script on the newly-purchased server with 3 threads
      //  4. Increment our iterator to indicate that we've bought a new server
      let hostname = ns.purchaseServer('pserv-' + i, ram);
      //copyAndRun("early.js", hostname, "silver-helix");
      ++i;
    }
    //Make the script wait for a second before looping again.
    //Removing this line will cause an infinite loop and crash the game.
    await ns.sleep(1000);
  }
}
