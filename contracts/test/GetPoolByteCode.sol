// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;
import "../core/XSwapPool.sol";

contract GetPoolByteCode {
    bytes32 public poolCodeHash;

    function getPoolCodeHash() external {
        bytes32 codeHash = keccak256(type(XSwapPool).creationCode);
        poolCodeHash = codeHash;
    }
}
