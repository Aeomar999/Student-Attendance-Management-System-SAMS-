"use client"

import { useState } from "react"
import { DoorOpen, Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { RoomRow } from "@/app/actions/room"
import { createRoom, updateRoom, deleteRoom } from "@/app/actions/room"

type Props = {
    rooms: RoomRow[]
    institutionId: string
}

export function RoomsClient({ rooms: initialRooms, institutionId }: Props) {
    const [rooms, setRooms] = useState(initialRooms)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState<RoomRow | null>(null)
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; room: RoomRow | null }>({ open: false, room: null })
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({ name: "", building: "", capacity: 30, description: "" })

    const resetForm = () => {
        setFormData({ name: "", building: "", capacity: 30, description: "" })
        setEditingRoom(null)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const result = await createRoom({ ...formData, institutionId })
            if (result.success) {
                toast.success("Room created")
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

    const handleEdit = (room: RoomRow) => {
        setEditingRoom(room)
        setFormData({ name: room.name, building: room.building ?? "", capacity: room.capacity, description: room.description ?? "" })
        setIsSheetOpen(true)
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingRoom) return
        setIsLoading(true)
        try {
            const result = await updateRoom(editingRoom.id, formData)
            if (result.success) {
                toast.success("Room updated")
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
        if (!deleteDialog.room) return
        setIsLoading(true)
        try {
            const result = await deleteRoom(deleteDialog.room.id)
            if (result.success) {
                toast.success("Room deleted")
                setDeleteDialog({ open: false, room: null })
                setRooms(prev => prev.filter(r => r.id !== deleteDialog.room!.id))
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
                        <DoorOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Rooms</h1>
                        <p className="text-sm text-muted-foreground">Manage classroom and facility rooms</p>
                    </div>
                </div>
                <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if (!open) resetForm() }}>
                    <SheetTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Room</Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-md">
                        <SheetHeader>
                            <SheetTitle>{editingRoom ? "Edit Room" : "Add Room"}</SheetTitle>
                            <SheetDescription>
                                {editingRoom ? "Update room information" : "Create a new room"}
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={editingRoom ? handleUpdate : handleCreate} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Room Name/Number *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Room 101, CS-Lab-1"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="building">Building</Label>
                                    <Input
                                        id="building"
                                        value={formData.building}
                                        onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                        placeholder="e.g., Engineering"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacity</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min={1}
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
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
                                    {isLoading ? "Saving..." : editingRoom ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Room</TableHead>
                            <TableHead>Building</TableHead>
                            <TableHead className="text-center">Capacity</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-center">Schedules</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rooms.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <DoorOpen className="h-8 w-8 opacity-30" />
                                        <span>No rooms yet</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : rooms.map((room) => (
                            <TableRow key={room.id}>
                                <TableCell className="font-medium">{room.name}</TableCell>
                                <TableCell>{room.building ?? "—"}</TableCell>
                                <TableCell className="text-center">{room.capacity}</TableCell>
                                <TableCell className="text-muted-foreground">{room.description ?? "—"}</TableCell>
                                <TableCell className="text-center">{room._count?.schedules ?? 0}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(room)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setDeleteDialog({ open: true, room })}
                                                className="text-red-600 focus:text-red-600"
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
            </div>

            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, room: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Room</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteDialog.room?.name}</strong>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeleteDialog({ open: false, room: null })}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
