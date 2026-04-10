delete from public.organizations
where ein = '47-3819426'
   or legal_name = 'New City Fellowship';

insert into public.organizations (
  id,
  legal_name,
  dba_name,
  ein,
  year_founded,
  state_of_incorporation,
  entity_type,
  primary_focus,
  geographic_scope,
  countries,
  website_url,
  status,
  notes
) values (
  '11111111-1111-4111-8111-111111111111',
  'New City Fellowship',
  'New City Fellowship',
  '47-3819426',
  2014,
  'Texas',
  '501(c)(3) nonprofit',
  array['Church Planting', 'Discipleship', 'Leadership Development'],
  array['Regional', 'Urban'],
  array['United States'],
  'https://www.newcityfellowship.org',
  'under_review',
  'Sample organization seeded for end-to-end SAVE workflow demos.'
);

insert into public.applications (
  id,
  organization_id,
  cycle_year,
  status,
  immersive_discernment_status,
  immersive_discernment_notes,
  ai_summary,
  ai_summary_generated_at
) values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  2026,
  'under_review',
  'completed',
  'A SAVE field visit confirmed a healthy volunteer culture, thoughtful elder engagement, and consistent ministry presence across two neighborhood campuses.',
  '{
    "executive_summary": "New City Fellowship presents as a credible, missionally focused ministry with strong local fruit, healthy doctrinal clarity, and meaningful governance discipline. The overall profile is positive, with a few follow-up areas around long-term succession planning and reserve growth rather than acute integrity concerns.",
    "top_strengths": [
      "Clear gospel-centered ministry model with strong neighborhood credibility",
      "Healthy elder oversight and documented board involvement in budgeting and compensation",
      "Consistent evidence of discipleship, church planting, and leadership development fruit"
    ],
    "top_risks": [
      "Financial resilience would improve with deeper operating reserves",
      "Future succession planning for key senior leadership should be more formally documented"
    ],
    "leadership_integrity": {
      "assessment": "Leadership appears stable, accountable, and pastorally respected. No misconduct signals surfaced in submitted materials or external review, and accountability structures appear to function in practice.",
      "confidence": "high"
    },
    "doctrine": {
      "assessment": "Doctrinal alignment is clear, orthodox, and consistently reflected across public teaching, written statements, and internal vetting responses.",
      "confidence": "high"
    },
    "governance": {
      "assessment": "Governance appears healthy, with engaged elders, regular board cadence, and evidence that difficult decisions are handled within accountable structures.",
      "confidence": "medium"
    },
    "financial_stewardship": {
      "assessment": "Financial practices appear responsible, with strong program allocation and board oversight, though reserve depth remains an area to strengthen over time.",
      "confidence": "medium"
    },
    "fruit": {
      "assessment": "The ministry demonstrates tangible fruit through neighborhood discipleship, church planting, volunteer mobilization, and testimony-backed pastoral care outcomes.",
      "confidence": "high"
    },
    "follow_up_questions": [
      "What formal succession planning steps are in place for senior pastoral leadership over the next three to five years?",
      "How does the board plan to grow operating reserves while sustaining current church planting commitments?"
    ],
    "recommendation": "advance"
  }',
  timezone('utc', now())
);

insert into public.inquiry_responses (
  application_id,
  lead_name,
  years_in_role,
  theological_education,
  ordination_status,
  board_size,
  board_compensated,
  denomination,
  doctrinal_statement_url,
  scripture_position,
  gospel_clarity,
  baptism_position,
  annual_revenue_range,
  funding_sources,
  files_990,
  audit_level,
  board_approved_budget,
  annual_reach,
  key_metric,
  has_references,
  legal_action,
  moral_failure,
  financial_investigation,
  funding_rationale,
  referral_source,
  raw_data
) values (
  '22222222-2222-4222-8222-222222222222',
  'Marcus Hale',
  9,
  'MDiv, Covenant Theological Seminary',
  'Ordained Presbyterian minister',
  9,
  false,
  'Acts 29 / Presbyterian partnership network',
  'https://www.newcityfellowship.org/beliefs',
  'Historic evangelical view of Scripture as fully authoritative and sufficient',
  'The church clearly articulates salvation by grace alone through faith alone in Christ alone.',
  'Believer''s baptism practiced within an elder-led congregational model',
  '$1M-$2.5M',
  array['Individual donors', 'Church partnerships', 'Foundation grants'],
  true,
  'Independent financial review annually',
  true,
  1850,
  'Adult discipleship participation and neighborhood ministry retention',
  true,
  false,
  false,
  false,
  'Leadership has intentionally kept donor concentration low to maintain stability across church planting and mercy ministry initiatives.',
  'SAVE reviewer referral',
  jsonb_build_object(
    'campuses', 2,
    'staff_size', 14,
    'volunteer_base', 180
  )
);

