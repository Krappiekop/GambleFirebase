import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { Container, Typography, Button, Grid, IconButton, Snackbar, Alert, MenuItem, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import Leaderboard from './Leaderboard';
import './Mines.css';

function Mines() {
    const [balance, setBalance] = useState(0);
    const [minesField, setMinesField] = useState(Array(25).fill('tile'));
    const [selectedTiles, setSelectedTiles] = useState([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [minesCount, setMinesCount] = useState(3);
    const [betAmount, setBetAmount] = useState(1);
    const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
    const [gemsCount, setGemsCount] = useState(0);
    const navigate = useNavigate();

    const payoutMatrix = [
        [1.01, 1.08, 1.12, 1.18, 1.24, 1.3, 1.37, 1.46, 1.55, 1.65, 1.77, 1.9, 2.06, 2.25, 2.47, 2.75, 3.09, 3.54, 4.12, 4.95, 6.19, 8.25, 12.37, 24.75],
        [1.08, 1.17, 1.29, 1.41, 1.56, 1.74, 1.94, 2.18, 2.47, 2.83, 3.26, 3.81, 4.5, 5.26, 6.6, 8.25, 10.61, 14.14, 19.8, 29.7, 49.5, 99, 297],
        [1.12, 1.29, 1.48, 1.71, 2.02, 2.35, 2.79, 3.35, 4.07, 4.95, 6.16, 7.96, 10.35, 13.85, 18.97, 27.11, 40.66, 65.06, 113.85, 227.7, 569.3, 2277],
        [1.18, 1.41, 1.71, 2.09, 2.58, 3.23, 4.09, 5.26, 6.88, 9.17, 12.51, 17.56, 25.35, 37.95, 59.64, 99.39, 178.91, 357.81, 834.9, 2504, 12523],
        [1.24, 1.56, 2.02, 2.58, 3.35, 4.3, 5.46, 7.03, 9.52, 13.01, 18.35, 27.02, 40.87, 71.25, 131.42, 208.72, 417.45, 939.26, 2504, 8768, 52598],
        [1.3, 1.74, 2.35, 3.23, 4.3, 5.46, 7.49, 10.01, 14.17, 21.89, 32.32, 58.38, 102.17, 189.75, 379.5, 834.9, 2087, 6261, 25047, 175329],
        [1.37, 1.94, 2.79, 3.95, 5.46, 7.49, 10.44, 14.97, 24.47, 41.18, 73.95, 138.66, 277.33, 600.87, 1442, 3965, 13219, 59486, 475893],
        [1.46, 2.18, 3.35, 4.87, 6.88, 10.44, 14.97, 24.47, 41.18, 73.95, 138.66, 277.33, 600.87, 1442, 3965, 13219, 59486, 475893],
        [1.55, 2.47, 4.07, 6.88, 12.04, 21.89, 39.65, 83.2, 176.8, 404.1, 1010, 2282, 4913, 2163, 6489, 23794, 118973, 1070759],
        [1.65, 2.83, 4.95, 8.32, 14.17, 26.63, 54.4, 107.7, 233.6, 538.38, 1134, 4041.1, 1010, 2282, 4913, 36773, 202254, 2022545],
        [1.77, 3.35, 6.16, 10.1, 17.82, 34.3, 77.8, 138.66, 356.56, 1010, 2282, 11314, 56574, 11314, 3232, 12113, 59054, 4412826],
        [1.9, 3.81, 7.96, 15.27, 31.5, 67.07, 140.7, 277.33, 831.98, 2828, 1314, 56574, 390622, 514892, 514892, 3236072],
        [1.99, 4.38, 10.0, 20.17, 48.07, 101.07, 207.33, 448.86, 831.98, 2828, 1166, 4093, 367735, 514892, 514892],
        [2.18, 4.5, 13.83, 27.95, 55.5, 118.9, 244.2, 408.78, 1166, 1166, 4093, 367735, 514892, 514892],
        [2.35, 5.4, 18.37, 39.5, 87.33, 146.2, 284.68, 6489, 408.78, 1166, 1166, 4093, 367735],
        [2.58, 6.1, 22.7, 59.6, 99.39, 178.91, 357.81, 118973, 408.78, 2022545],
        [2.75, 7.71, 40.66, 65.06, 113.85, 227.7, 569.3, 2277],
        [3.09, 10.01, 40.66, 65.06, 113.85, 227.7, 569.3],
        [4.12, 19.8, 113.85, 227.7, 569.3],
        [4.95, 49.5, 227.7],
        [8.25, 99],
        [24.75]
    ];
    
    useEffect(() => {
        if (!auth.currentUser) {
            navigate('/login');
        } else {
            loadUserData();
            resetGame();
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out: ', error);
        }
    };

    const calculatePayout = (mines, diamonds) => {
        if (mines >= 1 && mines <= 24 && diamonds >= 1 && diamonds <= 24) {
            return payoutMatrix[diamonds - 1][mines - 1];
        }
        return 0;
    };

    const loadUserData = async () => {
        try {
            const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                setBalance(userDoc.data().balance);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const updateUserData = async (newBalance) => {
        try {
            const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
            await updateDoc(userDocRef, {
                balance: newBalance
            });
            setBalance(newBalance);
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    const resetGame = () => {
        setIsGameOver(false);
        setSelectedTiles([]);
        setGameStarted(false);
        setMinesField(Array(25).fill('tile'));  // Reset the field but show tiles
        setCurrentMultiplier(1.0);
        setGemsCount(0);
    };

    const generateMinesField = () => {
        const newField = Array(25).fill('diamond');
        for (let i = 0; i < minesCount; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * 25);
            } while (newField[randomIndex] === 'mine');
            newField[randomIndex] = 'mine';
        }
        return newField;
    };

    const handleTileClick = (index) => {
        if (isGameOver || selectedTiles.includes(index) || !gameStarted) return;

        const newSelectedTiles = [...selectedTiles, index];
        setSelectedTiles(newSelectedTiles);

        if (minesField[index] === 'mine') {
            setIsGameOver(true);
            setSnackbarSeverity('error');
            setSnackbarMessage('Boom! You hit a mine!');
            setShowSnackbar(true);
            revealAllMines();
        } else {
            const diamondsCollected = newSelectedTiles.length;
            const multiplier = payoutMatrix[diamondsCollected - 1][minesCount - 1];
            setCurrentMultiplier(multiplier);
            setGemsCount(diamondsCollected);
            setSnackbarSeverity('success');
            setSnackbarMessage(`Safe! Multiplier: x${multiplier.toFixed(2)}`);
            setShowSnackbar(true);
        }
    };

    const revealAllMines = () => {
        const allTiles = Array.from({ length: 25 }, (_, i) => i);
        setSelectedTiles(allTiles);
    };

    const handleCloseSnackbar = () => {
        setShowSnackbar(false);
    };

    const startGame = () => {
        // Check if balance is sufficient before starting the game
        if (balance >= betAmount) {
            const newMinesField = generateMinesField();
            setMinesField(newMinesField);
            setGameStarted(true);
            // Deduct bet amount from balance
            const newBalance = Math.max(balance - betAmount, 0);
            updateUserData(newBalance);
        } else {
            setSnackbarSeverity('error');
            setSnackbarMessage('Insufficient balance to start the game.');
            setShowSnackbar(true);
        }
    };

    const handleBetChange = (e) => {
        setBetAmount(parseInt(e.target.value));
    };

    const handleMinesChange = (e) => {
        setMinesCount(parseInt(e.target.value));
    };

    const handleRandomTileClick = () => {
        if (!gameStarted || isGameOver) return;

        let availableTiles = minesField.map((tile, index) => index).filter((index) => !selectedTiles.includes(index));

        if (availableTiles.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableTiles.length);
            handleTileClick(availableTiles[randomIndex]);
        }
    };

    const handleCashout = () => {
        if (!gameStarted || isGameOver) return;

        const profit = Math.round(betAmount * currentMultiplier); // Round the profit to the nearest integer
        const newBalance = balance + profit;
        updateUserData(newBalance);
        resetGame();
    };

    return (
        <Container style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', position: 'relative', paddingBottom: '40px' }}>
            <Leaderboard />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '20px' }}>
                <ArrowBackIcon onClick={() => navigate('/games')} style={{ cursor: 'pointer' }} />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate('/profile')}>
                        <AccountCircleIcon />
                    </IconButton>
                    <Button variant="contained" color="primary" onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</Button>
                </div>
            </div>
            <Typography variant="h3" gutterBottom style={{ marginTop: '20px' }}>
                Mines
            </Typography>
            <div style={{ borderBottom: '2px solid #ccc', marginBottom: '20px' }}></div>
            <Typography variant="h5" gutterBottom style={{ marginBottom: '30px' }}>${balance}</Typography>

            <div className="game-container">
                <div className="menu-container">
                    <TextField
                        label="Bet Amount"
                        value={betAmount}
                        onChange={handleBetChange}
                        fullWidth
                        margin="normal"
                        type="number"
                        inputProps={{ min: 0.01, step: 0.01 }}
                        disabled={gameStarted}
                        InputProps={{
                            style: { color: '#FFFFFF' } // Witte tekstkleur voor bet amount
                        }}
                    />
                    <TextField
                        select
                        label="Mines"
                        value={minesCount}
                        onChange={handleMinesChange}
                        fullWidth
                        margin="normal"
                        disabled={gameStarted}
                        InputProps={{
                            style: { color: '#FFFFFF' } // Witte tekstkleur voor mines
                        }}
                    >
                        {[...Array(24).keys()].map((count) => (
                            <MenuItem key={count + 1} value={count + 1}>
                                {count + 1}
                            </MenuItem>
                        ))}
                    </TextField>
                    {!gameStarted ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={startGame}
                            fullWidth
                            style={{ marginTop: '20px' }}
                        >
                            Play
                        </Button>
                    ) : (
                        <>
                            <TextField
                                label="Mines Remaining"
                                value={minesCount - selectedTiles.length + gemsCount}
                                fullWidth
                                margin="normal"
                                disabled
                                InputProps={{
                                    style: { color: '#FFFFFF' } // Witte tekstkleur voor remaining mines
                                }}
                            />
                            <TextField
                                label="Gems Collected"
                                value={gemsCount}
                                fullWidth
                                margin="normal"
                                disabled
                                InputProps={{
                                    style: { color: '#FFFFFF' } // Witte tekstkleur voor gems collected
                                }}
                            />
                            <TextField
                                label="Total Profit"
                                value={`$${(betAmount * currentMultiplier).toFixed(2)} (${currentMultiplier.toFixed(2)}x)`}
                                fullWidth
                                margin="normal"
                                disabled
                                InputProps={{
                                    style: { color: '#FFFFFF' } // Witte tekstkleur voor total profit
                                }}
                            />
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleRandomTileClick}
                                fullWidth
                                style={{ marginTop: '20px' }}
                            >
                                Pick Random Tile
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCashout}
                                fullWidth
                                style={{ marginTop: '10px' }}
                            >
                                Cashout
                            </Button>
                        </>
                    )}
                </div>

                <div className="grid-container">
                    <Grid container spacing={2} justifyContent="center">
                        {minesField.map((tile, index) => (
                            <Grid item xs={2.4} key={index}>
                                <Button
                                    variant="contained"
                                    className={selectedTiles.includes(index) ? 'clicked' : ''}
                                    onClick={() => handleTileClick(index)}
                                    fullWidth
                                    style={{ height: '100px', fontSize: '24px' }}
                                    disabled={isGameOver || !gameStarted}
                                >
                                    {selectedTiles.includes(index) ? (tile === 'mine' ? '💣' : '💎') : ''}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            </div>

            <Grid container spacing={2} justifyContent="center" style={{ marginTop: '20px' }}>
                <Grid item xs={6}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={resetGame}
                        fullWidth
                        disabled={!isGameOver}
                    >
                        {isGameOver ? 'Play Again' : 'Reset Game'}
                    </Button>
                </Grid>
            </Grid>

            <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%', backgroundColor: snackbarSeverity === 'success' ? '#4caf50' : '#f44336', color: '#fff' }}
                    action={
                        <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default Mines;
