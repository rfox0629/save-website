/**
 * Design-preview fixtures.
 *
 * Static, deterministic, and deliberately isolated from Supabase so the
 * redesign can be reviewed without credentials, auth, or seeded rows. The
 * shapes mirror the real domain (six assessment categories, four SAVE tiers)
 * so wiring these screens to `lib/review.ts` and `lib/brief.ts` later is a
 * data-source swap rather than a rewrite.
 */

export type SaveTier =
  | "High Confidence Opportunity"
  | "Strong Opportunity"
  | "Proceed with Discernment"
  | "Not Recommended";

export const CATEGORY_LABELS = {
  doctrine: "Doctrine",
  external: "External Signals",
  financial: "Financial Integrity",
  fruit: "Fruit",
  governance: "Governance",
  leadership: "Leadership",
} as const;

export type CategoryKey = keyof typeof CATEGORY_LABELS;

export type CategoryScore = {
  confidence: "high" | "medium" | "low";
  key: CategoryKey;
  note: string;
  score: number;
};

export type Testimony = {
  attribution: string;
  date: string;
  id: string;
  quote: string;
  role: string;
};

export type MinistryUpdate = {
  body: string;
  date: string;
  id: string;
  kind: "milestone" | "field-report" | "financial" | "prayer-answered";
  title: string;
};

export type PrayerRequest = {
  body: string;
  date: string;
  id: string;
  praying: number;
  urgent?: boolean;
};

export type ImpactMetric = {
  label: string;
  period: string;
  value: string;
};

export type Ministry = {
  assessedOn: string;
  budget: number;
  category: string;
  categoryScores: CategoryScore[];
  ein: string;
  founded: number;
  id: string;
  impact: ImpactMetric[];
  leader: { bio: string; name: string; tenure: string; title: string };
  location: string;
  name: string;
  prayer: PrayerRequest[];
  reassessmentDue: string;
  region: "North America" | "Africa" | "Asia" | "Latin America" | "Europe";
  score: number;
  slug: string;
  staff: number;
  story: string;
  summary: string;
  tagline: string;
  testimonies: Testimony[];
  tier: SaveTier;
  updates: MinistryUpdate[];
};

/* -------------------------------------------------------------- Ministries */

