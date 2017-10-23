// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Reuiring Article and Comment models
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");

// Scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Set mongoose to leverage built in JS ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with the app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public as a static directory
app.use(express.static("public"));

// Database configuration with mongoose 
mongoose.connect("mongodb://localhost/week18day3mongoose");
var db = mongoose.connection;

// Show any errors in mongoose
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Log a success message once logged into the DB through mongoose
db.once("open", function() {
    console.log("Mongoose connection successful.");
});

// Routes 

// A GET request to scrape the Tech Crunch website
app.get("/scrape", function(req, res) {
    //Grab the body of the html with request
    request("https://techcrunch.com/", function(error, response, html) {
        // Load into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Grabs every H2 within the river-block class
        $("li h2").each(function(i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");

            // Create a new entry using the Article model
            var entry = new Article(result);

            // Saves the entry into the DB
            entry.save(function(err, doc) {
                // Log any errors 
                if (err) {
                    console.log(err);
                } 
                // Log the doc
                else {
                    console.log(doc);
                }
            });
        });
    });
    res.send("Scrape Complete!");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({}, function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Or send the doc to the browser as a json object
      else {
        res.json(doc);
      }
    });
  });
  
  // Grab an article by it's ObjectId
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({ "_id": req.params.id })
    // ..and populate all of the notes associated with it
    .populate("comment")
    // now, execute our query
    .exec(function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise, send the doc to the browser as a json object
      else {
        res.json(doc);
      }
    });
  });
  
  
  // Create a new note or replace an existing note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    var newComment = new Comment(req.body);
  
    // And save the new note the db
    newComment.save(function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise
      else {
        // Use the article id to find and update it's note
        Article.findOneAndUpdate({ "_id": req.params.id }, { "comment": doc._id })
        // Execute the above query
        .exec(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          else {
            // Or send the document to the browser
            res.send(doc);
          }
        });
      }
    });
  });
  
  
  // Listen on port 3000
  app.listen(3000, function() {
    console.log("App running on port 3000!");
  });
  