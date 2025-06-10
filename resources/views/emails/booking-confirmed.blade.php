<!DOCTYPE html>
<html>
<head>
    <title>Booking Confirmation</title>
</head>
<body>
    <h1>Hi {{ $booking->user->name ?? $booking->guest_name }},</h1>
    <p>Your booking (ID: {{ $booking->id }}) has been confirmed!</p>
    <p>Check-in: {{ $booking->check_in->format('F j, Y') }}</p>
    <p>Check-out: {{ $booking->check_out->format('F j, Y') }}</p>
    <p>Total Amount: ${{ number_format($booking->total_amount, 2) }}</p>
    <p>Thank you for booking with us!</p>
</body>
</html>
