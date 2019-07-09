import { all, put, takeEvery, select, call } from 'redux-saga/effects';
import {eventChannel} from 'redux-saga';
import _get from 'lodash/get';
import _pick from 'lodash/pick';
import _toLower from 'lodash/toLower';
import * as ethers from 'ethers';
import {STORE_ACTIONS, SAGA_ACTION_KEYS} from './store';
import {tryEnableWeb3} from '../lib/share';
import {getContractInstance, getAddr} from '../contracts';
import {swapErc20, upxTotalBalance} from '../lib/core';
import {BNB_DEX_API, UPXB} from '../lib/constants';

function heartbeat(ms, delayMs = 10000) { // delay 10s
  let trigger;
  const channel = eventChannel(emitter => {
    trigger = emitter;
    setTimeout(() => {
      emitter({type: 'HEART_BEAT'});
    }, delayMs);

    const iv = setInterval(() => {
      emitter({
        type: 'HEART_BEAT'
      });
    }, ms);
    return () => {
      clearInterval(iv);
    };
  });
  const trig = () => {
    if (typeof trigger === 'function') {
      trigger({type: 'HEART_BEAT'});
    }
  };
  return {
    channel,
    trig
  };
}

function wrp(saga) {
  return function * inner(...args) {
    try {
      yield call(saga, ...args);
    } catch (e) {
      console.log('saga exception raised.');
      console.log(e);
    }
  };
}

// update wallet address and activties
let errorCount = 0;
let providerBackup;
function * updateAccount(action) {
  const currentProvider = _get(window, ['ethereum'], _get(window, ['web3', 'currentProvider']));
  if (providerBackup && currentProvider && currentProvider !== providerBackup) {
    return window.location.reload();
  }
  if (!providerBackup) {
    providerBackup = currentProvider;
  }
  let {provider, account: lastAccount} = yield select(state => _pick(state, ['provider', 'account']));

  if (!provider && currentProvider) {
    provider = new ethers.providers.Web3Provider(currentProvider);
    // setWalletFlag(currentProvider);
    yield put(STORE_ACTIONS.setProvider(provider));
    const {chainId: network} = yield call(provider.getNetwork.bind(provider));
    yield put(STORE_ACTIONS.setNetwork(network));
    // const Watcher = yield call(eventWatcher, provider);
    // yield put(STORE_ACTIONS.setEventWatcher(Watcher));
  }

  if (provider) {
    try {
      yield call(tryEnableWeb3);
      const accounts = yield call(provider.listAccounts.bind(provider));
      if (accounts && accounts.length > 0) {
        const newAccount = _toLower(accounts[0]);

        // account switched
        if (newAccount && lastAccount && newAccount !== lastAccount) {
          return window.location.reload();
        }

        // new Account
        if (!lastAccount) {
          yield put(STORE_ACTIONS.setAccount(newAccount));
          yield call(fetchBalance);
        }

        errorCount = 0;
      }
    } catch (e) {
      console.log(e);
      if (errorCount === 0) {
        yield put(STORE_ACTIONS.setNotice({
          id: new Date().getTime(),
          msg: 'saga.error.walletNotReady',
          variant: 'error'
        }));
      }
      ++errorCount;
    }
  }
}

async function getBnbDexBalance(network, bnbAddr) {
  const balan = {upx: '--', bnb: '--'};
  if (!bnbAddr) {
    return balan;
  }
  const api = _get(BNB_DEX_API, network);
  const upxSymbol = _get(UPXB, [network, 'SYMBOL']);
  const balance = await window.fetch(`${api}/api/v1/account/${bnbAddr}`)
    .then(res => res.json())
    .then(acc => {
      return acc.balances.reduce((ret, b) => {
        if (b.symbol === upxSymbol) {
          ret.upx = b.free;
        }
        if (b.symbol === 'BNB') {
          ret.bnb = b.free;
        }
        return ret;
      }, balan);
    })
    .catch(e => {});
  return balance || balan;
}

let upxContract;
function * fetchBalance() {
  let {provider, account, network, bnbAddr} = yield select(state => _pick(state, ['provider', 'account', 'network', 'bnbAddr']));
  if (!provider || !account) {
    return;
  }
  if (!upxContract) {
    upxContract = getContractInstance(provider, 'UPX', network);
  }
  const [ethBalance, upxBalance, bnbBalances, totalUpx] = yield Promise.all([
    provider.getBalance(account).then(eth => parseFloat(ethers.utils.formatEther(eth))),
    upxContract.balanceOf(account).then(upx => parseFloat(ethers.utils.formatEther(upx))),
    getBnbDexBalance(network, bnbAddr),
    upxTotalBalance(provider, network)
  ]);
  yield all([
    put(STORE_ACTIONS.setEthBalance(ethBalance)),
    put(STORE_ACTIONS.setUpxBalance(upxBalance)),
    put(STORE_ACTIONS.setUpxbBalance(bnbBalances.upx)),
    put(STORE_ACTIONS.setBnbBalance(bnbBalances.bnb)),
    put(STORE_ACTIONS.setTotalUpx(totalUpx))
  ]);
}

function * swapErc20Saga(action) {
  const {bnbAddress, upxAmount} = action.payload;
  const {provider, network} = yield select(state => _pick(state, ['provider', 'network']));
  const tx = yield call(
    swapErc20,
    provider.getSigner(),
    getAddr('UPX', network),
    getAddr('Relay', network),
    upxAmount,
    bnbAddress
  );
  yield put(STORE_ACTIONS.setPendingTx(tx.hash));
  const reciept = yield call(tx.wait);
  console.log(reciept);
  yield put(STORE_ACTIONS.setTxReceipt(reciept.transactionHash, reciept.status === 1, new Date().getTime() + 10000));
  yield put(STORE_ACTIONS.setPendingTx(null));
}

function * rootSaga() {
  if (typeof window === 'undefined') {
    return;
  }

  const walletDetector = heartbeat(1000); // 1s
  const balanceWatcher = heartbeat(10000); // 10s

  yield all([
    takeEvery(walletDetector.channel, wrp(updateAccount)),
    takeEvery(balanceWatcher.channel, wrp(fetchBalance)),
    takeEvery(SAGA_ACTION_KEYS.SWAP_ERC20, wrp(swapErc20Saga))
  ]);
}

export default rootSaga;
