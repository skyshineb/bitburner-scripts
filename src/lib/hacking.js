/** @param {NS} ns */
export function deepHackNetwork(ns, target, maxDepth) {
  const visited = new Set();
  const rooted = new Set();
  scanRec(ns, target, 0, maxDepth, rooted, visited, getToolsAvailable(ns));
  return new Array(...rooted);
}

/** @param {NS} ns
 * @param {string} server
 * @param {number} depth
 * @param {number} maxDepth
 * @param {Set} rooted
 * @param {Set} visited
 * @param {Array} tools
 */
export function scanRec(ns, server, depth, maxDepth, rooted, visited, tools) {
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
      scanRec(ns, target, depth + 1, maxDepth, rooted, visited, tools);
    }
  }
}

const toolList = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'SQLInject.exe', 'HTTPWorm.exe'];

/** @param {NS} ns */
export function getToolsAvailable(ns) {
  return toolList.filter((t) => ns.fileExists(t));
}
