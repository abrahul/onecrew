import { requireAdminPage } from '@/lib/admin-auth';
import { AdminShell } from '@/components/admin-shell';
import { BookingDetails } from '@/components/admin-booking-console';
export const dynamic='force-dynamic';
export default async function BookingDetailPage({params}:{params:{id:string}}){const a=await requireAdminPage();return <AdminShell name={a.name} email={a.email}><BookingDetails id={params.id}/></AdminShell>;}
