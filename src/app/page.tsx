import { Cta } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

const SITE_URL = "https://track.sidcandev.online";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <Cta />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ShipTrack",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "ShipTrack is a shipment tracking app for small freight teams that keeps every shipment in one dashboard and tracks it through courier providers.",
            url: SITE_URL,
            logo: `${SITE_URL}/logo.svg`,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            author: {
              "@type": "Organization",
              name: "ShipTrack",
              url: SITE_URL,
            },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer support",
              email: "sidhantaadityan@outlook.com",
            },
          }),
        }}
      />
    </>
  );
}
