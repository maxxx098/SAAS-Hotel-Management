import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Timer,
  Users2,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const TabsContext = React.createContext<{ value: string; setValue: (v: string) => void }>({ value: '', setValue: () => {} });

interface TabsProps {
    defaultValue: string;
    className?: string;
    children: React.ReactNode;
}
const Tabs: React.FC<TabsProps> = ({ defaultValue, className, children }) => {
    const [value, setValue] = useState(defaultValue);
    return (
        <TabsContext.Provider value={{ value, setValue }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
};

interface TabsListProps {
    children: React.ReactNode;
}
const TabsList: React.FC<TabsListProps> = ({ children }) => (
    <div className="flex gap-2 border-b border-border mb-4">{children}</div>
);

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
}
const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children }) => {
    const ctx = React.useContext(TabsContext);
    const isActive = ctx.value === value;
    return (
        <button
            type="button"
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => ctx.setValue(value)}
        >
            {children}
        </button>
    );
};

interface TabsContentProps {
    value: string;
    className?: string;
    children: React.ReactNode;
}
const TabsContent: React.FC<TabsContentProps> = ({ value, className, children }) => {
    const ctx = React.useContext(TabsContext);
    if (ctx.value !== value) return null;
    return <div className={className}>{children}</div>;
};

interface PopoverProps {
    children: React.ReactNode;
}

interface PopoverContentProps {
    children: React.ReactNode;
    className?: string;
}

interface PopoverTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

const PopoverContext = React.createContext<{
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
} | null>(null);

export const Popover: React.FC<PopoverProps> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    return (
        <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
            <div className="relative inline-block">{children}</div>
        </PopoverContext.Provider>
    );
};

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children, asChild }) => {
    const ctx = React.useContext(PopoverContext);
    if (!ctx) return null;

    const { setOpen, triggerRef } = ctx;

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            ref: (node: HTMLButtonElement) => {
                (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
                const childRef = (children as React.ReactElement<any>).props.ref;
                if (typeof childRef === 'function') {
                    childRef(node);
                } else if (childRef && typeof childRef === 'object') {
                    (childRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
                }
            },
            onClick: (e: React.MouseEvent) => {
                setOpen((prev) => !prev);
                const childProps = (children as React.ReactElement<any>).props;
                if (
                    childProps &&
                    typeof childProps === 'object' &&
                    'onClick' in childProps &&
                    typeof childProps.onClick === 'function'
                ) {
                    childProps.onClick(e);
                }
            },
        });
    }

    return (
        <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="focus:outline-none"
        >
            {children}
        </button>
    );
};

export const PopoverContent: React.FC<PopoverContentProps> = ({ children, className }) => {
    const ctx = React.useContext(PopoverContext);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                ctx?.open &&
                contentRef.current &&
                !contentRef.current.contains(event.target as Node) &&
                ctx.triggerRef.current &&
                !ctx.triggerRef.current.contains(event.target as Node)
            ) {
                ctx.setOpen(false);
            }
        }
        if (ctx?.open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ctx]);

    if (!ctx?.open) return null;

    return (
        <div
            ref={contentRef}
            className={`absolute z-50 mt-2 bg-background border border-border rounded-md shadow-lg ${className ?? ''}`}
            style={{ minWidth: 180 }}
        >
            {children}
        </div>
    );
};

