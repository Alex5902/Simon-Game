import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import path from "path";

const app = express();
const PORT = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "simon",
    password: "463al84E",
    port: 5432,
});

db.connect();

app.use(express.json());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/submit-score", async (req, res) => {
    const {playerName, score} = req.body;
    
    try {
        await db.query("INSERT INTO top_scores (score, date, name) VALUES ($1, NOW(), $2)", [score, playerName]);
        res.sendStatus(200);
   } catch (error) {
        console.error("Error inserting score:", error);
        res.sendStatus(500);
    }
});

app.get("/leaderboard", async (req, res) => {
    try {
        const result = await db.query("SELECT name, score, EXTRACT(YEAR FROM date) AS year FROM top_scores ORDER BY score DESC LIMIT 5");
        const leaderboard = result.rows;
        res.json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.sendStatus(500);
    }
})

app.delete("/reset-leaderboard", async (req, res) => {
    try {
        await db.query("DELETE FROM top_scores");
        res.sendStatus(200);
   } catch (error) {
        console.error("Error resetting leaderboard:", error);
        res.sendStatus(500);
    }
});

// app.use((err, req, res) => {
//     console.error(err.stack);
//     res.sendStatus(500).send("Something went wrong!");
// })


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});