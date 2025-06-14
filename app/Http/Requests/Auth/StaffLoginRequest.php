<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StaffLoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $login = $this->input('login');
        $password = $this->input('password');

        // Find user by employee_id, username, or email
        $user = $this->findUserByLogin($login);

        // Debug: Log what we found
        Log::info('Staff login attempt', [
            'login_input' => $login,
            'user_found' => $user ? true : false,
            'user_id' => $user ? $user->id : null,
            'found_by' => $user ? $this->getFoundByMethod($login, $user) : null,
        ]);

        if (!$user || !Hash::check($password, $user->password)) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'login' => trans('auth.failed'),
            ]);
        }

        // Debug: Log user details before isStaff check
        Log::info('User found for staff login', [
            'user_id' => $user->id,
            'username' => $user->username,
            'employee_id' => $user->employee_id,
            'email' => $user->email,
            'role' => $user->role,
            'department' => $user->department ?? 'null',
            'is_staff_result' => $user->isStaff(),
        ]);

        // Check if user is staff
        if (!$user->isStaff()) {
            Log::warning('Non-staff user attempted staff login', [
                'user_id' => $user->id,
                'role' => $user->role,
                'login_input' => $login,
            ]);

            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'login' => 'These credentials are not authorized for staff access.',
            ]);
        }

        // Debug: Log successful authentication
        Log::info('Staff login successful', [
            'user_id' => $user->id,
            'role' => $user->role,
            'login_method' => $this->getFoundByMethod($login, $user),
        ]);

        // Manually log in the user
        Auth::login($user, $this->boolean('remember'));

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Find user by employee_id, username, or email
     */
    private function findUserByLogin(string $login): ?User
    {
        // Try to find by employee_id first
        $user = User::where('employee_id', $login)->first();
        
        if ($user) {
            Log::info('User found by employee_id', [
                'login' => $login,
                'user_id' => $user->id,
                'role' => $user->role,
            ]);
            return $user;
        }

        // Try to find by username
        $user = User::where('username', $login)->first();
        
        if ($user) {
            Log::info('User found by username', [
                'login' => $login,
                'user_id' => $user->id,
                'role' => $user->role,
            ]);
            return $user;
        }

        // Finally, try to find by email
        $user = User::where('email', $login)->first();
        
        if ($user) {
            Log::info('User found by email', [
                'login' => $login,
                'user_id' => $user->id,
                'role' => $user->role,
            ]);
        }

        return $user;
    }

    /**
     * Determine how the user was found (for debugging)
     */
    private function getFoundByMethod(string $login, User $user): string
    {
        if ($user->employee_id === $login) {
            return 'employee_id';
        }
        
        if ($user->username === $login) {
            return 'username';
        }
        
        if ($user->email === $login) {
            return 'email';
        }
        
        return 'unknown';
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->input('login')).'|'.$this->ip());
    }
}