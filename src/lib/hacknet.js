const serverPrefix = "pserv-";

/** @param {NS} ns */
export function getHacknetServers(ns) {
  const visited = new Set();
  const rooted = new Set();
  scanHackRec(ns, target, 0, maxDepth, visited, rooted);
  return rooted;

}