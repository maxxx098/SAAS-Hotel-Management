<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Google\Client as GoogleClient;
use Exception;

class GoogleAuthController extends Controller
{
    /**
     * Handle Google ID Token authentication
     */
    public function handleGoogleLogin(Request $request)
    {
        Log::info('Google ID Token received:', ['token' => $request->id_token]);
        
        $request->validate([
            'id_token' => 'required|string',
        ]);

        $idToken = $request->input('id_token');

        try {
            // Verify the token with Google
            $client = new GoogleClient(['client_id' => config('services.google.client_id')]);
            $payload = $client->verifyIdToken($idToken);

            if (!$payload) {
                Log::warning('Invalid Google ID token received');
                return back()->withErrors(['google' => 'Invalid Google token']);
            }

            // Get user information from the payload
            $googleId = $payload['sub'];
            $email = $payload['email'];
            $name = $payload['name'] ?? '';
            $avatar = $payload['picture'] ?? null;

            Log::info('Google user data:', [
                'google_id' => $googleId,
                'email' => $email,
                'name' => $name
            ]);

            // Check if user already exists by email
            $existingUser = User::where('email', $email)->first();

            if ($existingUser) {
                // User exists - update Google ID if not already set
                if (!$existingUser->google_id) {
                    $existingUser->update([
                        'google_id' => $googleId,
                        'email_verified_at' => $existingUser->email_verified_at ?? now(),
                    ]);
                }
                
                $user = $existingUser;
                Log::info('Google OAuth: Existing user logged in', ['user_id' => $user->id]);
                
            } else {
                // Check if Google ID already exists (edge case)
                $googleIdExists = User::where('google_id', $googleId)->first();
                
                if ($googleIdExists) {
                    Log::warning('Google OAuth: Google ID already exists for different email');
                    return back()->withErrors(['google' => 'This Google account is already associated with another email address.']);
                }
                
                // Create new user
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $googleId,
                    'password' => Hash::make(Str::random(32)), // Generate secure random password
                    'email_verified_at' => now(), // Google accounts are considered verified
                    'role' => 'user', // Default role for new Google users
                ]);
                
                Log::info('Google OAuth: New user created', ['user_id' => $user->id]);
            }

            // Log the user in with "remember me" enabled
            Auth::login($user, true);

            // Determine redirect destination based on user role
            $redirectUrl = $user->isAdmin() 
                ? route('admin.dashboard') 
                : route('dashboard');

            // Use intended URL if available, otherwise use role-based redirect
            $intendedUrl = session('url.intended', $redirectUrl);

            return redirect($intendedUrl)->with('status', 'Successfully logged in with Google!');

        } catch (\Google\Exception $e) {
            Log::error('Google API error: ' . $e->getMessage());
            return back()->withErrors(['google' => 'Google authentication service error. Please try again.']);
            
        } catch (\Exception $e) {
            Log::error('Google authentication error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['google' => 'Failed to authenticate with Google: ' . $e->getMessage()]);
        }
    }

    /**
     * Handle unlinking Google account (optional feature)
     */
    public function unlink(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Check if user has a password set (can't unlink if Google is only auth method)
            if (!$user->password) {
                return back()->withErrors(['google' => 'Please set a password before unlinking your Google account.']);
            }
            
            $user->update(['google_id' => null]);
            
            Log::info('Google account unlinked', ['user_id' => $user->id]);
            
            return back()->with('status', 'Google account successfully unlinked.');
            
        } catch (Exception $e) {
            Log::error('Google unlink error: ' . $e->getMessage());
            return back()->withErrors(['google' => 'Failed to unlink Google account. Please try again.']);
        }
    }
}