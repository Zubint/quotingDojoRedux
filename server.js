var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

mongoose.connect("mongodb://localhost/quoting_dojo_mean");
mongoose.connection.on('error', function(err){console.log(err)});
//build the schema

var QuoteSchema = new mongoose.Schema({
  name: String,
  quote: String,
  upvotes: Number,
  created_on: Date,
  updated_on: Date
})

QuoteSchema.path("name").required(true, "Name cannot be blank");
QuoteSchema.path("quote").required(true, "You must supply a quote");

mongoose.model('Quote', QuoteSchema);
var Quote = mongoose.model('Quote');
var errorsArray =[];


app.use(express.static(__dirname+"/static"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("/views", __dirname+"/views");
app.set("view engine", "ejs");

app.get("/", function(req, res){

  res.render("index", {errors:errorsArray});
})

app.get("/fix", function(req, res){   //I used this to delete records I had added accidentally.  They were incomplete.
  Quote.remove({_id:"5752446158f3a0a868ba6a16"}, function(err){  //I removed each one by ID after console.logging it.
        if(err){
            console.log(err);
        }else {
          res.redirect("/quotes");
        }
  });
})

app.get("/quotes/upvote/:id", function(req, res){
  //increment the upvotes by one and
  //redirect to the quotes page
  Quote.update({_id:req.params.id}, {$inc: {upvotes:1}}, function(err){
    if(err){
      console.log("Error: " + err);
    }else {
      console.log("increment done!");
      res.redirect("/quotes");
    }
  } );

})
app.get("/quotes", function(req, res){

  errorsArray=[]; //if you don't clear them here, they will appear again when you navigate back to the index page
  Quote.find({}).sort({upvotes: 'desc'}).sort({updated_on:'desc'}).exec(function(err, quotes){
    if(err){
        console.log("error getting quotes: " + err);
    }else {
      console.log(quotes);
      res.render("quotes", {allQuotes:quotes});
    }
  });


})
app.post("/quotes/add", function(req, res){

  console.log(req.body); // we have the data from the post
  var quote = new Quote({
    name: req.body.name.trim(),
    quote: req.body.quote.trim(),
    upvotes: 0,
    created_on: Date("YYYY-MM-DDTHH:MM:SS"),
    updated_on: Date("YYYY-MM-DDTHH:MM:SS")
  })

  quote.save(function(err){
    if (err){
      errorsArray = [];
      // console.log("There was a problem: " + err);
      for(var x in err.errors){
        errorsArray.push(err.errors[x].message);
      }
      // for(var y in errorsArray){
      //     console.log(errorsArray[y]);
      //   }
      res.redirect("/");
    }else {
      res.redirect("/quotes");
    }
  })

})

app.listen(8000, function(){
  console.log("listening on port 8000");
})
