import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const CONTACT_EMAIL = "sidhantaadityan@outlook.com";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of ShipTrack.",
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

export default function TermsPage() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: August 13, 2026</p>

        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          These Terms of Service (“Terms”) govern your access to and use of
          ShipTrack (“the Service”), operated by ShipTrack. By creating an
          account or using the Service, you agree to these Terms.
        </p>

        <Section title="1. Description of the Service">
          <p>
            ShipTrack is a shipment tracking service that lets you keep your
            shipments in one place, track them through courier providers, and
            optionally connect email accounts so tracking numbers are
            discovered automatically.
          </p>
        </Section>

        <Section title="2. Accounts and security">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>You must provide a valid email address to create an account.</li>
            <li>
              You are responsible for keeping your account secure and for all
              activity that happens under it.
            </li>
            <li>
              You may not create accounts or access the Service in ways that
              abuse, disrupt, or interfere with it or with other users.
            </li>
          </ul>
        </Section>

        <Section title="3. Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Use the Service for any unlawful purpose or in violation of applicable law.</li>
            <li>Attempt to access another user’s data or the Service’s infrastructure without authorization.</li>
            <li>Scrape, reverse-engineer, or attempt to extract data from the Service beyond what is provided to you.</li>
            <li>Misrepresent your identity or affiliation.</li>
          </ul>
        </Section>

        <Section title="4. Third-party services">
          <p>
            The Service relies on third-party providers, including courier
            tracking APIs and, if you choose to connect one, your email
            provider. Your use of those services is subject to their own terms
            and privacy policies. We are not responsible for the accuracy or
            availability of third-party tracking data.
          </p>
        </Section>

        <Section title="5. Intellectual property">
          <p>
            The Service, including its software, design, and content, is the
            property of ShipTrack or its licensors and is protected by
            applicable intellectual property laws. You may not copy, modify,
            distribute, or create derivative works from it without our prior
            written consent.
          </p>
        </Section>

        <Section title="6. Disclaimer of warranties">
          <p>
            The Service is provided “as is” and “as available”, without
            warranties of any kind, whether express or implied, including but
            not limited to implied warranties of merchantability, fitness for a
            particular purpose, and non-infringement. We do not warrant that
            the Service will be uninterrupted, error-free, or that tracking
            information will always be accurate or up to date.
          </p>
        </Section>

        <Section title="7. Limitation of liability">
          <p>
            To the maximum extent permitted by law, ShipTrack shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits, data, or goodwill,
            arising out of or related to your use of the Service.
          </p>
        </Section>

        <Section title="8. Termination">
          <p>
            You may stop using the Service at any time and may request deletion
            of your account and data. We may suspend or terminate access to the
            Service if you violate these Terms or if required by law.
          </p>
        </Section>

        <Section title="9. Changes to these Terms">
          <p>
            We may update these Terms from time to time. Continued use of the
            Service after changes take effect means you accept the updated
            Terms. The “Last updated” date above reflects the most recent
            revision.
          </p>
        </Section>

        <Section title="10. Governing law">
          <p>
            These Terms are governed by the applicable laws of India, without
            regard to conflict-of-law principles, unless otherwise required by
            law where you reside.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Questions about these Terms? Contact us at{" "}
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