export const MINISTRIES: Ministry[] = [
  {
    assessedOn: "2026-03-14",
    budget: 2_480_000,
    category: "Church Planting",
    categoryScores: [
      {
        confidence: "high",
        key: "doctrine",
        note: "Public statement of faith; elder-affirmed annually.",
        score: 96,
      },
      {
        confidence: "high",
        key: "governance",
        note: "Seven-member board, five fully independent.",
        score: 92,
      },
      {
        confidence: "high",
        key: "financial",
        note: "Audited four consecutive years. ECFA member since 2019.",
        score: 94,
      },
      {
        confidence: "high",
        key: "leadership",
        note: "Founder submits to an external accountability team.",
        score: 91,
      },
      {
        confidence: "medium",
        key: "fruit",
        note: "Strong plant survival; discipleship depth still self-reported.",
        score: 84,
      },
      {
        confidence: "high",
        key: "external",
        note: "No adverse findings across eight external sources.",
        score: 95,
      },
    ],
    ein: "84-2210398",
    founded: 2009,
    id: "min-ncf",
    impact: [
      { label: "Churches planted", period: "Since 2009", value: "38" },
      {
        label: "Still active after 5 years",
        period: "Of plants reaching year 5",
        value: "91%",
      },
      { label: "Leaders trained", period: "2026", value: "214" },
      { label: "Cost per plant", period: "Trailing 3 years", value: "$63,400" },
    ],
    leader: {
      bio: "Planted his first congregation in 2009 and has since handed off every church he started. Meets monthly with an accountability team he does not appoint.",
      name: "Daniel Okafor",
      tenure: "Founder, 17 years",
      title: "Executive Director",
    },
    location: "Kansas City, Missouri",
    name: "New City Fellowship Network",
    prayer: [
      {
        body: "Two families preparing to move to Wichita in September. Pray for housing and for their children settling into new schools.",
        date: "2026-07-22",
        id: "p1",
        praying: 47,
      },
      {
        body: "Our Springfield plant is meeting in a school that has just been sold. We need a new gathering space by October.",
        date: "2026-07-08",
        id: "p2",
        praying: 112,
        urgent: true,
      },
    ],
    reassessmentDue: "2028-03-14",
    region: "North America",
    score: 92,
    slug: "new-city-fellowship",
    staff: 24,
    story:
      "New City Fellowship Network plants churches in mid-size American cities that sit outside the attention of national church-planting organizations. Every plant is handed to local leadership within four years, and the network measures itself on whether those churches are still healthy a decade later.",
    summary:
      "A church-planting network with unusually disciplined succession practice and four consecutive clean audits.",
    tagline: "Planting churches that outlive their planters.",
    testimonies: [
      {
        attribution: "Pastor Ruth Alvarez",
        date: "2026-05-02",
        id: "t1",
        quote:
          "They handed us the keys and then stayed close enough to help but far enough away to let us lead. I have never seen a network do that well.",
        role: "Lead Pastor, Cornerstone Wichita",
      },
      {
        attribution: "Marcus Bell",
        date: "2026-02-19",
        id: "t2",
        quote:
          "I came in as an intern with no theological training. Four years later I am shepherding a congregation of two hundred. They did not rush me.",
        role: "Church planter, Class of 2022",
      },
    ],
    tier: "High Confidence Opportunity",
    updates: [
      {
        body: "The Springfield congregation formally called its first local elder board this month, completing our handoff four months ahead of plan.",
        date: "2026-07-18",
        id: "u1",
        kind: "milestone",
        title: "Springfield plant reaches self-governance",
      },
      {
        body: "Our FY2026 audit closed with no management letter comments for the fourth consecutive year.",
        date: "2026-06-30",
        id: "u2",
        kind: "financial",
        title: "Fourth consecutive clean audit",
      },
      {
        body: "Twenty-two residents began the two-year planting residency in June, our largest cohort and the first with a majority from within existing plants.",
        date: "2026-06-11",
        id: "u3",
        kind: "field-report",
        title: "Summer residency cohort begins",
      },
    ],
  },
  {
    assessedOn: "2026-01-27",
    budget: 1_150_000,
    category: "Relief & Development",
    categoryScores: [
      {
        confidence: "high",
        key: "doctrine",
        note: "Clear gospel articulation alongside relief work.",
        score: 89,
      },
      {
        confidence: "medium",
        key: "governance",
        note: "Board of five; two members share a family relationship.",
        score: 74,
      },
      {
        confidence: "high",
        key: "financial",
        note: "Reviewed financials; audit beginning FY2027.",
        score: 81,
      },
      {
        confidence: "high",
        key: "leadership",
        note: "Co-directors with clearly separated authority.",
        score: 88,
      },
      {
        confidence: "high",
        key: "fruit",
        note: "Third-party verified water-point functionality at 94%.",
        score: 93,
      },
      {
        confidence: "medium",
        key: "external",
        note: "Limited public footprint outside partner networks.",
        score: 79,
      },
    ],
    ein: "47-5590214",
    founded: 2014,
    id: "min-lw",
    impact: [
      { label: "Water points serving", period: "Currently", value: "162" },
      {
        label: "Still functional at 5 years",
        period: "Independently audited",
        value: "94%",
      },
      { label: "People with daily access", period: "2026", value: "48,300" },
      { label: "Cost per person served", period: "Lifetime", value: "$19.40" },
    ],
    leader: {
      bio: "A hydrologist before she was a missionary. Insisted on independent functionality audits three years before any donor asked for them.",
      name: "Grace Mwangi",
      tenure: "Co-Director, 12 years",
      title: "Co-Director",
    },
    location: "Kitale, Kenya",
    prayer: [
      {
        body: "Drilling team is working through the dry season in Turkana. Pray for safety on the roads and for water at the three sites we have surveyed.",
        date: "2026-07-25",
        id: "p1",
        praying: 89,
      },
    ],
    name: "Living Water East Africa",
    reassessmentDue: "2028-01-27",
    region: "Africa",
    score: 84,
    slug: "living-water-east-africa",
    staff: 41,
    story:
      "Living Water East Africa drills and maintains community water points across Kenya and northern Tanzania. Unusually, the organisation funds a maintenance endowment for every well it drills and publishes independently audited functionality rates rather than installation counts.",
    summary:
      "Publishes independently audited well-functionality rates instead of installation counts. Board independence is the open question.",
    tagline: "We count the wells that still work.",
    testimonies: [
      {
        attribution: "Chief Lokwang",
        date: "2026-04-08",
        id: "t1",
        quote:
          "Three organisations drilled here before. Only this one came back the next year to see if the water was still running.",
        role: "Community elder, Turkana",
      },
    ],
    tier: "Strong Opportunity",
    updates: [
      {
        body: "Our independent auditor confirmed 94% of water points drilled since 2014 are still delivering water daily.",
        date: "2026-07-14",
        id: "u1",
        kind: "milestone",
        title: "2026 functionality audit: 94%",
      },
      {
        body: "The maintenance endowment crossed $400,000, enough to service every existing water point for eleven years.",
        date: "2026-05-20",
        id: "u2",
        kind: "financial",
        title: "Maintenance endowment milestone",
      },
    ],
  },
  {
    assessedOn: "2026-05-09",
    budget: 640_000,
    category: "Theological Education",
    categoryScores: [
      {
        confidence: "high",
        key: "doctrine",
        note: "Confessional; curriculum publicly available.",
        score: 97,
      },
      {
        confidence: "high",
        key: "governance",
        note: "Nine-member board, all independent.",
        score: 95,
      },
      {
        confidence: "medium",
        key: "financial",
        note: "Strong reserves; heavy reliance on three donors.",
        score: 78,
      },
      {
        confidence: "high",
        key: "leadership",
        note: "Planned succession completed in 2025 without disruption.",
        score: 94,
      },
      {
        confidence: "medium",
        key: "fruit",
        note: "Graduate placement tracked; long-term retention not yet.",
        score: 82,
      },
      {
        confidence: "high",
        key: "external",
        note: "Accredited; no adverse findings.",
        score: 92,
      },
    ],
    ein: "26-3341882",
    founded: 2001,
    id: "min-hb",
    impact: [
      { label: "Pastors trained", period: "Since 2001", value: "1,840" },
      {
        label: "Serving in home regions",
        period: "Of graduates",
        value: "88%",
      },
      { label: "Languages of instruction", period: "Currently", value: "6" },
      { label: "Cost per graduate", period: "2026", value: "$2,110" },
    ],
    leader: {
      bio: "Took over from the founder in 2025 after a five-year documented succession plan. Teaches two courses a year to stay close to students.",
      name: "Elena Varga",
      tenure: "President since 2025",
      title: "President",
    },
    location: "Budapest, Hungary",
    name: "Harvest Bible Institute",
    prayer: [
      {
        body: "Twelve students from Ukraine are studying with us on emergency scholarships. Pray for their families back home.",
        date: "2026-07-19",
        id: "p1",
        praying: 203,
        urgent: true,
      },
    ],
    reassessmentDue: "2028-05-09",
    region: "Europe",
    score: 89,
    slug: "harvest-bible-institute",
    staff: 18,
    story:
      "Harvest Bible Institute trains pastors for Central and Eastern European churches in six languages, at roughly a tenth of the cost of Western seminary education. Graduates commit to serving in their home region for at least five years.",
    summary:
      "Exceptional governance and a clean leadership succession. Donor concentration is the risk worth discussing.",
    tagline: "Training pastors where the church is growing fastest.",
    testimonies: [
      {
        attribution: "Pastor Tomáš Novák",
        date: "2026-03-30",
        id: "t1",
        quote:
          "I could not have left my village for four years to study. They brought the classroom to me and my church never went without a pastor.",
        role: "Graduate, 2019",
      },
    ],
    tier: "High Confidence Opportunity",
    updates: [
      {
        body: "Our Romanian-language track graduated its first full cohort of nineteen students in June.",
        date: "2026-06-28",
        id: "u1",
        kind: "milestone",
        title: "First Romanian-language cohort graduates",
      },
    ],
  },
  {
    assessedOn: "2026-02-11",
    budget: 3_900_000,
    category: "Urban Ministry",
    categoryScores: [
      {
        confidence: "high",
        key: "doctrine",
        note: "Statement of faith public and specific.",
        score: 90,
      },
      {
        confidence: "medium",
        key: "governance",
        note: "Board expanded in 2025; independence improving.",
        score: 76,
      },
      {
        confidence: "medium",
        key: "financial",
        note: "Audited; program-to-overhead ratio trending the wrong way.",
        score: 72,
      },
      {
        confidence: "medium",
        key: "leadership",
        note: "Founder-led; succession plan drafted but not adopted.",
        score: 71,
      },
      {
        confidence: "high",
        key: "fruit",
        note: "Longitudinal outcomes tracked since 2016.",
        score: 88,
      },
      {
        confidence: "high",
        key: "external",
        note: "Well documented; strong local reputation.",
        score: 87,
      },
    ],
    ein: "31-4472901",
    founded: 2011,
    id: "min-cs",
    impact: [
      { label: "Students in program", period: "2026", value: "740" },
      {
        label: "High school graduation rate",
        period: "Program cohort",
        value: "96%",
      },
      {
        label: "Enrolled in college or trade",
        period: "Class of 2026",
        value: "81%",
      },
      { label: "Cost per student per year", period: "2026", value: "$5,270" },
    ],
    leader: {
      bio: "Grew up eight blocks from the first centre. Has said publicly that he intends to hand the organisation to someone from the neighbourhood.",
      name: "Andre Whitfield",
      tenure: "Founder, 15 years",
      title: "Executive Director",
    },
    location: "Baltimore, Maryland",
    name: "Cornerstone Youth Collective",
    prayer: [
      {
        body: "Two of our seniors lost a parent this spring. Pray for the staff walking with them through graduation.",
        date: "2026-07-12",
        id: "p1",
        praying: 64,
      },
    ],
    reassessmentDue: "2027-02-11",
    region: "North America",
    score: 79,
    slug: "cornerstone-youth-collective",
    staff: 58,
    story:
      "Cornerstone Youth Collective runs after-school and mentoring programs across four Baltimore neighbourhoods, following students from sixth grade through their first year after high school. It is one of very few youth ministries publishing longitudinal outcomes.",
    summary:
      "Outstanding measured outcomes. Founder succession and overhead trend are live conversations, not disqualifiers.",
    tagline: "We stay until they graduate. Then we stay another year.",
    testimonies: [
      {
        attribution: "Jasmine Carter",
        date: "2026-06-05",
        id: "t1",
        quote:
          "My mentor drove me to every college visit. She is still texting me about my midterms and I am a sophomore now.",
        role: "Class of 2024",
      },
    ],
    tier: "Proceed with Discernment",
    updates: [
      {
        body: "Ninety-six percent of our class of 2026 graduated on time, our sixth consecutive year above ninety percent.",
        date: "2026-06-15",
        id: "u1",
        kind: "milestone",
        title: "Class of 2026 graduates",
      },
    ],
  },
  {
    assessedOn: "2026-04-22",
    budget: 890_000,
    category: "Bible Translation",
    categoryScores: [
      {
        confidence: "high",
        key: "doctrine",
        note: "Translation philosophy documented and reviewed.",
        score: 94,
      },
      {
        confidence: "high",
        key: "governance",
        note: "Board of seven, six independent.",
        score: 90,
      },
      {
        confidence: "high",
        key: "financial",
        note: "Audited annually since 2018.",
        score: 91,
      },
      {
        confidence: "high",
        key: "leadership",
        note: "Distributed leadership across four field teams.",
        score: 87,
      },
      {
        confidence: "medium",
        key: "fruit",
        note: "Scripture engagement measured in three of nine languages.",
        score: 80,
      },
      {
        confidence: "high",
        key: "external",
        note: "Partnered with two accredited translation bodies.",
        score: 90,
      },
    ],
    ein: "82-1109745",
    founded: 2007,
    id: "min-ft",
    impact: [
      { label: "Languages in progress", period: "Currently", value: "9" },
      { label: "New Testaments completed", period: "Since 2007", value: "4" },
      { label: "Mother-tongue translators", period: "On staff", value: "31" },
      {
        label: "Avg. years per New Testament",
        period: "Trailing",
        value: "8.5",
      },
    ],
    leader: {
      bio: "Believes translation belongs to native speakers. Every one of the organisation's nine active projects is led by a mother-tongue translator.",
      name: "Samuel Tesfaye",
      tenure: "Director, 9 years",
      title: "Director",
    },
    location: "Chiang Mai, Thailand",
    name: "First Tongue Translation",
    prayer: [
      {
        body: "The Akha team has reached the Gospels. Pray for the elders reviewing the draft for clarity.",
        date: "2026-07-20",
        id: "p1",
        praying: 38,
      },
    ],
    reassessmentDue: "2028-04-22",
    region: "Asia",
    score: 88,
    slug: "first-tongue-translation",
    staff: 46,
    story:
      "First Tongue Translation supports mother-tongue translators bringing Scripture into minority languages across Southeast Asia. Every project is led by a native speaker of the target language, with expatriate staff serving strictly in a consulting role.",
    summary:
      "Every project led by a native speaker. Scripture-engagement measurement is the growth area.",
    tagline: "Scripture in the language people dream in.",
    testimonies: [
      {
        attribution: "Naw Paw",
        date: "2026-01-15",
        id: "t1",
        quote:
          "For the first time my mother heard the words of Jesus in the language she prays in. She wept through the whole reading.",
        role: "Translator, Karen project",
      },
    ],
    tier: "Strong Opportunity",
    updates: [
      {
        body: "The Karen New Testament went to press in April after eleven years of work.",
        date: "2026-04-30",
        id: "u1",
        kind: "milestone",
        title: "Karen New Testament completed",
      },
    ],
  },
  {
    assessedOn: "2026-06-03",
    budget: 1_720_000,
    category: "Church Planting",
    categoryScores: [
      {
        confidence: "high",
        key: "doctrine",
        note: "Confessional and publicly documented.",
        score: 93,
      },
      {
        confidence: "high",
        key: "governance",
        note: "Board of eight, all independent.",
        score: 91,
      },
      {
        confidence: "high",
        key: "financial",
        note: "Audited; twelve months operating reserve.",
        score: 92,
      },
      {
        confidence: "high",
        key: "leadership",
        note: "Two-person executive team, board-set compensation.",
        score: 89,
      },
      {
        confidence: "medium",
        key: "fruit",
        note: "Young organisation; outcomes promising but early.",
        score: 77,
      },
      {
        confidence: "high",
        key: "external",
        note: "Clean across all checked sources.",
        score: 93,
      },
    ],
    ein: "88-2234109",
    founded: 2018,
    id: "min-rh",
    impact: [
      { label: "Congregations started", period: "Since 2018", value: "16" },
      { label: "Meeting weekly", period: "Currently", value: "16" },
      { label: "Believers baptised", period: "2026", value: "412" },
      {
        label: "Median congregation age",
        period: "Currently",
        value: "3.1 yrs",
      },
    ],
    leader: {
      bio: "Left a large denominational role to start a network that would plant in towns under fifty thousand people.",
      name: "Priscila Ramos",
      tenure: "Founding Director, 8 years",
      title: "Executive Director",
    },
    location: "Belo Horizonte, Brazil",
    name: "Rio Hope Church Network",
    prayer: [
      {
        body: "Our newest congregation in Ouro Preto is meeting in a family's garage. Pray for a permanent space.",
        date: "2026-07-28",
        id: "p1",
        praying: 51,
      },
    ],
    reassessmentDue: "2028-06-03",
    region: "Latin America",
    score: 87,
    slug: "rio-hope-church-network",
    staff: 29,
    story:
      "Rio Hope plants congregations in Brazilian towns too small to attract denominational attention. Its churches are financially self-supporting within three years by design, and the network refuses to plant in a town where a healthy church already exists.",
    summary:
      "Disciplined self-support model and clean governance. Young enough that fruit is still being proven.",
    tagline: "Churches for the towns nobody plants in.",
    testimonies: [
      {
        attribution: "Joaquim Ferreira",
        date: "2026-05-22",
        id: "t1",
        quote:
          "We were the only believers in our town. Now there are sixty of us and we support our own pastor.",
        role: "Elder, Ouro Branco",
      },
    ],
    tier: "Strong Opportunity",
    updates: [
      {
        body: "Our 2021 cohort of five congregations all reached full financial self-support this year.",
        date: "2026-07-01",
        id: "u1",
        kind: "milestone",
        title: "2021 cohort fully self-supporting",
      },
    ],
  },
];

