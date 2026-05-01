// Konfiguration aller Kampagnen.
// Top-3 haben Custom-Forms (fields[]). Bottom-7 sind reine Tag-Kampagnen.

export type CampaignFieldOption = { value: string; label: string };

export type CampaignField =
  | {
      name: string;
      type: "text";
      label: string;
      help?: string;
      required?: boolean;
      maxLength?: number;
      placeholder?: string;
    }
  | {
      name: string;
      type: "textarea";
      label: string;
      help?: string;
      required?: boolean;
      maxLength?: number;
      placeholder?: string;
      rows?: number;
    }
  | {
      name: string;
      type: "number";
      label: string;
      help?: string;
      required?: boolean;
      min?: number;
      max?: number;
    }
  | {
      name: string;
      type: "select";
      label: string;
      help?: string;
      required?: boolean;
      options: CampaignFieldOption[];
    }
  | {
      name: string;
      type: "multiselect";
      label: string;
      help?: string;
      required?: boolean;
      options: CampaignFieldOption[];
    }
  | {
      name: string;
      type: "image";
      label: string;
      help?: string;
      required?: boolean;
    };

export type CampaignFilter = {
  field: string; // Feldname in structuredData oder "campaignStatus"
  label: string;
  options: CampaignFieldOption[];
};

export type CampaignSort = {
  value: string;
  label: string;
};

export type Campaign = {
  slug: string;
  title: string;
  shortTitle?: string;
  tagline: string;
  description: string;
  prompt?: string;
  tag: string; // Tag-Name, der jedem Beitrag automatisch zugewiesen wird
  category?: string; // Default-Kategorie-Name (Kategorie wird angelegt falls fehlend)
  fields?: CampaignField[]; // wenn vorhanden = custom form
  filters?: CampaignFilter[];
  sortOptions?: CampaignSort[];
  statusOptions?: { value: string; label: string; tone: "neutral" | "info" | "success" | "done" }[];
  view?: "list" | "gallery";
  isHighImpact?: boolean;
};

const PROFITEURE_OPTIONS: CampaignFieldOption[] = [
  { value: "buerger", label: "Bürger" },
  { value: "unternehmen", label: "Unternehmen" },
  { value: "verwaltung", label: "Verwaltung" },
  { value: "mehrere", label: "Mehrere" },
];

const KOSTENTRAEGER_OPTIONS: CampaignFieldOption[] = [
  { value: "bund", label: "Bund" },
  { value: "laender", label: "Länder" },
  { value: "unternehmen", label: "Unternehmen" },
  { value: "buerger", label: "Bürger" },
  { value: "keine", label: "Keine zusätzlichen" },
];

const ZEITAUFWAND_OPTIONS: CampaignFieldOption[] = [
  { value: "<15", label: "unter 15 Min" },
  { value: "15-60", label: "15–60 Min" },
  { value: "1-3h", label: "1–3 Std." },
  { value: ">3h", label: "über 3 Std." },
];

