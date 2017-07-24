$('#addReview').submit(function (e) {
    $('.alert.alert-danger').hide();
    if (!$('input#name').val() || !$('select#rating').val() || !$('textarea#review').val()) {
        if ($('.alert.alert-danger').length) {// Already there?
            $('.alert.alert-danger').show();
        } else {// show the thing for the first time 
            $(this).prepend('<div role="alert" class="alert alert-danger"> All feilds required, please try again..</div>');
        }
        return false; // prevents the form from submitting
    }
})

