/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  if (target == undefined) {
    ns.print('ERROR Empty 0 argument! Please provide a target server to solve contracts.');
    return;
  }
  ns.clearLog();
  ns.tail();
  ns.printf('Target server is %s', target);

  const files = ns.ls(target);
  const contracts = files.filter((f) => f.endsWith('.cct'));
  for (let i = 0; i < contracts.length; i++) {
    const contractType = ns.codingcontract.getContractType(contracts[i], target);
    const data = ns.codingcontract.getData(contracts[i], target);
    let solution = 0;
    let att = '';
    switch (contractType) {
      case 'Find Largest Prime Factor':
        ns.printf('Found contract %s. Solving...', contractType);
        break;
      case 'Subarray with Maximum Sum':
        ns.printf(
          'Found contract: %s. Attempts: %s Solving...',
          contractType,
          ns.codingcontract.getNumTriesRemaining(contracts[i], target),
        );
        solution = maximumSubArray(data);
        att = ns.codingcontract.attempt(solution, contracts[i], target);
        ns.printf('Solution is: %s. Result: %s', solution, att);
        break;
      case 'Array Jumping Game':
        ns.printf(
          'Found contract: %s. Attempts: %s Solving...',
          contractType,
          ns.codingcontract.getNumTriesRemaining(contracts[i], target),
        );
        solution = arrayJumpingGame(data);
        att = ns.codingcontract.attempt(solution + '', contracts[i], target);
        ns.printf('Solution is: %s. Result: %s', solution, att);
        break;
      default:
        ns.printf("Sorry, there's no code solution for contract type: %s", contractType);
        break;
    }
  }
  //ns.print(ns.codingcontract.getContractTypes());
}

function maximumSubArray(nums) {
  let maxSub = nums[0];
  let curSum = 0;

  for (let i = 0; i < nums.length; i++) {
    if (curSum < 0) {
      curSum = 0;
    }
    curSum += nums[i];
    maxSub = Math.max(maxSub, curSum);
  }
  return maxSub;
}

/** @param {Array} nums */
function arrayJumpingGame(nums) {
  if (nums.length <= 1) return 1;
  let maximum = nums[0];

  for (let i = 0; i < nums.length; i++) {
    if (maximum <= i && nums[i] == 0) return 0;

    if (i + nums[i] > maximum) {
      maximum = i + nums[i];
    }
    if (maximum >= nums.length - 1) return 1;
  }
  return 0;
}
