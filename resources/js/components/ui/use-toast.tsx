// Custom Toast Hook and Component
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
// import { Props } from 'node_modules/@headlessui/react/dist/types';

interface Toast {
  [x: string]: any;
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

interface ToastContextType {
  toast: (toast: Omit<Toast, 'id'>) => void;
}

// Custom hook for toast
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, title, description, variant, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toast, toasts, removeToast };
};

// Toast Component
interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent = ({ toast, onRemove }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'destructive':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getVariantStyles = () => {
    switch (toast.variant) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'destructive':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      default:
        return 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950';
    }
  };

  return (
    <div
      className={`
        fixed right-4 z-50 mb-4 flex w-full max-w-sm items-center space-x-4 rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out
        ${getVariantStyles()}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{ top: `${toast.indexOf(toast) * 80 + 20}px` }}
    >
      {getIcon()}
      <div className="flex-1 space-y-1">
        <div className="text-sm font-semibold">{toast.title}</div>
        {toast.description && (
          <div className="text-sm text-muted-foreground">{toast.description}</div>
        )}
      </div>
      <button
        onClick={handleRemove}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast, index) => (
        <ToastComponent 
          key={toast.id} 
          toast={toast} 
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

// Updated booking management component with custom toast
interface UserBookingManagementWithToastProps {
  bookings: any;
  filters: any;
}

export default function UserBookingManagementWithToast({ bookings, filters }: UserBookingManagementWithToastProps) {
    const { toast } = useToast();
    // ... rest of your existing state and functions

    const handleSaveEdit = (bookingId: number) => {
        put(route('bookings.update', bookingId), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                resetEdit();
                toast({
                    title: "Booking Updated",
                    description: "Your booking has been updated successfully.",
                    variant: "success",
                });
            },
            onError: () => {
                toast({
                    title: "Update Failed",
                    description: "Failed to update booking. Please try again.",
                    variant: "destructive",
                });
            }
        });
    };

    const handleCancelBooking = (bookingId: number) => {
        setIsProcessing(true);
        router.delete(route('bookings.destroy', bookingId), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setBookingToCancel(null);
                setIsProcessing(false);
                toast({
                    title: "Booking Cancelled",
                    description: "Your booking has been cancelled successfully.",
                    variant: "success",
                });
            },
            onError: () => {
                setIsProcessing(false);
                toast({
                    title: "Cancellation Failed",
                    description: "Failed to cancel booking. Please try again.",
                    variant: "destructive",
                });
            }
        });
    };

    // Define breadcrumbs for the AppLayout
    const breadcrumbs = [
        { title: "Home", href: "/" },
        { title: "My Bookings", href: "/bookings" }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Bookings" />
            <ToastContainer />
            {/* ... rest of your existing JSX */}
        </AppLayout>
    );
}

function put(arg0: string, arg1: { onSuccess: () => void; onError: () => void; }) {
    throw new Error('Function not implemented.');
}
function setIsEditDialogOpen(arg0: boolean) {
    throw new Error('Function not implemented.');
}

function resetEdit() {
    throw new Error('Function not implemented.');
}

function setIsProcessing(arg0: boolean) {
    throw new Error('Function not implemented.');
}

function setBookingToCancel(arg0: null) {
    throw new Error('Function not implemented.');
}

