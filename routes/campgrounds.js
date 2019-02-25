var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");



//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req,res) {
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name:name, price:price, image:image, description:desc, author: author};
    
   //Create a new campground and save to the database
    Campground.create(newCampground, function(err, newlyCreated) {
        if(err) {
            console.log("There is an error");
            console.log(err);
        } else {
            //Redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});


//NEW - show form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req,res) {
    res.render("campgrounds/new");
});

//SHOW - show the info for a single campground
router.get("/:id", function(req,res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err || !foundCampground) {
            req.flash("error", "campground not found.");
            res.redirect("back");
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
});
//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
          res.render("campgrounds/edit", {campground:foundCampground});
    });
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res) {
    //FIND AND UPDATE THE CORRECT CAMPGROUND
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
       if(err) {
           res.redirect("/campgrounds");
       } else {
           res.redirect("/campgrounds/" + req.params.id);
       }
    });

});

//DESTROY ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res, next) {
    Campground.findById(req.params.id, function(err, campground) {
        Comment.remove({
           "_id": {
               $in: campground.comments
           } 
        }, function(err) {
            if(err) return next(err);
            campground.remove();
            res.redirect("/campgrounds");
        });
    });
});

module.exports = router;