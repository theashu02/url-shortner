"use client";

import { forwardRef, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store";
import { deleteLink } from "@/store/my-links-slice";
import { DesktopTable } from "./desktopTable";
import { MobileList } from "./mobileList";
import { DeleteLinkDialog } from "./deleteLinkDialog";
import { TableSentinel } from "./tableSentinel";

interface LinksTableProps {
  onCopy: (id: string, text: string) => void;
}

export const LinksTable = forwardRef<HTMLDivElement, LinksTableProps>(function LinksTable({ onCopy }, sentinelRef) {
  const dispatch = useAppDispatch();
  const links = useAppSelector((state) => state.myLinks.links);
  const loading = useAppSelector((state) => state.myLinks.loading);
  const loadingMore = useAppSelector((state) => state.myLinks.loadingMore);
  const hasMore = useAppSelector((state) => state.myLinks.hasMore);
  const totalCount = useAppSelector((state) => state.myLinks.totalCount);
  const debouncedSearch = useAppSelector((state) => state.myLinks.debouncedSearch);
  const copiedId = useAppSelector((state) => state.myLinks.copiedId);
  const deletingId = useAppSelector((state) => state.myLinks.deletingId);

  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : process.env.NEXTAUTH_URL),
    [],
  );

  const confirmDelete = () => {
    if (linkToDelete) {
      dispatch(deleteLink(linkToDelete));
      setLinkToDelete(null);
    }
  };

  const tableProps = {
    links,
    origin,
    loading,
    search: debouncedSearch,
    copiedId,
    deletingId,
    onCopy,
    onDelete: setLinkToDelete,
  };

  return (
    <>
      <Card className="overflow-hidden rounded-none border bg-card p-0">
        <div className="hidden overflow-x-auto md:block">
          <DesktopTable {...tableProps} />
        </div>

        <div className="block divide-y divide-border/60 md:hidden">
          <MobileList {...tableProps} />
        </div>

        <TableSentinel
          ref={sentinelRef}
          loadingMore={loadingMore}
          hasMore={hasMore}
          totalCount={totalCount}
          linkCount={links.length}
        />
      </Card>

      <DeleteLinkDialog
        open={!!linkToDelete}
        onCancel={() => setLinkToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
});
