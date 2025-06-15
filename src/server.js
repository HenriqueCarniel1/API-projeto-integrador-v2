const express = require('express');
const app = express();
const routes = require('./routes/routes');
const cors = require('cors');
const path = require('path');
const porta = 5000;

app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(express.json());
app.use(routes);
app.use('/src/img', express.static(path.join(__dirname, 'src', 'img')));

app.listen(porta, () => {
  console.log(`Server is running on port ${porta}`);
});