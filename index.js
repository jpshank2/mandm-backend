require('dotenv').config();
const path = require("path");
const express    = require("express");
const cors       = require("cors");
const queryRouter = require("./routes/router");
const app        = express();
const PORT       = process.env.PORT || 3001;

app.use(cors());
app.use(express.static(path.join(__dirname, "assets")));

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use(queryRouter);

app.listen(PORT);
