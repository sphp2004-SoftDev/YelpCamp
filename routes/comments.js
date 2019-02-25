var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//COMMENTS NEW ROUTE
router.get("/new", middleware.isLoggedIn, function(req,res) {
    Campground.findById(req.params.id, function(err,campground) {
        if(err) {
            console.log(err);
        } else {
            console.log(campground);
            res.render("comments/new", {campground:campground});
        }
    });
});

//COMMENTS CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req,res) {
   //LOOKUP CAMPGROUND USING ID
   Campground.findById(req.params.id, function(err, campground) {
       if(err) {
            req.flash("error", "Something went wrong.");
            res.redirect("/campgrounds");
       } else {
           Comment.create(req.body.comment, function(err, comment) {
               if(err) {
                   req.flash("error", "Something went wrong.");
                   console.log(err);
               } else {
                   //ADD USERNAME AND ID TO COMMENT
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   //SAVE THE COMMENT
                   comment.save();
                   campground.comments.push(comment);
                   campground.save();
                   req.flash("success", "Successfully added comment");
                   res.redirect("/campgrounds/" + campground._id);
               }
           });
       }
   });
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req,res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
       if(err) {
           res.redirect("back");
       } else {
           res.render("comments/edit", {campground_id: req.params.id, comment: foundComment}); 
       }
    });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/campgrounds/" + req.params.id );
      }
   });
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id",middleware.checkCommentOwnership, function(req,res) {
   Comment.findByIdAndRemove(req.params.comment_id, function(err) {
       if(err) {
           res.redirect("back");
       } else {
           req.flash("success", "Comments deleted.");
           res.redirect("/campgrounds/" + req.params.id);
       }
   });
});

module.exports = router;