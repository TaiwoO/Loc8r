(function () {

    angular
        .module('loc8rApp')
        // .controller('homeCtrl', ['$scope', 'loc8rData', 'geolocation', homeCtrl]); // injection
        .controller('homeCtrl', homeCtrl)

    homeCtrl.$inject = ['$scope', 'loc8rData', 'geolocation'] // set services to be injected

    function homeCtrl($scope, loc8rData, geolocation) {
        var vm = this;

        vm.pageHeader = {
            title: 'Loc8r',
            strapline: '-find a place to work with wifi near you!'
        };
        vm.sidebar = {
            content: "Looking for wifi and a seat? When this is the applcation for you. Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for."
        };

        vm.message = "Checking your location";

        vm.getData = function (position) {
            var lat = position.coords.latitude,
                lng = position.coords.longitude;

            vm.message = "Searching for nearby places";

            loc8rData.locationByCoords(lat, lng)
                .then(
                    function (response) { // SuccessCallback
                        vm.message = response.data.length > 0 ? "" : "No location found"
                        vm.data = {
                            locations: response.data
                        };
                    },
                    function k(response) { // ErrorCallback
                        vm.message = "Sorry, somthinng's gone wrong";

                    });
        };

        // Note .$apply(0) is to let Angular know of an update to the scope.
        // This is usually already done in most native events, like with the .success (Angular already did vm.$apply() for you)

        vm.showError = function (error) {
            $scope.$apply(function () { // I think of apply as saying "Update this right now to the model"
                vm.message = error.message;
            });
        };

        vm.noGeo = function () {
            $scope.$apply(function () {
                vm.message = "Geolocation not supported by this browser."
            })
        }

        geolocation.getPosition(vm.getData, vm.showError, vm.noGeo)
    }
})();