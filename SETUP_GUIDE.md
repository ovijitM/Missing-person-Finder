# 🚀 Missing Persons DApp - Complete Setup Guide

Your Missing Persons smart contract DApp is now **fully functional and ready to run!**

## ⚡ Quick Start (5 Minutes)

### Step 1: Start Ganache Blockchain

Open a **new terminal/PowerShell** window:

```powershell
npx ganache -p 8585 --deterministic
```

✓ Keep this terminal running - it's your local blockchain

### Step 2: Compile Smart Contract

Open another **new terminal** and run:

```powershell
cd e:\Blockchain\Missing-person-Finder
npx truffle compile
```

✓ You should see: `Compiled successfully`

### Step 3: Deploy Contract

In the same terminal, run:

```powershell
npx truffle migrate --reset
```

⚠️ **Note:** If this hangs, skip to "Step 3 Alternative" below

### Step 3 Alternative: Browser Deployment (Recommended)

If `truffle migrate` is slow, use our browser deployer instead:

1. Open `frontend/deploy-contract.html` in your browser
2. Install MetaMask if needed
3. Add Ganache network to MetaMask:
   - Network name: `Ganache Local`
   - RPC URL: `http://localhost:8585`
   - Chain ID: `1337`
4. Click the "Deploy Contract Now" button
5. **Copy the contract address** shown on screen

### Step 4: Update Configuration

1. Open `frontend/config.js` in your editor
2. Replace this line:

```javascript
const CONTRACT_ADDRESS = "0x5FbDB2315678afccb333f8a2c45a7d5cccb1b5c7";
```

3. With the actual contract address from Step 3 (the one you copied)

### Step 5: Import Ganache Accounts into MetaMask

From the Ganache terminal output, copy any **Private Key** and:

1. Click MetaMask → Import Account
2. Paste the private key
3. Repeat for a few accounts (to test different roles)

**First Private Key (for admin):**

```
0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
```

### Step 6: Open the DApp

Open `frontend/index.html` in your browser (just double-click it or use `file:///` URL)

✓ **You're done!** The app is fully functional!

---

## 📋 Available Accounts in Ganache

```
Account 0: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1 (1000 ETH)
Account 1: 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0 (1000 ETH)
Account 2: 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b (1000 ETH)
... and 7 more accounts
```

---

## 🎯 Testing Scenarios

### Scenario 1: Register as Reporter

1. Connect account 0 to the app
2. Go to **Register** tab
3. Fill in: Name, NID (10 digits), Division, select Role = "Reporter"
4. Click "Register"
5. Refresh page - now you see Reporter tabs

### Scenario 2: Register as Investigator

1. Switch to account 1 in MetaMask
2. Reload the app
3. Register with Role = "Investigator"
4. Investigator tabs appear

### Scenario 3: Report Missing Person & Book Appointment

1. **As Reporter (Account 0):**
   - Go to "Report Missing Person" tab
   - Fill in case details
   - Click "Report"

2. **As Investigator (Account 1):**
   - Go to "My Schedule" tab
   - Book appointment for the reported case

3. **As Reporter (Account 0):**
   - Go to "Search Cases" tab
   - See the updated appointment

### Scenario 4: Admin Actions

1. Register Account 0 with Role = "Admin" (role value: 0)
2. Admin sees special tabs:
   - Update Case Status
   - Assign Investigator
   - Withdraw Funds

---

## 🏗️ Project Structure

```
Missing-person-Finder/
├── frontend/
│   ├── index.html              ← Main DApp interface
│   ├── deploy-contract.html    ← One-click deployment
│   ├── deploy.html             ← Setup instructions
│   ├── app.js                  ← Web3 integration & logic
│   ├── config.js               ← Contract address & ABI
│   ├── styles.css              ← Modern dark theme UI
│   └── package.json
│
├── contracts/
│   └── MissingPersonsSystem.sol ← Smart contract
│
├── migrations/
│   └── 1_project.js             ← Deployment script
│
├── truffle-config.js            ← Truffle configuration
├── package.json
└── README.md (this file)
```

---

## ✨ Features

### Smart Contract (Solidity)

- ✅ Register users with roles (Admin, Reporter, Investigator)
- ✅ Report missing persons
- ✅ Book appointments with investigators
- ✅ Update case status
- ✅ Withdraw funds for investigators
- ✅ Retrieve cases by division
- ✅ View investigator schedules

### Frontend (HTML/CSS/JS)

- ✅ Modern dark theme with glassmorphism
- ✅ 6 tab-based interface
- ✅ Full Web3/MetaMask integration
- ✅ Automatic role detection
- ✅ Role-based access control (RBAC)
- ✅ Form validation
- ✅ Real-time alerts
- ✅ Responsive design (mobile/tablet/desktop)