export function getMinistry(slug: string) {
  return MINISTRIES.find((ministry) => ministry.slug === slug) ?? MINISTRIES[0];
}

export const TIER_TONE: Record<
  SaveTier,
  "sage" | "ink" | "brass" | "clay" | "risk"
> = {
  "High Confidence Opportunity": "sage",
  "Strong Opportunity": "ink",
  "Proceed with Discernment": "clay",
  "Not Recommended": "risk",
};

/* ------------------------------------------------------------------ Donor */

export const DONOR = {
  advisor: { email: "hbradley@savefoundation.org", name: "Hannah Bradley" },
  followingSlugs: [
    "new-city-fellowship",
    "living-water-east-africa",
    "harvest-bible-institute",
    "first-tongue-translation",
  ],
  givenThisYear: 285_000,
  givenLifetime: 1_642_500,
  name: "Margaret Ellison",
  savedSlugs: ["rio-hope-church-network", "cornerstone-youth-collective"],
  since: 2017,
};

export type Gift = {
  amount: number;
  date: string;
  designation: string;
  id: string;
  method: "Wire" | "DAF" | "Stock" | "Check";
  ministrySlug: string;
  receipted: boolean;
};

export const GIFTS: Gift[] = [
  {
    amount: 75_000,
    date: "2026-06-15",
    designation: "Church planting residency",
    id: "g1",
    method: "DAF",
    ministrySlug: "new-city-fellowship",
    receipted: true,
  },
  {
    amount: 50_000,
    date: "2026-05-02",
    designation: "Maintenance endowment",
    id: "g2",
    method: "Wire",
    ministrySlug: "living-water-east-africa",
    receipted: true,
  },
  {
    amount: 40_000,
    date: "2026-04-18",
    designation: "Ukrainian student scholarships",
    id: "g3",
    method: "Stock",
    ministrySlug: "harvest-bible-institute",
    receipted: true,
  },
  {
    amount: 60_000,
    date: "2026-03-01",
    designation: "Unrestricted",
    id: "g4",
    method: "DAF",
    ministrySlug: "new-city-fellowship",
    receipted: true,
  },
  {
    amount: 35_000,
    date: "2026-02-14",
    designation: "Akha translation project",
    id: "g5",
    method: "Wire",
    ministrySlug: "first-tongue-translation",
    receipted: true,
  },
  {
    amount: 25_000,
    date: "2026-01-09",
    designation: "Unrestricted",
    id: "g6",
    method: "Check",
    ministrySlug: "harvest-bible-institute",
    receipted: true,
  },
];

