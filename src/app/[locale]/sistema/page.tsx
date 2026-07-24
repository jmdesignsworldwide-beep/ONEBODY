import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TreatedImage } from "@/components/ui/treated-image";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

// Página interna de referencia del sistema de diseño. No indexable, fuera del
// nav y del sitemap.
export const metadata: Metadata = {
  title: "Sistema de diseño",
  robots: { index: false, follow: false },
};

const palette = [
  { name: "ob-black", cls: "bg-ob-black", hex: "#0A0A0A" },
  { name: "ob-carbon", cls: "bg-ob-carbon", hex: "#141414" },
  { name: "ob-graphite", cls: "bg-ob-graphite", hex: "#1F1F1F" },
  { name: "ob-ash", cls: "bg-ob-ash", hex: "#3A3A3A" },
  { name: "ob-smoke", cls: "bg-ob-smoke", hex: "#8A8A8A" },
  { name: "ob-bone", cls: "bg-ob-bone", hex: "#F5F3F0" },
  { name: "ob-red", cls: "bg-ob-red", hex: "#E02B20", red: true },
  { name: "ob-red-deep", cls: "bg-ob-red-deep", hex: "#A81810", red: true },
];

export default async function StyleguidePage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        <Section className="pb-12">
          <Container>
            <Badge>Referencia interna</Badge>
            <h1 className="mt-6 font-display text-[clamp(2.5rem,7vw,5rem)] text-ob-bone">
              Sistema de diseño
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ob-smoke">
              Componentes base, tipografía, tratamiento de imagen y animaciones.
              El rojo aparece sólo en marca y donación.
            </p>
          </Container>
        </Section>

        {/* Paleta */}
        <Section className="py-12">
          <Container>
            <SectionHeading eyebrow="Color" title="Paleta" />
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {palette.map((c) => (
                <Card key={c.name} className="p-0">
                  <div className={`h-24 rounded-t-[var(--radius-ob)] ${c.cls}`} />
                  <div className="p-4">
                    <p className="font-medium text-ob-bone">--{c.name}</p>
                    <p className="tabular text-sm text-ob-smoke">{c.hex}</p>
                    {c.red && (
                      <p className="mt-1 text-xs text-ob-red">sólo marca / donación</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Tipografía */}
        <Section className="py-12">
          <Container>
            <SectionHeading eyebrow="Tipografía" title="Escala" />
            <div className="mt-10 space-y-6 border-t border-ob-ash/30 pt-8">
              <p className="font-display text-[clamp(3rem,8vw,6rem)] text-ob-bone">
                Muchos miembros
              </p>
              <p className="font-display text-4xl text-ob-bone">
                Un cuerpo, muchas manos
              </p>
              <p className="max-w-2xl text-lg leading-relaxed text-ob-smoke">
                Cuerpo en sans geométrica. Los titulares respiran con
                line-height generoso y tracking negativo. Los montos usan{" "}
                <span className="tabular text-ob-bone">números tabulares:
                RD$40,000</span>.
              </p>
            </div>
          </Container>
        </Section>

        {/* Botones */}
        <Section className="py-12">
          <Container>
            <SectionHeading
              eyebrow="Componentes"
              title="Botones"
              description="Sólo la variante de donación es roja. El resto, monocromo."
            />
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button variant="donate" size="lg">Donar ahora</Button>
              <Button variant="primary">Acción primaria</Button>
              <Button variant="secondary">Secundaria</Button>
              <Button variant="ghost">Fantasma</Button>
              <Button variant="secondary" size="sm">Pequeña</Button>
            </div>
          </Container>
        </Section>

        {/* Cards + Badges */}
        <Section className="py-12">
          <Container>
            <SectionHeading eyebrow="Componentes" title="Cards y badges" />
            <Stagger className="mt-10 grid gap-6 md:grid-cols-3" gap={0.09}>
              {["vivienda", "alimentación", "educación"].map((cat) => (
                <StaggerItem key={cat}>
                  <Card interactive>
                    <Badge>{cat}</Badge>
                    <h3 className="mt-4 font-display text-2xl text-ob-bone">
                      Título del proyecto
                    </h3>
                    <p className="mt-2 text-ob-smoke">
                      Descripción breve con espacio para respirar y jerarquía
                      clara.
                    </p>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>

        {/* Tratamiento de imagen */}
        <Section className="py-12">
          <Container>
            <SectionHeading
              eyebrow="Fotografía"
              title="Tratamiento de imagen"
              description="Grado cálido, grano de película y degradado en la base. Máscaras de aspecto consistentes. (Marcadores hasta que lleguen las fotos reales.)"
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <TreatedImage alt="Ejemplo 3:2" aspect="3/2" />
              <TreatedImage alt="Ejemplo 4:5" aspect="4/5" />
              <TreatedImage alt="Ejemplo 1:1" aspect="1/1" />
            </div>
          </Container>
        </Section>

        {/* Movimiento */}
        <Section className="py-12">
          <Container>
            <SectionHeading
              eyebrow="Movimiento"
              title="Animaciones"
              description="Cada bloque entra al viewport con fade + deslizamiento (expo-out). Todo respeta prefers-reduced-motion."
            />
            <div className="mt-10 space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-carbon p-6 text-ob-smoke">
                    Bloque {i + 1} — entrada escalonada al hacer scroll.
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
