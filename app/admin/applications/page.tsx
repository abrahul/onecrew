import { requireAdminPage } from '@/lib/admin-auth';
import { AdminShell } from '@/components/admin-shell';
import { ApplicationManager } from '@/components/admin-people';
export const dynamic='force-dynamic';
export default async function ApplicationsPage(){const a=await requireAdminPage();return <AdminShell name={a.name} email={a.email}><ApplicationManager/></AdminShell>;}
