// Conectare wallet, initializare contracte, verificare admin, afisare balanta, sendTokens + addFeedback

document.getElementById("connectWallet").addEventListener("click", async () => {
    if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    const walletAddress = await signer.getAddress();
    localStorage.setItem("connectedWallet", walletAddress);
    document.getElementById("walletInfo").innerText = `Wallet: ${walletAddress}`;

    const balance = await provider.getBalance(walletAddress);
    document.getElementById("walletBalance").innerText = `Balance: ${ethers.utils.formatEther(balance)} ETH`;

    // initializare contracte
    myToken = new ethers.Contract(contractAddresses.MyToken, abiMyToken, signer);
    reputationSystem = new ethers.Contract(contractAddresses.ReputationSystem, abiReputationSystem, signer);

    console.log("Contracts connected:", { myToken, reputationSystem });

    // afisare balanta + verificare admin
    await updateConnectedUserBalance();
    await checkAdminStatus();
    toggleFunctionalityVisibility();
});

async function checkAdminStatus() {
    try {
        const adminAddress = await reputationSystem.owner();
        const walletAddress = await signer.getAddress();
        isAdmin = adminAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
        isAdmin = false;
    }
}

async function updateConnectedUserBalance() {
    try {
        const walletAddress = await signer.getAddress();
        const balance = await myToken.balanceOf(walletAddress);
        document.getElementById("connectedTokenBalance").innerText = 
            `MyToken Balance: ${ethers.utils.formatUnits(balance, 18)} MYT`;
    } catch (error) {
        document.getElementById("connectedTokenBalance").innerText = "MyToken Balance: Error";
    }
}

document.getElementById("sendTokens").addEventListener("click", async () => {
    const recipient = document.getElementById("recipient").value;
    const amount = document.getElementById("amount").value;

    try {
        if (!myToken) {
            throw new Error("Contract MyToken nu este conectat!");
        }

        if (!ethers.utils.isAddress(recipient)) {
            throw new Error("Recipient address is invalid!");
        }

        const tx = await myToken.transfer(recipient, ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        document.getElementById("transactionStatus").innerText = "Tokens sent successfully!";
    } catch (error) {
        document.getElementById("transactionStatus").innerText = `Error: ${error.message}`;
        console.error("Error sending tokens:", error);
    }
});

document.getElementById("addFeedback").addEventListener("click", async () => {
    const userAddress = document.getElementById("feedbackUser").value;
    const score = document.getElementById("feedbackScore").value;

    try {
        if (!reputationSystem) {
            throw new Error("Contract ReputationSystem nu este conectat!");
        }
        if (score < 1 || score > 5) {
            throw new Error("Score must be between 1 and 5");
        }

        const tx = await reputationSystem.addFeedback(userAddress, score);
        await tx.wait();
        document.getElementById("feedbackStatus").innerText = "Feedback added successfully!";
    } catch (error) {
        document.getElementById("feedbackStatus").innerText = `Error: ${error.message}`;
        console.error("Error adding feedback:", error);
    }
});
