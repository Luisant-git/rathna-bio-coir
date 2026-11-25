/* ==================================================
   # Enquiry Modal - Product Page
================================================== */

// Auto open enquiry modal on first visit only (once per session)
$(document).ready(function() {
    // Check if popup was already shown in this session
    if (!sessionStorage.getItem('enquiryModalShown')) {
        setTimeout(function() {
            $('#enquiryModal').addClass('active');
            $('body').css('overflow', 'hidden');
            sessionStorage.setItem('enquiryModalShown', 'true');
        }, 3000);
    }
});

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

// Enquiry form submission via EmailJS
$('.enquiry-form').on('submit', function(e) {
    e.preventDefault();
    var formInstance = $(this);

    var formData = {
        name: $('#ename').val() || '',
        email: $('#eemail').val() || '',
        phone: $('#ephone').val() || '',
        product: $('#eproduct').val() || '',
        message: $('#ecomments').val() || '',
        form_type: 'Product Enquiry Modal'
    };

    var validationError = window.validateRathnaForm
        ? window.validateRathnaForm(formData)
        : null;

    if (validationError) {
        $('#emessage').html('<div class="alert alert-error">' + validationError + '</div>').addClass('alert-error-show').slideDown('slow');
        return false;
    }

    $('#emessage').slideUp(300, function() {
        $('#emessage').hide().removeClass('alert-success alert-error-show');
        $('#esubmit')
            .after('<img src="assets/img/ajax-loader.gif" class="loader" />')
            .attr('disabled', 'disabled');

        window.sendRathnaEmail(formData)
            .then(function() {
                $('.enquiry-form img.loader').fadeOut('slow', function() {
                    $(this).remove();
                });
                $('#esubmit').removeAttr('disabled');

                $('#emessage')
                    .html("<div class='alert alert-success'><h4>Enquiry Submitted!</h4><p>Thank you for your enquiry. We will get back to you shortly.</p></div>")
                    .addClass('alert-success')
                    .slideDown('slow');
                formInstance[0].reset();
                $('.nice-select').niceSelect('update');

                setTimeout(function() {
                    closeEnquiryModal();
                }, 4000);
            })
            .catch(function(err) {
                console.error('EmailJS Enquiry Error:', err);
                $('.enquiry-form img.loader').fadeOut('slow', function() {
                    $(this).remove();
                });
                $('#esubmit').removeAttr('disabled');
                $('#emessage')
                    .html('<div class="alert alert-error">Failed to send enquiry. Please try again or call +91 9629165966.</div>')
                    .addClass('alert-error-show')
                    .slideDown('slow');
            });
    });
    return false;
});