import { requireAdminPage } from '@/lib/admin-auth';import { AdminShell } from '@/components/admin-shell';import { ServiceManager } from '@/components/admin-catalog';
export const dynamic='force-dynamic';export default async function ServicesPage(){const a=await requireAdminPage();return <AdminShell name={a.name} email={a.email}><ServiceManager/></AdminShell>;}
