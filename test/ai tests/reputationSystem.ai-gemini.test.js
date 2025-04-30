const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReputationSystem - Gemini AI tests", function () {
  let ReputationSystem, reputationSystem, MyToken, myToken, owner, user1, user2, admin, WeightedCalculator;

  beforeEach(async function () {
    [owner, user1, user2, admin] = await ethers.getSigners();

    MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy(1000000);
    await myToken.waitForDeployment();

    WeightedCalculator = await ethers.getContractFactory("WeightedCalculator");
    const weightedCalculatorDeployed = await WeightedCalculator.deploy();
    await weightedCalculatorDeployed.waitForDeployment();

    ReputationSystem = await ethers.getContractFactory("ReputationSystem", {
      libraries: {
        WeightedCalculator: weightedCalculatorDeployed.target,
      },
    });

    reputationSystem = await ReputationSystem.deploy(myToken.target);
    await reputationSystem.waitForDeployment();

    await reputationSystem.transferOwnership(admin.address);
  });

  // Unit Tests
  describe("Unit Tests", function () {
    it("should allow adding feedback", async function () {
      await reputationSystem.addFeedback(user1.address, 5);
      const feedback = await reputationSystem.feedbacks(user1.address, 0);
      expect(feedback.score).to.equal(5);
      const latestBlock = await ethers.provider.getBlock("latest");
      expect(feedback.timestamp).to.be.closeTo(latestBlock.timestamp, 5);
    });

    it("should allow penalizing a user", async function () {
      await reputationSystem.connect(admin).penalizeUser(user1.address, 2);
      const feedback = await reputationSystem.feedbacks(user1.address, 0);
      expect(feedback.score).to.equal(2); // scorul negativ e stocat ca pozitiv și interpretat ca penalizare
    });

    it("should revert if score is out of range", async function () {
      await expect(reputationSystem.addFeedback(user1.address, 0)).to.be.revertedWith("Score must be between 1 and 5");
      await expect(reputationSystem.addFeedback(user1.address, 6)).to.be.revertedWith("Score must be between 1 and 5");
      await expect(reputationSystem.connect(admin).penalizeUser(user1.address, 0)).to.be.revertedWith("Score must be between 1 and 5");
      await expect(reputationSystem.connect(admin).penalizeUser(user1.address, 6)).to.be.revertedWith("Score must be between 1 and 5");
    });

    it("should calculate weighted score correctly", async function () {
      await reputationSystem.addFeedback(user1.address, 4);
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      await reputationSystem.addFeedback(user1.address, 5);

      const weightedScore = await reputationSystem.getWeightedScore(user1.address);
      expect(weightedScore).to.equal(4);
    });

    it("should revert getWeightedScore if no feedback exists", async function () {
      await expect(reputationSystem.getWeightedScore(user1.address)).to.be.revertedWith("No feedback found for this user");
    });

    it("should calculate reward correctly", async function () {
      const reward = await reputationSystem.calculateReward(100, 2);
      expect(reward).to.equal(200);
    });
  });

  // Integration Tests
  describe("Integration Tests", function () {
    it("should allow admin to reward user with tokens", async function () {
      const rewardAmount = 100n;
      const initialBalance = await myToken.balanceOf(user1.address);
      await myToken.transfer(reputationSystem.target, 200n);
      await reputationSystem.connect(admin).rewardUser(user1.address, rewardAmount);
      const finalBalance = await myToken.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance + rewardAmount);
    });

    it("should emit RewardPaid event on successful reward", async function () {
      const rewardAmount = 50;
      await myToken.transfer(reputationSystem.target, 100);
      await expect(reputationSystem.connect(admin).rewardUser(user1.address, rewardAmount))
        .to.emit(reputationSystem, "RewardPaid")
        .withArgs(user1.address, rewardAmount);
    });

    it("should allow admin to send reward with ETH", async function () {
      const initialBalance = await ethers.provider.getBalance(user2.address);
      const ethToSend = ethers.parseEther("0.1");
      const tx = await reputationSystem.connect(admin).sendRewardWithEth(user2.address, { value: ethToSend });
      await tx.wait();
      const finalBalance = await ethers.provider.getBalance(user2.address);
      expect(finalBalance).to.be.closeTo(initialBalance + ethToSend, ethers.parseEther("0.01"));
    });
  });

  // Basic Performance Test
  describe("Performance Test", function () {
    it("should handle a large number of feedbacks efficiently (basic)", async function () {
      const numFeedbacks = 100;
      const startTime = Date.now();
      for (let i = 0; i < numFeedbacks; i++) {
        await reputationSystem.addFeedback(user1.address, Math.floor(Math.random() * 5) + 1);
      }
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`Adding ${numFeedbacks} feedbacks took ${duration}ms`);
      expect(duration).to.be.lessThan(5000);
    });
  });

  // Security Tests
  describe("Security Tests", function () {
    it("should prevent non-admin from calling penalizeUser", async function () {
      await expect(reputationSystem.connect(user1).penalizeUser(user1.address, 3)).to.be.revertedWith("Only admin can call this function");
    });

    it("should prevent non-admin from calling rewardUser", async function () {
      await myToken.transfer(reputationSystem.target, 100);
      await expect(reputationSystem.connect(user1).rewardUser(user1.address, 20)).to.be.revertedWith("Only admin can call this function");
    });

    it("should prevent non-admin from calling sendRewardWithEth", async function () {
      await expect(
        reputationSystem.connect(user1).sendRewardWithEth(user2.address, {
          value: ethers.parseEther("0.05"),
        })
      ).to.be.revertedWith("Only admin can call this function");
    });

    it("should prevent rewarding user if contract has insufficient tokens", async function () {
      await expect(reputationSystem.connect(admin).rewardUser(user1.address, 100n)).to.be.reverted;
    });

    it("should prevent sending ETH if no ETH is provided", async function () {
      await expect(reputationSystem.connect(admin).sendRewardWithEth(user2.address)).to.be.revertedWith("No ETH sent");
    });
  });
});
