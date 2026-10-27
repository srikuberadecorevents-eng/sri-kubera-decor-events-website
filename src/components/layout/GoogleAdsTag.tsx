"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const googleAdsId =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-18536008648";

export default function GoogleAdsTag() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-tag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleAdsId}');
        `}
      </Script>
    </>
  );
}
