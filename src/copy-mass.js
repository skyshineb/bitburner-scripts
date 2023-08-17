/** @param {NS} ns */
export async function main(ns) {
  // filename
  const script = 'early.js';
  ns.tail();
  // all hacked servers
  const all_open = [
    'n00dles',
    'sigma-cosmetics',
    'joesguns',
    'nectar-net',
    'hong-fang-tea',
    'harakiri-sushi',
    'foodnstuff',
    'zer0',
    'max-hardware',
    'iron-gym',
    'silver-helix',
    'phantasy',
    'neo-net',
    'omega-net',
    'avmnite-02h',
  ];

  function copyAndRun(script, serv) {
    ns.scp(script, serv);
    ns.scriptKill(script, serv);
    const threads = ns.formatNumber(Math.floor(ns.getServerMaxRam(serv) / ns.getScriptRam(script)), 0);
    ns.exec(script, serv, threads);
  }

  // copy script to all servers that are hacked manually
  for (let i = 0; i < all_open.length; ++i) {
    const serv = all_open[i];
    copyAndRun(script, serv);
  }

  // copy script to purchased servers
  for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
    let serv = 'pserv-' + i;
    copyAndRun(script, serv);
  }
}
