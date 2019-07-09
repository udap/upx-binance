const ethers = require('ethers');
const _get = require('lodash/get');
const abis = require('./abi');

function getContractInstance(providerOrSigner, name, network) {
  const abi = _get(abis, [name, 'abi']);
  const addr = _get(abis, [name, 'networks', network, 'address']);
  if (!abi || !addr) {
    throw new Error('abi or address not found.');
  }
  return new ethers.Contract(addr, abi, providerOrSigner);
}

function getContractIface(name) {
  const abi = _get(abis, [name, 'abi']);
  return new ethers.utils.Interface(abi);
}

function getAddr(name, network) {
  return _get(abis, [name, 'networks', network, 'address']);
}

function getInitBlock(name, network) {
  return _get(abis, [name, 'networks', network, 'block']);
}

module.exports = {
  getContractInstance,
  getContractIface,
  getAddr,
  getInitBlock
};
