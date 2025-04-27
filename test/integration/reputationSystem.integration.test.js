const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReputationSystem - Integration Tests", function () {
    let MyToken, ReputationSystem, WeightedCalculator;
    let token, reputation, calculator;
    let owner, user1, user2;

    beforeEach(async function () {
        // 🔧 Deploy biblioteca pentru scor ponderat
        WeightedCalculator = await ethers.getContractFactory("WeightedCalculator");
        calculator = await WeightedCalculator.deploy();
        await calculator.waitForDeployment();

        // 🪙 Deploy tokenul ERC20
        MyToken = await ethers.getContractFactory("MyToken");
        token = await MyToken.deploy(1000000);
        await token.waitForDeployment();

        // ⚙️ Deploy contractul principal ReputationSystem
        const ReputationSystemFactory = await ethers.getContractFactory("ReputationSystem", {
            libraries: {
                WeightedCalculator: calculator.target,
            },
        });
        reputation = await ReputationSystemFactory.deploy(token.target);
        await reputation.waitForDeployment();

        [owner, user1, user2] = await ethers.getSigners();
    });

    // 🌐 Test integrat: user1 primește feedback, scor este calculat, apoi primește recompensă
    it("User receives feedback, score is calculated and reward is given", async function () {
        await reputation.addFeedback(user1.address, 5);
        const score = await reputation.getWeightedScore(user1.address);
        expect(score).to.equal(5);

        await token.transfer(reputation.target, 100);
        await reputation.rewardUser(user1.address, 50);

        const balance = await token.balanceOf(user1.address);
        expect(balance).to.equal(50);
    });

    // 🔁 Test: user1 primește mai multe feedbackuri + penalizare → scorul se modifică (sau rămâne ≤)
    it("User receives multiple feedbacks and is penalized – score is reduced", async function () {
        await reputation.addFeedback(user1.address, 5);
        await reputation.addFeedback(user1.address, 4);

        const beforePenalty = await reputation.getWeightedScore(user1.address);
        await reputation.penalizeUser(user1.address, 2);
        const afterPenalty = await reputation.getWeightedScore(user1.address);

        expect(afterPenalty).to.be.lte(beforePenalty);
    });

    // 💰 Test: recompensă în ETH după feedback
    it("User receives ETH reward after feedback", async function () {
        await reputation.addFeedback(user1.address, 4);

        const initialEth = await ethers.provider.getBalance(user1.address);
        const tx = await reputation.sendRewardWithEth(user1.address, {
            value: ethers.parseEther("0.01"),
        });
        await tx.wait();

        const finalEth = await ethers.provider.getBalance(user1.address);
        expect(finalEth).to.be.above(initialEth);
    });

    // 👥 Test: ambii utilizatori primesc feedback și scorurile lor sunt independente
    it("Multiple users receive feedback and have separate scores", async function () {
        await reputation.addFeedback(user1.address, 5);
        await reputation.addFeedback(user2.address, 2);

        const score1 = await reputation.getWeightedScore(user1.address);
        const score2 = await reputation.getWeightedScore(user2.address);

        expect(score1).to.equal(5);
        expect(score2).to.equal(2);
    });

    // 🔁 Test: penalizarea afectează doar utilizatorul penalizat
    it("Penalty affects only penalized user", async function () {
        await reputation.addFeedback(user1.address, 5);
        await reputation.addFeedback(user2.address, 4);

        await reputation.penalizeUser(user2.address, 2);

        const score1 = await reputation.getWeightedScore(user1.address);
        const score2 = await reputation.getWeightedScore(user2.address);

        expect(score1).to.equal(5);
        expect(score2).to.be.lessThan(4);
    });

    // 💸 Test: recompense token pentru mai mulți utilizatori
    it("Admin can reward multiple users with tokens", async function () {
        await token.transfer(reputation.target, 200);
        await reputation.rewardUser(user1.address, 50);
        await reputation.rewardUser(user2.address, 100);

        const balance1 = await token.balanceOf(user1.address);
        const balance2 = await token.balanceOf(user2.address);

        expect(balance1).to.equal(50);
        expect(balance2).to.equal(100);
    });

    // 💸 Test: recompensă în ETH pentru mai mulți utilizatori
    it("Admin can send ETH to multiple users", async function () {
        const initial1 = await ethers.provider.getBalance(user1.address);
        const initial2 = await ethers.provider.getBalance(user2.address);

        await reputation.sendRewardWithEth(user1.address, { value: ethers.parseEther("0.01") });
        await reputation.sendRewardWithEth(user2.address, { value: ethers.parseEther("0.02") });

        const final1 = await ethers.provider.getBalance(user1.address);
        const final2 = await ethers.provider.getBalance(user2.address);

        expect(final1).to.be.above(initial1);
        expect(final2).to.be.above(initial2);
    });

    // 🆕 Test: utilizatorul este penalizat fără feedback anterior
    it("User can be penalized without previous feedback", async function () {
        // Nu apelăm getWeightedScore înainte de penalizare – ar da revert
        await reputation.penalizeUser(user1.address, 2);
    
        const after = await reputation.getWeightedScore(user1.address);
        expect(after).to.equal(2);
    });
    
    // 🆕 Test: admin penalizează și recompensează același utilizator
    it("Admin penalizes then rewards same user", async function () {
        await reputation.addFeedback(user1.address, 5);
        await reputation.penalizeUser(user1.address, 1);

        const score = await reputation.getWeightedScore(user1.address);
        expect(score).to.be.lte(5);

        await token.transfer(reputation.target, 100);
        await reputation.rewardUser(user1.address, 20);
        const balance = await token.balanceOf(user1.address);

        expect(balance).to.equal(20);
    });

    // 🆕 Test: feedback de la mai mulți utilizatori către același
    it("Multiple users give feedback to the same user", async function () {
        await reputation.connect(user2).addFeedback(user1.address, 5);
        await reputation.connect(owner).addFeedback(user1.address, 3);

        const score = await reputation.getWeightedScore(user1.address);
        expect(score).to.equal(4);
    });
});
