var mongoose = require("mongoose");
var Loc = mongoose.model('Location')


var sendJsonResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
}

// Helper functions to encapsulate distance fucntions in reguards to the earth
var theEarth = (function () {
    var earthRadius = 6371; // in km, miles is 3959

    var getDistanceFromRads = function (rads) {
        return parseFloat(rads * earthRadius); // Distance = radians * radius
    };

    var getRadsFromDistance = function (distance) {
        return parseFloat(distance / earthRadius);
    };

    return {
        getDistanceFromRads: getDistanceFromRads,
        getRadsFromDistance: getRadsFromDistance
    };
})();

// Creates a location and adds it to the database
module.exports.locationsCreate = function (req, res) {

    var newLocation = {
        name: req.body.name,
        address: req.body.address,
        facilities: req.body.facilities.split(","),
        coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
        openingTimes: [{
            days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1
        }, {
            days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2
        }]
    }

    Loc.create(newLocation, function (err, location) {
        if (err) {
            console.log("location creation error");
            sendJsonResponse(res, 404, err)
        } else {
            sendJsonResponse(res, 201, location)
        }
    });
};

// Returns a list of locations within the range of the specified maxDistance.
module.exports.locationsListByDistance = function (req, res) {
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var maxDistance = parseFloat(req.query.maxDistance); // km

    // The geolocation of the current point of interest
    var point = {
        type: "Point",
        coordinates: [lng, lat]
    };

    var geoOptions = {
        spherical: true,
        maxDistance: theEarth.getRadsFromDistance(maxDistance),
        num: 10 // max number of locations to get
    }

    // Ensure that all parameters are provided
    if ((!lng && lng !== 0) || (!lat && lat !== 0) || !maxDistance) {
        console.log("locationsListByDistance missing params");
        sendJsonResponse(res, 404, { "message": "lng,lat, and maxDistance query parameters are all required" });
        return;
    }

    // Mongoose funciton to get other locations close to the specified point
    Loc.geoNear(point, geoOptions, function (err, results, stats) {

        if (err) {
            console.log("geoNear error", err);
            sendJsonResponse(res, 404, err)
        } else {
            var locations = buildLocationList(err, results, stats);
            sendJsonResponse(res, 200, locations);

        }
    });
};

// helper function for the geoNear function. Helps to build the location in a w
var buildLocationList = function (err, results, stats) {//  the "results" is a list of location objects each with a "dis" and "obj" field
    var locations = [];
    results.forEach(function (doc) {
        locations.push({
            distance: theEarth.getDistanceFromRads(doc.dis),
            name: doc.obj.name,
            rating: doc.obj.rating,
            facilities: doc.obj.facilities,
            address: doc.obj.address,
            _id: doc.obj._id
        });
    });
    return locations;
}

// Finds a location
module.exports.locationsReadOne = function (req, res) {

    if (req.params && req.params.locationid) {// ensure params then ensure locationid provided before querying
        Loc.findById(req.params.locationid)
            .exec(function (err, location) {
                if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                } else if (!location) {
                    sendJsonResponse(res, 404, { "message": "locationid not found" });
                    return;
                }
                sendJsonResponse(res, 200, location);
            });
    } else {
        sendJsonResponse(res, 404, { "message": "No locationid in request" })
    }
}

module.exports.locationsUpdateOne = function (req, res) {

    // Ensure a locationid is provided in the parameters
    if (!req.params.locationid) {
        sendJsonResponse(res, 404, { "message": "Not found, locationid is required" });
        return;
    }

    Loc.findById(req.params.locationid)
        .select("-reviews -rating")// retrieve all but reviews and rating
        .exec(function (err, location) {
            if (!location) {
                sendJsonResponse(res, 404, { "message": "locationid not found" });
                return;
            } else if (err) {
                sendJsonResponse(res, 400, err);
                return;
            }

            // Update the relevant items
            //
            location.name = req.body.name;
            location.address = req.body.address;
            location.facilities = req.body.facilities.split(",");
            location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
            location.openingTimes = [
                {
                    days: req.body.days1,
                    opening: req.body.opening1,
                    closing: req.body.closing1,
                    closed: req.body.closed1
                },
                {
                    days: req.body.days2,
                    opening: req.body.opening2,
                    closing: req.body.closing2,
                    closed: req.body.closed2
                }
            ];

            // Now save it
            //
            location.save(function (err, location) {
                if (err) {
                    sendJsonResponse(res, 404, err);
                } else {
                    sendJsonResponse(res, 200, location)
                }
            });

        });
};

module.exports.locationsDeleteOne = function (req, res) {
    var locationid = req.params.locatioid;
    if (locationid) {
        Loc.findByIdAndRemove(locationid)
            .exec(function (err, location) {
                if (err) {
                    sendJsonResponse(res, 404, err)
                    return;
                }
                sendJsonResponse(res, 204, null);
            });
    } else {
        sendJsonResponse(res, 404, { "message": "No locationid" });
    }
};

