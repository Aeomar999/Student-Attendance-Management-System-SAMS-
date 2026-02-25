import { Skeleton } from "@/components/ui/skeleton";

interface DataTableSkeletonProps {
    columns?: number;
    rows?: number;
}

export function DataTableSkeleton({ columns = 5, rows = 8 }: DataTableSkeletonProps) {
    return (
        <div className="rounded-md border">
            <div className="border-b p-4">
                <div className="flex gap-4">
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-24" />
                    ))}
                </div>
            </div>
            <div className="divide-y">
                {Array.from({ length: rows }).map((_, rowIdx) => (
                    <div key={rowIdx} className="flex gap-4 items-center p-4">
                        {Array.from({ length: columns }).map((_, colIdx) => (
                            <Skeleton
                                key={colIdx}
                                className="h-4"
                                style={{ width: `${Math.random() * 60 + 60}px` }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
