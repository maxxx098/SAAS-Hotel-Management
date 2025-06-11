<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingConfirmed extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Booking Confirmation #' . $this->booking->id . ' - ' . config('app.name'),
            from: config('mail.from.address'),
            // You can also set reply-to if needed
            // replyTo: 'support@yourhotel.com'
        );
    }

    public function content(): Content
    {
        // Determine the best email and name to use
        $guestName = $this->booking->user->name ?? $this->booking->guest_name;
        $guestEmail = $this->booking->notification_email 
            ?? $this->booking->user->email 
            ?? $this->booking->guest_email;

        return new Content(
            view: 'emails.booking-confirmed',
            with: [
                'booking' => $this->booking,
                'guestName' => $guestName,
                'guestEmail' => $guestEmail,
            ]
        );
    }
}
