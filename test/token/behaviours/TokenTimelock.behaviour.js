const shouldFail = require('openzeppelin-solidity/test/helpers/shouldFail');
const time = require('openzeppelin-solidity/test/helpers/time');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

function shouldBehaveLikeTokenTimelock ([_, minter, beneficiary], amount) {
  context('with token', function () {
    context('once deployed', function () {
      it('can get state', async function () {
        (await this.timelock.token()).should.be.equal(this.token.address);
        (await this.timelock.beneficiary()).should.be.equal(beneficiary);
        (await this.timelock.releaseTime()).should.be.bignumber.equal(this.releaseTime);
      });

      it('cannot be released before time limit', async function () {
        await shouldFail.reverting(this.timelock.release());
      });

      it('cannot be released just before time limit', async function () {
        await time.increaseTo(this.releaseTime - time.duration.seconds(3));
        await shouldFail.reverting(this.timelock.release());
      });

      it('can be released just after limit', async function () {
        await time.increaseTo(this.releaseTime + time.duration.seconds(1));
        await this.timelock.release();
        (await this.token.balanceOf(beneficiary)).should.be.bignumber.equal(amount);
      });

      it('can be released after time limit', async function () {
        await time.increaseTo(this.releaseTime + time.duration.years(1));
        await this.timelock.release();
        (await this.token.balanceOf(beneficiary)).should.be.bignumber.equal(amount);
      });

      it('cannot be released twice', async function () {
        await time.increaseTo(this.releaseTime + time.duration.years(1));
        await this.timelock.release();
        await shouldFail.reverting(this.timelock.release());
        (await this.token.balanceOf(beneficiary)).should.be.bignumber.equal(amount);
      });
    });
  });
}

module.exports = {
  shouldBehaveLikeTokenTimelock,
};