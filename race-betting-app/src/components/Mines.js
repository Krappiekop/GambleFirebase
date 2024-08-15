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
    const [minesField, setMinesField] = useState([]);
    const [selectedTiles, setSelectedTiles] = useState([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(true); // Tiles are always active
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [minesCount, setMinesCount] = useState(3);
    const [betAmount, setBetAmount] = useState(1);
    const [currentMultiplier, setCurrentMultiplier] = useState(1.0); // multiplier for winnings
    const [diamondsCount, setDiamondsCount] = useState(22); // Number of diamonds
    const [totalProfit, setTotalProfit] = useState(0);
    const navigate = useNavigate();

    const payoutMatrix = [
        [1.01, 1.08, 1.12, 1.18, 1.24, 1.37, 1.46, 1.55, 1.65, 1.74, 1.84, 1.99, 2.05, 2.16, 2.47, 3.09, 3.54, 4.12, 4.95, 6.19, 8.25, 12.37, 24.75],
        [1.08, 1.17, 1.29, 1.41, 1.56, 1.74, 1.94, 2.18, 2.47, 2.83, 3.26, 3.87, 4.5, 5.26, 6.16, 8.25, 10.64, 13.85, 18.79, 27.71, 49.5, 99.0, 297.0],
        [1.12, 1.29, 1.48, 1.71, 2.02, 2.35, 2.79, 3.35, 4.07, 4.95, 6.16, 7.73, 9.99, 12.51, 15.6, 21.56, 28.23, 38.04, 52.89, 80.29, 151.59, 323.6, 1077.32],
        [1.18, 1.41, 1.71, 2.09, 2.58, 3.14, 3.91, 4.92, 6.14, 7.69, 9.87, 12.94, 17.51, 24.01, 34.09, 55.82, 88.52, 148.3, 272.95, 565.74, 1131.48, 2822.96, 11314.8],
        [1.24, 1.56, 2.02, 2.58, 3.3, 4.09, 5.26, 6.88, 9.17, 12.04, 17.32, 26.77, 40.87, 66.41, 113.85, 208.72, 417.45, 939.26, 2504.0, 8768.0, 52598.0, 236.0, 52598.0],
        [1.37, 1.74, 2.35, 3.14, 4.19, 5.65, 7.69, 10.61, 14.17, 21.89, 35.03, 58.38, 102.17, 189.75, 357.81, 834.9, 2504.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0],
        [1.46, 1.94, 2.79, 3.91, 5.26, 7.69, 10.65, 14.17, 21.89, 35.03, 58.38, 102.17, 189.75, 357.81, 834.9, 23794.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0],
        [1.55, 2.18, 3.35, 4.92, 7.69, 10.65, 14.17, 21.89, 35.03, 58.38, 102.17, 189.75, 357.81, 834.9, 23794.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0],
        [1.65, 2.47, 4.07, 6.14, 9.17, 14.17, 21.89, 35.03, 58.38, 102.17, 189.75, 357.81, 834.9, 23794.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0],
        [1.74, 2.83, 4.95, 7.69, 12.04, 21.89, 35.03, 58.38, 102.17, 189.75, 357.81, 834.9, 23794.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0],
        [1.84, 3.26, 6.16, 9.87, 17.32, 26.77, 40.87, 66.41, 113.85, 208.72, 357.81, 834.9, 23794.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0],
        [1.99, 3.87, 7.73, 12.94, 21.89, 40.87, 66.41, 113.85, 208.72, 357.81, 834.9, 23794.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0],
        [2.16, 4.5, 9.99, 17.51, 26.77, 55.82, 88.52, 148.3, 272.95, 417.45, 834.9, 23794.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0],
        [2.47, 5.26, 12.51, 24.01, 40.87, 66.41, 113.85, 208.72, 357.81, 834.9, 23794.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0],
        [3.09, 6.16, 15.6, 34.09, 66.41, 113.85, 208.72, 357.81, 834.9, 23794.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0],
        [3.54, 7.73, 18.79, 55.82, 113.85, 208.72, 357.81, 834.9, 23794.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0],
        [4.12, 9.17, 21.89, 66.41, 148.3, 272.95, 565.74, 1131.48, 2822.96, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0],
        [4.95, 10.64, 28.23, 88.52, 208.72, 417.45, 834.9, 23794.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0],
        [6.19, 13.85, 38.04, 113.85, 357.81, 834.9, 23794.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0],
        [8.25, 18.79, 52.89, 148.3, 417.45, 939.26, 2504.0, 8768.0, 52598.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0],
        [12.37, 27.71, 80.29, 208.72, 565.74, 1131.48, 2822.96, 1131.48, 2822.96, 4418260.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0],
        [24.75, 49.5, 151.59, 357.81, 834.9, 23794.0, 6498.0, 23794.0, 118973.0, 441826.0, 2022545.0, 3236072.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0, 4418260.0]
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

    const resetGame = () => {
        setIsGameOver(false);
        setSelectedTiles([]);
        setGameStarted(true);
        const newMinesField = generateMinesField();
        setMinesField(newMinesField);
        setCurrentMultiplier(1.0); // Reset multiplier
        setTotalProfit(0); // Reset profit
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
        setDiamondsCount(25 - minesCount); // Update diamond count based on mines
        return newField;
    };

    const handleTileClick = (index) => {
        if (isGameOver || selectedTiles.includes(index)) return;

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
            setSnackbarSeverity('success');
            setSnackbarMessage(`Safe! Multiplier: x${multiplier.toFixed(2)}`);
            setShowSnackbar(true);
            setTotalProfit(betAmount * multiplier); // Update total profit
        }
    };

    const revealAllMines = () => {
        const allTiles = Array.from({ length: 25 }, (_, i) => i);
        setSelectedTiles(allTiles);
    };

    const handleCloseSnackbar = () => {
        setShowSnackbar(false);
    };

    const handleBetChange = (e) => {
        setBetAmount(parseFloat(e.target.value));
    };

    const handleMinesChange = (e) => {
        const mines = parseInt(e.target.value);
        setMinesCount(mines);
        setDiamondsCount(25 - mines); // Ensure diamonds count is updated
    };

    const handlePickRandomTile = () => {
        const unselectedTiles = minesField
            .map((tile, index) => (selectedTiles.includes(index) ? null : index))
            .filter((index) => index !== null);

        if (unselectedTiles.length > 0) {
            const randomIndex = unselectedTiles[Math.floor(Math.random() * unselectedTiles.length)];
            handleTileClick(randomIndex);
        }
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
                        inputProps={{ min: "1", step: "0.01" }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <TextField
                            label="Mines"
                            value={minesCount}
                            onChange={handleMinesChange}
                            fullWidth
                            margin="normal"
                            type="number"
                            inputProps={{ min: "1", max: "24" }}
                            style={{ marginRight: '10px' }}
                        />
                        <TextField
                            label="Gems"
                            value={diamondsCount}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                    </div>
                    <TextField
                        label="Total Profit"
                        value={totalProfit.toFixed(2)}
                        fullWidth
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handlePickRandomTile}
                        fullWidth
                        style={{ marginTop: '20px' }}
                    >
                        Pick random tile
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => {}} // Cashout logic goes here
                        fullWidth
                        style={{ marginTop: '10px', backgroundColor: '#4caf50' }}
                    >
                        Cashout
                    </Button>
                </div>

                <div className="grid-container">
                    <Grid container spacing={2} justifyContent="center">
                        {minesField.map((tile, index) => (
                            <Grid item xs={2.4} key={index}>
                                <Button
                                    variant="contained"
                                    color={selectedTiles.includes(index) ? (tile === 'mine' ? 'error' : 'success') : 'primary'}
                                    onClick={() => handleTileClick(index)}
                                    fullWidth
                                    style={{ height: '100px', fontSize: '24px' }}
                                    disabled={isGameOver}
                                >
                                    {selectedTiles.includes(index) ? (tile === 'mine' ? '💣' : '💎') : ''}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            </div>

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