### Security

- ✅ Permission checks on sensitive functions
- ✅ Tab visibility based on user role
- ✅ Unregistered users can't perform actions
- ✅ Role validation on contract-level
- ✅ Smart error messages

---

## 🔧 Troubleshooting

### ❌ "Could not connect to node at http://127.0.0.1:8585"

**Solution:** Make sure Ganache is running

```powershell
npx ganache -p 8585 --deterministic
```

### ❌ "Unrecognized Chain ID in MetaMask"

**Solution:** Add Ganache network with:

- Chain ID: `1337`
- RPC: `http://localhost:8585`

### ❌ "Please connect MetaMask first"

**Solution:**

- Install MetaMask browser extension
- Click "Connect MetaMask" button in app
- Approve the connection request

### ❌ "Invalid contract address"

**Solution:**

- Make sure you copied the correct address from deployment
- Update `frontend/config.js` with the new address
- Refresh the browser page

### ❌ "Function not callable - permissions denied"

**Solution:**

- Make sure your account is registered with the correct role
- Click "Register" tab if you haven't registered yet
- The app will auto-detect your role after registration

### ❌ "Network request failed"

**Solution:**

- Check that Ganache is still running
- Verify MetaMask is connected to Ganache network
- Try refreshing the page

---

## 📝 Key Files Explained

### `frontend/index.html`

The main user interface with 6 tabs:

- **Register:** Sign up as a user (Admin/Reporter/Investigator)
- **Report Missing Person:** Report missing cases (Reporters)
- **Search Cases:** View and search all cases (Everyone)
- **My Schedule:** Manage appointments (Investigators)
- **Admin:** Manage system & withdraw funds (Admins only)
- **Statistics:** View system stats (Everyone)

### `frontend/config.js`

Configuration file containing:

- `CONTRACT_ADDRESS`: The deployed contract address (you need to update this!)
- `CONTRACT_ABI`: The contract interface definition
- Enums for roles, status, urgency, and divisions

### `frontend/app.js`

Core JavaScript logic:

- Web3.js initialization
- MetaMask connection handling
- Role-based access control
- Form submission handlers
- Contract function calls

### `frontend/styles.css`

Modern UI styling with:

- Dark theme (dark blue/slate gradients)
- Glassmorphism effects
- Smooth animations
- Responsive design
- Color scheme (indigo, pink, cyan)

---

## 🌐 Roles & Permissions

### Admin (Role: 0)

- ✅ Register users
- ✅ Update case status
- ✅ Assign investigators
- ✅ Withdraw funds
- ✅ View all data

### Reporter (Role: 1)

- ✅ Register users
- ✅ Report missing persons
- ✅ Book appointments with investigators
- ✅ Search and view cases
- ✅ View statistics

### Investigator (Role: 2)

- ✅ Register users
- ✅ View my schedule
- ✅ View available slots
- ✅ Search and view cases
- ✅ View statistics

---

## 🔐 Security Notes

1. **Private Keys:** Never share the private keys shown in Ganache
2. **MetaMask:** Use MetaMask only on trusted networks
3. **Contract:** The contract is deployed locally - it's not on mainnet
4. **Permissions:** The system enforces role-based permissions on both frontend and contract level

---

## 📚 Technology Stack

- **Blockchain:** Ethereum (via Ganache local testnet)
- **Smart Contract:** Solidity 0.8.19
- **Frontend Framework:** Vanilla HTML/CSS/JavaScript (no dependencies!)
- **Web3 Library:** Web3.js v1.10.0
- **Wallet:** MetaMask
- **Deployment:** Truffle Suite

---

## 💡 Next Steps

1. ✅ Deploy the contract (using deploy-contract.html or truffle)
2. ✅ Update CONTRACT_ADDRESS in config.js
3. ✅ Import Ganache accounts into MetaMask
4. ✅ Test the complete flow with different roles
5. 🚀 Customize and extend as needed!

---

## 🎓 Learning Resources

- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [MetaMask Developer Guide](https://docs.metamask.io/)
- [Ganache Documentation](https://ganache.readthedocs.io/)
- [Truffle Suite Documentation](https://trufflesuite.com/docs/)
- [Solidity Documentation](https://docs.soliditylang.org/)

---

## 📞 Support

If you encounter issues:

1. Check the Troubleshooting section above
2. Look at the browser console (F12) for error messages
3. Make sure all prerequisites are installed
4. Restart Ganache and reload the page

---

**🎉 Your DApp is ready to go! Happy exploring!**
