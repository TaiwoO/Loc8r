var _isNumeric = function (n) {
    return !isNaN(parseFloat(n) && isFinite(n))
}

// This is a filterer
var formatDistance = function () {
    return function (distance) {
        var numDistance, unit;

        if (distance && _isNumeric(distance)) {
            if (distance > 1) {
                numDistance = parseFloat(distance).toFixed(1);
                unit = "km";
            } else { // convert to meters if it would be a decimal in km
                numDistance = parseInt(distance * 1000, 10);
                unit = 'm';
            }

            return numDistance + unit;
        } else {
            return "?";
        }
    }
}


// A directive
var ratingStars = function () {
    return {
        scope: {
            thisRating: '=rating'
        },
        templateUrl: "/angular/rating-starts.html"
    };
}

// This controller uses the loc8rData, and geolocaition service
var locationListCtrl = function ($scope, loc8rData, geolocation) {

    $scope.message = "Checking your location";

    $scope.getData = function (position) {
        var lat = position.coords.latitude,
            lng = position.coords.longitude;

        $scope.message = "Searching for nearby places";
        loc8rData.locationByCoords(lat, lng)
            .success(function (data) {
                $scope.message = data.length > 0 ? "" : "No location found"
                $scope.data = {
                    locations: data
                };
            })
            .error(function (e) {
                $scope.message = "Sorry, somthinng's gone wrong";
            });
    };

    // Note .$apply(0) is to let Angular know of an update to the scope.
    // This is usually already done in most native events, like with the .success (Angular already did $scope.$apply() for you)

    $scope.showError = function (error) {
        $scope.$apply(function () {
            $scope.message = error.message;
        });
    };

    $scope.noGeo = function () {
        $scope.$apply(function () {
            $scope.message = "Geolocation not supported by this browser."
        })
    }

    geolocation.getPosition($scope.getData, $scope.showError, $scope.noGeo)

}

// A service to get data from api
var loc8rData = function ($http) {
    var locationByCoords = function (lat, lng) {
        return $http.get('/api/locations?lng=' + lng + ' +&lat=' + lat + '&maxDistance=200000000000000');
    };
    return {
        locationByCoords: locationByCoords
    }
}

// A service to get the user's location 
var geolocation = function () {
    var getPosition = function (cbSuccess, cbError, cbNoGeo) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
        } else {
            cbNoGeo();
        }
    };

    return {
        getPosition: getPosition
    };
};

// angular.module('loc8rApp', []);

angular.module('loc8rApp', [])
    .controller('locationListCtrl', locationListCtrl)
    .filter('formatDistance', formatDistance)
    .directive('ratingStars', ratingStars)
    .service('loc8rData', loc8rData)
    .service('geolocation', geolocation)