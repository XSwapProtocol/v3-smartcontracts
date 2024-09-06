// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

/// @title Immutable state
/// @notice Functions that return immutable state of the router
interface IImmutableState {
    /// @return Returns the address of the XSwap V2 factory
    function factoryV2() external view returns (address);

    /// @return Returns the address of XSwap V3 NFT position manager
    function positionManager() external view returns (address);
}
