import QRCode from "qrcode";

/** A print-crisp vector QR code, generated on the server at build time. */
export async function QrCode({ url, className = "" }: { url: string; className?: string }) {
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#1d1a17", light: "#ffffff" },
  });
  return (
    <div
      role="img"
      aria-label={`QR code linking to ${url}`}
      className={`bg-white p-[2.5pt] [&>svg]:block [&>svg]:size-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
