export default function DashboardLoading() {
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="pt-2">
                            <div className="h-7 w-16 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-24 bg-muted animate-pulse rounded mt-2" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="rounded-xl border bg-card p-6 col-span-4">
                    <div className="h-5 w-32 bg-muted animate-pulse rounded mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-2 w-2 bg-muted animate-pulse rounded-full" />
                                <div className="h-4 flex-1 bg-muted animate-pulse rounded" />
                                <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 col-span-3">
                    <div className="h-5 w-32 bg-muted animate-pulse rounded mb-4" />
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-2 w-2 bg-muted animate-pulse rounded-full" />
                                <div className="flex-1">
                                    <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                                    <div className="h-3 w-24 bg-muted animate-pulse rounded mt-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
