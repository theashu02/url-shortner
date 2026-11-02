import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-28 rounded-none" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-full max-w-md rounded-none" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="mx-auto h-4 w-10 rounded-none" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16 rounded-none" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20 rounded-none" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-8 w-32 rounded-none" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function MobileListSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3 p-4">
          <Skeleton className="h-5 w-32 rounded-none" />
          <Skeleton className="h-4 w-48 rounded-none" />
          <Skeleton className="h-8 w-full rounded-none" />
        </div>
      ))}
    </>
  );
}
