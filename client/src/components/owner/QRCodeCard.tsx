// apps/web/src/components/owner/QRCodeCard.tsx
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2 } from "lucide-react";
import { useRef } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { toast } from "sonner";

interface QRCodeCardProps {
  restaurantId: string;
  restaurantName: string;
}

export function QRCodeCard({ restaurantId, restaurantName }: QRCodeCardProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const publicUrl = `${
    import.meta.env.VITE_PUBLIC_URL || window.location.origin
  }/r/${restaurantId}`;
  const { t } = useLocale();

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-${restaurantName.replace(/\s+/g, "-").toLowerCase()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card rounded-2xl p-6 text-center space-y-4">
      <h3 className="font-semibold text-lg">{t("owner.qrcode.title")}</h3>
      <p className="text-sm text-muted-foreground">
        {t("owner.qrcode.subtitle")}
      </p>

      <div ref={qrRef} className="inline-block bg-white p-4 rounded-2xl shadow-sm">
        <QRCode
          value={publicUrl}
          size={200}
          level="H"
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>

      <p className="text-xs text-muted-foreground break-all">{publicUrl}</p>

      <div className="flex justify-center gap-2">
        <Button size="sm" variant="outline" onClick={downloadQR}>
          <Download className="size-4 mr-1" /> {t("owner.qrcode.download")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <Printer className="size-4 mr-1" /> {t("owner.qrcode.print")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(publicUrl);
            toast.success(t('owner.qrcode.copied'))
          }}
        >
          <Share2 className="size-4 mr-1" /> {t("owner.qrcode.copy")}
        </Button>
      </div>
    </div>
  );
}