export const STATEMENTS = [
  { gifts: 6, id: "s1", total: 285_000, year: 2026 },
  { gifts: 9, id: "s2", total: 340_000, year: 2025 },
  { gifts: 7, id: "s3", total: 295_000, year: 2024 },
  { gifts: 5, id: "s4", total: 210_000, year: 2023 },
];

export const PLEDGES = [
  {
    amount: 150_000,
    committed: 75_000,
    ministrySlug: "new-city-fellowship",
    through: "2027-12-31",
  },
  {
    amount: 100_000,
    committed: 50_000,
    ministrySlug: "living-water-east-africa",
    through: "2027-06-30",
  },
];

/* --------------------------------------------------------- Ministry portal */

export const MINISTRY_ACCOUNT = {
  applicationId: "APP-2026-0148",
  assessmentDue: "2026-09-12",
  ministry: "Rio Hope Church Network",
  reviewer: "Hannah Bradley",
  stage: "Assessment in progress",
  user: "Priscila Ramos",
};

export type AssessmentSection = {
  answered: number;
  key: CategoryKey;
  status: "complete" | "in-progress" | "not-started" | "returned";
  total: number;
};

export const ASSESSMENT_SECTIONS: AssessmentSection[] = [
  { answered: 14, key: "doctrine", status: "complete", total: 14 },
  { answered: 22, key: "governance", status: "complete", total: 22 },
  { answered: 12, key: "financial", status: "in-progress", total: 19 },
  { answered: 4, key: "leadership", status: "returned", total: 16 },
  { answered: 0, key: "fruit", status: "not-started", total: 21 },
  { answered: 0, key: "external", status: "not-started", total: 8 },
];

