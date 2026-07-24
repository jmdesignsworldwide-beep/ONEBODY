import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import { ConvergencePlayground } from "@/components/convergence/convergence-playground";

// Banco de pruebas interno. No indexable, fuera del nav y del sitemap.
export const metadata: Metadata = {
  title: "Sistema de convergencia",
  robots: { index: false, follow: false },
};

export default async function ConvergencePage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        <Section>
          <Container>
            <Badge>Elemento firma · Referencia interna</Badge>
            <div className="mt-6">
              <SectionHeading
                title="Sistema de convergencia"
                description="Muchas donaciones, un nodo terminado. Mueve el progreso de 0 a 100 y pulsa «Simular donación» para ver el pulso en vivo. Los mismos datos alimentan la meta real en los proyectos."
              />
            </div>
            <div className="mt-16">
              <ConvergencePlayground />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
