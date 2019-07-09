
module.exports = {
  Relay: {
    abi: [
      `function relay(address to, uint256 amount, string bnbTxId) public returns (bool)`
    ],
    networks: {
      '3': {
        block: 5886764,
        address: '0xec54657a2cc86dffe7a09ca323a41de03b7ae543'
      },
      '1': {
        block: 8063913,
        address: '0x10810b0abb8ee6ca5421e2f71b9d8b081401d673'
      }
    }
  },
  UPX: {
    abi: [
      `function balanceOf(address who) external view returns (uint256)`
    ],
    networks: {
      '3': {
        'block': 5886762,
        'address': '0xad2a9df6c926f449c6fcc7e5c6368a8695366e5a'
      },
      '1': {
        'block': 5796935,
        'address': '0x5f778ec4b31a506c1dfd8b06f131e9b451a61d39'
      }
    }
  }
};
