<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .booking-details { background: #f8f9fa; padding: 15px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Booking Confirmed!</h1>
        </div>
        
        <div class="content">
            <p>Dear {{ $guestName }},</p>
            
            <p>We're pleased to confirm your booking. Here are the details:</p>
            
            <div class="booking-details">
                <h3>Booking Details</h3>
                <p><strong>Booking ID:</strong> {{ $booking->id }}</p>
                <p><strong>Room Type:</strong> {{ $booking->room->name ?? $booking->room_type }}</p>
                <p><strong>Check-in:</strong> {{ $booking->check_in->format('F j, Y') }}</p>
                <p><strong>Check-out:</strong> {{ $booking->check_out->format('F j, Y') }}</p>
                <p><strong>Guests:</strong> {{ $booking->adults }} Adults{{ $booking->children > 0 ? ', ' . $booking->children . ' Children' : '' }}</p>
                <p><strong>Total Amount:</strong> ${{ number_format($booking->total_amount, 2) }}</p>
            </div>
            
            @if($booking->special_requests)
            <p><strong>Special Requests:</strong> {{ $booking->special_requests }}</p>
            @endif
            
            <p>We look forward to welcoming you!</p>
            
            <p>Best regards,<br>{{ config('app.name') }}</p>
        </div>
    </div>
</body>
</html>