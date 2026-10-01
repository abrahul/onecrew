import { requireAdminPage } from '@/lib/admin-auth';
import { AdminShell } from '@/components/admin-shell';
import { WorkerManager } from '@/components/admin-people';
export const dynamic='force-dynamic';
export default async function WorkersPage(){const a=await requireAdminPage();return <AdminShell name={a.name} email={a.email}><WorkerManager/></AdminShell>;}