export interface CalendarProps {
    selected?: Date;
    onSelect?: (date: Date) => void;
    className?: string;
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function isSameDay(a?: Date, b?: Date) {
    return (
        a &&
        b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
    ({ selected, onSelect, className }, ref) => {
        const today = new Date();
        const [viewMonth, setViewMonth] = useState(
            selected ? selected.getMonth() : today.getMonth()
        );
        const [viewYear, setViewYear] = useState(
            selected ? selected.getFullYear() : today.getFullYear()
        );

        const daysInMonth = getDaysInMonth(viewYear, viewMonth);
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const weeks: (Date | null)[][] = [];
        let week: (Date | null)[] = Array(firstDay).fill(null);

        for (let d = 1; d <= daysInMonth; d++) {
            week.push(new Date(viewYear, viewMonth, d));
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        }
        if (week.length) {
            while (week.length < 7) week.push(null);
            weeks.push(week);
        }

        const handlePrevMonth = () => {
            if (viewMonth === 0) {
                setViewMonth(11);
                setViewYear(viewYear - 1);
            } else {
                setViewMonth(viewMonth - 1);
            }
        };

        const handleNextMonth = () => {
            if (viewMonth === 11) {
                setViewMonth(0);
                setViewYear(viewYear + 1);
            } else {
                setViewMonth(viewMonth + 1);
            }
        };

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

        return (
            <div ref={ref} className={cn("p-3 bg-background text-foreground", className)}>
                <div className="flex items-center justify-between mb-2">
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="px-2 py-1 rounded hover:bg-muted text-foreground"
                        aria-label="Previous month"
                    >
                        &lt;
                    </button>
                    <span className="font-semibold text-foreground">
                        {monthNames[viewMonth]} {viewYear}
                    </span>
                    <button
                        type="button"
                        onClick={handleNextMonth}
                        className="px-2 py-1 rounded hover:bg-muted text-foreground"
                        aria-label="Next month"
                    >
                        &gt;
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs text-center mb-1">
                    {dayNames.map((d) => (
                        <div key={d} className="font-medium text-muted-foreground">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {weeks.flat().map((date, idx) =>
                        date ? (
                            <button
                                key={idx}
                                type="button"
                                className={cn(
                                    "rounded p-1 w-8 h-8 text-sm text-foreground hover:bg-muted transition-colors",
                                    isSameDay(date, selected) && "bg-primary text-primary-foreground hover:bg-primary",
                                    isSameDay(date, today) && !isSameDay(date, selected) && "border border-primary"
                                )}
                                onClick={() => onSelect?.(date)}
                            >
                                {date.getDate()}
                            </button>
                        ) : (
                            <div key={idx} />
                        )
                    )}
                </div>
            </div>
        );
    }
);

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => (
        <textarea
            ref={ref}
            className={cn(
                "border border-input rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent min-h-[60px] resize-vertical",
                className
            )}
            {...props}
        />
    )
);

Textarea.displayName = 'Textarea';

interface Staff {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  employee_id: string;
  status: 'active' | 'busy' | 'off_duty';
}

interface Room {
  id: number;
  number: string;
  type: string;
  status: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to: number;
  assigned_staff?: Staff;
  room_id?: number;
  room?: Room;
  scheduled_date: string;
  scheduled_time?: string;
  estimated_duration: number;
  location?: string;
  created_at: string;
  updated_at: string;
}

interface PageProps {
  staff: Staff[];
  rooms: Room[];
  tasks: Task[];
  taskTypes: string[];
  departments: string[];
  [key: string]: unknown;
}

const AdminTaskAssignment: React.FC = () => {
  const { staff, rooms, tasks, taskTypes, departments } = usePage<PageProps>().props;
  
  const getTaskTypesArray = () => {
    if (Array.isArray(taskTypes)) {
      return taskTypes;
    }
    if (typeof taskTypes === 'object' && taskTypes !== null) {
      return Object.keys(taskTypes);
    }
    return [
      'general',
      'room_cleaning',
      'maintenance',
      'repair',
      'inspection',
      'cleaning',
      'guest_service',
      'security_check',
      'laundry',
      'preventive_maintenance'
    ];
  };
  
  const availableTaskTypes = getTaskTypesArray();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('all-tasks');
  
  const { toast } = useToast();

  // Form state - Fixed initialization
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assigned_to: '',
    room_id: '',
    scheduled_date: new Date(), // Initialize with today's date
    scheduled_time: '',
    estimated_duration: 60,
    location: ''
  });

  const getTaskTypesForRole = (staffId: string) => {
    if (!staffId) return availableTaskTypes;
    
    const selectedStaff = staff.find(s => s.id.toString() === staffId);
    if (!selectedStaff) return availableTaskTypes;
    
    const roleTaskTypes = {
      'housekeeping': ['room_cleaning', 'cleaning', 'laundry', 'maintenance_request', 'general'],
      'maintenance': ['maintenance', 'repair', 'inspection', 'preventive_maintenance', 'general'],
      'front_desk': ['guest_service', 'check_in', 'check_out', 'booking_management', 'general'],
      'security': ['security_check', 'patrol', 'incident_report', 'access_control', 'general'],
      'management': availableTaskTypes,
    };
    
    const roleTypes = roleTaskTypes[selectedStaff.role as keyof typeof roleTaskTypes];
    return roleTypes ? roleTypes.filter(type => availableTaskTypes.includes(type)) : availableTaskTypes;
  };

  const getRoleInfo = (staffId: string) => {
    if (!staffId) return null;
    
    const selectedStaff = staff.find(s => s.id.toString() === staffId);
    if (!selectedStaff) return null;
    
    const roleInfo = {
      'housekeeping': {
        description: 'Room cleaning tasks will create room assignments automatically',
        requiresRoom: ['room_cleaning', 'cleaning'].includes(formData.type),
        defaultDuration: 45
      },
      'maintenance': {
        description: 'Maintenance tasks will create maintenance requests automatically',
        requiresRoom: ['maintenance', 'repair', 'inspection'].includes(formData.type),
        defaultDuration: 60
      },
      'front_desk': {
        description: 'Front desk tasks for guest services and operations',
        requiresRoom: false,
        defaultDuration: 30
      },
      'security': {
        description: 'Security and safety related tasks',
        requiresRoom: false,
        defaultDuration: 30
      }
    };
    
    return roleInfo[selectedStaff.role as keyof typeof roleInfo] || null;
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Staff Management', href: '/admin/staff' },
    { title: 'Task Assignment', href: '/admin/staff/tasks' }
  ];

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const roleColors = {
    front_desk: 'bg-purple-100 text-purple-800',
    housekeeping: 'bg-pink-100 text-pink-800',
    maintenance: 'bg-orange-100 text-orange-800',
    security: 'bg-blue-100 text-blue-800',
    management: 'bg-green-100 text-green-800'
  };

  // Fixed form validation
  const validateForm = () => {
    const errors = [];
    
    if (!formData.title || formData.title.trim().length === 0) {
      errors.push("Task title is required.");
    }
    
    if (formData.title && formData.title.length > 255) {
      errors.push("Task title must not exceed 255 characters.");
    }
    
    if (!formData.type) {
      errors.push("Task type is required.");
    }
    
    if (formData.type && !availableTaskTypes.includes(formData.type)) {
      errors.push("Selected task type is invalid.");
    }
    
    if (!formData.assigned_to) {
      errors.push("Please assign the task to a staff member.");
    }
    
    if (!formData.priority || !['low', 'medium', 'high', 'urgent'].includes(formData.priority)) {
      errors.push("Please select a valid priority level.");
    }
    
    const assignedStaff = staff.find(s => s.id.toString() === formData.assigned_to);
    if (formData.assigned_to && !assignedStaff) {
      errors.push("Selected staff member is invalid.");
    }
    
    if (formData.room_id && formData.room_id !== 'none') {
      const roomExists = rooms.find(r => r.id.toString() === formData.room_id);
      if (!roomExists) {
        errors.push("Selected room is invalid.");
      }
    }
    
    if (!formData.scheduled_date) {
      errors.push("Scheduled date is required.");
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const scheduledDate = new Date(formData.scheduled_date);
      scheduledDate.setHours(0, 0, 0, 0);
      
      if (scheduledDate < today) {
        errors.push("Scheduled date must be today or in the future.");
      }
    }
    
    if (formData.estimated_duration && formData.estimated_duration < 15) {
      errors.push("Estimated duration must be at least 15 minutes.");
    }
    
    const roleInfo = getRoleInfo(formData.assigned_to);
    if (roleInfo && roleInfo.requiresRoom && (!formData.room_id || formData.room_id === 'none')) {
      errors.push("Room selection is required for this task type and staff role.");
    }
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(" "),
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  // Fixed form submission
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const submissionData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        type: formData.type,
        priority: formData.priority,
        assigned_to: parseInt(formData.assigned_to),
        room_id: formData.room_id === 'none' || !formData.room_id ? null : parseInt(formData.room_id),
        scheduled_at: formData.scheduled_date && formData.scheduled_time 
          ? `${format(formData.scheduled_date, 'yyyy-MM-dd')} ${formData.scheduled_time}:00`
          : formData.scheduled_date 
            ? `${format(formData.scheduled_date, 'yyyy-MM-dd')} 09:00:00`
            : null,
        estimated_duration: formData.estimated_duration || 60,
      };

      console.log('Submitting task data:', submissionData);

      // Check if route function exists
      if (typeof route === 'function') {
        router.post(route('admin.staff.tasks.store'), submissionData, {
          onSuccess: () => {
            setIsCreateDialogOpen(false);
            resetForm();
            toast({
              title: "Success",
              description: "Task created and assigned successfully.",
            });
          },
          onError: (errors: any) => {
            console.log('Validation errors:', errors);
            
            const errorMessages = [];
            
            if (typeof errors === 'object' && errors !== null) {
              Object.keys(errors).forEach(field => {
                if (Array.isArray(errors[field])) {
                  errorMessages.push(...errors[field]);
                } else if (typeof errors[field] === 'string') {
                  errorMessages.push(errors[field]);
                }
              });
            }
            
            if (errorMessages.length === 0) {
              if (errors.error) {
                errorMessages.push(errors.error);
              } else if (typeof errors === 'string') {
                errorMessages.push(errors);
              } else {
                errorMessages.push('Failed to assign task. Please try again.');
              }
            }
            
            toast({
              title: "Error",
              description: errorMessages.join(" "),
              variant: "destructive",
            });
          }
        });
      } else {
        // Fallback if route helper is not available
        router.post('/admin/staff/tasks', submissionData, {
          onSuccess: () => {
            setIsCreateDialogOpen(false);
            resetForm();
            toast({
              title: "Success",
              description: "Task created and assigned successfully.",
            });
          },
          onError: (errors: any) => {
            toast({
              title: "Error",
              description: "Failed to assign task. Please try again.",
              variant: "destructive",
            });
          }
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!selectedTask) return;

    try {
      const submissionData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        type: formData.type,
        priority: formData.priority,
        assigned_to: parseInt(formData.assigned_to),
        room_id: formData.room_id === 'none' || !formData.room_id ? null : parseInt(formData.room_id),
        scheduled_at: formData.scheduled_date && formData.scheduled_time 
          ? `${format(formData.scheduled_date, 'yyyy-MM-dd')} ${formData.scheduled_time}:00`
          : formData.scheduled_date 
            ? `${format(formData.scheduled_date, 'yyyy-MM-dd')} 09:00:00`
            : null,
        estimated_duration: formData.estimated_duration || 60,
      };

      if (typeof route === 'function') {
        router.put(route('admin.staff.tasks.update', selectedTask.id), submissionData, {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setSelectedTask(null);
            resetForm();
            toast({
              title: "Success",
              description: "Task updated successfully.",
            });
          },
          onError: (errors: any) => {
            const errorMessages = [];
            
            if (typeof errors === 'object' && errors !== null) {
              Object.keys(errors).forEach(field => {
                if (Array.isArray(errors[field])) {
                  errorMessages.push(...errors[field]);
                } else if (typeof errors[field] === 'string') {
                  errorMessages.push(errors[field]);
                }
              });
            }
            
            if (errorMessages.length === 0) {
              errorMessages.push('Failed to update task. Please try again.');
            }
            
            toast({
              title: "Error",
              description: errorMessages.join(" "),
              variant: "destructive",
            });
          }
        });
      } else {
        router.put(`/admin/staff/tasks/${selectedTask.id}`, submissionData, {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setSelectedTask(null);
            resetForm();
            toast({
              title: "Success",
              description: "Task updated successfully.",
            });
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update task. Please try again.",
              variant: "destructive",
            });
          }
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      if (typeof route === 'function') {
        router.delete(route('admin.staff.tasks.destroy', taskId), {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Task deleted successfully.",
            });
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to delete task. Please try again.",
              variant: "destructive",
            });
          }
        });
      } else {
        router.delete(`/admin/staff/tasks/${taskId}`, {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Task deleted successfully.",
            });
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to delete task. Please try again.",
              variant: "destructive",
            });
          }
        });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Fixed form reset
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: '',
      priority: 'medium',
      assigned_to: '',
      room_id: '',
      scheduled_date: new Date(), // Reset to today
      scheduled_time: '',
      estimated_duration: 60,
      location: ''
    });
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    
    let scheduledDate: Date = new Date();
    let scheduledTime = '';
    
    if (task.scheduled_date) {
      scheduledDate = new Date(task.scheduled_date);
      if (task.scheduled_time) {
        scheduledTime = task.scheduled_time;
      } else if (task.scheduled_date.includes(' ')) {
        const [datePart, timePart] = task.scheduled_date.split(' ');
        scheduledDate = new Date(datePart);
        scheduledTime = timePart ? timePart.substring(0, 5) : '';
      }
    }
    
    setFormData({
      title: task.title,
      description: task.description || '',
      type: task.type,
      priority: task.priority,
      assigned_to: task.assigned_to.toString(),
      room_id: task.room_id?.toString() || '',
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      estimated_duration: task.estimated_duration || 60,
      location: task.location || ''
    });
    setIsEditDialogOpen(true);
  };

  const filteredTasks = Array.isArray(tasks) ? tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assigned_staff?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || task.assigned_staff?.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

    return matchesSearch && matchesDepartment && matchesStatus && matchesPriority;
  }) : [];

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  // Fixed TaskForm component with proper form handling
  const TaskForm = ({ onSubmit, submitText, isEdit = false }: { 
    onSubmit: (e: React.FormEvent) => void; 
    submitText: string;
    isEdit?: boolean;
  }) => {
    // Handle form field changes properly
    const handleFieldChange = (field: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Enter task title"
              required
              maxLength={255}
            />
          </div>
          
          {(() => {
            const availableTypes = getTaskTypesForRole(formData.assigned_to);
            const roleInfo = getRoleInfo(formData.assigned_to);
            return (
              <div className="space-y-2">
                <Label htmlFor="type">Task Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => {
                    handleFieldChange('type', value);
                    // Auto-set default duration based on role and type
                    if (roleInfo && !formData.estimated_duration) {
                      handleFieldChange('estimated_duration', roleInfo.defaultDuration);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {roleInfo && (
                  <p className="text-xs text-muted-foreground">
                    {roleInfo.description}
                  </p>
                )}
              </div>
            );
          })()}
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Enter task description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assign To *</Label>
            <Select
              value={formData.assigned_to}
              onValueChange={(value) => {
                handleFieldChange('assigned_to', value);
                // Reset type if the new staff doesn't have the current type
                if (!getTaskTypesForRole(value).includes(formData.type)) {
                  handleFieldChange('type', '');
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{member.name}</span>
                      <Badge
                        variant="outline"
                        className={roleColors[member.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}
                      >
                        {member.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => handleFieldChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Scheduled Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.scheduled_date && "text-muted-foreground"
                  )}
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduled_date ? format(formData.scheduled_date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  selected={formData.scheduled_date}
                  onSelect={(date) => date && handleFieldChange('scheduled_date', date)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_time">Scheduled Time</Label>
            <Input
              id="scheduled_time"
              type="time"
              value={formData.scheduled_time}
              onChange={(e) => handleFieldChange('scheduled_time', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(() => {
            const roleInfo = getRoleInfo(formData.assigned_to);
            const isRoomRequired = roleInfo ? roleInfo.requiresRoom : false;
            return (
              <div className="space-y-2">
                <Label htmlFor="room_id">
                  Room {isRoomRequired ? '*' : '(Optional)'}
                </Label>
                <Select 
                  value={formData.room_id} 
                  onValueChange={(value) => handleFieldChange('room_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {!isRoomRequired && (
                      <SelectItem value="none">No specific room</SelectItem>
                    )}
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        Room {room.number} ({room.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isRoomRequired && (
                  <p className="text-xs text-red-600">
                    Room selection is required for this task type
                  </p>
                )}
              </div>
            );
          })()}

          {(() => {
            const roleInfo = getRoleInfo(formData.assigned_to);
            return (
              <div className="space-y-2">
                <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
                <Input
                  id="estimated_duration"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.estimated_duration}
                  onChange={(e) =>
                    handleFieldChange('estimated_duration', parseInt(e.target.value) || (roleInfo?.defaultDuration ?? 60))
                  }
                  placeholder={roleInfo ? `Default: ${roleInfo.defaultDuration} min` : "60"}
                />
              </div>
            );
          })()}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder="Specific location or area"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            if (isEdit) {
              setIsEditDialogOpen(false);
              setSelectedTask(null);
            } else {
              setIsCreateDialogOpen(false);
            }
            resetForm();
          }}>
            Cancel
          </Button>
          <Button type="submit">{submitText}</Button>
        </DialogFooter>
      </form>
    );
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription className="text-sm">
              {task.description || 'No description'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" type="button">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40">
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start" 
                    onClick={() => openEditDialog(task)}
                    type="button"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-destructive" 
                    onClick={() => handleDeleteTask(task.id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{task.assigned_staff?.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(new Date(task.scheduled_date), 'MMM dd')}</span>
          </div>
          {task.scheduled_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{task.scheduled_time}</span>
            </div>
          )}
        </div>
        
        {(task.room || task.location) && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{task.room ? `Room ${task.room.number}` : task.location}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Badge className={statusColors[task.status]}>
            {task.status.replace('_', ' ')}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Timer className="h-3 w-3" />
            <span>{task.estimated_duration}min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbItems}>
      <Head title="Task Assignment - Staff Management" />
      
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Task Assignment</h1>
            <p className="text-muted-foreground">
              Assign and manage tasks for your staff members
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button">
                <Plus className="h-4 w-4 mr-2" />
                Assign New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Assign New Task</DialogTitle>
                <DialogDescription>
                  Create and assign a new task to a staff member
                </DialogDescription>
              </DialogHeader>
              <TaskForm onSubmit={handleCreateTask} submitText="Assign Task" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTasksByStatus('pending').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTasksByStatus('in_progress').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTasksByStatus('completed').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Tabs defaultValue="all-tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-tasks">All Tasks ({filteredTasks.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({getTasksByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({getTasksByStatus('in_progress').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({getTasksByStatus('completed').length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-tasks" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            {filteredTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found matching your filters.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTasksByStatus('pending').map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            {getTasksByStatus('pending').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No pending tasks found.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="in-progress" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTasksByStatus('in_progress').map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            {getTasksByStatus('in_progress').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tasks in progress found.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTasksByStatus('completed').map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            {getTasksByStatus('completed').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No completed tasks found.
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Update the task details and assignment
              </DialogDescription>
            </DialogHeader>
            <TaskForm onSubmit={handleUpdateTask} submitText="Update Task" isEdit={true} />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AdminTaskAssignment;