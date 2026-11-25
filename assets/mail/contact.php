
<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit;
}

// Get form values safely
$name     = trim($_POST['name'] ?? '');
$email    = trim($_POST['email'] ?? '');
$phone    = trim($_POST['phone'] ?? '');
$product  = trim($_POST['product'] ?? '');
$comments = trim($_POST['comments'] ?? '');

// Email validation
function isEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Form validation
if ($name === '') {
    echo '<div class="alert alert-error">You must enter your name.</div>';
    exit;
}

if ($email === '') {
    echo '<div class="alert alert-error">You must enter email address.</div>';
    exit;
}

if (!isEmail($email)) {
    echo '<div class="alert alert-error">You must enter a valid email address.</div>';
    exit;
}

if ($phone === '') {
    echo '<div class="alert alert-error">Please fill all fields!</div>';
    exit;
}

if ($comments === '') {
    echo '<div class="alert alert-error">You must enter your comments.</div>';
    exit;
}

// Prevent email header injection
if (preg_match('/[\r\n]/', $email)) {
    echo '<div class="alert alert-error">Invalid email address.</div>';
    exit;
}

// Email configuration
$address = 'rathnabiocoirproduct@gmail.com';
$e_subject = 'Contact Form';

// Email content
$e_body = "You have been contacted by $name." . PHP_EOL . PHP_EOL;

$e_content =
    "Name: $name" . PHP_EOL .
    "Email: $email" . PHP_EOL .
    "Phone: $phone" . PHP_EOL .
    "Product: $product" . PHP_EOL .
    "Message: $comments" . PHP_EOL . PHP_EOL;

$msg = wordwrap($e_body . $e_content, 70);

// Email headers
$headers = "From: Rathna Bio Coir Website <no-reply@rathnabiocoirproduct.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Send email
if (mail($address, $e_subject, $msg, $headers)) {

    $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');

    echo "<div class='alert alert-success'>";
    echo "<h3>Email Sent Successfully.</h3>";
    echo "<p>Thank you <strong>$safeName</strong>, your message has been submitted to us.</p>";
    echo "</div>";

} else {

    echo '<div class="alert alert-error">Unable to send email. Please try again later.</div>';

}

?>
