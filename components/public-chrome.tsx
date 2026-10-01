'use client';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
import { MobileBooking } from './mobile-booking';
export function PublicHeader(){const path=usePathname();return path.startsWith('/admin')||path.startsWith('/track/')?null:<Header/>;}
export function PublicFooter(){const path=usePathname();return path.startsWith('/admin')||path.startsWith('/track/')?null:<><Footer/><MobileBooking/></>;}
