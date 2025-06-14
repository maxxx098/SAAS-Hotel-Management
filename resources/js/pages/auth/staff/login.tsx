import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type StaffLoginForm = {
    login: string; // Can be employee_id, username, or email
    password: string;
    remember: boolean;
};

interface StaffLoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function StaffLogin({ status, canResetPassword }: StaffLoginProps) {
    const [loginType, setLoginType] = useState<'employee_id' | 'username' | 'email'>('employee_id');
    
    const { data, setData, post, processing, errors, reset } = useForm<Required<StaffLoginForm>>({
        login: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('staff.login'), {
            onFinish: () => reset('password'),
        });
    };

    const detectLoginType = (value: string) => {
        if (value.includes('@')) {
            setLoginType('email');
        } else if (value.startsWith('EMP-') || /^\d+$/.test(value)) {
            setLoginType('employee_id');
        } else {
            setLoginType('username');
        }
    };

    const getPlaceholder = () => {
        switch (loginType) {
            case 'email':
                return 'staff@example.com';
            case 'employee_id':
                return 'EMP-1234';
            case 'username':
                return 'staffusername';
            default:
                return 'Employee ID, Username, or Email';
        }
    };

    const getInputLabel = () => {
        switch (loginType) {
            case 'email':
                return 'Email Address';
            case 'employee_id':
                return 'Employee ID';
            case 'username':
                return 'Username';
            default:
                return 'Login';
        }
    };

    return (
        <AuthLayout 
            title="Staff Portal Login" 
            description="Enter your employee credentials to access the staff portal"
        >
            <Head title="Staff Login" />

            {/* Link to regular login */}
            <div className="mb-4 text-center">
                <p className="text-sm text-muted-foreground">
                    Not a staff member?{' '}
                    <TextLink href={route('login')}>
                        Login as Guest
                    </TextLink>
                </p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="login">{getInputLabel()}</Label>
                        <Input
                            id="login"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            value={data.login}
                            onChange={(e) => {
                                setData('login', e.target.value);
                                detectLoginType(e.target.value);
                            }}
                            placeholder={getPlaceholder()}
                        />
                        <div className="text-xs text-muted-foreground">
                            You can use your Employee ID, Username, or Email address
                        </div>
                        <InputError message={errors.login} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink 
                                    href={route('password.request')} 
                                    className="ml-auto text-sm" 
                                    tabIndex={5}
                                >
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
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
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Sign In to Staff Portal
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Need help accessing your account?{' '}
                    <TextLink href="#" tabIndex={6}>
                        Contact IT Support
                    </TextLink>
                </div>
            </form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}