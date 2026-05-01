// Seed: legt vordefinierte Kategorien und ein paar Standard-Tags an.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PREDEFINED_CATEGORIES: { name: string; description: string }[] = [
  { name: "Politik", description: "Gesetze, Regierung, Parteien, Wahlen" },
  { name: "Bildung", description: "Schulen, Universitäten, Ausbildung" },
  { name: "Gesundheit", description: "Krankenhäuser, Versicherung, Pflege" },
  { name: "Wohnen", description: "Mieten, Wohnungsmarkt, Bauen" },
  { name: "Verkehr", description: "ÖPNV, Straßen, Auto, Fahrrad" },
  { name: "Wirtschaft", description: "Arbeit, Steuern, Unternehmen" },
  { name: "Umwelt", description: "Klima, Natur, Energie" },
  { name: "Soziales", description: "Familie, Senioren, Integration" },
  { name: "Digitalisierung", description: "Internet, IT, digitale Verwaltung" },
  { name: "Bürokratie", description: "Behörden, Anträge, Verwaltung" },
  { name: "Sicherheit", description: "Polizei, Justiz, Kriminalität" },
  { name: "Sonstiges", description: "Andere Themen" },
];

const PREDEFINED_TAGS = [
  "Problem",
  "Lösung",
  "Details",
  "Frage",
  "Erfahrung",
  "Vorschlag",
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Seed startet …");
  for (const c of PREDEFINED_CATEGORIES) {
    const slug = slugify(c.name);
    await prisma.category.upsert({
      where: { slug },
      update: { description: c.description, isPredefined: true },
      create: {
        name: c.name,
        slug,
        description: c.description,
        isPredefined: true,
      },
    });
    console.log(`  ✓ Kategorie: ${c.name}`);
  }
  for (const t of PREDEFINED_TAGS) {
    const slug = slugify(t);
    await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name: t, slug },
    });
    console.log(`  ✓ Tag: ${t}`);
  }
  console.log("Seed fertig.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
