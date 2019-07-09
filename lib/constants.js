import {getAddr} from '../contracts';

export const BNB_DEX_API = {
  '3': 'https://testnet-dex.binance.org',
  '1': 'https://dex.binance.org'
};

export const BNB_DEX_EXP = {
  '3': 'https://testnet-explorer.binance.org',
  '1': 'https://explorer.binance.org'
};

export const ETH_EXP = {
  '3': 'https://ropsten.etherscan.io',
  '1': 'https://etherscan.io'
};

export const CREATE_BINANCE_ACCOUNT = {
  3: 'https://testnet.binance.org/en/create',
  1: 'https://binance.org/en/create'
};

export const UPXB = {
  3: {
    SYMBOL: 'UPX-B00',
    LOCKERS: [
      'tbnb19kdrqfl66rss2flgn7mld6yltv6u83wwsw8ztm',
      'tbnb1ft4vs3xlp83c2kv8qhpw8xry8kpnnazecf5pcn'
    ]
  },
  1: {
    SYMBOL: 'UPX-F3E',
    LOCKERS: [
      'bnb1588jx9ylvfpfhdzy672lk3pulleq8md0a4wcjl',
      'bnb1drfawp2wl08u8pyhsdf3frsedp3zu27cskmdq2'
    ]
  }
};

export const UPX = {
  3: {
    ADDRESS: getAddr('UPX', 3),
    LOCKERS: [
      getAddr('Relay', 3)
    ]
  },
  1: {
    ADDRESS: getAddr('UPX', 1),
    LOCKERS: [
      getAddr('Relay', 1)
    ]
  }
};

export const MAX_BALANCE_CONTRACT = 10000000000;
