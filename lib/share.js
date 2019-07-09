// import * as Sentry from '@sentry/browser';

function denyMetamask() {
  const expire = window.localStorage.getItem('metamask-deny');
  return new Date(expire) > new Date();
}

function setDenyMetamask() {
  let d = new Date();
  d.setHours(d.getHours() - 12);
  window.localStorage.setItem('metamask-deny', d);
}

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1102.md
// https://github.com/MetaMask/metamask-extension/issues/5715
let enabled = false;
export async function tryEnableWeb3(forceEnable) {
  try {
    if (
      window &&
      window.ethereum &&
      (forceEnable || (!enabled && !denyMetamask()))
    ) {
      if (window.ethereum.enable) {
        await window.ethereum.enable();
        enabled = true;
      } else if (window.ethereum.sendAsync) {
        const accounts = await window.ethereum.sendAsync('eth_requestAccounts');
        if (accounts && accounts.length > 0) {
          enabled = true;
        }
      } else {
        const accounts = await window.ethereum.send('eth_requestAccounts');
        if (accounts && accounts.length > 0) {
          enabled = true;
        }
      }
    }
  } catch (e) {
    // Sentry.captureException(e);
    setDenyMetamask();
    enabled = false;
  }
  return enabled;
}

export function selectAs(object, pathConf) {
  return Object.keys(object).reduce((ret, key) => {
    if (pathConf.hasOwnProperty(key)) {
      ret[pathConf[key]] = object[key];
    }
    return ret;
  }, {});
}

export function shortAddr(addr, len) {
  const reg = new RegExp(`^(0x\\w{${len}})(\\w+)(\\w{${len}})$`);
  return addr.replace(reg, (_, m1, m2, m3) => `${m1}......${m3}`);
}

export function numberWithCommas(x) {
  const parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function trimZero(numStr = '') {
  return numStr.replace(/\.?0+$/, '');
}

export function formatNumber(len) {
  const zeros = '0000000000';
  return (number) => {
    if (number >= Math.pow(10, len)) {
      return number;
    }
    return `${zeros}${number}`.substr(-len);
  };
}