export type EvidenceItem = {
  category: CategoryKey;
  id: string;
  name: string;
  note?: string;
  required: boolean;
  size?: string;
  status: "accepted" | "in-review" | "needs-attention" | "missing";
  uploaded?: string;
};

export const EVIDENCE: EvidenceItem[] = [
  {
    category: "financial",
    id: "e1",
    name: "FY2025 audited financial statements",
    required: true,
    size: "2.4 MB",
    status: "accepted",
    uploaded: "2026-07-02",
  },
  {
    category: "financial",
    id: "e2",
    name: "FY2026 board-approved budget",
    required: true,
    size: "480 KB",
    status: "accepted",
    uploaded: "2026-07-02",
  },
  {
    category: "financial",
    id: "e3",
    name: "IRS Form 990, most recent",
    note: "The uploaded copy is FY2024. We need FY2025 to match your audit.",
    required: true,
    size: "1.1 MB",
    status: "needs-attention",
    uploaded: "2026-07-05",
  },
  {
    category: "governance",
    id: "e4",
    name: "Board roster with independence declarations",
    required: true,
    size: "220 KB",
    status: "accepted",
    uploaded: "2026-06-28",
  },
  {
    category: "governance",
    id: "e5",
    name: "Conflict of interest policy",
    required: true,
    size: "180 KB",
    status: "in-review",
    uploaded: "2026-07-19",
  },
  {
    category: "governance",
    id: "e6",
    name: "Minutes from last three board meetings",
    required: true,
    status: "missing",
  },
  {
    category: "doctrine",
    id: "e7",
    name: "Statement of faith",
    required: true,
    size: "94 KB",
    status: "accepted",
    uploaded: "2026-06-20",
  },
  {
    category: "leadership",
    id: "e8",
    name: "Executive compensation approval record",
    note: "Please include the board minute that approved the current figure.",
    required: true,
    status: "missing",
  },
  {
    category: "fruit",
    id: "e9",
    name: "Outcome measurement methodology",
    required: false,
    status: "missing",
  },
];

