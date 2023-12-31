export class HWGWTimings {
  constructor(hackThreads, weakenThreads1, growThreads, weakenThreads2, hTime, wTime1, gTime, wTime2) {
    this.hackThreads = hackThreads;
    this.weakenThreads1 = weakenThreads1;
    this.growThreads = growThreads;
    this.weakenThreads2 = weakenThreads2;
    this.hTime = hTime;
    this.wTime1 = wTime1;
    this.gTime = gTime;
    this.wTime2 = wTime2;
  }

  setDelays(hSleep, wSleep1, gSleep, wSleep2, maxTime) {
    this.hSleep = hSleep;
    this.wSleep1 = wSleep1;
    this.gSleep = gSleep;
    this.wSleep2 = wSleep2;
    this.maxTime = maxTime;
  }
}