export const CAMPAIGNS: Campaign[] = [
  // -------------- TOP 3 (Custom Templates) --------------
  {
    slug: "streichliste-2036",
    title: "Streichliste 2036",
    shortTitle: "Streichliste",
    tagline: "Welche Vorschriften gehören ersatzlos weg?",
    description:
      "Konkrete Gesetze, Verordnungen oder Vorschriften, die ohne Ersatz gestrichen werden sollen. Quartalsweise wird daraus ein „Streichgesetz“ mit den Top-50-Vorschlägen als Vorlage für Fraktionen.",
    prompt:
      "Mach es konkret. Beziehe dich auf eine Rechtsquelle (Paragraph, Verordnung). Erkläre, wer dadurch belastet wird — und vor allem, was NICHT verloren geht, wenn man es streicht.",
    tag: "Streichliste",
    category: "Bürokratie",
    isHighImpact: true,
    fields: [
      {
        name: "rechtsquelle",
        type: "text",
        label: "Rechtsquelle",
        help: "z. B. § 17 Ladenschlussgesetz, BImSchV §X, EnEV §6",
        required: true,
        maxLength: 200,
      },
      {
        name: "belastung",
        type: "textarea",
        label: "Wen belastet das wie?",
        required: true,
        maxLength: 1500,
        rows: 4,
      },
      {
        name: "profiteure",
        type: "multiselect",
        label: "Wer würde profitieren?",
        required: true,
        options: PROFITEURE_OPTIONS,
      },
      {
        name: "nicht_verloren",
        type: "textarea",
        label: "Was geht NICHT verloren, wenn es gestrichen wird?",
        help: "Wichtig — verhindert ideologische Forderungen ohne Substanz.",
        required: true,
        maxLength: 1500,
        rows: 3,
      },
      {
        name: "vorbild",
        type: "text",
        label: "Vorbild (optional)",
        help: "Bundesland oder Land, in dem es schon ohne diese Vorschrift funktioniert.",
        required: false,
        maxLength: 100,
      },
    ],
    filters: [
      {
        field: "profiteure",
        label: "Profiteure",
        options: PROFITEURE_OPTIONS,
      },
    ],
    sortOptions: [
      { value: "neu", label: "Neueste" },
      { value: "top", label: "Beliebteste" },
      { value: "konsens", label: "Konsens" },
    ],
  },
  {
    slug: "wishlist-2036",
    title: "Wishlist 2036",
    shortTitle: "Wishlist",
    tagline: "Welches Gesetz fehlt?",
    description:
      "Bürgerliche Gesetzesvorschläge mit Substanz. Top-3 pro Quartal werden mit Pro-Bono-Jurist:innen zu fertigen Entwürfen ausgearbeitet.",
    prompt:
      "Sei konkret. Beschreibe das Problem, dann den Lösungsvorschlag möglichst gesetzesnah. Wenn etwas Vergleichbares schon irgendwo existiert (Bundesland, EU, Ausland), nenne es.",
    tag: "Wishlist",
    category: "Politik",
    isHighImpact: true,
    fields: [
      {
        name: "problem",
        type: "textarea",
        label: "Welches Problem soll gelöst werden?",
        required: true,
        maxLength: 1500,
        rows: 4,
      },
      {
        name: "loesungsvorschlag",
        type: "textarea",
        label: "Lösungsvorschlag (möglichst gesetzesnah)",
        required: true,
        maxLength: 2500,
        rows: 6,
      },
      {
        name: "vorbild",
        type: "text",
        label: "Vorbild",
        help: "Bundesland / EU / Ausland — oder „neu“, wenn Eigen-Idee",
        required: true,
        maxLength: 200,
      },
      {
        name: "profiteure",
        type: "multiselect",
        label: "Wer würde profitieren?",
        required: true,
        options: PROFITEURE_OPTIONS,
      },
      {
        name: "kostentraeger",
        type: "select",
        label: "Wer trägt die Kosten?",
        help: "Verhindert reines „Mehr Geld für X“-Drift.",
        required: true,
        options: KOSTENTRAEGER_OPTIONS,
      },
    ],
    filters: [
      {
        field: "kostentraeger",
        label: "Kostenträger",
        options: KOSTENTRAEGER_OPTIONS,
      },
      {
        field: "campaignStatus",
        label: "Status",
        options: [
          { value: "eingereicht", label: "Eingereicht" },
          { value: "in-ausarbeitung", label: "In Ausarbeitung" },
          { value: "entwurf-fertig", label: "Entwurf fertig" },
          { value: "eingebracht", label: "Eingebracht" },
        ],
      },
    ],
    sortOptions: [
      { value: "neu", label: "Neueste" },
      { value: "top", label: "Beliebteste" },
      { value: "in-ausarbeitung", label: "Aktuell in Ausarbeitung" },
    ],
    statusOptions: [
      { value: "eingereicht", label: "Eingereicht", tone: "neutral" },
      { value: "in-ausarbeitung", label: "In Ausarbeitung", tone: "info" },
      { value: "entwurf-fertig", label: "Entwurf fertig", tone: "success" },
      { value: "eingebracht", label: "Eingebracht", tone: "done" },
    ],
  },
  {
    slug: "formular-friedhof",
    title: "Formular-Friedhof",
    shortTitle: "Friedhof",
    tagline: "Welche Behördenformulare sind absurd?",
    description:
      "Visuelle Sammlung absurder Behördenformulare. Quartalsweise erscheint die Liste „10 Formulare, die niemand mehr braucht“ mit konkreten Vereinfachungs-Vorschlägen an die Behörden.",
    prompt:
      "Foto oder Screenshot ist Pflicht. Gib an, welche Behörde, wie viele Seiten, wie lange das Ausfüllen realistisch dauert — und was stattdessen reichen würde.",
    tag: "Formular-Friedhof",
    category: "Bürokratie",
    isHighImpact: true,
    view: "gallery",
    fields: [
      {
        name: "bild",
        type: "image",
        label: "Foto / Screenshot des Formulars",
        help: "Pflicht — kein Beitrag ohne Bild.",
        required: true,
      },
      {
        name: "behoerde",
        type: "text",
        label: "Behörde",
        required: true,
        maxLength: 150,
        placeholder: "z. B. Bürgeramt Berlin-Mitte",
      },
      {
        name: "anzahl_seiten",
        type: "number",
        label: "Anzahl Seiten",
        required: true,
        min: 1,
        max: 200,
      },
      {
        name: "zeitaufwand",
        type: "select",
        label: "Realistischer Zeitaufwand",
        required: true,
        options: ZEITAUFWAND_OPTIONS,
      },
      {
        name: "vereinfachung",
        type: "textarea",
        label: "Was würde stattdessen reichen?",
        required: true,
        maxLength: 1500,
        rows: 4,
      },
    ],
    filters: [
      {
        field: "zeitaufwand",
        label: "Zeitaufwand",
        options: ZEITAUFWAND_OPTIONS,
      },
    ],
    sortOptions: [
      { value: "neu", label: "Neueste" },
      { value: "top", label: "Beliebteste" },
      { value: "schmerzhaftest", label: "Schmerzhaftest" },
    ],
  },

  // -------------- PHASE 2 (reine Tag-Kampagnen) --------------
  {
    slug: "buerokratie-erlebnis",
    title: "Bürokratie-Erlebnis",
    tagline: "Dein Behörden-Schock-Moment",
    description:
      "Erzähl deinen aktuellsten Bürokratie-Reinfall. Konkrete Geschichten, konkrete Behörde, konkrete Zeit/Geldverlust.",
    tag: "Bürokratie-Erlebnis",
    category: "Bürokratie",
  },
  {
    slug: "doppelmelder",
    title: "Doppelmelder",
    tagline: "Welche Daten musst du mehrfach an den Staat geben?",
    description:
      "Sammelt Fälle, in denen Bürger oder Unternehmen dieselben Daten mehrfach an verschiedene Behörden melden müssen.",
    tag: "Doppelmelder",
    category: "Bürokratie",
  },
  {
    slug: "gold-plating",
    title: "Gold-Plating",
    tagline: "Wo verschärft Deutschland EU-Recht unnötig?",
    description:
      "EU-Richtlinien, die in Deutschland strenger umgesetzt sind als nötig — mit konkretem Vergleich zu anderen Mitgliedsstaaten.",
    tag: "Gold-Plating",
    category: "Bürokratie",
  },
  {
    slug: "vorbild-ausland",
    title: "Vorbild Ausland",
    tagline: "Wo macht es ein anderes Land besser?",
    description:
      "Konkrete Regelungen aus anderen Ländern, die in Deutschland fehlen oder schlechter umgesetzt sind.",
    tag: "Vorbild-Ausland",
    category: "Politik",
  },
  {
    slug: "erster-job",
    title: "Erster Job",
    tagline: "Was macht den Berufseinstieg in Deutschland kompliziert?",
    description:
      "Steuerklassen, Sozialabgaben, Bewerbungs-Hürden, Anerkennung von Abschlüssen — was hat dir auf deinem Weg zum ersten Job Steine in den Weg gelegt?",
    tag: "Erster-Job",
    category: "Wirtschaft",
  },
  {
    slug: "freischwimmer",
    title: "Freischwimmer",
    tagline: "Selbstständigkeit gegen den Behörden-Wind",
    description:
      "Hürden auf dem Weg in die Selbstständigkeit — von Gewerbeanmeldung über Krankenkasse bis zum ersten Bescheid.",
    tag: "Freischwimmer",
    category: "Wirtschaft",
  },
  {
    slug: "foerder-dschungel",
    title: "Förder-Dschungel",
    tagline: "Wo verirrt sich Geld zwischen Antrag und Auszahlung?",
    description:
      "Förderprogramme, deren Antragsaufwand größer ist als die Förderhöhe. Oder bei denen niemand versteht, ob er überhaupt antragsberechtigt ist.",
    tag: "Förder-Dschungel",
    category: "Wirtschaft",
  },
];

