import * as ethers from 'ethers';
import bech32 from 'bech32';
import _get from 'lodash/get';
import BN from 'bignumber.js';
// import _sum from 'lodash/sum';
import {BNB_DEX_API, UPXB, UPX, MAX_BALANCE_CONTRACT} from './constants';
import {getContractInstance} from '../contracts';

// const ethUtils = ethers.utils;
const ERC20_TRANSFER = '0xa9059cbb';

// 0xa9059cbb000000000000000000000000e95505c1518f209710670b1b5e98b317c7e346870000000000000000000000000000000000000000000000056bc75e2d63100000

export async function swapErc20(signer, upxAddr, relayAddr, amount, bnbAddress) {
  const withoutSelector = ethers.utils.defaultAbiCoder.encode(
    [{type: 'address'}, {type: 'uint256'}, {type: 'string'}],
    [relayAddr, ethers.utils.parseEther(amount), bnbAddress]
  );
  const calldata = `${ERC20_TRANSFER}${withoutSelector.substring(2)}`;
  const rawTx = {
    to: upxAddr,
    data: calldata,
    value: 0
  };
  console.log(rawTx);
  const tx = await signer.sendTransaction(rawTx);
  return tx;
}

export function validBnbAddr(address, network) {
  network = parseInt(network, 10);
  let pass = false;
  try {
    const {prefix} = bech32.decode(address);
    pass = (network === 3 && /tbnb/i.test(prefix)) || (network === 1 && /bnb/.test(prefix));
  } catch (e) {}
  return pass;
}

async function fetchBalance(addr, symbols) {
  const {prefix} = bech32.decode(addr);
  const network = prefix === 'bnb' ? 1 : 3;
  const apiB = _get(BNB_DEX_API, network);
  const balance = await window.fetch(`${apiB}/api/v1/account/${addr}`)
    .then(res => res.json())
    .then(acc => {
      return acc.balances.reduce((ret, b) => {
        if (~symbols.indexOf(b.symbol)) {
          ret[b.symbol] = b.free;
        }
        return ret;
      }, {});
    });
  return balance;
}

async function upxbLockedAmount(network) {
  const lockerAccounts = _get(UPXB, [network, 'LOCKERS']);
  const tokenSymbol = _get(UPXB, [network, 'SYMBOL']);
  const balances = await Promise.all(lockerAccounts.map(a => fetchBalance(a, [tokenSymbol])));
  return balances.reduce((ret, b) => {
    ret = ret.plus(new BN(b[tokenSymbol]));
    return ret;
  }, new BN(0));
}

async function upxLockedAmount(provider, network) {
  const lockerAccounts = _get(UPX, [network, 'LOCKERS']);
  const upxContract = getContractInstance(provider, 'UPX', network);
  const balances = await Promise.all(
    lockerAccounts.map(
      a => upxContract.balanceOf(a).then(b => ethers.utils.formatEther(b))
    )
  );
  return balances.reduce((ret, b) => {
    ret = ret.plus(new BN(b));
    return ret;
  }, new BN(0));
}

export async function upxTotalBalance(provider, network) {
  const [upxbLock, upxLock] = await Promise.all([
    upxbLockedAmount(network),
    upxLockedAmount(provider, network)
  ]);
  // console.log(`upxLock: ${upxLock}, upxbLock: ${upxbLock}`);
  return new BN(2 * MAX_BALANCE_CONTRACT).minus(upxLock).minus(upxbLock).dp(8, BN.ROUND_CEIL).toFormat(8);
}
