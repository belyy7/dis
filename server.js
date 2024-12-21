const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
const path = require('path');
const app = express();

dotenv.config({path: './config.env'});

const port = process.env.PORT || 3000;

const db = new sqlite3.Database(path.join(__dirname, 'database.db'));
db.run(`CREATE TABLE IF NOT EXISTS users (
    number TEXT PRIMARY KEY,
    taken5 INTEGER DEFAULT 0,
    taken10 INTEGER DEFAULT 0
)`);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.post('/check-number', (req, res) => {
    const { number } = req.body;
    db.get('SELECT * FROM users WHERE number = ?', [number], (err, row) => {
        if (row) {
            if (!row.taken5) {
                return res.json({ success: false, message: 'Admin must confirm your 5% discount first.' });
            } else if (row.taken5 && !row.taken10) {
                return res.json({ success: true, discount: 10 });
            } else {
                return res.json({ success: false, message: 'You have already claimed both discounts.' });
            }
        } else {
            db.run('INSERT INTO users (number, taken5, taken10) VALUES (?, 0, 0)', [number]);
            return res.json({ success: true, discount: 5 });
        }
    });
});

app.post('/admin/mark-claimed', (req, res) => {
    const { number, discount } = req.body;

    if (discount === 5) {
        db.run('UPDATE users SET taken5 = 1 WHERE number = ?', [number], () => {
            res.json({ success: true, message: '5% discount marked as taken.' });
        });
    } else if (discount === 10) {
        db.get('SELECT taken5 FROM users WHERE number = ?', [number], (err, row) => {
            if (row && row.taken5) {
                db.run('UPDATE users SET taken10 = 1 WHERE number = ?', [number], () => {
                    res.json({ success: true, message: '10% discount marked as taken.' });
                });
            } else {
                res.status(400).json({ success: false, message: 'Cannot mark 10% before 5% is taken.' });
            }
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid discount type.' });
    }
});

app.get('/admin/search', (req, res) => {
    const { number } = req.query;
    db.get('SELECT * FROM users WHERE number = ?', [number], (err, row) => {
        if (row) res.json(row);
        else res.status(404).json({ success: false, message: 'User not found' });
    });
});

app.listen(port, () => console.log(`Server running on port ${port}`));