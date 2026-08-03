// apps/web/src/pages/PaymentVerify.tsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "wouter";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";

const glass =
  "rounded-[26px] border border-white/70 bg-white/70 shadow-[0_16px_45px_rgba(74,71,113,.10)] backdrop-blur-xl";

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");
  const method = searchParams.get("method");
  const session_id = searchParams.get("session_id");
  const { t } = useLocale();

  const [pageState, setPageState] = useState<
    "loading" | "success" | "failed" | "invalid"
  >("loading");
  const [refId, setRefId] = useState("");

  useEffect(() => {
    if (!orderId) {
      setPageState("invalid");
      return;
    }

    // For Zarinpal, the URL will contain Authority & Status
    if (method == "zarinpal") {
      api
        .verifyPayment(
          `/api/payment/verify?orderId=${orderId}&Authority=${authority}&Status=${status}`
        )
        .then(res => {
          console.log(res);

          if (res.success) {
            setRefId(res.refId || "");
            setPageState("success");
          } else {
            setPageState("failed");
          }
        })
        .catch(() => setPageState("failed"));
    } else if (method == "stripe") {
      if (status) {
        setPageState("success");
        setRefId(session_id || "");
      } else {
        setPageState("failed");
      }
    } else setPageState("failed");
  }, [orderId, authority, status, method, session_id]);

  return (
    <main className="min-h-screen bg-[#f5f5fb] flex items-center justify-center p-4">
      <div className="pointer-events-none fixed -left-40 top-0 size-[30rem] rounded-full bg-indigo-200/45 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 size-[34rem] rounded-full bg-emerald-100/70 blur-3xl" />

      <AnimatePresence mode="wait">
        {pageState === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`${glass} p-8 text-center max-w-md w-full`}
          >
            <Loader2 className="size-12 mx-auto animate-spin text-indigo-500 mb-4" />
            <h2 className="text-xl font-semibold">{t("payment.verifying")}</h2>
            <p className="text-muted-foreground mt-2">{t("payment.waiting")}</p>
          </motion.div>
        )}

        {pageState === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`${glass} p-8 text-center max-w-md w-full`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto size-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4"
            >
              <CheckCircle className="size-8 text-emerald-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-emerald-700">
              {t("payment.success")}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t("payment.successDesc")}
            </p>
            {refId && (
              <div className="mt-4 bg-white/50 rounded-xl p-3 text-sm">
                <span className="text-muted-foreground">
                  {" "}
                  {t("payment.trackCode")}
                </span>
                <strong className="font-mono">{refId}</strong>
              </div>
            )}
            <div className="mt-6 flex gap-3 justify-center">
              <Link to={`/r/${searchParams.get("restaurantId") || ""}`}>
                <Button variant="outline" className="gap-2">
                  <UtensilsCrossed className="size-4" /> {t("common.backToMenu")}
                </Button>
              </Link>
              <Link to="/">
                <Button className="gap-2">
                  <ArrowRight className="size-4" /> {t("common.home")}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {pageState === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`${glass} p-8 text-center max-w-md w-full`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto size-16 rounded-full bg-red-100 flex items-center justify-center mb-4"
            >
              <XCircle className="size-8 text-red-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-red-700">{t("payment.filed")}</h2>
            <p className="text-muted-foreground mt-2">
              {t("payment.filedDesc")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("payment.try")}
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Link to={`/r/${searchParams.get("restaurantId") || ""}`}>
                <Button variant="outline" className="gap-2">
                  {t("common.backToMenu")}
                </Button>
              </Link>
              <Link to="/">
                <Button className="gap-2">{t("common.home")}</Button>
              </Link>
            </div>
          </motion.div>
        )}

        {pageState === "invalid" && (
          <motion.div
            key="invalid"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`${glass} p-8 text-center max-w-md w-full`}
          >
            <XCircle className="size-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold">{t("payment.invalid")}</h2>
            <p className="text-muted-foreground mt-2">
              {t("payment.invalidDesc")}
            </p>
            <div className="mt-6">
              <Link to="/">
                <Button className="gap-2">{t("common.goHome")}</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
