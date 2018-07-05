
(function () {
    var app = angular.module('StoreModule', ['ngSanitize', 'ngRoute', 'angularUUID2']);
    //global controller
    app.controller('PageController', ['$scope', '$http', 'cartid', function ($scope, $http, cartid) {
        $scope.StoreName = "Beyond Peace";
        $scope.Copyright = "Beyond Peace Apparel. All rights reserved.";
        $scope.Categories = [];
        $http.get('/api/categories/').success(function (data) {
            $scope.Categories = data;
        });
        $scope.tdate = function () {
            return new Date();
        };
        $scope.hdrClassIdx = Math.floor((Math.random() * 5) + 1);
    }]);
    //Home Page controller
    app.controller('HomeController', ['$scope', '$http', function ($scope, $http) {
        $scope.PageContent = [];
        $http.get('/api/pagecontents/1').success(function (data) {
            $scope.PageContent = data;
        });
    }]);
    //Contact Us controller
    app.controller('ContactController', ['$scope', '$http', function ($scope, $http) {
        $scope.PageContent = [];
        $http.get('/api/pagecontents/3').success(function (data) {
            $scope.PageContent = data;
        });
    }]);
    //Products controller
    app.controller('ProductsController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
        $scope.Products = [];
        if ($routeParams.catid) {
            //products in category
            $http.get('/api/products/' + $routeParams.catid).success(function (data) {
                $scope.Products = data;
            });
            //category info
            $scope.CategoryInfo = [];
            $http.get('/api/categories/' + $routeParams.catid).success(function (data) {
                $scope.CategoryInfo = data;
            });
        }
    }]);
    //Product Details controller
    app.controller('ProductDetailsController', ['$scope', '$location', '$http', '$routeParams', 'cartid', function ($scope, $location, $http, $routeParams, cartid) {
        $scope.cart = {};
        $scope.cart.Count = 1;
        $scope.cart.Id = 0;
        $scope.cart.DateCreated = new Date();
        $scope.cart.CartId = cartid.getCartId();
        $scope.Products = [];
        if ($routeParams.prodid) {
            $http.get('/api/productdetails/plp/' + $routeParams.prodid).success(function (data) {
                $scope.Products = data;
                $scope.cart.ProductName = $scope.Products.ProductName;
                $scope.cart.ProductId = $scope.Products.Id;
                $scope.cart.Price = $scope.Products.Price;
                $scope.cart.Sku = $scope.Products.Sku;
                $scope.cart.ColorName = $scope.Products.ColorName;
                $scope.cart.SizeName = $scope.Products.SizeName;
                //size/color menu - set default item is size/colors delimited
                if ($scope.Products.ColorName.indexOf('|') > -1) {
                    $scope.cart.ColorName = $scope.Products.ColorName.split('|')[0];
                }
                if ($scope.Products.SizeName.indexOf('|') > -1) {
                    $scope.cart.SizeName = $scope.Products.SizeName.split('|')[0];
                }
            });
        }
        $scope.addToCart = function (cart) {
            $http.post('/api/cart/', cart).success(function () { $location.path('/cart'); });
        };
    }]);
    //Policies controller
    app.controller('PoliciesController', ['$scope', '$http', function ($scope, $http) {
        $scope.PageContent = [];
        $http.get('/api/pagecontents/2').success(function (data) {
            $scope.PageContent = data;
        });
    }]);
    //Faqs controller
    app.controller('FaqsController', ['$scope', '$http', function ($scope, $http) {
        $scope.FaqShow = true;
        $scope.Faqs = [];
        $http.get('/api/faqs/').success(function (data) {
            $scope.Faqs = data;
        });
    }]);
    //Cart controller
    app.controller('CartController', ['$scope', '$http', 'cartid', function ($scope, $http, cartid) {
        $scope.CartId = cartid.getCartId();
        $scope.CartItems = [];
        $http.get('/api/cartitems/', { params: { cart: $scope.CartId } }).success(function (data) { //used with different param name to keep Gets unique
            $scope.CartItems = data;
            $scope.CartEmpty = ($scope.CartItems.length > 0 ? false : true);
            $scope.Message = ($scope.CartItems.length > 0 ? "" : "Shopping cart is empty.");
            calcTotals();
        });
        $scope.removeItem = function (recordId) {
            $http.delete('/api/cart/' + recordId).success(function () {
                //remove from scope so page updates
                removeCartItem(recordId);
                calcTotals();
                $scope.Message = "item has been removed";
                $scope.CartEmpty = ($scope.CartItems.length > 0 ? false : true);
                $scope.Message = ($scope.CartItems.length > 0 ? "" : "Shopping cart is empty.");
            });
        };
        calcTotals = function () {
            $scope.SubTotal = getSubTotal();
            $scope.Tax = 9 / 100 * $scope.SubTotal;
        };
        getSubTotal = function () {
            var total = 0;
            for (var i = 0; i < $scope.CartItems.length; i++) {
                var item = $scope.CartItems[i];
                total += (item.Price * item.Count);
            }
            return total;
        };
        removeCartItem = function (rid) {
            for (var i = 0; i < $scope.CartItems.length; i++) {
                if ($scope.CartItems[i].Id == rid) {
                    $scope.CartItems.splice(i, 1);
                    break;
                }
            }
        };
    }]);
    //Checkout controller
    app.controller('CheckoutController', ['$scope', '$http', '$location', 'cartid', function ($scope, $http, $location, cartid) {
        $scope.addresses = {};
        $scope.addresses.Uname = cartid.getCartId();
        $http.get('/api/checkout/states').success(function (data) {
            $scope.States = data;
        });
        $http.get('/api/checkout/countries').success(function (data) {
            $scope.Countries = data;
        });
        $scope.addAddress = function (addresses) {
            $http.post('/api/checkout/', addresses).success(function () { $location.path('/payment'); });
        };
    }]);
    //Payment controller
    app.controller('PaymentController', ['$scope', '$http', '$location', 'cartid', function ($scope, $http, $location, cartid) {
        $scope.payment = {};
        $scope.payment.Username = cartid.getCartId();
        $scope.addresses = {};
        $http.get('/api/payments/addresses/' + cartid.getCartId()).success(function (data) {
            $scope.addresses = data;
        });
        $scope.ExpYears = [2014, 2015, 2016, 2017, 2018, 2019, 2020];
        $scope.ExpMos = [
            { name: 'January', num: 1 },
            { name: 'February', num: 2 },
            { name: 'March', num: 3 },
            { name: 'April', num: 4 },
            { name: 'May', num: 5 },
            { name: 'June', num: 6 },
            { name: 'July', num: 7 },
            { name: 'August', num: 8 },
            { name: 'September', num: 9 },
            { name: 'October', num: 10 },
            { name: 'November', num: 11 },
            { name: 'December', num: 12 }
        ];
        $http.get('/api/payments/shipping/' + cartid.getCartId()).success(function (data) {
            $scope.Shipping = data;
            $scope.payment.ShipChoice = $scope.Shipping[0]; //sets first item as selected (eliminates blank default item)
        });
        $scope.addPayment = function (payment) {
            $http.post('/api/payments/post/', payment).success(function (data, status, headers, config) {
                $location.path('/order/' + data.replace(/\"/g, ""));
            });
        };
    }]);
    //OrderComplete controller
    app.controller('OrderCompleteController', ['$scope', '$routeParams', function ($scope, $routeParams) {
        $scope.OrderNum = $routeParams.ordid;
    }]);
    //Filters
    app.filter('encodeURIComponent', function () {
        return function (item) {
            return window.encodeURIComponent(item.toLowerCase()); //encodes url string and makes it lowercase
        };
    });
    //Factories
    app.factory('cookies', function () {
        //ng-cookie does not support expiration date
        return {
            setCookie: function (cookieName, cookieValue, nDays) {
                var today = new Date();
                var expire = new Date();
                if (nDays == null || nDays == 0)
                    nDays = 1;
                expire.setTime(today.getTime() + 3600000 * 24 * nDays);
                document.cookie = cookieName + '=' + escape(cookieValue) + ';expires=' + expire.toGMTString();
            },
            readCookie: function (cookieName) {
                var theCookie = ' ' + document.cookie;
                var ind = theCookie.indexOf(' ' + cookieName + '=');
                if (ind == -1)
                    ind = theCookie.indexOf(';' + cookieName + '=');
                if (ind == -1 || cookieName == "")
                    return '';
                var ind1 = theCookie.indexOf(';', ind + 1);
                if (ind1 == -1)
                    ind1 = theCookie.length;
                return unescape(theCookie.substring(ind + cookieName.length + 2, ind1));
            }
        };
    });
    app.factory('cartid', function (cookies, uuid2) {
        return {
            getCartId: function () {
                var cartId = cookies.readCookie('cartId222');
                if (!cartId) {
                    cartId = uuid2.newuuid();
                    cookies.setCookie('cartId222', cartId, 30);
                }
                return cartId;
            }
        };
    });
    //Routes
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
		// route for the home page
		.when('/', { templateUrl: 'pages/home.html' })
        // route for the faqs  page
        .when('/faqs', { templateUrl: 'pages/faqs.html' })
        // route for the shopping cart  page
        .when('/cart', { templateUrl: 'pages/cart.html' })
		// route for the contact page
		.when('/contact', { templateUrl: 'pages/contact.html' })
        // route for the shopping cart  page
        .when('/payment', { templateUrl: 'pages/payment.html' })
        // route for the shopping cart  page
        .when('/checkout', { templateUrl: 'pages/address.html' })
		// route for the terms & policies page
		.when('/policies', { templateUrl: 'pages/policies.html' })
        // route for the order  page
        .when('/order/:ordid', { templateUrl: 'pages/order.html' })
        // route for the categories  page
        .when('/categories', { templateUrl: 'pages/categories.html' })
        // route for the product list page
        .when('/products/:catid', { templateUrl: 'pages/products.html' })
        // route for the product details page
        .when('/productdetails/:prodid', { templateUrl: 'pages/productdetails.html' })
        //default
        .otherwise({ redirectTo: '/' });
    }]);
})();
