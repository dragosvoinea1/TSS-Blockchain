const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReputationSystem - Security Tests", function () {
    let token, reputation, calculator;
    let owner, user1, user2;

    beforeEach(async function () {
        const WeightedCalculator = await ethers.getContractFactory("WeightedCalculator");
        calculator = await WeightedCalculator.deploy();
        await calculator.waitForDeployment();

        const MyToken = await ethers.getContractFactory("MyToken");
        token = await MyToken.deploy(1000000);
        await token.waitForDeployment();

        const ReputationSystemFactory = await ethers.getContractFactory("ReputationSystem", {
            libraries: {
                WeightedCalculator: calculator.target,
            },
        });
        reputation = await ReputationSystemFactory.deploy(token.target);
        await reputation.waitForDeployment();

        [owner, user1, user2] = await ethers.getSigners();
    });

    // 🔒 Doar admin poate penaliza utilizatori
    it("Should revert if non-admin tries to penalize a user", async function () {
        await expect(
            reputation.connect(user1).penalizeUser(user2.address, 3)
        ).to.be.revertedWith("Only admin can call this function");
    });

    // 🔒 Doar admin poate recompensa în tokeni
    it("Should revert if non-admin tries to reward with tokens", async function () {
        await token.transfer(reputation.target, 100);
        await expect(
            reputation.connect(user1).rewardUser(user2.address, 50)
        ).to.be.revertedWith("Only admin can call this function");
    });

    // 🔒 Doar admin poate trimite ETH
    it("Should revert if non-admin tries to send ETH", async function () {
        await expect(
            reputation.connect(user1).sendRewardWithEth(user2.address, {
                value: ethers.parseEther("0.01")
            })
        ).to.be.revertedWith("Only admin can call this function");
    });

    // ❌ Feedback cu scor invalid
    it("Should revert on invalid feedback score", async function () {
        await expect(reputation.addFeedback(user1.address, 0)).to.be.revertedWith("Score must be between 1 and 5");
        await expect(reputation.addFeedback(user1.address, 6)).to.be.revertedWith("Score must be between 1 and 5");
    });

    // ❌ Penalizare cu scor invalid
    it("Should revert on invalid penalty score", async function () {
        await expect(reputation.penalizeUser(user1.address, 0)).to.be.revertedWith("Score must be between 1 and 5");
        await expect(reputation.penalizeUser(user1.address, 10)).to.be.revertedWith("Score must be between 1 and 5");
    });

    // 🚫 Self-feedback permis doar dacă nu e interzis explicit în contract
    it("Should allow self-feedback only if permitted", async function () {
        await reputation.connect(user1).addFeedback(user1.address, 5);
        const score = await reputation.getWeightedScore(user1.address);
        expect(score).to.equal(5);
    });

    // 🔐 Oricine poate citi scorul unui utilizator
    it("Anyone can read weighted score", async function () {
        await reputation.addFeedback(user1.address, 3);
        const score = await reputation.connect(user2).getWeightedScore(user1.address);
        expect(score).to.equal(3);
    });

    // 🔒 Nu există funcție de manipulare directă a scorului
    it("Should not allow direct score manipulation", async function () {
        expect(reputation.setScore).to.be.undefined;
    });

    
    // 🚫 Feedback spam (50 feedback-uri consecutive)
    it("Should allow many feedbacks if spam protection is not enforced", async function () {
        for (let i = 0; i < 50; i++) {
            await reputation.addFeedback(user1.address, 5);
        }
        const score = await reputation.getWeightedScore(user1.address);
        expect(score).to.equal(5);
    });

    // 🔐 Fallback non-payable protejează contractul de primire ETH direct
    it("Should reject direct ETH transfers to contract if no payable fallback", async function () {
        await expect(
            owner.sendTransaction({
                to: reputation.target,
                value: ethers.parseEther("0.01")
            })
        ).to.be.reverted;
    });
});
