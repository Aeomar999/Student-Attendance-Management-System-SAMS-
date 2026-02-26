import { Metadata } from "next"
import { getCurrentUser } from "@/app/actions/settings"
import { SettingsClient } from "./settings-client"

export const metadata: Metadata = {
    title: "Settings | SAMS",
    description: "Account settings and profile management",
}

export default async function SettingsPage() {
    const userResult = await getCurrentUser()
    return (
        <div className="flex-1 space-y-4">
            <SettingsClient user={userResult.success ? userResult.data : null} />
        </div>
    )
}
