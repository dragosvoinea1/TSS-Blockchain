const { ethers } = require("hardhat");
const { expect } = require("chai");
const { performance } = require("perf_hooks");

describe("ReputationSystem - Performance Tests (Extended)", function () {
    let token, reputation, calculator;
    let owner, user;

    beforeEach(async function () {
        const WeightedCalculator = await ethers.getContractFactory("WeightedCalculator");
        calculator = await WeightedCalculator.deploy();
        await calculator.waitForDeployment();

        const MyToken = await ethers.getContractFactory("MyToken");
        token = await MyToken.deploy(10_000_000);
        await token.waitForDeployment();

        const ReputationSystemFactory = await ethers.getContractFactory("ReputationSystem", {
            libraries: {
                WeightedCalculator: calculator.target,
            },
        });
        reputation = await ReputationSystemFactory.deploy(token.target);
        await reputation.waitForDeployment();

        [owner, user] = await ethers.getSigners();
    });

    // ⏱️ Test: 100 feedback-uri
    it("Performance: add 100 feedbacks", async function () {
        const start = performance.now();
        for (let i = 0; i < 100; i++) {
            await reputation.addFeedback(user.address, 5);
        }
        const end = performance.now();
        console.log(`✅ 100 feedbacks in ${(end - start).toFixed(2)} ms`);
    });

    // 🔥 Test de stres: 1000 feedback-uri
    it("Stress Test: add 1000 feedbacks", async function () {
        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
            await reputation.addFeedback(user.address, (i % 5) + 1);
        }
        const end = performance.now();
        console.log(`🔥 1000 feedbacks in ${(end - start).toFixed(2)} ms`);
    });

    // ⛽ Gas: addFeedback
    it("Gas Profile: addFeedback", async function () {
        const tx = await reputation.addFeedback(user.address, 4);
        const receipt = await tx.wait();
        console.log(`⛽ addFeedback gas: ${receipt.gasUsed.toString()}`);
        expect(typeof receipt.gasUsed).to.equal("bigint");
    });
    
    // ⛽ Gas: penalizeUser
    it("Gas Profile: penalizeUser", async function () {
        await reputation.addFeedback(user.address, 5);
        const tx = await reputation.penalizeUser(user.address, 2);
        const receipt = await tx.wait();
        console.log(`⛽ penalizeUser gas: ${receipt.gasUsed.toString()}`);
    });

    // ⛽ Gas: rewardUser
    it("Gas Profile: rewardUser", async function () {
        await token.transfer(reputation.target, 1000);
        const tx = await reputation.rewardUser(user.address, 100);
        const receipt = await tx.wait();
        console.log(`⛽ rewardUser gas: ${receipt.gasUsed.toString()}`);
    });

    // ⛽ Gas: sendRewardWithEth
    it("Gas Profile: sendRewardWithEth", async function () {
        const tx = await reputation.sendRewardWithEth(user.address, {
            value: ethers.parseEther("0.01")
        });
        const receipt = await tx.wait();
        console.log(`⛽ sendRewardWithEth gas: ${receipt.gasUsed.toString()}`);
    });

   // ⚖️ Feedback de la 20 de utilizatori diferiți)
it("Scalability: feedback from 20 different users", async function () {
    const signers = (await ethers.getSigners()).slice(0, 20);
    const start = performance.now();

    for (let i = 0; i < signers.length; i++) {
        await reputation.connect(signers[i]).addFeedback(user.address, (i % 5) + 1);
    }

    const end = performance.now();
    console.log(`👥 20 users gave feedback in ${(end - start).toFixed(2)} ms`);
});


    // 🔁 Penalizări repetate
    it("Performance: 50 repeated penalties", async function () {
        await reputation.addFeedback(user.address, 5);
        const start = performance.now();
        for (let i = 0; i < 50; i++) {
            await reputation.penalizeUser(user.address, 2);
        }
        const end = performance.now();
        console.log(`🚫 50 penalties in ${(end - start).toFixed(2)} ms`);
    });

    // 🧠 Test combinat: feedback + penalizare + recompensă
    it("Combined performance test: feedback + penalty + reward", async function () {
        await token.transfer(reputation.target, 1000);
        const start = performance.now();

        for (let i = 0; i < 50; i++) {
            await reputation.addFeedback(user.address, 4);
            if (i % 10 === 0) await reputation.penalizeUser(user.address, 2);
            if (i % 15 === 0) await reputation.rewardUser(user.address, 20);
        }

        const end = performance.now();
        console.log(`🧠 Combined test (50 iterations): ${(end - start).toFixed(2)} ms`);
    });

    // 🧍 Test scor cu 1000 feedback-uri
    it("Edge Case: score after 1000 feedbacks", async function () {
        for (let i = 0; i < 1000; i++) {
            await reputation.addFeedback(user.address, 5);
        }
        const score = await reputation.getWeightedScore(user.address);
        expect(score).to.equal(5);
    });
});