insert into public.vetting_responses (
  application_id,
  leader_conversion_narrative,
  leader_marital_status,
  leader_accountability,
  decision_making_model,
  compensation_set_by_board,
  leadership_conflict_notes,
  board_confrontation_willingness,
  doctrinal_distinctives,
  doctrinal_non_negotiables,
  statement_of_faith_alignment,
  sacramental_practice,
  governance_model,
  independent_board_count,
  board_meeting_frequency,
  conflict_of_interest_policy,
  whistleblower_policy,
  annual_ed_review,
  family_on_board,
  program_expense_pct,
  overhead_expense_pct,
  reserve_fund_level,
  exec_salary_benchmark,
  recent_deficit,
  restricted_funds_tracked,
  restricted_funds_misused,
  ministry_fruit_evidence,
  discipleship_outcomes,
  beneficiary_feedback,
  reputation_summary,
  reference_check_summary,
  public_controversy_notes,
  attests_information_is_true,
  attests_doctrinal_alignment,
  attests_financial_integrity,
  attestation_name,
  attestation_title,
  attestation_signed_at,
  raw_data
) values (
  '22222222-2222-4222-8222-222222222222',
  'Marcus Hale came to faith in college through an urban campus ministry, served in church revitalization for several years, and later helped plant New City Fellowship with a focus on neighborhood discipleship and pastoral presence.',
  'Married',
  'Marcus is accountable to a plurality of elders, meets monthly with two senior peer pastors outside the organization, and receives an annual review from the elder board.',
  'Elder-led with major budget and compensation decisions approved by the board',
  true,
  'Normal pastoral tensions have arisen around growth pace and staffing load, but no unresolved integrity or relational breach concerns were reported.',
  4,
  'Strong emphasis on neighborhood presence, expositional preaching, and mercy ministry integrated with discipleship',
  'Biblical authority, substitutionary atonement, bodily resurrection, regenerate church membership, and elder accountability',
  'Fully aligned with SAVE doctrinal expectations',
  'Practices believer''s baptism and regular communion',
  'Elder-led nonprofit governance with ministry leadership reporting to the board',
  7,
  'Bi-monthly',
  true,
  true,
  true,
  false,
  74,
  18,
  'Approximately four months of operating reserves',
  'Compensation reviewed against comparable regional church and nonprofit data',
  false,
  true,
  false,
  'New City has planted one daughter congregation, launched a residency pipeline for ministry leaders, and sustained strong volunteer engagement in neighborhood outreach.',
  'Members consistently move from Sunday attendance into discipleship groups, service teams, and pastoral care relationships.',
  'Congregants and local partners repeatedly describe the ministry as faithful, present, and trustworthy in the community.',
  'Public reputation is consistently positive with no material concerns found in media or partner references.',
  'Reference checks described Marcus as humble, teachable, and effective in building teams without centralizing authority.',
  'No meaningful public controversies were identified.',
  true,
  true,
  true,
  'Marcus Hale',
  'Lead Pastor',
  timezone('utc', now()),
  jsonb_build_object(
    'residency_program', true,
    'church_plants_supported', 1,
    'mercy_ministry_partners', 6
  )
);

insert into public.scores (
  id,
  application_id,
  calculated_by,
  total_score,
  leadership_score,
  doctrine_score,
  governance_score,
  financial_score,
  fruit_score,
  external_trust_score,
  is_hard_stop,
  hard_stop_reason
) values (
  '33333333-3333-4333-8333-333333333333',
  '22222222-2222-4222-8222-222222222222',
  'sample_seed',
  84,
  16,
  13,
  13,
  17,
  16,
  9,
  false,
  null
);

insert into public.score_components (
  score_id,
  category,
  criterion,
  max_points,
  awarded_points,
  rationale
) values
  ('33333333-3333-4333-8333-333333333333', 'leadership', 'Character and accountability', 10, 8, 'Strong elder accountability and positive external references.'),
  ('33333333-3333-4333-8333-333333333333', 'leadership', 'Team health and conflict handling', 10, 8, 'Healthy team culture with no unresolved integrity signals.'),
  ('33333333-3333-4333-8333-333333333333', 'doctrine', 'Orthodoxy and doctrinal clarity', 10, 9, 'Clear orthodox alignment across public and internal materials.'),
  ('33333333-3333-4333-8333-333333333333', 'doctrine', 'Practical ministry consistency', 5, 4, 'Doctrine is reflected credibly in ministry practice.'),
  ('33333333-3333-4333-8333-333333333333', 'governance', 'Board structure and independence', 8, 7, 'Board appears engaged and substantially independent.'),
  ('33333333-3333-4333-8333-333333333333', 'governance', 'Decision-making discipline', 7, 6, 'Decision-making is accountable, with modest room to formalize succession planning.'),
  ('33333333-3333-4333-8333-333333333333', 'financial', 'Stewardship and controls', 10, 9, 'Healthy financial review cadence and tracking of restricted funds.'),
  ('33333333-3333-4333-8333-333333333333', 'financial', 'Resilience and sustainability', 10, 8, 'Reserve position is adequate but not yet especially strong.'),
  ('33333333-3333-4333-8333-333333333333', 'fruit', 'Discipleship outcomes', 10, 8, 'Strong evidence of discipleship participation and leader development.'),
  ('33333333-3333-4333-8333-333333333333', 'fruit', 'Missional impact', 10, 8, 'Neighborhood credibility and church planting fruit are compelling.'),
  ('33333333-3333-4333-8333-333333333333', 'external', 'Public trust and signal checks', 10, 9, 'External checks were positive across IRS, website, and reputation review.');

