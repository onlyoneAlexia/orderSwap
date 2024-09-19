import { expect } from "chai";
import { ethers } from "hardhat";
import { OrderSwap, SampleToken } from "../typechain-types";

describe("OrderSwap Contract", function () {
    let orderSwap: OrderSwap;
    let tokenA: SampleToken;
    let tokenB: SampleToken;
    let addr1: any
    let addr2: any;

    beforeEach(async function () {
        const Token = await ethers.getContractFactory("SampleToken");
        tokenA = await Token.deploy("TokenA", "TKA");
        tokenB = await Token.deploy("TokenB", "TKB");

       const odSwap =  (await ethers.getContractFactory("OrderSwap"));
       orderSwap=await odSwap.deploy();
       await orderSwap.waitForDeployment();
        [addr1, addr2] = await ethers.getSigners();
        console.log(addr1.address)
        

        await tokenA.waitForDeployment();
        await tokenB.waitForDeployment();
        await orderSwap.waitForDeployment();

        // Transfer tokens to addr1 and addr2 for testing
        await tokenA.transfer(addr1.address, ethers.parseUnits("100", 18));
        await tokenB.transfer(addr2.address, ethers.parseUnits("100", 18));
    });

    it("should allow a user to deposit an order with a deadline", async function () {
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        await tokenA.connect(addr1).approve(orderSwap.target, ethers.parseUnits("100", 18));
        await orderSwap.connect(addr1).depositOrder(tokenA.target, tokenB.target, ethers.parseUnits("100", 18), ethers.parseUnits("20", 18), deadline);
        
        const order = await orderSwap.viewOrder(0);
        expect(order.deadline).to.be.greaterThan(Math.floor(Date.now() / 1000));
    });

    it("should allow a user to purchase an order before the deadline", async function () {
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        await tokenA.connect(addr1).approve(orderSwap.target, ethers.parseUnits("100", 18));
        await orderSwap.connect(addr1).depositOrder(tokenA.target, tokenB.target, ethers.parseUnits("100", 18), ethers.parseUnits("20", 18), deadline);

        await tokenB.connect(addr2).approve(orderSwap.target, ethers.parseUnits("20", 18));
        await orderSwap.connect(addr2).purchaseOrder(0);
        
        const order = await orderSwap.viewOrder(0);
        expect(order.active).to.be.false;
        expect(await tokenA.balanceOf(addr2.address)).to.equal(ethers.parseUnits("100", 18));
        expect(await tokenB.balanceOf(orderSwap.target)).to.equal(ethers.parseUnits("20", 18));
    });

    it("should not allow purchasing an order after the deadline", async function () {
        const deadline = Math.floor(Date.now() / 1000) - 3600; // 1 hour in the past
        await tokenA.connect(addr1).approve(orderSwap.target, ethers.parseUnits("100", 18));
        await orderSwap.connect(addr1).depositOrder(tokenA.target, tokenB.target, ethers.parseUnits("100", 18), ethers.parseUnits("20", 18), deadline);

        await tokenB.connect(addr2).approve(orderSwap.target, ethers.parseUnits("20", 18));
        
        await expect(orderSwap.connect(addr2).purchaseOrder(0)).to.be.revertedWith("Order not active");
    });

    it("should allow a user to cancel their order and receive tokens back", async function () {
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        await tokenA.connect(addr1).approve(orderSwap.target, ethers.parseUnits("100", 18));
        await orderSwap.connect(addr1).depositOrder(tokenA.target, tokenB.target, ethers.parseUnits("100", 18), ethers.parseUnits("20", 18), deadline);

        const initialBalance = await tokenA.balanceOf(addr1.address);
        await orderSwap.connect(addr1).cancelOrder(0);
        
        const order = await orderSwap.viewOrder(0);
        expect(order.active).to.be.false;

        const finalBalance = await tokenA.balanceOf(addr1.address);
        expect(finalBalance).to.equal(initialBalance + (ethers.parseUnits("100", 18))); // Check if tokens are returned
    });

    it("should not allow purchase of inactive order", async function () {
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        await tokenA.connect(addr1).approve(orderSwap.target, ethers.parseUnits("100", 18));
        await orderSwap.connect(addr1).depositOrder(tokenA.target, tokenB.target, ethers.parseUnits("100", 18), ethers.parseUnits("20", 18), deadline);

        await orderSwap.connect(addr1).cancelOrder(0);
        await expect(orderSwap.connect(addr2).purchaseOrder(0)).to.be.revertedWith("Order not active");
    });

    it("should allow users to view orders", async function () {
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        await tokenA.connect(addr1).approve(orderSwap.target, ethers.parseUnits("100", 18));
        await orderSwap.connect(addr1).depositOrder(tokenA.target, tokenB.target, ethers.parseUnits("100", 18), ethers.parseUnits("20", 18), deadline);

        const order = await orderSwap.viewOrder(0);
        expect(order.depositor).to.equal(addr1.address);
        expect(order.amountDeposited).to.equal(ethers.parseUnits("100", 18));
        expect(order.price).to.equal(ethers.parseUnits("20", 18));
        expect(order.active).to.be.true;
        expect(order.paymentToken).to.equal(tokenB.target);
        expect(order.deadline).to.be.greaterThan(Math.floor(Date.now() / 1000));
    });
});