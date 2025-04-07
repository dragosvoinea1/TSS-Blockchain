
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
## 🧪 Testare Unitară – Reputation System

Acest proiect include o suită de **teste unitare** pentru contractul inteligent `ReputationSystem`. Scopul acestor teste este de a valida logica principală a fiecărei funcții și de a asigura că sistemul se comportă conform așteptărilor în diferite condiții.

### ✅ Ce testăm

| Caz de testare                                 | Descriere                                                                 |
|------------------------------------------------|---------------------------------------------------------------------------|
| `addFeedback`                                  | Utilizatorii pot adăuga scoruri de feedback între 1 și 5.                 |
| `scor de feedback invalid`                     | Scorurile sub 1 sau peste 5 sunt respinse.                                |
| `onlyAdmin: penalizeUser()`                    | Doar proprietarul contractului poate penaliza utilizatori.               |
| `penalizeUser()`                               | Scade scorul de reputație al utilizatorului pe baza penalizării.          |
| `rewardUser()`                                 | Administratorul poate recompensa utilizatorii cu token-uri.              |
| `sendRewardWithEth()`                          | Administratorul poate trimite ETH utilizatorilor.                        |
| `multiple feedbacks`                           | Media ponderată este calculată corect din mai multe scoruri.              |
| `eveniment: FeedbackAdded`                     | Se emite un eveniment când este adăugat un feedback.                      |
| `sold insuficient de token-uri`                | Tranzacția este anulată dacă contractul nu are fonduri pentru recompense. |
| `getWeightedScore` (funcție `view` publică)    | Oricine poate vedea scorul de reputație al unui utilizator.               |

---

### 🛠 Tehnologii utilizate

- **Hardhat** – Mediu de dezvoltare și testare pentru contracte inteligente.
- **Chai** – Bibliotecă de aserțiuni pentru validarea rezultatelor așteptate.
- **Mocha** – Motor de testare JavaScript, integrat în Hardhat.
- **Ethers.js** – Interfață pentru interacțiunea cu contractele inteligente în timpul testelor.

---

### ▶️ Rulare teste unitare

```bash
npx hardhat test
```
