require('dotenv').config();
const express = require('express');
const cors = require('cors');
const umidadeRoutes = require('./routes/umidadeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', umidadeRoutes);

module.exports = app;
