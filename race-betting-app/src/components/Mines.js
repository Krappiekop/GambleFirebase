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
    const [gameStarted, setGameStarted] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [minesCount, setMinesCount] = useState(3);
    const [betAmount, setBetAmount] = useState(1);
    const [currentMultiplier, setCurrentMultiplier] = useState(1.0); // multiplier for winnings
    const navigate = useNavigate();

    const payoutMatrix = [
        // Payout matrix (diamonds, mines) as provided by your chart
        [1.01, 1.08, 1.12, 1.18, 1.24, 1.37, 1.46, 1.55, 1.65, 1.74, 1.84, 1.99, 2.05, 2.16, 2.47, 3.09, 3.54, 4.12, 4.95, 6.19, 8.25, 12.37, 24.75],
        // More rows follow according to your table
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
        setGameStarted(false);
        const newMinesField = generateMinesField();
        setMinesField(newMinesField);
        setCurrentMultiplier(1.0); // Reset multiplier
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
        setGameStarted(true);
    };

    const handleBetChange = (amount) => {
        setBetAmount(amount);
    };

    const handleMinesChange = (e) => {
        setMinesCount(parseInt(e.target.value));
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

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '200px', textAlign: 'left', paddingRight: '20px' }}>
                    <TextField
                        select
                        label="Mines"
                        value={minesCount}
                        onChange={handleMinesChange}
                        fullWidth
                        margin="normal"
                    >
                        {[...Array(24).keys()].map((count) => (
                            <MenuItem key={count + 1} value={count + 1}>
                                {count + 1}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={startGame}
                        fullWidth
                        disabled={gameStarted}
                        style={{ marginTop: '20px' }}
                    >
                        Play
                    </Button>
                </div>

                <Grid container spacing={2} justifyContent="center" style={{ width: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                    {minesField.map((tile, index) => (
                        <Grid item xs={2.4} key={index}>
                            <Button
                                variant="contained"
                                color={selectedTiles.includes(index) ? (tile === 'mine' ? 'error' : 'success') : 'primary'}
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
