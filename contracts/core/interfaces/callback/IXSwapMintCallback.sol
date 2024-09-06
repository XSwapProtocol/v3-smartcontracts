// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

/// @title Callback for IXSwapPoolActions#mint
/// @notice Any contract that calls IXSwapPoolActions#mint must implement this interface
interface IXSwapMintCallback {
    /// @notice Called to `msg.sender` after minting liquidity to a position from IXSwapPool#mint.
    /// @dev In the implementation you must pay the pool tokens owed for the minted liquidity.
    /// The caller of this method must be checked to be a XSwapPool deployed by the canonical XSwapFactory.
    /// @param amount0Owed The amount of token0 due to the pool for the minted liquidity
    /// @param amount1Owed The amount of token1 due to the pool for the minted liquidity
    /// @param data Any data passed through by the caller via the IXSwapPoolActions#mint call
    function xswapMintCallback(
        uint256 amount0Owed,
        uint256 amount1Owed,
        bytes calldata data
    ) external;
}
