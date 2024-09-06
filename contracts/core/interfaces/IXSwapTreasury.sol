// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

/// @title The interface for a XSwap Treasury
/// @notice A XSwap treasury facilitates storing and transfering assets that strictly conform to the ERC20 specification
/// This is where protocol fees from pools go to
interface IXSwapTreasury {
    struct FeeTakers {
        address firstTaker;
        uint256 firstTakerClaimRate;
        address secondTaker;
        uint256 secondTakerClaimRate;
        address thirdTaker;
        uint256 thirdTakerClaimRate;
    }

    /// @notice Emitted when the fee takers is changed
    /// @param oldFeeTakers The fee takers before the treasury was changed
    /// @param newFeeTakers The fee takers after the treasury was changed
    event FeeTakersChanged(FeeTakers oldFeeTakers, FeeTakers newFeeTakers);

    /// @notice Emitted when the collected protocol fees are withdrawn by the factory owner
    /// @param sender The address that call the collect protocol fees function
    /// @param tokenList The list of token addresses that have been collected the protocol fees
    event CollectProtocol(address indexed sender, address[] tokenList);

    /// @return The contract address
    function factory() external view returns (address);

    /// @notice The feeTaker stores address and earn percentage of the fee taker, and is exposed as a single method to save gas
    /// when accessed externally.
    /// @return firstTaker The current address of the first fee taker
    /// firstTakerClaimRate The current percentage of protocol fees that first taker can collect
    /// secondTaker The current address of the second fee taker
    /// secondTakerClaimRate The current percentage of protocol fees that second taker can collect
    /// thirdTaker The current address of the third fee taker
    /// thirdTakerClaimRate The current percentage of protocol fees that third taker can collect
    function feeTakers()
        external
        view
        returns (
            address firstTaker,
            uint256 firstTakerClaimRate,
            address secondTaker,
            uint256 secondTakerClaimRate,
            address thirdTaker,
            uint256 thirdTakerClaimRate
        );

    /// @notice Updates the fee takers information of the treasury
    /// @dev Must be called by the current owner
    /// @param params The new data of the fee takers
    function setFeeTakers(FeeTakers memory params) external;

    /// @notice Collect the protocol fee of all pools
    /// @param tokenList The address list of which should be collected
    function collectProtocol(address[] calldata tokenList) external;
}
