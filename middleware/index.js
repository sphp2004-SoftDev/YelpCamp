var middlewareObj = {};
var Campground = require("../models/campground");
var Comment = require("../models/comment");

middlewareObj.checkCampgroundOwnership = function(req,res,next) {
    if(req.isAuthenticated()) {
            Campground.findById(req.params.id, function(err, foundCampground) {
            if(err || !foundCampground) {
                req.flash("error", "Campground not found.")
                res.redirect("back");
            } else {
                //DOES USER OWN THE CAMPGROUND
                if(foundCampground.author.id.equals(req.user._id)) {
                   next();
                } else {
                    req.flash("error", "You do not have permission do this this task.")
                    res.redirect("back");
                }
            }
        });
    } else {
       req.flash("error", "You need to be logged in to complete this task");
       res.redirect("back");
    }
};


middlewareObj.checkCommentOwnership = function(req,res,next) {
    if(req.isAuthenticated()) {
            Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err) {
                console.log(err);
                res.redirect("back");
            } else {
                //DOES USER OWN THE COMMENT
                if(foundComment.author.id.equals(req.user._id)) {
                   next();
                } else {
                    req.flash("error", "You don't have permission to complete this task.");
                    res.redirect("back");
                }
            }
        });
    } else {
       req.flash("error", "YOu need to be logged in to complete this task.");
       res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req,res, next) {
    if(req.isAuthenticated()) {
       return next();
    }
    req.flash("error", "You need to be logged in to complete this task.");
    res.redirect("/login");
};




module.exports = middlewareObj