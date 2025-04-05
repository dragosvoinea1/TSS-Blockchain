
# ✅ 1/3 Implementare – Versiune Alpha-Alpha

Aceasta este versiunea incipientă a aplicației de testare a unei rețele blockchain. În această etapă am realizat documentarea, cercetarea prealabilă și am pregătit configurația de bază a mediului de lucru.

---

## 📘 State-of-the-Art – Analiză și documentare

### 🔍 Tema: *Testarea unei rețele Blockchain*

Testarea rețelelor blockchain este esențială pentru a garanta:
- **securitatea** tranzacțiilor,
- **consistența** datelor distribuite,
- **eficiența** contractelor smart,
- **scalabilitatea** aplicațiilor descentralizate (dApps).

---

### 📚 Resurse și articole științifice/documentații studiate

| Nr | Sursa | Tip | Conținut |
|----|-------|-----|----------|
| [1] | [Ethereum Whitepaper](https://ethereum.org/en/whitepaper/) | Web | Bază pentru înțelegerea contractelor inteligente |
| [2] | Atzei, Bartoletti, Cimoli – *A Survey of Attacks on Ethereum Smart Contracts* | PDF Articol | Identifică vulnerabilități testabile |
| [3] | [Hardhat Docs](https://hardhat.org/docs) | Web | Instrument de testare pentru Solidity |
| [4] | [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts/) | Web | Util pentru contracte ERC20 și controale de acces |
| [5] | [Chai Assertions](https://www.chaijs.com/api/bdd/) | Web | Pentru structurarea testelor în JS |

---

## 🔧 Analiza aplicațiilor existente (avantaje/dezavantaje)

| Aplicație | Avantaje | Dezavantaje |
|-----------|----------|-------------|
| Remix IDE | Interfață rapidă pentru testare rapidă | Limitat la debugging și integrare locală |
| Truffle | Suită completă | Configurare complexă, lentă la testare masivă |
| **Hardhat** ✅ (ales) | Rapid, modern, ușor de integrat cu JS/TS, personalizabil | Necesită setup inițial în linie de comandă |

---

## ⚙️ Setup Inițial

### 📁 Structura proiectului

```
/contracts
  MyToken.sol
  ReputationSystem.sol
  WeightedCalculator.sol

/test
  unit/
  security/
  integration/
  performance/

/scripts
  deploy.js

/frontend
  index.html
  app.js
  style.css

hardhat.config.js
README.md
```

---

### 📦 Tool-uri folosite

| Tehnologie | Rol |
|------------|-----|
| **Solidity** | Limbaj pentru contractele inteligente |
| **Hardhat** | Compilare, testare, rețea locală |
| **Ethers.js** | Interacțiune frontend–smart contract |
| **Chai** | Framework de testare pentru JS |
| **MetaMask** | Portofel pentru simulare utilizator |
| **HTML/CSS/JS** | Interfață utilizator pentru dApp |

---

## 🎯 Obiectivul versiunii Alpha-Alpha

- ✅ Documentare completă despre testarea blockchain
- ✅ Alegerea tehnologiilor și framework-urilor potrivite
- ✅ Setup complet de proiect Hardhat + frontend
- ✅ Primele contracte scrise (`MyToken`, `ReputationSystem`)
- ✅ Conectarea inițială wallet–frontend funcțională
- ✅ Primele teste de tip **unitare** și **manuale**

---
## 🧪 Unit Testing - Reputation System

This project includes a comprehensive suite of **unit tests** for the `ReputationSystem` smart contract. The purpose of these tests is to validate the core logic of each individual function and ensure the system behaves as expected under different conditions.

### ✅ What We Test

| Test Case                                      | Description                                                                 |
|-----------------------------------------------|-----------------------------------------------------------------------------|
| `addFeedback`                                  | Users can add feedback scores between 1 and 5.                              |
| `invalid feedback score`                       | Scores below 1 or above 5 are rejected.                                     |
| `onlyAdmin: penalizeUser()`                    | Only the contract owner can penalize users.                                 |
| `penalizeUser()`                               | Reduces the user's reputation score based on penalty.                       |
| `rewardUser()`                                 | Admin can reward users with tokens.                                         |
| `sendRewardWithEth()`                          | Admin can send ETH to users.                                                |
| `multiple feedbacks`                           | Weighted average is calculated properly from multiple scores.               |
| `event: FeedbackAdded`                         | Event is emitted when feedback is added.                                    |
| `insufficient token balance`                   | Reverts if contract lacks funds to reward.                                  |
| `getWeightedScore` (public view)               | Anyone can view a user's score.                                             |

### 🛠 Technologies Used

- **Hardhat** – Smart contract development and testing environment.
- **Chai** – Assertion library to validate test expectations.
- **Mocha** – JavaScript test runner used by Hardhat.
- **Ethers.js** – Interacting with smart contracts during tests.

### ▶️ Run Unit Tests

```bash
npx hardhat test
```
