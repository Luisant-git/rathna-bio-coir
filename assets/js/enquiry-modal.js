/* ==================================================
   # Enquiry Modal - Product Page
================================================== */

// Open enquiry modal when clicking "Enquiry Now" on product cards
$('.open-enquiry-modal').on('click', function(e) {
    e.preventDefault();
    var productName = $(this).data('product');
    $('#enquiryModal').addClass('active');
    // Pre-select product in dropdown
    if (productName) {
        $('#eproduct').val(productName).trigger('change');
        $('.nice-select').niceSelect('update');
    }
    // Clear any previous messages
    $('#emessage').html('').removeClass('alert-success alert-error-show').hide();
    // Reset form
    $('.enquiry-form')[0].reset();
    $('body').css('overflow', 'hidden');
});

// Close enquiry modal
function closeEnquiryModal() {
    $('#enquiryModal').removeClass('active');
    $('body').css('overflow', '');
}

$(document).on('click', '.enquiry-modal-close', function() {
    closeEnquiryModal();
});

$(document).on('click', '.enquiry-modal-overlay', function(e) {
    if ($(e.target).hasClass('enquiry-modal-overlay')) {
        closeEnquiryModal();
    }
});

// Close on Escape key
$(document).on('keydown', function(e) {
    if (e.key === 'Escape' && $('#enquiryModal').hasClass('active')) {
        closeEnquiryModal();
    }
});

// Enquiry form submission via AJAX
$('.enquiry-form').on('submit', function(e) {
    e.preventDefault();
    var formInstance = $(this);
    var action = formInstance.attr('action');

    $('#emessage').slideUp(750, function() {
        $('#emessage').hide();
        $('#esubmit')
            .after('<img src="assets/img/ajax-loader.gif" class="loader" />')
            .attr('disabled', 'disabled');

        $.post(action, {
            name: $('#ename').val(),
            email: $('#eemail').val(),
            phone: $('#ephone').val(),
            product: $('#eproduct').val(),
            comments: $('#ecomments').val()
        }, function(data) {
            $('.enquiry-form img.loader').fadeOut('slow', function() {
                $(this).remove();
            });
            $('#esubmit').removeAttr('disabled');

            if (data.indexOf('alert-success') !== -1) {
                // Show success message in modal
                $('#emessage').html("<div class='alert alert-success'><h4>Enquiry Submitted!</h4><p>Thank you for your enquiry. We will get back to you shortly.</p></div>").addClass('alert-success').slideDown('slow');
                formInstance[0].reset();
                // Auto close after 4 seconds
                setTimeout(function() {
                    closeEnquiryModal();
                }, 4000);
            } else {
                // Show error inline
                document.getElementById('emessage').innerHTML = data;
                $('#emessage').addClass('alert-error-show').slideDown('slow');
            }
        });
    });
    return false;
});