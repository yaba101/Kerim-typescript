import express from 'express';
import { createDeck } from './deck.js';
const app = express();
const PORT = 3001;
app.use(express.json());
const players = {};
let bidSequence = ['North', 'East', 'South', 'West'];
let currentBidderIndex = 0;
let biddingHistory = [];
let contract = null;
let passCount = 0;
let isBiddingComplete = false;
app.post('/register', (req, res) => {
    const { name, position } = req.body;
    if (!['North', 'South', 'East', 'West'].includes(position)) {
        return res.status(400).send({ error: 'Invalid position specified' });
    }
    if (players[position]) {
        return res.status(400).send({ error: 'Position already taken' });
    }
    const newPlayer = { name, position, cards: [], bid: null };
    players[position] = newPlayer;
    res.status(200).send({ message: `Player ${name} registered as ${position}`, player: newPlayer });
});
app.post('/distribute', (req, res) => {
    const deck = createDeck();
    let index = 0;
    for (const position of ['North', 'South', 'East', 'West']) {
        players[position].cards = deck.slice(index * 13, (index + 1) * 13);
        index++;
    }
    res.status(200).send({ message: 'Cards distributed', players });
});
app.post('/bid', (req, res) => {
    var _a;
    const { position, bid } = req.body;
    if (isBiddingComplete) {
        return res.status(400).send({ error: "Bidding phase is already complete." });
    }
    if (position !== bidSequence[currentBidderIndex]) {
        return res.status(400).send({ error: `It's not ${position}'s turn to bid.` });
    }
    biddingHistory.push(bid);
    players[position].bid = bid;
    currentBidderIndex = (currentBidderIndex + 1) % 4;
    contract = (_a = biddingHistory.slice().reverse().find((bid) => bid !== "pass")) !== null && _a !== void 0 ? _a : null;
});
function isValidBid(newBid, bidHistory) {
    if (newBid === "pass")
        return true;
    if (!bidHistory.length)
        return true;
    const newBidLevel = parseInt(newBid[0]);
    const newBidSuit = newBid.slice(1);
    const lastValidBid = bidHistory.slice().reverse().find(bid => bid !== "pass");
    if (!lastValidBid)
        return true;
    const lastBidLevel = parseInt(lastValidBid[0]);
    const lastBidSuit = lastValidBid.slice(1);
    if (newBidLevel > lastBidLevel)
        return true;
    if (newBidLevel === lastBidLevel && suitHierarchy[newBidSuit] > suitHierarchy[lastBidSuit])
        return true;
    return false;
}
const suitHierarchy = { "♣": 1, "♦": 2, "♥": 3, "♠": 4, "NT": 5 };
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
