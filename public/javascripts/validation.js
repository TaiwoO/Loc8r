$('#addReview').submit(function (e) {
    $('.alert.alert-danger').hide();
    if (!$('input#name').val() || !$('select#rating').val() || !$('textarea#review').val()) {
        if ($('.alert.alert-danger').length) { // alert message has already been rendered?
            $('.alert.alert-danger').show();
        } else {// render alert for the first time 
            $(this).prepend('<div role="alert" class="alert alert-danger"> All feilds required, please try again..</div>');
        }
        return false; // prevents the form from submitting
    }
})

