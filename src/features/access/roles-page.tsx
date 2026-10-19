"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { KeyRound, LockKeyhole, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Main, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAccess } from "@/components/access/access-provider";
import { useI18n } from "@/i18n/provider";
import { permissionGroups, type AuditEntry, type Permission, type Role } from "@/lib/access/catalog";
import { TimeAgo } from "@/components/time-ago";
import { mutateAccess } from "@/lib/access/client";

export function RolesPage({ roles, audit }: { roles: Role[]; audit: AuditEntry[] }) {
  const { t } = useI18n();
  const copy = t.access;
  const access = useAccess();
  const router = useRouter();
  const [editing, setEditing] = useState<Role | "new" | null>(null);
  const [removing, setRemoving] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  return (
    <Main>
      <PageHeader title={copy.title} description={access.principal?.demo ? copy.previewRolesDescription : copy.description} actions={access.can("roles.manage") && <Button onClick={() => setEditing("new")}><Plus />{copy.newRole}</Button>} />
      <p className="flex items-start gap-2 rounded-lg border bg-paper p-4 text-sm text-muted-foreground"><LockKeyhole className="mt-0.5 size-4 shrink-0" />{copy.protected}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {roles.map((role) => {
          const editable = !role.system && access.can("roles.manage") && role.permissions.every((permission) => access.can(permission));
          return <article key={role.id} className="flex flex-col rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="size-5 text-ink" />{role.name}</h2><span className="rounded-sm bg-muted px-2 py-1 text-xs">{role.system ? copy.system : copy.custom}</span></div>
            <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>
            <div className="my-4 flex flex-wrap gap-1.5" aria-label={copy.permissions}>{role.permissions.map((permission) => <code key={permission} className="rounded border bg-paper px-1.5 py-0.5 text-xs">{permission}</code>)}</div>
            <div className="mt-auto flex items-center justify-between border-t pt-3"><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><KeyRound className="size-3.5" />{role.permissions.length} {copy.selected}</span>{editable && <div className="flex gap-2"><Button variant="outline" onClick={() => setEditing(role)}>{copy.edit}</Button><Button variant="ghost" aria-label={`${copy.delete}: ${role.name}`} onClick={() => setRemoving(role)}><Trash2 /></Button></div>}</div>
          </article>;
        })}
      </div>
      {access.can("audit.read") && <section className="rounded-lg border p-5"><h2 className="mb-4 text-lg font-semibold">{copy.audit}</h2>{!audit.length ? <p className="text-sm text-muted-foreground">{copy.auditEmpty}</p> : <ol className="divide-y">{audit.map((entry) => <li key={entry.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span><span className="font-medium">{entry.action}</span><code className="ms-2 break-all text-xs text-muted-foreground">{entry.target}</code><span className="block text-xs text-muted-foreground">{entry.actor}</span></span><TimeAgo value={entry.createdAt} /></li>)}</ol>}</section>}
      {editing !== null && <RoleEditor key={typeof editing === "string" ? editing : editing.id} role={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); router.refresh(); }} />}
      <ConfirmDialog open={removing !== null} onOpenChange={(open) => !open && !deleting && setRemoving(null)} title={`${copy.delete}: ${removing?.name ?? ""}`} description={copy.deleteConfirm} confirmLabel={deleting ? copy.loading : copy.delete} onConfirm={async () => {
        if (!removing || deleting) return;
        setDeleting(true);
        try { await mutateAccess("roles", "DELETE", { id: removing.id }); toast.success(copy.deleted); setRemoving(null); router.refresh(); }
        catch (error) { toast.error(error instanceof Error ? error.message : copy.error); }
        finally { setDeleting(false); }
      }} />
    </Main>
  );
}

function RoleEditor({ role, onClose, onSaved }: { role: Role | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n();
  const copy = t.access;
  const access = useAccess();
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [selected, setSelected] = useState<Permission[]>(role?.permissions ?? ["dashboard.read"]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function toggle(permission: Permission, checked: boolean) {
    setSelected((current) => {
      if (!checked) return current.filter((entry) => entry !== permission && !(permission.endsWith(".read") && entry.startsWith(permission.split(".")[0] + ".")) && !(permission === "posts.read" && entry === "taxonomy.manage"));
      const read = `${permission.split(".")[0]}.read` as Permission;
      const requiredRead = permission === "taxonomy.manage" ? "posts.read" : read;
      const includeRead = !permission.endsWith(".read") && access.can(requiredRead);
      return [...new Set([...current, permission, ...(includeRead ? [requiredRead] : [])])];
    });
  }
  return <Dialog open onOpenChange={(open) => !open && !pending && onClose()}><DialogContent className="sm:max-w-2xl">
    <form className="contents" onSubmit={async (event) => {
      event.preventDefault(); setPending(true); setError(null);
      try { await mutateAccess("roles", "POST", { ...(role ? { id: role.id } : {}), name, description, permissions: selected }); toast.success(copy.saved); onSaved(); }
      catch (error) { setError(error instanceof Error ? error.message : copy.error); }
      finally { setPending(false); }
    }}>
      <DialogHeader><DialogTitle>{role ? copy.editRole : copy.newRole}</DialogTitle><DialogDescription>{copy.description}</DialogDescription></DialogHeader>
      <DialogBody className="grid max-h-[65vh] gap-5 overflow-y-auto">
        <label className="grid gap-2 text-sm font-medium">{copy.name}<Input required minLength={2} maxLength={60} value={name} onChange={(event) => setName(event.target.value)} disabled={pending} /></label>
        <label className="grid gap-2 text-sm font-medium">{copy.descriptionLabel}<Input maxLength={240} value={description} onChange={(event) => setDescription(event.target.value)} disabled={pending} /></label>
        <div className="grid gap-3 sm:grid-cols-2">{Object.entries(permissionGroups).filter(([resource]) => resource !== "system").map(([resource, actions]) => <fieldset key={resource} className="rounded-lg border p-3"><legend className="px-1 text-sm font-semibold capitalize">{resource}</legend><div className="grid gap-1">{actions.map((action) => {
          const permission = `${resource}.${action}` as Permission;
          return <label key={permission} className="flex min-h-9 cursor-pointer items-center gap-2 text-sm has-disabled:cursor-not-allowed has-disabled:opacity-50"><Checkbox checked={selected.includes(permission)} onCheckedChange={(checked) => toggle(permission, checked === true)} disabled={pending || !access.can(permission)} /><code className="text-xs">{permission}</code></label>;
        })}</div></fieldset>)}</div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </DialogBody>
      <DialogFooter><span aria-live="polite" className="me-auto text-sm text-muted-foreground">{selected.length} {copy.selected}</span><Button type="button" variant="outline" disabled={pending} onClick={onClose}>{copy.cancel}</Button><Button type="submit" disabled={pending}>{pending ? copy.loading : copy.save}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}