export function getCampaign(slug: string): Campaign | null {
  return CAMPAIGNS.find((c) => c.slug === slug) || null;
}

export function getActiveCampaigns(): Campaign[] {
  return CAMPAIGNS;
}

export function getHighImpactCampaigns(): Campaign[] {
  return CAMPAIGNS.filter((c) => c.isHighImpact);
}

// Hilfs-Lookup für Tag→Kampagne (z. B. um Beiträge ohne campaignSlug aber mit Tag zuzuordnen)
export function getCampaignByTag(tagName: string): Campaign | null {
  return CAMPAIGNS.find((c) => c.tag.toLowerCase() === tagName.toLowerCase()) || null;
}

// Validierung der structuredData gegen die Campaign-Felder.
export type ValidationResult = { ok: true; data: Record<string, any> } | { ok: false; error: string };

export function validateStructuredData(
  campaign: Campaign,
  raw: Record<string, any>,
): ValidationResult {
  if (!campaign.fields) return { ok: true, data: {} };
  const out: Record<string, any> = {};
  for (const f of campaign.fields) {
    const v = raw[f.name];
    const empty =
      v === undefined ||
      v === null ||
      v === "" ||
      (Array.isArray(v) && v.length === 0);

    if (empty) {
      if (f.required) {
        return { ok: false, error: `Pflichtfeld fehlt: ${f.label}` };
      }
      continue;
    }

    if (f.type === "text") {
      const s = String(v).trim();
      if (f.maxLength && s.length > f.maxLength) {
        return { ok: false, error: `${f.label}: zu lang (max. ${f.maxLength}).` };
      }
      out[f.name] = s;
    } else if (f.type === "textarea") {
      const s = String(v).trim();
      if (f.maxLength && s.length > f.maxLength) {
        return { ok: false, error: `${f.label}: zu lang (max. ${f.maxLength}).` };
      }
      out[f.name] = s;
    } else if (f.type === "number") {
      const n = Number(v);
      if (!Number.isFinite(n)) {
        return { ok: false, error: `${f.label}: bitte eine Zahl angeben.` };
      }
      if (f.min !== undefined && n < f.min) {
        return { ok: false, error: `${f.label}: mind. ${f.min}.` };
      }
      if (f.max !== undefined && n > f.max) {
        return { ok: false, error: `${f.label}: höchstens ${f.max}.` };
      }
      out[f.name] = n;
    } else if (f.type === "select") {
      const s = String(v);
      if (!f.options.find((o) => o.value === s)) {
        return { ok: false, error: `${f.label}: ungültige Auswahl.` };
      }
      out[f.name] = s;
    } else if (f.type === "multiselect") {
      const arr = Array.isArray(v) ? v.map(String) : [];
      for (const x of arr) {
        if (!f.options.find((o) => o.value === x)) {
          return { ok: false, error: `${f.label}: ungültige Auswahl (${x}).` };
        }
      }
      out[f.name] = arr;
    } else if (f.type === "image") {
      out[f.name] = String(v);
    }
  }
  return { ok: true, data: out };
}

export function findFieldLabel(campaign: Campaign, fieldName: string): string | null {
  if (!campaign.fields) return null;
  const f = campaign.fields.find((x) => x.name === fieldName);
  return f?.label || null;
}

export function findOptionLabel(
  campaign: Campaign,
  fieldName: string,
  value: string,
): string | null {
  if (!campaign.fields) return null;
  const f = campaign.fields.find((x) => x.name === fieldName);
  if (!f || (f.type !== "select" && f.type !== "multiselect")) return null;
  return f.options.find((o) => o.value === value)?.label || null;
}
