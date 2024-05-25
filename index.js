import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const port = 3000;

var recipes = [];

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/search", async (req, res) => {
    var queryParam = req.body.ingredient1;
    
    // Iterate through the keys of req.body
    Object.keys(req.body).forEach((key, index) => {
        if (req.body[key]) {
            queryParam += `,${req.body[key]}`;
        }
    });
    try {
        const result = await axios.get(`${process.env.API_DOMAIN}findByIngredients`, {
            params: {
                ingredients: queryParam,
                ignorePantry: true,
                ranking: 1,
                apiKey: process.env.API_KEY,
            },
        });
        
        recipes = result.data;

        res.redirect("/results");
    } catch(error) {
        console.log(error.message);
        res.redirect("/");
    }

});

app.get("/results", (req, res) => {
    res.render("results.ejs", {
        recipes: recipes
    });
});

app.post("/recipe/:id", async (req, res) => {
    var id = req.body.id;

    try {
        const instructions = await axios.get(`${process.env.API_DOMAIN}${id}/analyzedInstructions`, {
            params: {
                apiKey: process.env.API_KEY,
            },
        });
        const info = await axios.get(`${process.env.API_DOMAIN}${id}/information`, {
            params: {
                apiKey: process.env.API_KEY,
            },
        });
        
        var apiInstructions = instructions.data;
        var apiInformation = info.data;
    
        res.render("recipe.ejs", {
            instructions: apiInstructions,
            information: apiInformation,
        });
    } catch(error) {
        console.log(error.message)
        res.redirect("/");
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});