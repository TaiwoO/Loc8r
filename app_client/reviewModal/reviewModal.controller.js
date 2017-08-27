(function () {
    angular
        .module('loc8rApp')
        .controller('reviewModalCtrl', reviewModalCtrl);

    reviewModalCtrl.$inject = ['$uibModalInstance', 'loc8rData', 'locationData'];

    function reviewModalCtrl($uibModalInstance, loc8rData, locationData) {
        var vm = this;
        vm.formData = {};
        vm.locationData = locationData;

        vm.doAddReview = function (locationid, formData) {

            loc8rData.addReviewById(locationid, {
                    rating: formData.rating,
                    reviewText: formData.reviewText
                })
                .then(
                    function (res) { // success
                        vm.modal.close(res.data);
                    },
                    function (res) { // error
                        vm.formError = "Your review has not been saved, try again";
                    });

            return false;
        };


        vm.modal = {
            close: function(result) {
                $uibModalInstance.close(result);// gives result to the parent controller
            },
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            }
        };

        vm.onSubmit = function () {
            vm.formError = "";

            if (!vm.formData.rating || !vm.formData.reviewText) {
                vm.formError = "All fields are required, please try again";
                return false;
            } else {
                vm.doAddReview(vm.locationData.locationid, vm.formData);
            }

        };

    }

})();