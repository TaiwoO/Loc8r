(function () {
    angular
        .module('loc8rApp')
        .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$location', 'authentication'];

    function loginCtrl($location, authentication) {
        var vm = this;

        vm.pageHeader = {
            title: 'Sign in to Loc8er'
        };

        vm.credentials = {
            email: "",
            password: ""
        };

        vm.returnPage = $location.search().page || '/';

        vm.onSubmit = function () {
            vm.formError = "";
            if (!vm.credentials.email || !vm.credentials.password) {
                vm.formError = "All fields are required man, please try again";
                return false;
            } else {
                vm.doLogin();
            }
        };

        vm.doLogin = function () {
            vm.formError = "";
            authentication
                .login(vm.credentials)
                .catch(function (res) {
                    vm.formError = res.data.message;
                    console.log(res.data.message)
                })
                .then(function () {
                    $location.search('page', null); // clear the query string
                    $location.path(vm.returnPage); // Go to last page
                })


        };
    }

})();