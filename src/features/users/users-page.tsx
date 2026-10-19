"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { Main, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAccess } from "@/components/access/access-provider";
import { useI18n } from "@/i18n/provider";
import { Link, useRouter } from "@/i18n/navigation";
import { canPreviewPage, type AccessUser, type Role } from "@/lib/access/catalog";
import { mutateAccess } from "@/lib/access/client";

export function UsersPage({ users, roles }: { users: AccessUser[]; roles: Role[] }) {
  const { t } = useI18n();
  const copy = t.access;
  const { principal, can } = useAccess();
  const router = useRouter();
  const [editing, setEditing] = useState<AccessUser | null>(null);
  const columns: ColumnDef<AccessUser>[] = [
    { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title={copy.user} />, cell: ({ row }) => <div><span className="font-medium">{row.original.name}</span><span className="block text-xs text-muted-foreground">{row.original.email || "Demo"}</span></div>, filterFn: (row, _id, value: string) => `${row.original.name} ${row.original.email}`.toLowerCase().includes(value.toLowerCase()) },
    { accessorKey: "roles", header: copy.roles, cell: ({ row }) => <div className="flex flex-wrap gap-1">{row.original.roles.map((id) => <span className="rounded border bg-paper px-2 py-1 text-xs" key={id}>{roles.find((role) => role.id === id)?.name ?? id}</span>)}</div> },
    { id: "actions", cell: ({ row }) => can("users.manage") && !row.original.demo && row.original.id !== principal?.id && row.original.roles.every((id) => roles.find((role) => role.id === id)?.permissions.every((permission) => can(permission))) ? <Button variant="outline" onClick={() => setEditing(row.original)}><ShieldCheck />{copy.manage}</Button> : <span className="text-xs text-muted-foreground">{copy.readOnly}</span> },
  ];
  return <Main>
    <PageHeader title={copy.users} description={principal?.demo ? copy.previewUsersDescription : copy.usersDescription} actions={(can("roles.read") || canPreviewPage(principal, "roles.read")) && <Button asChild variant="outline"><Link href="/panel/roles"><ShieldCheck />{copy.title}</Link></Button>} />
    <DataTable columns={columns} data={users} getRowId={(user) => user.id} searchColumn="name" searchPlaceholder={copy.search} />
    {editing && <UserRoles key={editing.id} user={editing} roles={roles} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); router.refresh(); }} />}
  </Main>;
}

function UserRoles({ user, roles, onClose, onSaved }: { user: AccessUser; roles: Role[]; onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n();
  const copy = t.access;
  const access = useAccess();
  const [selected, setSelected] = useState(user.roles);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return <Dialog open onOpenChange={(open) => !open && !pending && onClose()}><DialogContent className="sm:max-w-lg">
    <form className="contents" onSubmit={async (event) => {
      event.preventDefault(); setPending(true); setError(null);
      try { await mutateAccess("users", "PATCH", { userId: user.id, roles: selected }); toast.success(copy.saved); onSaved(); }
      catch (error) { setError(error instanceof Error ? error.message : copy.error); }
      finally { setPending(false); }
    }}>
      <DialogHeader><DialogTitle>{copy.manage}</DialogTitle><DialogDescription>{user.name} · {user.email}</DialogDescription></DialogHeader>
      <DialogBody className="grid max-h-[60vh] gap-2 overflow-y-auto">{roles.filter((role) => role.id !== "demo").map((role) => <label key={role.id} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-disabled:cursor-not-allowed has-disabled:opacity-50">
        <Checkbox className="mt-1" checked={selected.includes(role.id)} disabled={pending || !role.permissions.every((permission) => access.can(permission))} onCheckedChange={(checked) => setSelected((current) => checked === true ? [...current, role.id] : current.filter((id) => id !== role.id))} />
        <span className="grid gap-1"><span className="text-sm font-medium">{role.name}</span><span className="text-xs text-muted-foreground">{role.description}</span></span>
      </label>)}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</DialogBody>
      <DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={onClose}>{copy.cancel}</Button><Button type="submit" disabled={pending || !selected.length}>{pending ? copy.loading : copy.save}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}