export type Finding = {
  category: CategoryKey;
  detail: string;
  id: string;
  severity: "strength" | "observation" | "gap" | "risk";
  title: string;
};

export const FINDINGS: Finding[] = [
  {
    category: "governance",
    detail:
      "All eight board members are independent of staff and of one another. This is well above what we typically see at your budget size.",
    id: "f1",
    severity: "strength",
    title: "Fully independent board",
  },
  {
    category: "financial",
    detail:
      "Twelve months of operating expense held in reserve, with a board policy governing its use.",
    id: "f2",
    severity: "strength",
    title: "Twelve-month operating reserve",
  },
  {
    category: "fruit",
    detail:
      "Congregation counts are tracked well, but there is no consistent measure of discipleship depth across plants. We would like to see a shared instrument.",
    id: "f3",
    severity: "gap",
    title: "No common discipleship measure",
  },
  {
    category: "leadership",
    detail:
      "Executive compensation is set by the board, but the supporting minute was not included in your evidence.",
    id: "f4",
    severity: "observation",
    title: "Compensation record incomplete",
  },
  {
    category: "leadership",
    detail:
      "The founding director holds both the executive role and the chair of the planting committee. Consider separating these before the next assessment.",
    id: "f5",
    severity: "risk",
    title: "Concentrated decision authority",
  },
];

