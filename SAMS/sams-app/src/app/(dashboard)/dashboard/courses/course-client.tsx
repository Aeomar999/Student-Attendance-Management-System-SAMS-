"use client"

import { useState } from "react"
import { BookOpen, Plus, Trash2, Edit, GraduationCap, Users2, CalendarRange, X } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { createCourse, updateCourse, deleteCourse, getCourseSchedules, addCourseSchedule, deleteCourseSchedule, type CourseRow, type CourseScheduleRow } from "@/app/actions/course"

type LecturerRow = {
    id: string
    firstName: string
    lastName: string
    email: string
}

type DepartmentRow = {
    id: string
    name: string
    code: string
}

type Props = {
    initialCourses: CourseRow[]
    lecturers: LecturerRow[]
    departments: DepartmentRow[]
    institutionId: string
}

export function CourseClient({ initialCourses, lecturers, departments, institutionId }: Props) {
    const [courses, setCourses] = useState<CourseRow[]>(initialCourses)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<CourseRow | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Form state
    const [code, setCode] = useState("")
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [lecturerId, setLecturerId] = useState<string>("")
    const [creditHours, setCreditHours] = useState(3)
    const [departmentId, setDepartmentId] = useState("")

    // Schedule state
    const [scheduleCourse, setScheduleCourse] = useState<CourseRow | null>(null)
    const [schedules, setSchedules] = useState<CourseScheduleRow[]>([])
    const [isScheduleLoading, setIsScheduleLoading] = useState(false)
    const [dayOfWeek, setDayOfWeek] = useState("Monday")
    const [startTime, setStartTime] = useState("09:00")
    const [endTime, setEndTime] = useState("10:30")
    const [roomName, setRoomName] = useState("")

    const resetForm = () => {
        setCode(""); setName(""); setDescription(""); setLecturerId(""); setCreditHours(3)
        // Set first available department or keep current if valid
        const firstDept = departments[0]
        if (firstDept && !departmentId) {
            setDepartmentId(firstDept.id)
        }
        setEditingCourse(null)
    }

    const handleOpenEdit = (course: CourseRow) => {
        setEditingCourse(course)
        setCode(course.code)
        setName(course.name)
        setDescription(course.description ?? "")
        setLecturerId(course.lecturerId ?? "")
        setCreditHours(course.creditHours)
        setDepartmentId(course.departmentId)
        setIsSheetOpen(true)
    }

    const handleOpenNew = () => { resetForm(); setIsSheetOpen(true) }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Client-side validation
        if (!departmentId) {
            toast.error("Please select a department")
            return
        }
        if (!institutionId) {
            toast.error("Institution not configured. Please contact administrator.")
            return
        }
        
        setIsLoading(true)
        try {
            if (editingCourse) {
                const result = await updateCourse(editingCourse.id, {
                    code, name, description, creditHours,
                    lecturerId: lecturerId || null,
                })
                if (result.success) {
                    toast.success("Course updated")
                    window.location.reload()
                } else {
                    toast.error(result.error ?? "Update failed")
                }
            } else {
                const result = await createCourse({
                    code, name, description, departmentId, institutionId,
                    lecturerId: lecturerId || null, creditHours,
                })
                if (result.success) {
                    toast.success("Course created")
                    window.location.reload()
                } else {
                    toast.error(result.error ?? "Create failed")
                }
            }
            setIsSheetOpen(false)
        } catch (err) {
            console.error("Submit error:", err)
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string, courseName: string) => {
        if (!confirm(`Delete course "${courseName}"? This will also remove all enrollment records.`)) return
        setIsLoading(true)
        try {
            const result = await deleteCourse(id)
            if (result.success) {
                toast.success("Course deleted")
                setCourses(courses.filter(c => c.id !== id))
            } else {
                toast.error(result.error ?? "Delete failed")
            }
        } catch {
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenSchedule = async (course: CourseRow) => {
        setScheduleCourse(course)
        setIsScheduleLoading(true)
        setSchedules([])
        try {
            const result = await getCourseSchedules(course.id)
            if (result.success && result.data) {
                setSchedules(result.data)
            } else {
                toast.error("Failed to load schedules")
            }
        } catch {
            toast.error("An unexpected error occurred")
        } finally {
            setIsScheduleLoading(false)
        }
    }

    const handleAddSchedule = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!scheduleCourse) return
        setIsScheduleLoading(true)
        try {
            const result = await addCourseSchedule(scheduleCourse.id, {
                dayOfWeek: dayOfWeek as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday", startTime, endTime, roomName
            })
            if (result.success && result.data) {
                toast.success("Schedule added")
                setSchedules([...schedules, result.data])
                setStartTime("")
                setEndTime("")
                setRoomName("")
            } else {
                toast.error(result.error || "Failed to add schedule")
            }
        } catch {
            toast.error("An unexpected error occurred")
        } finally {
            setIsScheduleLoading(false)
        }
    }

    const handleDeleteSchedule = async (scheduleId: string) => {
        if (!confirm("Delete this schedule?")) return
        setIsScheduleLoading(true)
        try {
            const result = await deleteCourseSchedule(scheduleId)
            if (result.success) {
                toast.success("Schedule deleted")
                setSchedules(schedules.filter(s => s.id !== scheduleId))
            } else {
                toast.error(result.error || "Failed to delete schedule")
            }
        } catch {
            toast.error("An unexpected error occurred")
        } finally {
            setIsScheduleLoading(false)
        }
    }

    const activeCourses = courses.filter(c => c.status === "ACTIVE").length
    const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
                        <p className="text-sm text-muted-foreground">Manage courses and lecturer assignments</p>
                    </div>
                </div>
                <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if (!open) resetForm() }}>
                    <SheetTrigger asChild>
                        <Button onClick={handleOpenNew}>
                            <Plus className="mr-2 h-4 w-4" /> Add Course
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto overflow-x-hidden">
                        <SheetHeader>
                            <SheetTitle>{editingCourse ? "Edit Course" : "Create Course"}</SheetTitle>
                            <SheetDescription>
                                {editingCourse ? "Update course details." : "Enter the details for the new course."}
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={onSubmit} className="space-y-5 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Course Code *</Label>
                                    <Input id="code" value={code} onChange={e => setCode(e.target.value)}
                                        placeholder="e.g. CS301" required disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="creditHours">Credit Hours</Label>
                                    <Input id="creditHours" type="number" min={1} max={12}
                                        value={creditHours} onChange={e => setCreditHours(parseInt(e.target.value))}
                                        disabled={isLoading} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department *</Label>
                                <Select 
                                    value={departmentId || (departments[0]?.id ?? "")} 
                                    onValueChange={v => setDepartmentId(v)} 
                                    required
                                >
                                    <SelectTrigger id="department">
                                        <SelectValue placeholder="Select a department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.length === 0 ? (
                                            <SelectItem value="none" disabled>No departments available</SelectItem>
                                        ) : (
                                            departments.map(d => (
                                                <SelectItem key={d.id} value={d.id}>
                                                    {d.name} ({d.code})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Course Name *</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Operating Systems" required disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                    placeholder="Optional course description..." rows={3} disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lecturer">Assigned Lecturer</Label>
                                <Select value={lecturerId || "__none__"} onValueChange={v => setLecturerId(v === "__none__" ? "" : v)}>
                                    <SelectTrigger id="lecturer">
                                        <SelectValue placeholder="Select a lecturer (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">— Unassigned —</SelectItem>
                                        {lecturers.map(l => (
                                            <SelectItem key={l.id} value={l.id}>
                                                {l.firstName} {l.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="pt-4 flex justify-end gap-2 border-t">
                                <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Saving..." : editingCourse ? "Update Course" : "Create Course"}
                                </Button>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary text-primary-foreground transition-all duration-300 relative overflow-hidden group">
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider opacity-80">
                            Total Courses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{courses.length}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm transition-all duration-300 relative overflow-hidden group">
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider opacity-80">
                            Active Courses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 text-primary">
                        <div className="text-3xl font-bold">{activeCourses}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm transition-all duration-300 relative overflow-hidden group">
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider opacity-80">
                            Total Enrollments
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 text-blue-600">
                        <div className="text-3xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="overflow-hidden shadow-sm mt-6">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold">Code</TableHead>
                            <TableHead className="font-semibold">Course Name</TableHead>
                            <TableHead className="font-semibold">Lecturer</TableHead>
                            <TableHead className="font-semibold text-center">Credits</TableHead>
                            <TableHead className="font-semibold text-center">Students</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <GraduationCap className="h-8 w-8 opacity-30" />
                                        <span>No courses yet. Create your first course.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map(course => (
                                <TableRow key={course.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-mono font-medium text-sm text-foreground/80">{course.code}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{course.name}</span>
                                            {course.description && (
                                                <span className="text-xs text-muted-foreground line-clamp-1">{course.description}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground font-medium">
                                        {course.lecturerName ?? <span className="italic opacity-50">Unassigned</span>}
                                    </TableCell>
                                    <TableCell className="text-center text-muted-foreground">{course.creditHours}</TableCell>
                                    <TableCell className="text-center font-medium">{course.studentCount}</TableCell>
                                    <TableCell>
                                        <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${course.status === "ACTIVE" ? "bg-primary/10 text-primary" : ""}`}
                                            variant={course.status === "ACTIVE" ? "default" : "secondary"}>
                                            {course.status.charAt(0).toUpperCase() + course.status.slice(1).toLowerCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                
                                            >
                                                <Link href={`/dashboard/courses/${course.id}/enrollment`}>
                                                    <Users2 className="h-3.5 w-3.5 mr-1" />
                                                    Roster
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Manage Schedule" onClick={() => handleOpenSchedule(course)} >
                                                <CalendarRange className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(course)} >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id, course.name)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Schedule Modal */}
            <Dialog open={!!scheduleCourse} onOpenChange={(open) => { if (!open) setScheduleCourse(null) }}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Manage Schedule: {scheduleCourse?.code}</DialogTitle>
                        <DialogDescription>
                            Add or remove session times for {scheduleCourse?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <form onSubmit={handleAddSchedule} className="flex flex-col gap-3 border p-4 rounded-md bg-secondary/20">
                            <div className="font-medium text-sm">Add New Session</div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Day of Week</Label>
                                    <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Room (Optional)</Label>
                                    <Input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="e.g. Room 101" disabled={isScheduleLoading} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Start Time</Label>
                                    <Input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} disabled={isScheduleLoading} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">End Time</Label>
                                    <Input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} disabled={isScheduleLoading} />
                                </div>
                            </div>
                            <Button type="submit" disabled={isScheduleLoading} className="mt-2 w-full">
                                {isScheduleLoading ? "Adding..." : "Add Session Time"}
                            </Button>
                        </form>

                        <div className="space-y-2 mt-4">
                            <div className="font-medium text-sm">Current Sessions</div>
                            {schedules.length === 0 ? (
                                <div className="text-sm text-muted-foreground italic">No sessions scheduled for this course.</div>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {schedules.map(s => (
                                        <div key={s.id} className="flex justify-between items-center p-3 border rounded-md">
                                            <div className="space-y-1">
                                                <div className="font-medium text-sm">{s.dayOfWeek}</div>
                                                <div className="text-xs text-muted-foreground">{s.startTime} - {s.endTime}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {s.roomName && <Badge variant="secondary">{s.roomName}</Badge>}
                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteSchedule(s.id)} disabled={isScheduleLoading}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
