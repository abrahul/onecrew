import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Arrow } from '@/components/brand';
import { PageIntro } from '@/components/page-intro';
import { WhatsAppCTA } from '@/components/whatsapp-cta';

export const metadata: Metadata = {
  title: 'About ONECREW',
  description:
    'ONECREW is a workforce service platform connecting customers with suitable workers and creating flexible work opportunities across Kerala.',
};

const missionPoints = [
  'Connect customers with suitable workers.',
  'Create more employment opportunities.',
  'Make workforce booking simple and convenient.',
  'Build trust through professional service and transparent communication.',
  'Support individuals in finding flexible work opportunities.',
];

const reasons = [
  'Easy workforce booking.',
  'Opportunities for freshers and experienced workers.',
  'Flexible work opportunities.',
  'Customer-focused service.',
  'A growing platform for workforce connections.',
];

export default function About() {
  return (
    <>
      <PageIntro
        eyebrow="About ONECREW"
        title="Your Daily Workforce Partner."
        copy="Connecting People. Empowering Workers. Building Better Communities."
      />

      <section className="inner-content about-page">
        <div className="wrap">
          <div className="about-overview">
            <span className="eyebrow">Who we are</span>
            <h2>Making workforce connections <em>simpler for everyone.</em></h2>
            <div className="about-overview-copy">
              <p>
                ONECREW is a workforce service platform built with a vision to make hiring reliable,
                simple, and accessible for everyone.
              </p>
              <p>
                We aim to bridge the gap between people who need workers and individuals who are
                looking for work opportunities.
              </p>
              <p>
                Whether it&apos;s a home requirement, daily assistance, general helper services, or
                business workforce support, ONECREW aims to make finding the right workforce easier
                through a simple and convenient booking experience.
              </p>
            </div>
          </div>

          <div className="about-direction-grid">
            <article className="vision-card">
              <span className="about-card-number">01</span>
              <span className="eyebrow eyebrow-light">Our vision</span>
              <h2>From Kerala to every part of India.</h2>
              <p>
                To become a trusted workforce service platform across Kerala and expand our services
                to every part of India.
              </p>
            </article>

            <article className="mission-card">
              <span className="about-card-number">02</span>
              <span className="eyebrow">Our mission</span>
              <h2>Opportunity, access, and trust.</h2>
              <ul className="about-check-list">
                {missionPoints.map((point) => (
                  <li key={point}><i aria-hidden="true" />{point}</li>
                ))}
              </ul>
            </article>
          </div>

          <section className="about-reasons" aria-labelledby="why-onecrew">
            <div className="about-reasons-heading">
              <span className="eyebrow">Why ONECREW?</span>
              <h2 id="why-onecrew">Built around the needs of <em>people and work.</em></h2>
            </div>
            <ol className="about-reason-list">
              {reasons.map((reason, index) => (
                <li key={reason}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{reason}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="founder-message" aria-labelledby="founder-message-title">
            <figure className="founder-portrait">
              <Image
                src="/images/syam-krishnan-ceo.png"
                alt="Syam Krishnan, Founder and CEO of ONECREW"
                width={1089}
                height={1444}
                sizes="(max-width: 820px) calc(100vw - 84px), 280px"
              />
              <figcaption>
                <strong>Syam Krishnan</strong>
                <span>Founder &amp; CEO</span>
              </figcaption>
            </figure>
            <div className="founder-message-heading">
              <span className="eyebrow eyebrow-light">A message from the founder</span>
              <h2 id="founder-message-title">One simple idea.<br />A bigger vision.</h2>
            </div>
            <div className="founder-quote">
              <span className="founder-quote-mark" aria-hidden="true">&ldquo;</span>
              <blockquote>
                <p>
                  ONECREW was born from a simple idea — connecting people who need work done with
                  people who are ready to work.
                </p>
                <p>
                  We believe that every worker deserves an opportunity and every customer deserves
                  reliable support.
                </p>
                <p>Our journey starts in Kerala, with a vision to build something bigger.</p>
              </blockquote>
              <div className="founder-signature">
                <strong>Syam Krishnan</strong>
                <span>Founder &amp; CEO — ONECREW</span>
              </div>
            </div>
          </section>

          <div className="about-next-step">
            <div>
              <span className="eyebrow">ONECREW</span>
              <h2>Your Daily Workforce Partner.</h2>
              <p>Need workforce, or ready to find your next work opportunity?</p>
            </div>
            <div className="about-next-actions">
              <WhatsAppCTA message="Hi ONECREW, I would like to book a worker.">Book a Worker</WhatsAppCTA>
              <Link className="button button-outline" href="/careers">
                Join ONECREW <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
