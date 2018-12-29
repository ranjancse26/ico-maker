const shouldFail = require('openzeppelin-solidity/test/helpers/shouldFail');

const { shouldBehaveLikeCappedDelivery } = require('./CappedDelivery.behaviour');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

const CappedDelivery = artifacts.require('CappedDelivery');
const BaseToken = artifacts.require('BaseToken');

const { ZERO_ADDRESS } = require('openzeppelin-solidity/test/helpers/constants');

contract('CappedDelivery', function (accounts) {
  const [
    tokenOwner,
    cappedDeliveryOwner,
    receiver,
  ] = accounts;

  const name = 'BaseToken';
  const symbol = 'ERC20';
  const decimals = 18;
  const tokenCap = new BigNumber(100000);

  const cap = new BigNumber(20000);

  beforeEach(async function () {
    this.token = await BaseToken.new(name, symbol, decimals, tokenCap, { from: tokenOwner });
  });

  const testingDelivery = function (allowMultipleSend) {
    context('creating a valid delivery', function () {
      describe('if token address is the zero address', function () {
        it('reverts', async function () {
          await shouldFail.reverting(
            CappedDelivery.new(ZERO_ADDRESS, cap, allowMultipleSend, { from: cappedDeliveryOwner })
          );
        });
      });

      describe('if cap is zero', function () {
        it('reverts', async function () {
          await shouldFail.reverting(
            CappedDelivery.new(this.token.address, 0, allowMultipleSend, { from: cappedDeliveryOwner })
          );
        });
      });

      context('testing behaviours', function () {
        beforeEach(async function () {
          this.cappedDelivery = await CappedDelivery.new(
            this.token.address,
            cap,
            allowMultipleSend,
            { from: cappedDeliveryOwner }
          );

          await this.token.mint(this.cappedDelivery.address, tokenCap, { from: tokenOwner });
        });

        describe('sending tokens if minting is not finished', function () {
          it('reverts', async function () {
            await shouldFail.reverting(
              this.cappedDelivery.multiSend([receiver], [100], { from: cappedDeliveryOwner })
            );
          });
        });

        context('like a CappedDelivery', function () {
          beforeEach(async function () {
            await this.token.finishMinting({ from: tokenOwner });
          });

          shouldBehaveLikeCappedDelivery(accounts, cap, allowMultipleSend);
        });
      });
    });
  };

  context('if allowing multiple send', function () {
    const allowMultipleSend = true;
    testingDelivery(allowMultipleSend);
  });

  context('if not allowing multiple send', function () {
    const allowMultipleSend = false;
    testingDelivery(allowMultipleSend);
  });
});