var mongoose = require("mongoose");
var Loc = mongoose.model('Location');
var User = mongoose.model('User');

// Gets the name of the user from the jwt payload
var getAuthor = function (req, res, callback) {
    if (req.payload && req.payload.email) {
        User
            .findOne({
                email: req.payload.email
            })
            .exec(function (err, user) {
                if (!user) {
                    sendJsonResponse(res, 404, {
                        message: "User not found"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    sendJsonResponse(res, 404, err);
                    return;
                }
                callback(req, res, user.name);
            });
    } else {
        sendJsonResponse(res, 404, {
            message: "User not found"
        });
        return;
    }
};

var sendJsonResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
}


// Creates a new review for a locaition
module.exports.reviewsCreate = function (req, res) {

    getAuthor(req, res, function (req, res, userName) {
        if (req.params.locationid) {
            Loc.findById(req.params.locationid)
                .select('reviews') // all we want is the review
                .exec(function (err, location) {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else {
                        doAddReview(req, res, location, userName);
                    }
                });
        } else {
            sendJsonResponse(res, 404, {
                "message": "locationid required"
            });
        }
    });

}

// adds a review to the specified location
var doAddReview = function (req, res, location, author) {
    if (!location) {
        sendJsonResponse(res, 404, {
            "message": "locationid not found"
        });
    } else { // add the review to the location

        // First add it
        location.reviews.push({
            author: author,
            rating: req.body.rating,
            reviewText: req.body.reviewText
        });

        // Then save it
        location.save(function (err, location) {
            var addedReview;
            if (err) {
                console.log(err)
                sendJsonResponse(res, 400, err);
            } else {
                updateAverageRating(location._id);
                addedReview = location.reviews[location.reviews.length - 1];
                sendJsonResponse(res, 201, addedReview);
            }

        });

    }
};

var updateAverageRating = function (locationid) {
    Loc.findById(locationid)
        .select("rating reviews")
        .exec(function (err, location) {
            if (!err) {
                doSetAverageRating(location);
            }
        });
};

// Caculates the average rating of a location and updates that location's rating 
var doSetAverageRating = function (location) {
    var i, reviewCount, reviewAverage, ratingTotal;

    if (location.reviews && location.reviews.length > 0) { // ensure that there are reviews
        reviewCount = location.reviews.length;
        ratingTotal = 0;

        // Calculate total rating
        for (i = 0; i < reviewCount; i++) {
            ratingTotal = ratingTotal + location.reviews[i].rating;
        }

        ratingAverage = parseInt(ratingTotal / reviewCount, 10);
        location.rating = ratingAverage;
        location.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Average rating updated to", ratingAverage);
            }
        });
    }
};

module.exports.reviewsReadOne = function (req, res) {
    if (req.params && req.params.locationid && req.params.reviewid) {
        Loc.findById(req.params.locationid)
            .select("name reviews") // All we want is the name of the locaiton and the reviews for that location
            .exec(function (err, location) {

                var response, review;
                if (!location) {
                    sendJsonResponse(res, 404, {
                        "message": "locationid not found"
                    });
                    return;
                } else if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                // at this point we know that there is no err and that the location exists. Time to check the reviews
                if (location.reviews && location.reviews.length > 0) {

                    review = location.reviews.id(req.params.reviewid); // id is a function that works when working with an array of subdocuments

                    if (!review) { // was the review id found in this paticular location?
                        sendJsonResponse(res, 404, {
                            "message": "reviewid not found"
                        });
                    } else {
                        response = {
                            location: {
                                name: location.name,
                                id: req.params.locationid
                            },
                            review: review
                        };
                        sendJsonResponse(res, 200, response);
                    }
                } else {
                    sendJsonResponse(res, 404, {
                        "message": "No reviews found"
                    });
                }
            });

    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid and reviewid are both required"
        })
    }
}

module.exports.reviewsUpdateOne = function (req, res) {

    if (!req.params.locationid || !req.parms.reviewid) {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid and reviewid are both required"
        });
        return;
    }

    Loc.findById(req.params.locationid)
        .select("reviews")
        .exec(function (err, location) {
            var thisReview;
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "locationid was not found"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 400, err);
                return;
            }

            if (location.reviews && location.reviews.length > 0) {
                thisReview = location.review.id(req.params.reviewid);
                if (!thisReview) {
                    sendJsonResponse(res, 404, {
                        "message": "reviewid not found"
                    });
                    return;
                } else {

                    // First update it
                    //
                    thisReview.author = req.body.author;
                    thisReview.rating = req.body.rating;
                    thisReview.reviewText = req.body.reviewText;

                    // Then save the changes
                    //
                    location.save(function (err, location) {
                        if (err) {
                            sendJsonResponse(res, 404, err);
                        } else {
                            sendJsonResponse(res, 200, thisReview);
                        }
                    });

                }
            } else {
                sendJsonResponse(res, 404, {
                    "message": "No review to update"
                });
            }
        });

}

module.exports.reviewsDeleteOne = function (req, res) {


    // Ensure that the parameters exisit
    if (!req.params.locationid || !req.parms.reviewid) {
        sendJsonResponse(res, 404, {
            "message": "Not found, location and reiewid are both required"
        });
        return;
    }

    // First find parent document
    Loc.findById(req.params.locationid)
        .select("reviews")
        .exec(function (err, location) {
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "locationid not found"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 400, err);
                return;
            }

            if (location.reviews && location.review.length > 0) { // are there reviews?
                if (!location.reviews.id(req.params.reviewid)) { // is this review id in this location?
                    sendJsonResponse(res, 404, {
                        "message": "reviewid not found"
                    })
                } else {
                    location.review.id(req.params.reviewid).remove();
                    location.save(function (err) {
                        if (err) {
                            sendJsonResponse(res, 404, err);
                        } else {
                            updateAverageRating(location._id);
                            sendJsonResponse(res, 204, null);
                        }
                    });
                }
            } else {
                sendJsonResponse(res, 404, {
                    "message": "No review to delete"
                })
            }
        })
}