export type RoadmapItem = {
  detail: string;
  due: string;
  effort: "low" | "medium" | "high";
  id: string;
  owner: string;
  status: "not-started" | "in-progress" | "submitted" | "verified";
  title: string;
};

export const ROADMAP: RoadmapItem[] = [
  {
    detail:
      "Provide the board minute approving current executive compensation.",
    due: "2026-08-15",
    effort: "low",
    id: "r1",
    owner: "Priscila Ramos",
    status: "in-progress",
    title: "Supply compensation approval record",
  },
  {
    detail:
      "Adopt a shared discipleship measurement instrument across all sixteen congregations.",
    due: "2026-11-30",
    effort: "high",
    id: "r2",
    owner: "Marcos Silva",
    status: "not-started",
    title: "Adopt a common discipleship measure",
  },
  {
    detail:
      "Move the planting committee chair to a board member who is not the executive director.",
    due: "2026-10-01",
    effort: "medium",
    id: "r3",
    owner: "Board",
    status: "not-started",
    title: "Separate executive and committee chair roles",
  },
  {
    detail:
      "Publish the statement of faith and governance policies on the public site.",
    due: "2026-07-31",
    effort: "low",
    id: "r4",
    owner: "Ana Costa",
    status: "verified",
    title: "Publish governance documents",
  },
  {
    detail:
      "Document the three-year self-support pathway used with new congregations.",
    due: "2026-09-15",
    effort: "medium",
    id: "r5",
    owner: "Priscila Ramos",
    status: "submitted",
    title: "Document self-support pathway",
  },
];

export const DONOR_UPDATE_DRAFTS = [
  {
    audience: "All followers",
    id: "d1",
    reach: 214,
    sent: "2026-07-01",
    status: "published",
    title: "2021 cohort fully self-supporting",
  },
  {
    audience: "All followers",
    id: "d2",
    reach: 208,
    sent: "2026-05-14",
    status: "published",
    title: "Ouro Preto congregation launches",
  },
  {
    audience: "Major partners",
    id: "d3",
    reach: 0,
    sent: null,
    status: "draft",
    title: "Mid-year financial position",
  },
];

/* ------------------------------------------------------------ Staff portal */

export type QueueApplication = {
  daysInStage: number;
  flags: number;
  id: string;
  ministry: string;
  reviewer: string | null;
  score: number | null;
  slaBreached?: boolean;
  stage:
    | "Inquiry"
    | "Assessment"
    | "Evidence review"
    | "Scoring"
    | "Decision"
    | "Publishing";
  submitted: string;
};

