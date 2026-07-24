import { getTranslations } from "next-intl/server";
import { getMySubscriptions } from "@/lib/account-queries";
import { SubscriptionCard } from "@/components/account/subscription-card";
import { Button } from "@/components/ui/button";

export default async function SubscriptionPage() {
  const t = await getTranslations("Account");
  const subs = await getMySubscriptions();

  return (
    <div>
      <h1 className="font-display text-3xl text-ob-bone">
        {t("navSubscription")}
      </h1>
      {subs.length === 0 ? (
        <div className="mt-8">
          <p className="text-ob-smoke">{t("subEmpty")}</p>
          <div className="mt-6">
            <Button href="/donar" variant="donate">
              {t("subStart")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {subs.map((s) => (
            <SubscriptionCard key={s.id} sub={s} />
          ))}
        </div>
      )}
    </div>
  );
}
