<?php

namespace App\Http\Controllers\Staff;

use App\Models\Booking;
use App\Models\StaffTask;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FrontDeskController extends BaseStaffController
{
    public function index(): \Inertia\Response
    {
        $user = auth()->user();
        $dashboardData = $this->getFrontDeskDashboardData($user);

        return Inertia::render('dashboard/staff/index', [
            'dashboardData' => $dashboardData,
            ...$this->getBaseStaffData($user)
        ]);
    }

    public function stats(): JsonResponse
    {
        $user = auth()->user();
        return response()->json([
            'success' => true,
            'stats' => $this->getRoleSpecificStats($user),
        ]);
    }

    protected function getRoleSpecificStats($user): array
    {
        $today = Carbon::today();
        
      $stats = \DB::selectOne("
        SELECT 
        COUNT(CASE WHEN DATE(check_in) = ? AND status = 'confirmed' THEN 1 END) as check_ins_today,
        COUNT(CASE WHEN DATE(check_out) = ? AND status = 'checked_in' THEN 1 END) as check_outs_today,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings
            FROM bookings
        ", [$today->format('Y-m-d'), $today->format('Y-m-d')]);

        return [
            'checkInsToday'   => (int) ($stats->check_ins_today ?? 0),
            'checkOutsToday'  => (int) ($stats->check_outs_today ?? 0),
            'pendingBookings' => (int) ($stats->pending_bookings ?? 0),
            'tasksCompleted'  => $this->getCompletedTasksCount($user->id, $today),
        ];
    }

    protected function getRoleSpecificTasks($user): array
    {
        $today = Carbon::today();
        $tasks = [];

        $checkIns = Booking::with(['user', 'room'])
            ->whereDate('check_in', $today) // ✅ safer than just ->where('check_in', $today)
            ->where('status', 'confirmed')
            ->get();

        foreach ($checkIns as $booking) {
            $tasks[] = [
                'id'          => $booking->id,
                'type'        => 'check_in',
                'title'       => 'Check-in: ' . ($booking->user->name ?? 'Guest'),
                'description' => 'Room ' . ($booking->room->number ?? 'TBD'),
                'priority'    => 'medium',
                'status'      => 'pending',
            ];
        }

        return $tasks;
    }

    private function getFrontDeskDashboardData($user): array
    {
        return [
            'todayStats' => $this->getRoleSpecificStats($user),
            'todayTasks' => $this->getRoleSpecificTasks($user),
        ];
    }

    public function checkIn(Request $request): JsonResponse
    {
        // TODO: Implement check-in logic
        return response()->json(['message' => 'Check-in processed successfully']);
    }

    public function checkOut(Request $request): JsonResponse
    {
        // TODO: Implement check-out logic
        return response()->json(['message' => 'Check-out processed successfully']);
    }
}
