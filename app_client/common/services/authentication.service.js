(function () {

    angular
        .module('loc8rApp')
        .service('authentication', authentication);

    authentication.$inject = ['$http', '$window']

    function authentication($http, $window) {

        var saveToken = function (token) {
            $window.localStorage['loc8r-token'] = token;
        }

        var getToken = function () {
            return $window.localStorage['loc8r-token'];
        }

        var register = function (user) {
            return $http.post('/api/register', user)
                .then(
                    function (res) {
                        saveToken(res.data.token);
                    });
        };

        var login = function (user) {
            return $http.post('/api/login', user)
                .then(
                    function (res) {
                        saveToken(res.data.token)
                    });
        }

        var logout = function () {
            $window.localStorage.removeItem('loc8r-token');
        };

        // Logged if requires a present jwt that hasn't expired
        var isLoggedIn = function () {
            var token = getToken();

            if (token) {
                var payload = JSON.parse($window.atob(token.split('.')[1])); // token.split('.')[1]) is the 2nd portion of the jwt which is where the payload lives

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        var currentUser = function () {
            if (isLoggedIn()) {
                var token = getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));
                return {
                    email: payload.email,
                    name: payload.name
                };
            }
        };

        return {
            saveToken: saveToken,
            getToken: getToken,
            login: login,
            register: register,
            logout: logout,
            isLoggedIn: isLoggedIn,
            currentUser: currentUser
        };
    }

})();