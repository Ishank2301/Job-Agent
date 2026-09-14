import { Landing } from "@/components/landing/Landing";
import { site } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: site.url,
  description: site.description,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Automated job discovery",
    "AI resume tailoring",
    "ATS match scoring",
    "Recruiter outreach drafts",
    "Application pipeline Kanban",
  ],
  creator: { "@type": "Organization", name: site.name, url: site.url },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Landing />
    </>
  );
}
