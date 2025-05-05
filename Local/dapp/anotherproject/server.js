const express = require('express');
const path = require('path');

const app = express();

// Serve the 'public' directory (contains index.html and app.js)
app.use(express.static(path.join(__dirname, 'test')));

// Serve Truffle build contracts directory
app.use('/contracts', express.static(path.join(__dirname, 'build/contracts')));

// Serve contract address file (you placed it in src/contracts)
app.use('/src-contracts', express.static(path.join(__dirname, 'src/contracts')));

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});