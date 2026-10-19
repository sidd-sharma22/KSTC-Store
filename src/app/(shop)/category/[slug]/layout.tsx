import type { Metadata } from "next";

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  "pipes-fittings": {
    title: "Sentini Pipes & Fittings Wholesale Distributor",
    description:
      "Buy Sentini CPVC, UPVC, SWR drainage pipes, column pipes, and fittings at wholesale contractor prices in Gwalior & Chambal region.",
  },
  "sanitary-ware": {
    title: "Johnson Pedders Sanitary Ware Wholesale Distributor",
    description:
      "Premium Johnson Pedders ceramic wash basins, water closets, urinals, and sanitary ware wholesale in Gwalior.",
  },
  "bathroom-ware": {
    title: "Luxury Bathroom Ware & Fittings Wholesale",
    description:
      "Modern luxury bathroom ware, vanities, faucets, and brass fittings for contractors and retail customers in Gwalior.",
  },
  "water-tanks": {
    title: "Polyworld Water Storage Tanks Wholesale Distributor",
    description:
      "Polyworld heavy-duty multi-layer water storage tanks in 500L, 1000L, and 2000L sizes for commercial and residential applications in Gwalior.",
  },
  "all-products": {
    title: "All Wholesale Plumbing & Sanitary Products",
    description:
      "Browse the complete catalog of factory-authorized pipes, fittings, sanitary ware, and water tanks at KSTC Gwalior.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = CATEGORY_META[slug] || {
    title: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    description: "Explore wholesale plumbing, sanitary ware, and pipes from Khatu Shyam Trading Co. in Gwalior.",
  };

  const canonicalUrl = `https://store-kstco.vercel.app/category/${slug}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${meta.title} | Khatu Shyam Trading Co. Gwalior`,
      description: meta.description,
      url: canonicalUrl,
      images: [
        {
          url: "/og-preview.png",
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.title} | Khatu Shyam Trading Co. Gwalior`,
      description: meta.description,
      images: ["/og-preview.png"],
    },
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
