# ClarityXO 🎮

A fully functional Tic-Tac-Toe game built on the Stacks blockchain using Clarity smart contracts. Play against an AI opponent with each move requiring an on-chain transaction signature. Features a beautiful neomorphic UI design.

![ClarityXO](https://img.shields.io/badge/Stacks-Blockchain-5546FF)
![Clarity](https://img.shields.io/badge/Smart_Contract-Clarity-purple)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)

## ✨ Features

### Blockchain Features
- ✅ **On-Chain Game State**: All game logic stored on Stacks blockchain
- ✅ **Transaction Signing**: Each move requires wallet signature
- ✅ **Smart Contract AI**: Computer opponent logic in Clarity
- ✅ **Win Detection**: Automatic win/loss/draw detection on-chain
- ✅ **Game Reset**: Start new games with blockchain transactions

### Frontend Features
- 🎨 **Neomorphic Design**: Soft UI with no gradients, pure shadows
- 🔐 **Wallet Integration**: Connect with Hiro or Leather wallet
- ⚡ **Real-Time Updates**: Board state polling for live updates
- 🎯 **Interactive Board**: Click cells to make moves
- 📊 **Game Status**: Clear display of turn, winner, and game state
- 🔄 **Loading States**: Transaction pending indicators

## 🛠 Technology Stack

### Blockchain
- **Stacks Blockchain**: Bitcoin Layer-2 for smart contracts
- **Clarity**: Smart contract language
- **Clarinet**: Development and testing framework

### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first styling
- **@stacks/connect**: Wallet integration
- **@stacks/transactions**: Transaction building
- **Lucide React**: Beautiful icons

## 📁 Project Structure

```
ClarityXO/
├── contracts/
│   └── tictactoe.clar          # Main game smart contract
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameBoard.tsx   # Game board component
│   │   │   └── WalletConnect.tsx # Wallet connection UI
│   │   ├── App.tsx             # Main app component
│   │   ├── auth.ts             # Wallet authentication
│   │   ├── config.ts           # Contract configuration
│   │   ├── contract.ts         # Contract read functions
│   │   ├── index.css           # Neomorphic styles
│   │   └── main.tsx            # App entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── Clarinet.toml
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) - Clarity development tool
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Hiro Wallet](https://wallet.hiro.so/) or [Leather Wallet](https://leather.io/)

### Smart Contract Deployment

1. **Using Hiro Sandbox (Recommended)**

   - Open [Hiro Sandbox](https://platform.hiro.so/sandbox)
   - Create a new project or open existing
   - Copy the contract from `contracts/tictactoe.clar`
   - Paste into the Sandbox editor
   - Click "Deploy" and confirm the transaction
   - Copy the deployed contract address

2. **Update Frontend Configuration**

   Edit `frontend/src/config.ts`:
   ```typescript
   export const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
   export const CONTRACT_NAME = 'tictactoe';
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to `http://localhost:5173`
   - Connect your Stacks wallet
   - Start playing!

## 🎮 How to Play

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve connection in Hiro/Leather wallet
   - Your address will appear in the header

2. **Start New Game**
   - Click "New Game" button
   - Sign the transaction in your wallet
   - Wait for confirmation

3. **Make Moves**
   - Click any empty cell to place your X
   - Sign the transaction
   - Computer automatically makes O move
   - Continue until someone wins or draw

4. **Game Over**
   - Winner or draw is announced
   - Click "New Game" to play again

## 🎨 Neomorphic Design System

ClarityXO uses a pure neomorphic (soft UI) design without any gradients:

### Color Palette
```css
--neo-bg: #e0e5ec           /* Background */
--neo-shadow-dark: #a3b1c6  /* Dark shadow */
--neo-shadow-light: #ffffff /* Light highlight */
--neo-text: #4a5568         /* Text color */
--neo-accent: #667eea       /* Accent color */
```

### Shadow Styles
- **Outset (Raised)**: `8px 8px 16px dark, -8px -8px 16px light`
- **Inset (Pressed)**: `inset 6px 6px 12px dark, inset -6px -6px 12px light`

### Components
- Board cells: Inset when empty, raised when filled
- Buttons: Raised effect with inset on click
- Cards: Large soft shadows for depth
- Status displays: Subtle inset backgrounds

## 📜 Smart Contract Functions

### Public Functions

- **`start-new-game()`**: Initialize a new game session
- **`make-move(row: uint, col: uint)`**: Player makes a move
- **`resign-game()`**: Forfeit current game

### Read-Only Functions

- **`get-board-state()`**: Returns current 3x3 board
- **`get-game-status()`**: Returns game status (active/finished)
- **`get-winner()`**: Returns winner or none
- **`get-current-turn()`**: Returns who should move next
- **`is-valid-move(row, col)`**: Check if move is valid

## 🔧 Development

### Build Frontend
```bash
cd frontend
npm run build
```

### Lint Code
```bash
npm run lint
```

### Test Smart Contract
```bash
clarinet test
```

### Preview Production Build
```bash
npm run preview
```

## 🌐 Network Configuration

The app is configured for **Stacks Testnet** by default. To use mainnet:

1. Update `frontend/src/config.ts`:
   ```typescript
   import { StacksMainnet } from '@stacks/network';
   export const NETWORK = new StacksMainnet();
   ```

2. Deploy contract to mainnet
3. Update `CONTRACT_ADDRESS` with mainnet deployment

## 🐛 Troubleshooting

### Wallet Won't Connect
- Ensure you have Hiro or Leather wallet installed
- Check that wallet is on testnet
- Refresh the page and try again

### Transaction Pending Forever
- Stacks testnet can be slow
- Wait 2-5 minutes for confirmation
- Check transaction on [Stacks Explorer](https://explorer.stacks.co/)

### Board Not Updating
- Wait for transaction confirmation
- Click "New Game" to refresh state
- Check browser console for errors

### Computer Not Making Moves
- Ensure transaction was confirmed
- Game state updates automatically
- Refresh page if needed

## 🎯 Future Enhancements

- [ ] AI difficulty levels (Easy, Medium, Hard with Minimax)
- [ ] Player vs Player mode
- [ ] On-chain statistics and leaderboard
- [ ] Sound effects and animations
- [ ] Dark mode theme
- [ ] Mobile-responsive improvements
- [ ] Tournament mode
- [ ] NFT rewards for winners

## 📝 License

MIT License - feel free to use this project for learning and building!

## 🙏 Acknowledgments

- Built with [Stacks](https://www.stacks.co/)
- UI inspired by neomorphic design principles
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

For questions or issues:
- Check the [Stacks Documentation](https://docs.stacks.co/)
- Join the [Stacks Discord](https://discord.gg/stacks)
- Review [Clarity Language Guide](https://docs.stacks.co/clarity/)

---

**Ready to play?** Deploy your contract, connect your wallet, and start playing ClarityXO! 🎮✨
