(function () {
    angular
        .module('loc8rApp')
        .directive('ratingStars', ratingStars)

    function ratingStars() {
        return {
            restrict: 'EA', // element and attribute
            scope: {
                thisRating: '=rating' // Addes thisRating veriable into the scope and sets the value to whatever they said (rating= ??) in the html element
            },
            templateUrl: '/common/directives/ratingStars/ratingStars.template.html'
        }
    }
})();