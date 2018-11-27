const express = require("express");
const app = express();

app.use(express.static(__dirname));

app.get("/", (req, res) => { });

app.listen(3000, () => console.log("listening on port 3000"));
