"use client"

import { useState } from "react"
import { Building2, Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DepartmentRow } from "@/app/actions/department"
import { createDepartment, updateDepartment, deleteDepartment } from "@/app/actions/department"

type Props = {
    departments: DepartmentRow[]
    institutionId: string
    institutionName: string
}

export function DepartmentClient({ departments: initialDepartments, institutionId, institutionName }: Props) {
    const [departments, setDepartments] = useState(initialDepartments)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [editingDept, setEditingDept] = useState<DepartmentRow | null>(null)
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; dept: DepartmentRow | null }>({ open: false, dept: null })
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({ name: "", code: "", description: "" })

    const resetForm = () => {
        setFormData({ name: "", code: "", description: "" })
        setEditingDept(null)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const result = await createDepartment({ ...formData, institutionId })
            if (result.success) {
                toast.success("Department created")
                setIsSheetOpen(false)
                resetForm()
                window.location.reload()
            } else {
                toast.error(result.error ?? "Failed to create")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (dept: DepartmentRow) => {
        setEditingDept(dept)
        setFormData({ name: dept.name, code: dept.code, description: dept.description ?? "" })
        setIsSheetOpen(true)
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingDept) return
        setIsLoading(true)
        try {
            const result = await updateDepartment(editingDept.id, { name: formData.name, description: formData.description })
            if (result.success) {
                toast.success("Department updated")
                setIsSheetOpen(false)
                resetForm()
                window.location.reload()
            } else {
                toast.error(result.error ?? "Failed to update")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteDialog.dept) return
        setIsLoading(true)
        try {
            const result = await deleteDepartment(deleteDialog.dept.id)
            if (result.success) {
                toast.success("Department deleted")
                setDeleteDialog({ open: false, dept: null })
                setDepartments(prev => prev.filter(d => d.id !== deleteDialog.dept!.id))
            } else {
                toast.error(result.error ?? "Failed to delete")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
                        <p className="text-sm text-muted-foreground">Manage departments in {institutionName}</p>
                    </div>
                </div>
                <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if (!open) resetForm() }}>
                    <SheetTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Department</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>{editingDept ? "Edit Department" : "Add Department"}</SheetTitle>
                            <SheetDescription>
                                {editingDept ? "Update department information" : "Create a new department"}
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={editingDept ? handleUpdate : handleCreate} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Department Code *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g., CS, ENG, MATH"
                                    required
                                    disabled={!!editingDept}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Department Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Computer Science"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Optional description"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-2 border-t">
                                <Button type="button" variant="ghost" onClick={() => { setIsSheetOpen(false); resetForm() }}>Cancel</Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Saving..." : editingDept ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <Card className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-center">Users</TableHead>
                            <TableHead className="text-center">Students</TableHead>
                            <TableHead className="text-center">Courses</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {departments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Building2 className="h-8 w-8 opacity-30" />
                                        <span>No departments yet</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : departments.map((dept) => (
                            <TableRow key={dept.id}>
                                <TableCell className="font-mono font-medium">{dept.code}</TableCell>
                                <TableCell>{dept.name}</TableCell>
                                <TableCell className="text-muted-foreground">{dept.description ?? "—"}</TableCell>
                                <TableCell className="text-center">{dept._count?.users ?? 0}</TableCell>
                                <TableCell className="text-center">{dept._count?.students ?? 0}</TableCell>
                                <TableCell className="text-center">{dept._count?.courses ?? 0}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(dept)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setDeleteDialog({ open: true, dept })}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, dept: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Department</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteDialog.dept?.name}</strong>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeleteDialog({ open: false, dept: null })}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
