import type { Metadata } from "next";

const PRODUCTS_META: Record<string, { title: string; brand: string; description: string }> = {
  "1": {
    title: "Sentini CPVC Pipe SDR 11 - 1/2 inch 3Mtr",
    brand: "Sentini Flopipes",
    description: "High-quality Sentini CPVC SDR 11 pipe for hot and cold water distribution. Conforms to IS 15778. Available for bulk wholesale in Gwalior.",
  },
  "2": {
    title: "Sentini UPVC SCH 40 Plain Pipe - 2.5 inch",
    brand: "Sentini Flopipes",
    description: "Heavy-duty Sentini UPVC Schedule 40 pressure pipe conforming to ASTM D-1785. Ideal for industrial and agricultural plumbing.",
  },
  "3": {
    title: "Sentini SWR Pipe Double Socket - 75mm",
    brand: "Sentini Flopipes",
    description: "SWR soil, waste & rainwater pipe with double socket design for quick ring-fit leakproof installation. Type A heavy-duty.",
  },
  "4": {
    title: "Johnson's Pedders Ceramic Wash Basin",
    brand: "Johnson's Pedders",
    description: "Premium high-gloss ceramic wash basin with anti-bacterial glaze. Elegant sanitary design from Johnson's Pedders.",
  },
  "5": {
    title: "Polyworld 1000L Triple Layer Water Storage Tank",
    brand: "Polyworld",
    description: "UV-stabilized virgin plastic 1000L water tank with antibacterial inner lining and threaded leakproof lid.",
  },
  "6": {
    title: "Brass Concealed Stop Cock 15mm",
    brand: "Sentini Flopipes",
    description: "Heavy-duty forged brass concealed stop cock with quarter-turn ceramic disc cartridge for precise water flow control.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS_META[id] || {
    title: `Product #${id}`,
    brand: "KSTC",
    description: "Genuine wholesale plumbing and sanitary solutions from KSTC Gwalior.",
  };

  const canonicalUrl = `https://store-kstco.vercel.app/product/${id}`;

  return {
    title: product.title,
    description: product.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.title} | ${product.brand} - KSTC Gwalior`,
      description: product.description,
      url: canonicalUrl,
      images: [
        {
          url: "/og-preview.png",
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | ${product.brand}`,
      description: product.description,
      images: ["/og-preview.png"],
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
