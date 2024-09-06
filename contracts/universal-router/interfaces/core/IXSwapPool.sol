// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.17;

import "./pool/IXSwapPoolImmutables.sol";
import "./pool/IXSwapPoolState.sol";
import "./pool/IXSwapPoolDerivedState.sol";
import "./pool/IXSwapPoolActions.sol";
import "./pool/IXSwapPoolOwnerActions.sol";
import "./pool/IXSwapPoolEvents.sol";

/// @title The interface for a XSwap Pool
/// @notice A XSwap pool facilitates swapping and automated market making between any two assets that strictly conform
/// to the ERC20 specification
/// @dev The pool interface is broken up into many smaller pieces
interface IXSwapPool is
    IXSwapPoolImmutables,
    IXSwapPoolState,
    IXSwapPoolDerivedState,
    IXSwapPoolActions,
    IXSwapPoolOwnerActions,
    IXSwapPoolEvents
{

}
