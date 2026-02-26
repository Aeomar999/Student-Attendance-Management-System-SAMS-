import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getRooms } from "@/app/actions/room"
import { prisma } from "@/lib/prisma"
import { RoomsClient } from "./rooms-client"

export default async function RoomsPage() {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/login")
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { institutionId: true }
    })

    const institutionId = user?.institutionId ?? "default"

    const rooms = await getRooms(institutionId)

    return <RoomsClient rooms={rooms} institutionId={institutionId} />
}
