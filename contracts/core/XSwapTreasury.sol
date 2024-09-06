// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.7.6;
pragma abicoder v2;

import "./interfaces/IERC20Minimal.sol";
import "./interfaces/IXSwapFactory.sol";
import "./interfaces/IXSwapTreasury.sol";

import "./libraries/TransferHelper.sol";
import "./libraries/FullMath.sol";

contract XSwapTreasury is IXSwapTreasury {
    uint256 public constant BASE_DENOMINATOR = 10_000; // 10_000
    /// @inheritdoc IXSwapTreasury
    address public immutable override factory;

    /// @inheritdoc IXSwapTreasury
    FeeTakers public override feeTakers;

    bool internal locked;

    // Receive native token function
    receive() external payable {}

    fallback() external payable {}

    modifier lock() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    modifier onlyFactoryOwner() {
        require(msg.sender == IXSwapFactory(factory).owner());
        _;
    }

    constructor(address _factory, FeeTakers memory params) {
        factory = _factory;
        emit FeeTakersChanged(feeTakers, params);
        feeTakers = FeeTakers({
            firstTaker: params.firstTaker,
            firstTakerClaimRate: params.firstTakerClaimRate,
            secondTaker: params.secondTaker,
            secondTakerClaimRate: params.secondTakerClaimRate,
            thirdTaker: params.thirdTaker,
            thirdTakerClaimRate: params.thirdTakerClaimRate
        });
    }

    /// @inheritdoc IXSwapTreasury
    function setFeeTakers(
        FeeTakers memory params
    ) external override onlyFactoryOwner {
        emit FeeTakersChanged(feeTakers, params);
        feeTakers = FeeTakers({
            firstTaker: params.firstTaker,
            firstTakerClaimRate: params.firstTakerClaimRate,
            secondTaker: params.secondTaker,
            secondTakerClaimRate: params.secondTakerClaimRate,
            thirdTaker: params.thirdTaker,
            thirdTakerClaimRate: params.thirdTakerClaimRate
        });
    }

    /// @inheritdoc IXSwapTreasury
    function collectProtocol(
        address[] calldata tokenList
    ) external override lock onlyFactoryOwner {
        address tokenAddress;
        uint256 tokenBalance;
        uint32 tokenCount = 0;
        // Loop through the list
        while (tokenCount < tokenList.length) {
            tokenAddress = tokenList[tokenCount];
            // Native is not allowed
            require(tokenAddress != address(0));
            tokenBalance = balance(tokenAddress);
            // Do the transfers to fee takers if balance is > 0
            if (tokenBalance > 0) {
                TransferHelper.safeTransfer(
                    tokenAddress,
                    feeTakers.firstTaker,
                    FullMath.mulDiv(
                        tokenBalance,
                        feeTakers.firstTakerClaimRate,
                        BASE_DENOMINATOR
                    )
                );
                TransferHelper.safeTransfer(
                    tokenAddress,
                    feeTakers.secondTaker,
                    FullMath.mulDiv(
                        tokenBalance,
                        feeTakers.secondTakerClaimRate,
                        BASE_DENOMINATOR
                    )
                );
                TransferHelper.safeTransfer(
                    tokenAddress,
                    feeTakers.thirdTaker,
                    FullMath.mulDiv(
                        tokenBalance,
                        feeTakers.thirdTakerClaimRate,
                        BASE_DENOMINATOR
                    )
                );
            }
            tokenCount++;
        }

        emit CollectProtocol(msg.sender, tokenList);
    }

    /// @dev Get the contract's balance of selected token
    /// @dev This function is gas optimized to avoid a redundant extcodesize check in addition to the returndatasize
    /// check
    function balance(address tokenAddress) private view returns (uint256) {
        (bool success, bytes memory data) = tokenAddress.staticcall(
            abi.encodeWithSelector(
                IERC20Minimal.balanceOf.selector,
                address(this)
            )
        );
        require(success && data.length >= 32);
        return abi.decode(data, (uint256));
    }
}
