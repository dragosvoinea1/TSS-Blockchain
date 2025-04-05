const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReputationSystem - Unit Tests", function () {
    let MyToken, ReputationSystem, WeightedCalculator;
    let token, reputation, calculator;
    let owner, addr1, addr2;

    beforeEach(async function () {
        // Deployăm biblioteca WeightedCalculator
        WeightedCalculator = await ethers.getContractFactory("WeightedCalculator");
        calculator = await WeightedCalculator.deploy();
        await calculator.waitForDeployment();

        // Deployăm tokenul MyToken
        MyToken = await ethers.getContractFactory("MyToken");
        token = await MyToken.deploy(1000000);
        await token.waitForDeployment();

        // Deployăm contractul ReputationSystem cu biblioteca linkuită
        const ReputationSystemFactory = await ethers.getContractFactory("ReputationSystem", {
            libraries: {
                WeightedCalculator: calculator.target,
            },
        });
        reputation = await ReputationSystemFactory.deploy(token.target);
        await reputation.waitForDeployment();

        // Obținem semnatarii (owner și alți utilizatori)
        [owner, addr1, addr2] = await ethers.getSigners();
    });

    // ✅ Testăm adăugarea feedbackului și scorul ponderat
    it("Should add feedback and retrieve weighted score", async function () {
        await reputation.addFeedback(addr1.address, 5);
        const weightedScore = await reputation.getWeightedScore(addr1.address);
        expect(weightedScore).to.equal(5);
    });

    // ❌ Testăm că nu putem adăuga feedback invalid
    it("Should prevent invalid feedback scores", async function () {
        await expect(reputation.addFeedback(addr1.address, 0)).to.be.revertedWith("Score must be between 1 and 5");
        await expect(reputation.addFeedback(addr1.address, 10)).to.be.revertedWith("Score must be between 1 and 5");
    });

    // 🔐 Testăm permisiunile la penalizare
    it("Should allow only admin to penalize users", async function () {
        await expect(reputation.connect(addr1).penalizeUser(addr2.address, 2))
            .to.be.revertedWith("Only admin can call this function");
    });

    // ❌ Testăm penalizarea unui utilizator și scăderea scorului
    it("Should penalize user and reduce their score", async function () {
        await reputation.addFeedback(addr1.address, 5);
        const beforePenalty = await reputation.getWeightedScore(addr1.address);
        await reputation.penalizeUser(addr1.address, 2);
        const afterPenalty = await reputation.getWeightedScore(addr1.address);
        expect(afterPenalty).to.be.lessThan(beforePenalty);
    });

    // 🎁 Testăm recompensarea utilizatorului cu tokeni
    it("Should reward a user with tokens", async function () {
        await token.transfer(reputation.target, 100);
        await reputation.rewardUser(addr1.address, 50);
        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(50);
    });

    // 💸 Testăm trimiterea de ETH către un utilizator
    it("Should send ETH to a user", async function () {
        const initialBalance = await ethers.provider.getBalance(addr1.address);
        const tx = await reputation.sendRewardWithEth(addr1.address, { value: ethers.parseEther("0.01") });
        await tx.wait();
        const newBalance = await ethers.provider.getBalance(addr1.address);
        expect(newBalance).to.be.above(initialBalance);
    });

    // 🔁 Testăm feedback multiplu și verificăm dacă scorul ponderat este media corectă
    it("Should calculate correct weighted score with multiple feedbacks", async function () {
        await reputation.addFeedback(addr1.address, 5);
        await reputation.addFeedback(addr1.address, 3);
        await reputation.addFeedback(addr1.address, 4);
        const score = await reputation.getWeightedScore(addr1.address);
        expect(score).to.equal(4); // media între 5, 3 și 4
    });

    // ❌ Testăm penalizarea multiplă și ne asigurăm că scorul scade de fiecare dată
    it("Should reduce score correctly with multiple penalties", async function () {
        await reputation.addFeedback(addr1.address, 5);
        const initialScore = await reputation.getWeightedScore(addr1.address);

        await reputation.penalizeUser(addr1.address, 2);
        const midScore = await reputation.getWeightedScore(addr1.address);
        expect(midScore).to.be.lessThan(initialScore);

        await reputation.penalizeUser(addr1.address, 3);
        const finalScore = await reputation.getWeightedScore(addr1.address);
        expect(finalScore).to.be.lessThan(midScore);
    });

    // 📢 Testăm dacă evenimentul FeedbackAdded este emis corect când se adaugă feedback
    it("Should emit FeedbackAdded event with correct parameters", async function () {
        await expect(reputation.addFeedback(addr1.address, 4))
            .to.emit(reputation, "FeedbackAdded")
            .withArgs(addr1.address, 4);
    });

    // 💸 Testăm dacă recompensa eșuează dacă contractul nu are fonduri suficiente
    it("Should fail to reward tokens if balance is insufficient", async function () {
        await expect(reputation.rewardUser(addr1.address, 100))
            .to.be.reverted; // orice revert e acceptat
    });

    // 🔓 Testăm dacă oricine poate apela getWeightedScore (funcție doar view)
    it("Should allow anyone to read the weighted score", async function () {
        await reputation.addFeedback(addr1.address, 5);
        const score = await reputation.connect(addr2).getWeightedScore(addr1.address);
        expect(score).to.equal(5);
    });
});
