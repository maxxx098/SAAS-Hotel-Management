<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    /**
     * Display the static bookings page.
     */
    public function index(): Response
    {
        return Inertia::render('admin/bookings/bookings');
    }
}