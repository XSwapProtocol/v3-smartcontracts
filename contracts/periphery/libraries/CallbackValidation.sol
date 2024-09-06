// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

import "../../core/interfaces/IXSwapPool.sol";
import "./PoolAddress.sol";

/// @notice Provides validation for callbacks from XSwap Pools
library CallbackValidation {
    /// @notice Returns the address of a valid XSwap Pool
    /// @param factory The contract address of the XSwap factory
    /// @param tokenA The contract address of either token0 or token1
    /// @param tokenB The contract address of the other token
    /// @param fee The fee collected upon every swap in the pool, denominated in hundredths of a bip
    /// @return pool The V3 pool contract address
    function verifyCallback(
        address factory,
        address tokenA,
        address tokenB,
        uint24 fee
    ) internal view returns (IXSwapPool pool) {
        return
            verifyCallback(
                factory,
                PoolAddress.getPoolKey(tokenA, tokenB, fee)
            );
    }

    /// @notice Returns the address of a valid XSwap Pool
    /// @param factory The contract address of the XSwap factory
    /// @param poolKey The identifying key of the V3 pool
    /// @return pool The V3 pool contract address
    function verifyCallback(
        address factory,
        PoolAddress.PoolKey memory poolKey
    ) internal view returns (IXSwapPool pool) {
        pool = IXSwapPool(PoolAddress.computeAddress(factory, poolKey));
        require(msg.sender == address(pool));
    }
}
