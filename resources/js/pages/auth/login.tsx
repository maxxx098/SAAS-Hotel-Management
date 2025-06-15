
import { Head, useForm, router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

declare global {
    interface Window {
        google: any;
    }
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleError, setGoogleError] = useState<string | null>(null);
    const [googleReady, setGoogleReady] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // Initialize Google Sign-In
    useEffect(() => {
        const initializeGoogleSignIn = () => {
            if (window.google?.accounts?.id) {
                const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
                
                if (!clientId) {
                    console.error('VITE_GOOGLE_CLIENT_ID is not set in environment variables');
                    setGoogleError('Google Sign-In is not configured properly');
                    return;
                }
                
                try {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleGoogleResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                        ux_mode: 'popup',
                        use_fedcm_for_prompt: false, // Disable FedCM to avoid some origin issues
                    });
                    
                    setGoogleReady(true);
                    setGoogleError(null);
                    console.log('Google Sign-In initialized successfully');
                } catch (error) {
                    console.error('Google Sign-In initialization error:', error);
                    setGoogleError('Failed to initialize Google Sign-In');
                }
            }
        };

        // Load Google Sign-In script
        if (!window.google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                // Wait a bit for the Google object to be fully available
                setTimeout(initializeGoogleSignIn, 100);
            };
            script.onerror = () => {
                setGoogleError('Failed to load Google Sign-In');
            };
            document.head.appendChild(script);
        } else {
            initializeGoogleSignIn();
        }
    }, []);

    const handleGoogleResponse = (response: any) => {
        if (response.credential) {
            setGoogleLoading(true);
            setGoogleError(null);
            
            // Send the ID token to your Laravel backend
            router.post(route('google.login'), {
                id_token: response.credential,
            }, {
                onFinish: () => setGoogleLoading(false),
                onError: (errors) => {
                    setGoogleLoading(false);
                    if (errors.google) {
                        setGoogleError(errors.google);
                    }
                }
            });
        }
    };

    const handleGoogleLogin = () => {
        if (!window.google?.accounts?.id) {
            setGoogleError('Google Sign-In is not loaded yet');
            return;
        }
        
        if (!googleReady) {
            setGoogleError('Google Sign-In is not ready yet');
            return;
        }
        
        try {
            setGoogleError(null);
            setGoogleLoading(true);
            
            // Use the One Tap prompt
            window.google.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.log('Google One Tap not displayed, reason:', notification.getNotDisplayedReason?.() || 'unknown');
                    
                    // Fallback: render a temporary button and trigger it
                    const buttonContainer = document.createElement('div');
                    buttonContainer.style.position = 'absolute';
                    buttonContainer.style.top = '-9999px';
                    buttonContainer.style.left = '-9999px';
                    document.body.appendChild(buttonContainer);
                    
                    window.google.accounts.id.renderButton(buttonContainer, {
                        theme: 'outline',
                        size: 'large',
                        width: 300,
                        type: 'standard',
                        shape: 'rectangular',
                        text: 'signin_with',
                        logo_alignment: 'left'
                    });
                    
                    // Trigger the button click
                    setTimeout(() => {
                        const googleButton = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
                        if (googleButton) {
                            googleButton.click();
                        } else {
                            setGoogleLoading(false);
                            setGoogleError('Failed to create Google Sign-In button');
                        }
                        // Clean up
                        setTimeout(() => {
                            if (document.body.contains(buttonContainer)) {
                                document.body.removeChild(buttonContainer);
                            }
                        }, 100);
                    }, 100);
                } else {
                    setGoogleLoading(false);
                }
            });
        } catch (error) {
            console.error('Google Sign-In error:', error);
            setGoogleLoading(false);
            setGoogleError('Failed to start Google Sign-In');
        }
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <form className="flex flex-col gap-6 " onSubmit={submit}>
                <div className="grid gap-6">
                    {/* Google Login Button */}
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleGoogleLogin}
                            disabled={googleLoading || !googleReady}
                            tabIndex={1}
                        >
                            {googleLoading ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            )}
                            Continue with Google
                        </Button>
                        
                        {/* Google Error Display */}
                        {googleError && (
                            <div className="mt-2 text-sm text-red-600">
                                {googleError}
                            </div>
                        )}
                        
                        {/* Google Errors from Backend */}
                        {(errors as any).google && (
                            <InputError message={(errors as any).google} />
                        )}
                    </div>
                    <div>
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => router.visit(route('staff.login'))} // or your staff login route
                        tabIndex={1}
                    >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Log in as Staff
                    </Button>
                </div>
                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={6}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={4}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} tabIndex={7}>
                        Sign up
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}