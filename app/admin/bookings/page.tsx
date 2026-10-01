import { requireAdminPage } from '@/lib/admin-auth';
import { AdminShell } from '@/components/admin-shell';
import { BookingList } from '@/components/admin-booking-console';
export const dynamic='force-dynamic';
export default async function BookingsPage(){const a=await requireAdminPage();return <AdminShell name={a.name} email={a.email}><BookingList/></AdminShell>;}
