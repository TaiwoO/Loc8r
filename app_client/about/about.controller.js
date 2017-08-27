(function () {

    angular
        .module("loc8rApp")
        .controller("aboutCtrl", aboutCtrl);

    function aboutCtrl() {
        var vm = this;

        vm.pageHeader = {
            title: 'About Loc8r'
        };

        vm.main = {
            content: " This is an application I built using the book <a target='_blank' href='https://www.manning.com/books/getting-mean-with-mongo-express-angular-and-node'>GETTING MEAN with Mongo, Express, Angular, and Node</a>. \n For me personally, this book was a great introduction to the mean stack"
        }
    }
})();
