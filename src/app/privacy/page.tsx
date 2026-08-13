import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const CONTACT_EMAIL = "sidhantaadityan@outlook.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ShipTrack collects, uses, and protects your information.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: August 13, 2026</p>

        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          This Privacy Policy explains how ShipTrack (“we”, “our”, “us”)
          collects, uses, and protects your information when you use our
          shipment tracking service (the “Service”). By using the Service, you
          agree to the practices described in this policy.
        </p>

        <Section title="1. Information we collect">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Account information</strong> —
              your email address, used to sign you in securely with a
              one-time verification code.
            </li>
            <li>
              <strong className="text-foreground">Shipment information</strong> —
              the tracking numbers, couriers, nicknames, statuses, and
              tracking history you add or that we discover for you.
            </li>
            <li>
              <strong className="text-foreground">Connected email accounts</strong> —
              when you choose to connect an email account (via Google OAuth,
              read-only), we store an encrypted token and the email address so
              we can find shipment notifications on your behalf. We never store
              the contents of your emails — only the extracted tracking facts.
            </li>
            <li>
              <strong className="text-foreground">Usage and technical data</strong> —
              basic session information and cookies required to keep you signed
              in. We do not sell or use this for advertising.
            </li>
          </ul>
        </Section>

        <Section title="2. How we use your information">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>To provide, maintain, and improve the Service.</li>
            <li>To authenticate you and keep your account secure.</li>
            <li>
              To track your shipments by calling courier tracking providers on
              your behalf.
            </li>
            <li>
              To discover and sync shipment updates from email accounts you
              connect.
            </li>
            <li>To respond to your questions and support requests.</li>
          </ul>
        </Section>

        <Section title="3. How we share information">
          <p>
            We do not sell your personal information. We share data only with
            the service providers required to run the Service, including
            hosting and database providers (e.g. Supabase), courier tracking
            APIs, and Google (only when you connect a Gmail account). These
            providers may process your data only to provide the Service to you.
          </p>
        </Section>

        <Section title="4. Data retention">
          <p>
            We keep your data for as long as your account is active or as long
            as needed to provide the Service. If you disconnect an email
            account or delete a shipment, the related data is removed. You may
            request deletion of your entire account and data at any time.
          </p>
        </Section>

        <Section title="5. Security">
          <p>
            Your data is protected with row-level security so each user can
            only ever see their own shipments. OAuth tokens are encrypted at
            rest and never exposed to your browser. Sign-in codes are
            single-use and expire quickly.
          </p>
        </Section>

        <Section title="6. Your rights and choices">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              You can disconnect any connected email account from your
              dashboard settings at any time.
            </li>
            <li>You can edit or delete any shipment you have added.</li>
            <li>
              You can ask us to access, correct, or delete your personal
              information by contacting us.
            </li>
          </ul>
        </Section>

        <Section title="7. Children’s privacy">
          <p>
            The Service is not directed to children under 13, and we do not
            knowingly collect personal information from them.
          </p>
        </Section>

        <Section title="8. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. Material
            changes will be reflected by updating the “Last updated” date
            above.
          </p>
        </Section>

        <Section title="9. Contact us">
          <p>
            If you have any questions about this Privacy Policy or your data,
            please contact us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-primary hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
