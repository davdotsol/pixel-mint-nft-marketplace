const { expect } = require('chai');

const {
  loadFixture,
} = require('@nomicfoundation/hardhat-toolbox/network-helpers');

describe('NFTMarket Contract', function () {
  async function deployFixture() {
    // Get the Signers here.
    const [owner, addr1, addr2] = await ethers.getSigners();

    const NFTMarket = await ethers.getContractFactory('NFTMarket');
    const nftMarket = await NFTMarket.deploy(owner);

    await nftMarket.waitForDeployment();

    const NFTMarketplace = await ethers.getContractFactory('NFTMarketplace');
    const nftMarketplace = await NFTMarketplace.deploy(owner, nftMarket);
    await nftMarketplace.waitForDeployment();

    // Fixtures can return anything you consider useful for your tests
    return { nftMarketplace, nftMarket, owner, addr1, addr2 };
  }

  describe('Deployment', function () {
    it('Should have the correct name and symbol', async function () {
      const { nftMarketplace, nftMarket } = await loadFixture(deployFixture);
      expect(await nftMarket.name()).to.equal('RobotsNFT');
      expect(await nftMarket.symbol()).to.equal('RNFT');
      expect(await nftMarketplace.nftContract()).to.equal(nftMarket);
    });
  });

  describe('Mint token', function () {
    it('Should have the correct recipient address', async function () {
      const { nftMarket, owner, addr1 } = await loadFixture(deployFixture);

      // Mint the NFT to addr1
      await nftMarket.mint(addr1);

      // Verify the owner of the nft is correct
      expect(await nftMarket.ownerOf(0)).to.equal(addr1.address);
    });

    it('Should have the correct token URI', async function () {
      const { nftMarket, owner, addr1 } = await loadFixture(deployFixture);

      // Mint the NFT to addr1
      await nftMarket.mint(addr1);

      // Verify the token URI is correct
      expect(await nftMarket.tokenURI(0)).to.equal(
        'https://api.example.com/metadata/0'
      );
    });
  });

  describe('Marketplace', function () {
    it('should have one listed item', async function () {
      const { nftMarketplace, nftMarket, owner, addr1 } = await loadFixture(
        deployFixture
      );

      // Mint the NFT to addr1
      await nftMarket.mint(addr1);

      // Approve the marketplace contract to handle the token
      await nftMarket.connect(addr1).approve(nftMarketplace, 0);

      // List the NFT on the marketplace
      const tx = await nftMarketplace.connect(addr1).listNFT(0, 10000);
      await tx.wait();

      // Verify the event was emitted correctly
      await expect(tx)
        .to.emit(nftMarketplace, 'NFTListed')
        .withArgs(0, 0, addr1.address, 10000); // Correct the index for args

      const listing = await nftMarketplace.getListing(0);
      expect(listing.tokenId.toString()).to.equal('0');
    });
  });
});
