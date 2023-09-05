/** @param {NS} ns */
export async function main(ns) {
  const servRooted = new Set();
  let tools = [];
  const maxScanDepth = 15;
  const serversWithFiles = [];
  // 1 scan network and hack servers
  // 2 run optimized hack script
  // 3 repeat

  // first run early.js on n00dles with 6666 threads until we have enough money to spend on tools in darkweb
  // next hack all available servers and spread hacking stuff there

  function copyAndRun(script, serv, ...args) {
    ns.scp(script, serv);
    ns.scriptKill(script, serv);
    const threads = ns.formatNumber(Math.floor(ns.getServerMaxRam(serv) / ns.getScriptRam(script)), 0);
    ns.exec(script, serv, threads, ...args);
  }

  function checkTools() {
    const toolList = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'SQLInject.exe', 'HTTPWorm.exe'];
    tools = [];
    for (let i = 0; i < toolList.length; i++) {
      if (ns.fileExists(toolList[i])) {
        tools.push(toolList[i]);
        ns.print('Tool added:' + toolList[i]);
      }
    }
  }

  function scanRec(server, depth, visited) {
    const neighbours = ns.scan(server);
    for (let i = 0; i < neighbours.length; i++) {
      const target = neighbours[i];
      if (!visited.has(target)) {
        if (!ns.hasRootAccess(target)) {
          ns.print(ns.hasRootAccess(target));
          if (
            ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel() &&
            ns.getServerNumPortsRequired(target) <= tools.length
          ) {
            ns.print('hacking ' + target + '...');
            ns.print('required ports: ' + ns.getServerNumPortsRequired(target));
            ns.print('tools available: ' + tools.length);
            for (let t = 0; t < ns.getServerNumPortsRequired(target); t++) {
              if (t == 0) {
                ns.brutessh(target);
              } else if (t == 1) {
                ns.ftpcrack(target);
              } else if (t == 2) {
                ns.relaysmtp(target);
              } else if (t == 3) {
                ns.httpworm(target);
              } else if (t == 4) {
                ns.sqlinject(target);
              }
            }
            ns.nuke(target);
            servRooted.add(target);
          }
        } else {
          if (!servRooted.has(target)) {
            servRooted.add(target);
          }
        }

        // check for files
        const files = ns.ls(target).filter((f) => f.endsWith('.cct'));

        if (files.length != 0) {
          serversWithFiles.push(target);
        }

        // add node to visited and go rec
        visited.add(target);
        if (depth < maxScanDepth) {
          scanRec(target, depth + 1, visited);
        }
      }
    }
  }

  // -------------
  // PROGRAM START
  // -------------
  ns.tail();
  ns.print('INFO' + ' starting toolCheck');
  checkTools();
  ns.print('INFO' + ' starting scanRec');
  const visited = new Set();
  scanRec('home', 0, visited);
  ns.print('rooted servers: ' + new Array(...servRooted).join(' '));
  //ns.print("servers with contracts: " + new Array(...serversWithFiles).join(' '));
  const rootedServerArray = new Array(...servRooted);
  for (let i = 0; i < serversWithFiles.length; i++) {
    const target = serversWithFiles[i];
    ns.exec('contract-solver.js', 'home', 1, target);
    await ns.sleep(100);
  }
}