insert into public.external_checks (
  application_id,
  source,
  status,
  summary,
  raw_result,
  score_impact
) values
  (
    '22222222-2222-4222-8222-222222222222',
    'irs_teos',
    'pass',
    'IRS records confirm active 501(c)(3) status under New City Fellowship with no filing anomalies identified.',
    jsonb_build_object('ntee_code', 'X20', 'deductibility', 'Eligible'),
    2
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'website',
    'pass',
    'Website content is current, doctrinally consistent, and reflects the same leadership and ministry priorities described in the application.',
    jsonb_build_object('ssl', true, 'last_reviewed', '2026-04-09'),
    2
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'news_search',
    'pass',
    'Local coverage and partner mentions reflect a positive reputation with emphasis on faithful neighborhood engagement and church planting.',
    jsonb_build_object('articles_reviewed', 6, 'negative_hits', 0),
    2
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'charity_navigator',
    'pass',
    'Charity Navigator integration located the organization and did not surface any adverse trust indicators.',
    jsonb_build_object('status', 'found', 'rating_note', 'Profile present without material concern flags'),
    1
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '990_analysis',
    'pass',
    'Form 990 review showed healthy program allocation, responsible executive compensation practices, and consistent reporting.',
    jsonb_build_object('program_ratio', 74, 'overhead_ratio', 18),
    2
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'doctrinal_analysis',
    'pass',
    'Doctrinal materials were coherent, orthodox, and consistent with the church’s public teaching and ministry posture.',
    jsonb_build_object('alignment', 'high'),
    2
  );

insert into public.donor_briefs (
  application_id,
  generated_at,
  published,
  published_at,
  slug,
  headline,
  ministry_description,
  commendations,
  cautions,
  recommendation_level,
  rationale,
  include_voice_alignment
) values (
  '22222222-2222-4222-8222-222222222222',
  timezone('utc', now()),
  true,
  timezone('utc', now()),
  'new-city-fellowship-brief',
  'A grounded urban church movement building disciples, leaders, and neighborhood trust.',
  'New City Fellowship is a gospel-centered urban ministry that combines local church formation, practical mercy ministry, and leadership development in neighborhoods that have historically been underserved by long-term pastoral presence.',
  array[
    'Clear theological alignment and strong gospel clarity',
    'Healthy elder accountability and strong reference feedback',
    'Meaningful ministry fruit through discipleship, community presence, and church planting'
  ],
  array[
    'Reserve growth should continue to improve long-term resilience',
    'Formal succession planning for senior leadership should be more clearly documented'
  ],
  'Recommended',
  'SAVE found New City Fellowship to be a strong ministry opportunity with credible leadership, clear doctrinal alignment, and visible local fruit. The opportunity remains especially compelling for donors who value church-based discipleship and neighborhood presence, while still noting the importance of continued reserve growth and succession planning maturity.',
  true
);

insert into public.voice_alignment_summaries (
  application_id,
  organization_id,
  summary,
  status,
  generated_at
) values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  '{
    "internal_summary": {
      "themes": [
        "Strong trust in pastoral leadership",
        "Healthy volunteer culture and practical accountability",
        "Mission consistency between leadership and frontline ministry"
      ],
      "strengths": [
        "Leaders are described as present, humble, and accessible",
        "Staff and volunteers experience clear mission alignment",
        "Internal culture is marked by prayerfulness, service, and follow-through"
      ],
      "concerns": [
        "Leadership load is concentrated in a few key senior roles",
        "Future succession planning should be more explicit"
      ]
    },
    "external_summary": {
      "themes": [
        "Positive neighborhood reputation",
        "Consistent leadership credibility",
        "Visible long-term commitment to local ministry presence"
      ],
      "strengths": [
        "Community partners consistently describe the church as dependable",
        "Public reputation matches the ministry’s stated mission",
        "External observers see tangible fruit in leadership development and care"
      ],
      "concerns": [
        "Growth pace may stretch leadership capacity over time"
      ]
    },
    "alignment_insight": "Internal and external feedback are substantially aligned. Both groups describe New City Fellowship as credible, relationally trustworthy, and missionally consistent, with the main caution centered on long-term leadership capacity rather than integrity concerns.",
    "alignment_status": "aligned",
    "follow_up_questions": [
      "What concrete succession planning milestones should leadership complete over the next 12 months?"
    ]
  }',
  'aligned',
  timezone('utc', now())
);
