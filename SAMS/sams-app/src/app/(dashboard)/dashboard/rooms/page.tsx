import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getRooms } from "@/app/actions/room"
import { queryRaw } from "@/lib/prisma"
import { RoomsClient } from "./rooms-client"

interface UserRow {
    id: string;
    institution_id: string | null;
}

export default async function RoomsPage() {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/login")
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    const users = await queryRaw<UserRow>(
        "SELECT id, institution_id FROM users WHERE id = $1",
        [session.user.id]
    )
    const user = users[0]
    const institutionId = user?.institution_id ?? "default"

    const rooms = await getRooms(institutionId)

    return <RoomsClient rooms={rooms} institutionId={institutionId} />
}
