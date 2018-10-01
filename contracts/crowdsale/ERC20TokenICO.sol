pragma solidity ^0.4.24;

import "./base/DefaultCrowdsale.sol";


contract ERC20TokenICO is DefaultCrowdsale {

  constructor(
    uint256 _startTime,
    uint256 _endTime,
    uint256 _rate,
    address _wallet,
    uint256 _cap,
    uint256 _minimumContribution,
    address _token,
    address _contributions
  )
  DefaultCrowdsale(
    _startTime,
    _endTime,
    _rate,
    _wallet,
    _cap,
    _minimumContribution,
    _token,
    _contributions
  )
  public
  {}
}
