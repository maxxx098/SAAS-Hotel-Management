import React, { useState,useRef, useEffect } from 'react';
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
    <div className="flex gap-2 border-b mb-4">{children}</div>
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
                    : 'border-transparent text-muted-foreground hover:text-primary'
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
                // Assign to triggerRef.current
                (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
                // If the child has its own ref, call it as well
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
            className={`absolute z-50 mt-2 bg-white border rounded shadow-lg ${className ?? ''}`}
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
            <div ref={ref} className={className}>
                <div className="flex items-center justify-between mb-2">
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="px-2 py-1 rounded hover:bg-muted"
                        aria-label="Previous month"
                    >
                        &lt;
                    </button>
                    <span className="font-semibold">
                        {monthNames[viewMonth]} {viewYear}
                    </span>
                    <button
                        type="button"
                        onClick={handleNextMonth}
                        className="px-2 py-1 rounded hover:bg-muted"
                        aria-label="Next month"
                    >
                        &gt;
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs text-center mb-1">
                    {dayNames.map((d) => (
                        <div key={d} className="font-medium">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {weeks.flat().map((date, idx) =>
                        date ? (
                            <button
                                key={idx}
                                type="button"
                                className={`rounded p-1 w-8 h-8 text-sm
                                    ${isSameDay(date, selected) ? "bg-primary text-white" : ""}
                                    ${isSameDay(date, today) ? "border border-primary" : ""}
                                    hover:bg-muted`}
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
Calendar.displayName = "Calendar";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => (
        <textarea
            ref={ref}
            className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${className ?? ''}`}
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
  [key: string]: unknown; // Add index signature for Inertia compatibility
}

const AdminTaskAssignment: React.FC = () => {
  let { staff, rooms, tasks, taskTypes, departments } = usePage<PageProps>().props;
  taskTypes = Array.isArray(taskTypes) ? taskTypes : [];
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('all-tasks');
  
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assigned_to: '',
    room_id: '',
    scheduled_date: undefined as Date | undefined,
    scheduled_time: '',
    estimated_duration: 60,
    location: ''
  });

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

const handleCreateTask = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    router.post(route('admin.staff.tasks.store'), {
      ...formData,
      room_id: formData.room_id === 'none' ? null : parseInt(formData.room_id) || null,
      assigned_to: parseInt(formData.assigned_to),
      scheduled_date: formData.scheduled_date ? format(formData.scheduled_date, 'yyyy-MM-dd') : null
    }, {
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
        toast({
          title: "Error",
          description: "Failed to create task. Please check your input.",
          variant: "destructive",
        });
      }
    });
  } catch (error) {
    console.error('Error creating task:', error);
  }
};

// 2. Fix update route
const handleUpdateTask = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!selectedTask) return;

  try {
    router.put(route('admin.staff.tasks.update', selectedTask.id), { // ✅ Correct
      ...formData,
      room_id: formData.room_id === 'none' ? null : parseInt(formData.room_id) || null,
      assigned_to: parseInt(formData.assigned_to),
      scheduled_date: formData.scheduled_date ? format(formData.scheduled_date, 'yyyy-MM-dd') : null
    }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedTask(null);
        resetForm();
        toast({
          title: "Success",
          description: "Task updated successfully.",
        });
      }
    });
  } catch (error) {
    console.error('Error updating task:', error);
  }
};

// 3. Fix delete route
const handleDeleteTask = async (taskId: number) => {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    router.delete(route('admin.staff.tasks.destroy', taskId), { // ✅ Correct
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Task deleted successfully.",
        });
      }
    });
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

// 4. Add validation check before submit
const validateForm = () => {
  if (!formData.title.trim()) {
    toast({
      title: "Validation Error",
      description: "Task title is required.",
      variant: "destructive",
    });
    return false;
  }
  
  if (!formData.type) {
    toast({
      title: "Validation Error", 
      description: "Task type is required.",
      variant: "destructive",
    });
    return false;
  }
  
  if (!formData.assigned_to) {
    toast({
      title: "Validation Error",
      description: "Please assign the task to a staff member.",
      variant: "destructive",
    });
    return false;
  }
  
  if (!formData.scheduled_date) {
    toast({
      title: "Validation Error",
      description: "Scheduled date is required.",
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};

const resetForm = () => {
  setFormData({
    title: '',
    description: '',
    type: '',
    priority: 'medium',
    assigned_to: '',
    room_id: 'none', // Changed from '' to 'none'
    scheduled_date: undefined,
    scheduled_time: '',
    estimated_duration: 60,
    location: ''
  });
};

const openEditDialog = (task: Task) => {
  setSelectedTask(task);
  setFormData({
    title: task.title,
    description: task.description,
    type: task.type,
    priority: task.priority,
    assigned_to: task.assigned_to.toString(),
    room_id: task.room_id?.toString() || 'none', // Changed from '' to 'none'
    scheduled_date: new Date(task.scheduled_date),
    scheduled_time: task.scheduled_time || '',
    estimated_duration: task.estimated_duration,
    location: task.location || ''
  });
  setIsEditDialogOpen(true);
};

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assigned_staff?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || task.assigned_staff?.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

    return matchesSearch && matchesDepartment && matchesStatus && matchesPriority;
  });

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const TaskForm = ({ onSubmit, submitText, isEdit = false }: { 
    onSubmit: (e: React.FormEvent) => void; 
    submitText: string;
    isEdit?: boolean;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter task title"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Task Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select task type" />
            </SelectTrigger>
            <SelectContent>
              {taskTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="col-span-2 space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assigned_to">Assign To *</Label>
          <Select value={formData.assigned_to} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              {staff.map((member) => (
                <SelectItem key={member.id} value={member.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{member.name}</span>
                    <Badge variant="outline" className={roleColors[member.role as keyof typeof roleColors]}>
                      {member.role.replace('_', ' ')}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setFormData({ ...formData, priority: value })}>
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
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.scheduled_date ? format(formData.scheduled_date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                selected={formData.scheduled_date}
                onSelect={(date) => setFormData({ ...formData, scheduled_date: date })}
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
            onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="room_id">Room (Optional)</Label>
        <Select value={formData.room_id} onValueChange={(value) => setFormData({ ...formData, room_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select room" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No specific room</SelectItem>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id.toString()}>
                Room {room.number} ({room.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
          <Input
            id="estimated_duration"
            type="number"
            min="15"
            step="15"
            value={formData.estimated_duration}
            onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) || 60 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40">
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openEditDialog(task)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={() => handleDeleteTask(task.id)}>
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Assign New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
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
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTasksByStatus('pending').map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="in-progress" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTasksByStatus('in_progress').map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTasksByStatus('completed').map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
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