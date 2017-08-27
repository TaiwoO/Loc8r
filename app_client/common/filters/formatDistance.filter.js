(function () {
    
    angular
        .module('loc8rApp')
        .filter('formatDistance', formatDistance);

    var _isNumeric = function (n) {
        return !isNaN(parseFloat(n) && isFinite(n))
    }

    // This is a filterer
    function formatDistance() {
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
})();