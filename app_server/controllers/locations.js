
/* GET 'home' page */
module.exports.homelist = function(req, res, next) {
  res.render('location-list', { title: 'Home' });
};

/* GET 'Location Info' page */
module.exports.locationInfo = function(req, res, next) {
  res.render('location-info', { title: 'Location info' });
};

/* GET 'Add review' page */
module.exports.addReview = function(req, res, next) {
  res.render('index', { title: 'Add review' });
};