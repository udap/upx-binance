import { createStore, applyMiddleware } from 'redux';
import {createActions, handleActions} from 'redux-actions';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './saga';

const STORE_ACTION_KEYS = {
  SET_ACCOUNT: 'SET_ACCOUNT',
  SET_UPX_BALANCE: 'SET_UPX_BALANCE',
  SET_UPXB_BALANCE: 'SET_UPXB_BALANCE',
  SET_BNB_BALANCE: 'SET_BNB_BALANCE',
  SET_ETH_BALANCE: 'SET_ETH_BALANCE',
  SET_PROVIDER: 'SET_PROVIDER',
  SET_NETWORK: 'SET_NETWORK',
  SET_NOTICE: 'SET_NOTICE',
  SET_PENDING_TX: 'SET_PENDING_TX',
  SET_BNB_ADDR: 'SET_BNB_ADDR',
  SET_TX_RECEIPT: 'SET_TX_RECEIPT',
  SET_TOTAL_UPX: 'SET_TOTAL_UPX'
};

export const SAGA_ACTION_KEYS = {
  SWAP_ERC20: 'SWAP_ERC20'
};

export const STORE_ACTIONS = createActions({
  [STORE_ACTION_KEYS.SET_ACCOUNT]: (account) => ({account}),
  [STORE_ACTION_KEYS.SET_UPX_BALANCE]: (upx) => ({upx}),
  [STORE_ACTION_KEYS.SET_ETH_BALANCE]: (eth) => ({eth}),
  [STORE_ACTION_KEYS.SET_UPXB_BALANCE]: (upxb) => ({upxb}),
  [STORE_ACTION_KEYS.SET_BNB_BALANCE]: (bnb) => ({bnb}),
  [STORE_ACTION_KEYS.SET_PROVIDER]: (provider) => ({provider}),
  [STORE_ACTION_KEYS.SET_NETWORK]: (network) => ({network}),
  [STORE_ACTION_KEYS.SET_NOTICE]: (notice) => ({notice}),
  [STORE_ACTION_KEYS.SET_PENDING_TX]: (pendingTx) => ({pendingTx}),
  [STORE_ACTION_KEYS.SET_BNB_ADDR]: (addr) => ({addr}),
  [STORE_ACTION_KEYS.SET_TX_RECEIPT]: (txHash, success, expire) => ({txHash, success, expire}),
  [STORE_ACTION_KEYS.SET_TOTAL_UPX]: (totalUpx) => ({totalUpx})
});

export const SAGA_ACTIONS = createActions({
  [SAGA_ACTION_KEYS.SWAP_ERC20]: (bnbAddress, upxAmount) => ({bnbAddress, upxAmount})
});

const reducer = handleActions({
  [STORE_ACTION_KEYS.SET_ACCOUNT]: (state, {payload: {account}}) => {
    return {...state, account};
  },
  [STORE_ACTION_KEYS.SET_UPX_BALANCE]: (state, {payload: {upx}}) => {
    return {...state, upx};
  },
  [STORE_ACTION_KEYS.SET_UPXB_BALANCE]: (state, {payload: {upxb}}) => {
    return {...state, upxb};
  },
  [STORE_ACTION_KEYS.SET_BNB_BALANCE]: (state, {payload: {bnb}}) => {
    return {...state, bnb};
  },
  [STORE_ACTION_KEYS.SET_ETH_BALANCE]: (state, {payload: {eth}}) => {
    return {...state, eth};
  },
  [STORE_ACTION_KEYS.SET_TOTAL_UPX]: (state, {payload: {totalUpx}}) => {
    return {...state, totalUpx};
  },
  [STORE_ACTION_KEYS.SET_PROVIDER]: (state, {payload: {provider}}) => {
    return {...state, provider};
  },
  [STORE_ACTION_KEYS.SET_NETWORK]: (state, {payload: {network}}) => {
    return {...state, network};
  },
  [STORE_ACTION_KEYS.SET_BNB_ADDR]: (state, {payload: {addr}}) => {
    return {...state, bnbAddr: addr};
  },
  [STORE_ACTION_KEYS.SET_PENDING_TX]: (state, {payload: {pendingTx}}) => {
    return {...state, pendingTx};
  },
  [STORE_ACTION_KEYS.SET_TX_RECEIPT]: (state, {payload: {txHash, success, expire}}) => {
    return {...state, txReceipt: {txHash, success, expire}};
  },
  [STORE_ACTION_KEYS.SET_NOTICE]: (state, {payload: {id, msg, variant}}) => {
    if (typeof id === 'undefined') {
      id = new Date().getTime();
    }
    return {...state, notice: {id, msg, variant}};
  }
}, {eth: '--', upx: '--', bnb: '--', upxb: '--'});

const bindMiddleware = middleware => {
  if (process.env.NODE_ENV !== 'production') {
    const { composeWithDevTools } = require('redux-devtools-extension');
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

export const initStore = (initialState) => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    reducer,
    initialState,
    bindMiddleware([sagaMiddleware])
  );

  store.sagaTask = sagaMiddleware.run(rootSaga);
  return store;
};
