"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createUserAction,
  setUserActiveAction,
  updateUserRoleAction,
} from "@/modules/users/user.actions";

interface UserRow {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  roleId: string | null;
  roleName: string | null;
}

interface Role {
  id: string;
  name: string;
}

export function UserManager({
  users,
  roles,
  currentUserId,
}: {
  users: UserRow[];
  roles: Role[];
  currentUserId: string;
}) {
  const router = useRouter();
  const firstRole = roles[0]?.id ?? "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(firstRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await createUserAction({ name, email, password, roleId });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    router.refresh();
  }

  async function changeRole(id: string, newRole: string) {
    const res = await updateUserRoleAction(id, newRole);
    if (res.ok) router.refresh();
    else window.alert(res.error);
  }

  async function toggleActive(id: string, next: boolean) {
    const res = await setUserActiveAction(id, next);
    if (res.ok) router.refresh();
    else window.alert(res.error);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
      <form onSubmit={onCreate} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium">User baru</p>
        <div className="space-y-1.5">
          <Label htmlFor="u-name">Nama</Label>
          <Input id="u-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="u-email">Email</Label>
          <Input id="u-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="u-pass">Password</Label>
          <Input id="u-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="u-role">Peran</Label>
          <Select id="u-role" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Membuat…" : "Buat User"}
        </Button>
      </form>

      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {u.name}
                {u.id === currentUserId ? (
                  <span className="ml-2 text-xs text-muted-foreground">(Anda)</span>
                ) : null}
              </p>
              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {u.isActive ? (
                <Badge variant="success">aktif</Badge>
              ) : (
                <Badge variant="secondary">nonaktif</Badge>
              )}
              <Select
                value={u.roleId ?? ""}
                onChange={(e) => changeRole(u.id, e.target.value)}
                className="h-8 w-auto text-xs"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={u.id === currentUserId}
                onClick={() => toggleActive(u.id, !u.isActive)}
              >
                {u.isActive ? "Nonaktifkan" : "Aktifkan"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
