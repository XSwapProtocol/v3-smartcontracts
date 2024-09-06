// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

interface IXSwapV2Callee {
    function xswapCall(
        address sender,
        uint amount0,
        uint amount1,
        bytes calldata data
    ) external;
}
