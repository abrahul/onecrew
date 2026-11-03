import type { Metadata } from 'next';
import { PageIntro } from '@/components/page-intro';
import { CareerForm } from '@/components/forms';
export const metadata: Metadata = { title: 'Careers', description: 'Find work opportunities with ONECREW. Apply as a skilled, general or temporary worker.' };
export default function Careers() { return <><PageIntro eyebrow="Join ONECREW" title="Apply to work with us." copy="A short application with only the essentials." /><section className="inner-content"><div className="wrap"><CareerForm /></div></section></>; }
