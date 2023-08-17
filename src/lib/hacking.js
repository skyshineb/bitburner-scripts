/** @param {NS} ns */
export function deepHackNetwork(ns, target, maxDepth) {
  const visited = new Set();
  const rooted = new Set();
  scanHackRec(ns, target, 0, maxDepth, visited, rooted);
  return new Array(...rooted);
}

/** @param {NS} ns
 *  @param {Set} visited
 * @param {Set} rooted
 */
function scanHackRec(ns, server, depth, maxDepth, visited, rooted) {
  const neighbours = ns.scan(server).filter((s) => !visited.has(s));
  for (let i = 0; i < neighbours.length; i++) {
    const target = neighbours[i];
    if (!ns.hasRootAccess(target)) {
      const tools = getToolsAvailable(ns);
      if (
        ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel() &&
        ns.getServerNumPortsRequired(target) <= tools.length
      ) {
        ns.print(
          'hacking ' +
            target +
            '...' +
            ' required ports: ' +
            ns.getServerNumPortsRequired(target) +
            ' tools available: ' +
            tools.length,
        );
        for (const tool of tools) {
          switch (tool) {
            case 'BruteSSH.exe':
              ns.brutessh(target);
              break;
            case 'FTPCrack.exe':
              ns.ftpcrack(target);
              break;
            case 'HTTPWorm.exe':
              ns.httpworm(target);
              break;
            case 'relaySMTP.exe':
              ns.relaysmtp(target);
              break;
            case 'SQLInject.exe':
              ns.sqlinject(target);
              break;
          }
        }
        ns.nuke(target);
        rooted.add(target);
      }
    } else {
      rooted.add(target);
    }

    // add node to visited and go rec
    visited.add(target);
    if (depth < maxDepth) {
      scanHackRec(ns, target, depth + 1, maxDepth, visited, rooted);
    }
  }
}

const toolList = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'SQLInject.exe', 'HTTPWorm.exe'];

/** @param {NS} ns */
function getToolsAvailable(ns) {
  return toolList.filter((t) => ns.fileExists(t));
}