export const QUEUE: QueueApplication[] = [
  {
    daysInStage: 2,
    flags: 0,
    id: "APP-2026-0148",
    ministry: "Rio Hope Church Network",
    reviewer: "Hannah Bradley",
    score: 87,
    stage: "Evidence review",
    submitted: "2026-07-29",
  },
  {
    daysInStage: 11,
    flags: 2,
    id: "APP-2026-0147",
    ministry: "Mercy House Detroit",
    reviewer: "Hannah Bradley",
    score: 68,
    slaBreached: true,
    stage: "Scoring",
    submitted: "2026-07-20",
  },
  {
    daysInStage: 1,
    flags: 0,
    id: "APP-2026-0151",
    ministry: "Anchor Deaf Ministries",
    reviewer: null,
    score: null,
    stage: "Inquiry",
    submitted: "2026-07-30",
  },
  {
    daysInStage: 4,
    flags: 1,
    id: "APP-2026-0144",
    ministry: "Sierra Leone Medical Mission",
    reviewer: "Tom Reyes",
    score: 81,
    stage: "Decision",
    submitted: "2026-07-14",
  },
  {
    daysInStage: 6,
    flags: 0,
    id: "APP-2026-0142",
    ministry: "Bright Path Foster Care",
    reviewer: "Tom Reyes",
    score: 90,
    stage: "Publishing",
    submitted: "2026-07-08",
  },
  {
    daysInStage: 3,
    flags: 0,
    id: "APP-2026-0150",
    ministry: "Grace Prison Fellowship",
    reviewer: null,
    score: null,
    stage: "Inquiry",
    submitted: "2026-07-28",
  },
  {
    daysInStage: 9,
    flags: 3,
    id: "APP-2026-0139",
    ministry: "Harvest Gate International",
    reviewer: "Dana Kim",
    score: 54,
    slaBreached: true,
    stage: "Scoring",
    submitted: "2026-07-02",
  },
  {
    daysInStage: 5,
    flags: 0,
    id: "APP-2026-0146",
    ministry: "Riverbend Camp Ministries",
    reviewer: "Dana Kim",
    score: 84,
    stage: "Assessment",
    submitted: "2026-07-18",
  },
];

export const REVIEWERS = [
  {
    active: 4,
    capacity: 6,
    id: "rv1",
    name: "Hannah Bradley",
    specialty: "Church planting, governance",
  },
  {
    active: 3,
    capacity: 5,
    id: "rv2",
    name: "Tom Reyes",
    specialty: "Relief, international finance",
  },
  {
    active: 5,
    capacity: 5,
    id: "rv3",
    name: "Dana Kim",
    specialty: "Education, youth",
  },
  {
    active: 1,
    capacity: 4,
    id: "rv4",
    name: "Michael Osei",
    specialty: "Translation, theology",
  },
];

export type AuditEntry = {
  actor: string;
  detail?: string;
  id: string;
  action: string;
  timestamp: string;
};

export const AUDIT_LOG: AuditEntry[] = [
  {
    action: "Evidence accepted",
    actor: "Hannah Bradley",
    detail: "FY2025 audited financial statements",
    id: "a1",
    timestamp: "2026-07-30 14:22",
  },
  {
    action: "Document returned to ministry",
    actor: "Hannah Bradley",
    detail: "IRS Form 990 — wrong fiscal year supplied",
    id: "a2",
    timestamp: "2026-07-30 14:18",
  },
  {
    action: "External checks run",
    actor: "System",
    detail: "8 sources, 0 adverse findings",
    id: "a3",
    timestamp: "2026-07-29 09:04",
  },
  {
    action: "Reviewer assigned",
    actor: "Dana Kim",
    detail: "Assigned to Hannah Bradley",
    id: "a4",
    timestamp: "2026-07-29 08:51",
  },
  {
    action: "Assessment submitted",
    actor: "Priscila Ramos",
    detail: "All six categories",
    id: "a5",
    timestamp: "2026-07-29 07:33",
  },
  {
    action: "Score override",
    actor: "Tom Reyes",
    detail: "Fruit 74 → 77, reviewer note attached",
    id: "a6",
    timestamp: "2026-07-28 16:40",
  },
];

export const STAFF_METRICS = {
  approvalRate: 62,
  awaitingAssignment: 2,
  medianDaysToDecision: 34,
  publishedThisQuarter: 11,
  slaBreaches: 2,
  inQueue: QUEUE.length,
};

export const LEADER_HEALTH = [
  {
    flag: null,
    lastCheckIn: "2026-06-30",
    leader: "Daniel Okafor",
    ministry: "New City Fellowship Network",
    status: "healthy",
  },
  {
    flag: "Accountability team has not met in 5 months",
    lastCheckIn: "2026-02-18",
    leader: "Andre Whitfield",
    ministry: "Cornerstone Youth Collective",
    status: "watch",
  },
  {
    flag: null,
    lastCheckIn: "2026-07-11",
    leader: "Grace Mwangi",
    ministry: "Living Water East Africa",
    status: "healthy",
  },
  {
    flag: "Succession plan drafted, not adopted",
    lastCheckIn: "2026-05-22",
    leader: "Priscila Ramos",
    ministry: "Rio Hope Church Network",
    status: "watch",
  },
];
