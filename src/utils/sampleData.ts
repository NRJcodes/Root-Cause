import { InvestigationSession } from '../types';

export const SAMPLE_BENCHMARKS: {
  id: string;
  name: string;
  category: InvestigationSession['intake']['category'];
  badge: string;
  session: Partial<InvestigationSession>;
}[] = [
  {
    id: 'benchmark-automotive',
    name: 'Powertrain Plant: 34% Unplanned Downtime on Stamping Press #4',
    category: 'Production/Operations',
    badge: 'Operations & Reliability',
    session: {
      title: 'Powertrain Plant: 34% Unplanned Downtime on Stamping Press #4',
      intake: {
        category: 'Production/Operations',
        description:
          'Stamping Line #4 experienced an unprecedented 34% increase in unplanned downtime during the past 6 weeks. The line produces inner door structural panels. Symptoms include repeated hydraulic pressure drops on the secondary ram cylinder, intermittent emergency-stop trips with fault code E-408 (hydraulic pressure delta > 18 bar), and finished stampings showing micro-wrinkling on the flange radius. Line speed was derated from 24 strokes/min to 16 strokes/min to avoid line stops, causing a 1,200 unit/day delivery deficit to the body assembly shop.',
        documents: [
          {
            id: 'doc_sample_1',
            name: 'Shift_Log_Press4_August.csv',
            size: 4820,
            type: 'text/csv',
            uploadedAt: '2026-09-18T10:14:00Z',
            textContent: `Date,Shift,Line_Speed_SPM,Hydraulic_Temp_C,Fault_Code,Downtime_Minutes,Root_Reported
2026-08-01,Shift 1,24,48,None,0,Normal operation
2026-08-04,Shift 2,24,52,None,12,Brief die repositioning
2026-08-11,Shift 1,24,64,E-408,45,Secondary cylinder pressure fluctuation
2026-08-12,Shift 1,20,68,E-408,72,Filter bypass alert triggered. Oil sampled.
2026-08-15,Shift 3,18,74,E-408,110,Replaced proportional relief valve with batch #992-B spare
2026-08-18,Shift 2,16,77,E-408,140,High oil viscosity observed; heat exchanger fins clogged with airborne particulate
2026-08-25,Shift 1,16,79,E-408,185,Micro-wrinkling rejects reached 4.8%. Maintenance flagged non-OEM hydraulic seal kit installed during July turnaround.`,
          },
          {
            id: 'doc_sample_2',
            name: 'Turnaround_Procurement_Audit_July.txt',
            size: 2150,
            type: 'text/plain',
            uploadedAt: '2026-09-18T10:15:00Z',
            textContent: `AUDIT MEMORANDUM - JULY PREVENTIVE MAINTENANCE TURNAROUND
Subject: Hydraulic Seal Kit Substitution & Supplier Expediting
Date: July 28, 2026
Auditor: Plant Reliability Engineering

Observations:
1. Primary OEM Parker-Hannifin fluorocarbon seal kits (Part #PH-8821) had a 16-week lead time due to port logistics backlog.
2. Procurement authorized spot-buy of alternate polyurethane seals from distributor Apex Industrial (Batch #AX-441-N) without metallurgical/temperature compatibility sign-off.
3. Operating specification for Press #4 specifies continuous hydraulic operating temperature up to 80°C. Apex polyurethane seals are rated only to 60°C continuous before thermal softening and extrusion under 250 bar pressure.
4. Heat exchanger cleaning was deferred during July turnaround to recover 8 hours of scheduled maintenance time.`,
          },
        ],
      },
      clarifying: {
        isSubmitted: true,
        questions: [
          {
            id: 'cq_1',
            focusArea: 'Timing/Onset',
            question: 'When exactly did the hydraulic pressure drops (Fault E-408) begin relative to the July turnaround?',
            rationale: 'Isolates whether the problem is correlated with maintenance turnaround changes or baseline wear.',
            answer:
              'Fault E-408 first appeared on August 11, exactly 12 days after returning from the July annual turnaround, and has worsened in frequency as ambient shop temperature peaked in late August.',
          },
          {
            id: 'cq_2',
            focusArea: 'Recent Changes',
            question: 'What supplier, material, or fluid changes occurred during or immediately prior to the turnaround?',
            rationale: 'Validates physical compatibility of replacement parts against design tolerances.',
            answer:
              'Turnaround audit confirms replacement of OEM Parker seals with Apex polyurethane seals rated for only 60°C instead of the 80°C operating standard, plus heat exchanger cleaning was skipped to save 8 hours.',
          },
          {
            id: 'cq_3',
            focusArea: 'Data/Evidence',
            question: 'What oil analysis and temperature telemetry data exists during fault occurrences?',
            rationale: 'Verifies whether thermal degradation and fluid breakdown are physically documented.',
            answer:
              'Shift logs show hydraulic fluid operating at 74°C to 79°C, well above the 60°C limit of the spot-bought seals. Oil samples confirm micro-polymer debris from seal shedding inside the proportional valve.',
          },
          {
            id: 'cq_4',
            focusArea: 'Prior Attempts',
            question: 'What corrective actions have maintenance crews attempted, and what were the outcomes?',
            rationale: 'Prevents recommending already failed surface-level interventions.',
            answer:
              'Maintenance replaced the proportional relief valve on August 15 and derated line speed from 24 to 16 strokes/minute. This reduced hourly trips slightly but did not prevent overheating or panel wrinkling.',
          },
        ],
      },
    },
  },
  {
    id: 'benchmark-saas',
    name: 'B2B Enterprise SaaS: Q3 Gross Margin Compression (78% to 63%)',
    category: 'Financial',
    badge: 'Finance & Cloud Ops',
    session: {
      title: 'B2B Enterprise SaaS: Q3 Gross Margin Compression (78% to 63%)',
      intake: {
        category: 'Financial',
        description:
          'Gross margins for our flagship enterprise data platform declined sharply from an historical average of 78.4% in Q1/Q2 down to 63.1% in Q3. Operating expenses remained stable, but Cost of Goods Sold (COGS) surged by $1.82M quarter-over-quarter. CFO and board require an objective root-cause breakdown to determine whether this is an unrecoverable structural cost increase or remediable operational leakage before setting 2027 fiscal guidance.',
        documents: [
          {
            id: 'doc_sample_saas_1',
            name: 'AWS_COGS_Breakdown_Q3.csv',
            size: 3410,
            type: 'text/csv',
            uploadedAt: '2026-09-12T14:20:00Z',
            textContent: `Service,Q2_Cost_USD,Q3_Cost_USD,Delta_USD,Percentage_Growth
Amazon EKS Compute,520000,580000,+60000,+11.5%
S3 Storage & Glacier,310000,340000,+30000,+9.7%
Vector Search & LLM Inference Gateway,180000,1190000,+1010000,+561.1%
Cross-Region Data Egress,140000,490000,+350000,+250.0%
Datadog Monitoring & Log Ingestion,220000,400000,+180000,+81.8%
Total COGS,1370000,3000000,+1630000,+119.0%`,
          },
          {
            id: 'doc_sample_saas_2',
            name: 'Product_Release_Notes_Sprint_v4.2.txt',
            size: 1980,
            type: 'text/plain',
            uploadedAt: '2026-09-12T14:22:00Z',
            textContent: `RELEASE NOTES - PLATFORM VERSION 4.2 (Shipped July 5, 2026)
Feature: "Autonomous Semantic Document Search"
Architectural Notes:
1. Implemented real-time re-embedding on every user query across customer document indices.
2. Default caching layer (Redis) was bypassed due to race condition ticket #ENG-4891; direct API calls to third-party vector provider routed unthrottled.
3. Multi-tenant clusters query raw embedding APIs across US-East-1 and EU-Central-1 without VPC peering endpoints, generating cross-region Internet egress billing.
4. Billing meter was not enabled on free-tier and starter enterprise pilot accounts.`,
          },
        ],
      },
      clarifying: {
        isSubmitted: true,
        questions: [
          {
            id: 'cq_saas_1',
            focusArea: 'Timing/Onset',
            question: 'When did the cost surge begin relative to software deployments?',
            rationale: 'Establishes whether unit economics degraded from customer volume or architectural change.',
            answer:
              'The cost inflection occurred immediately after the July 5 release of v4.2 Semantic Search, jumping from ~$15k/day to $42k/day within 96 hours of deployment.',
          },
          {
            id: 'cq_saas_2',
            focusArea: 'Data/Evidence',
            question: 'Which specific infrastructure line items account for the $1.82M COGS expansion?',
            rationale: 'Pinpoints exact operational leakage vectors.',
            answer:
              'Vector search API calls (+$1.01M) and cross-region egress (+$350k) account for 83% of the entire margin compression, corroborated by AWS line item reports.',
          },
          {
            id: 'cq_saas_3',
            focusArea: 'Recent Changes',
            question: 'Why was query caching bypassed in production?',
            rationale: 'Identifies software release gate and process failure.',
            answer:
              'Sprint release v4.2 bypassed the Redis caching layer to hotfix a race condition under ticket ENG-4891 without load testing or cost governance guardrails.',
          },
          {
            id: 'cq_saas_4',
            focusArea: 'Prior Attempts',
            question: 'Have any billing limits or tier throttles been applied since the issue was detected?',
            rationale: 'Determines current operational exposure.',
            answer:
              'Engineering implemented a temporary rate-limit of 50 queries/user/min on August 28, which curbed peak spikes by 14% but the baseline architecture remains un-cached and cross-region.',
          },
        ],
      },
    },
  },
  {
    id: 'benchmark-quality',
    name: 'Medical Device Sterile Packaging: 4.8% Seal Integrity Failure Rate',
    category: 'Quality',
    badge: 'Quality & Regulatory',
    session: {
      title: 'Medical Device Sterile Packaging: 4.8% Seal Integrity Failure Rate',
      intake: {
        category: 'Quality',
        description:
          'Lot acceptance testing for sterile blister pouches on Packaging Line 2 detected a 4.8% dye-penetration leak failure rate (ASTM F1929), exceeding the 0.05% critical defect upper specification limit. Three production lots (32,000 total surgical tray kits, valued at $780k) are currently quarantined under Non-Conformance Report NCR-2026-094. Root cause must be pinpointed to prevent lot scrap or a potential field recall notification to the FDA.',
        documents: [
          {
            id: 'doc_quality_1',
            name: 'Cleanroom_Calibrations_Line2.txt',
            size: 1840,
            type: 'text/plain',
            uploadedAt: '2026-09-22T08:30:00Z',
            textContent: `QUALITY AUDIT & NCR-2026-094 TECHNICAL SUMMARY
Station: Rotary Heat Sealer HS-04, Cleanroom Class 7 (Line 2)
Substrate: Tyvek 1073B sealed to 12-mil PETG thermoformed tray

Key Observations:
1. Thermocouple calibration: Sealing platen temperature display read 135°C (target: 135°C ± 2°C). Independent infrared pyrometer verification showed actual platen center at 121°C and outer edge at 136°C (15°C thermal gradient across the 4-cavity seal platen).
2. Platen heating cartridge #2 open-circuit resistance measured 142 ohms (standard: 38 ohms), indicating partial internal element failure.
3. Operator shift logs record that Shift 2 operators manually increased dwell time from 1.2s to 1.8s without an approved Engineering Change Order (ECO) when seal peel strength felt low to the touch.
4. Raw Tyvek roll batch inspection verified tensile and porosity certificates conform to medical grade 1073B specifications.`,
          },
        ],
      },
      clarifying: {
        isSubmitted: true,
        questions: [
          {
            id: 'cq_q_1',
            focusArea: 'Timing/Onset',
            question: 'When did the seal integrity failures first exceed the 0.05% limit?',
            rationale: 'Determines the boundary of non-conforming product lots.',
            answer:
              'Defects were detected during lot sampling for Lot #26-880 on September 14, following a weekend preventative maintenance cycle on the rotary sealer.',
          },
          {
            id: 'cq_q_2',
            focusArea: 'Data/Evidence',
            question: 'What physical failure mode was observed on the non-conforming blister pouches?',
            rationale: 'Distinguishes between seal burn-through, under-fusion, or foreign particulate contamination.',
            answer:
              'Dye penetration testing showed channels specifically located in Cavity 2 of the 4-cavity tooling platen, directly corresponding to the cold spot identified by infrared pyrometry (121°C vs 135°C target).',
          },
          {
            id: 'cq_q_3',
            focusArea: 'Recent Changes',
            question: 'Why did operators adjust dwell time settings without an Engineering Change Order?',
            rationale: 'Uncovers process discipline and calibration verification procedures.',
            answer:
              'Operators noticed weak seal peels on Cavity 2 and compensated by increasing dwell time to 1.8s. The machine recipe password protection was disabled on the HMI terminal during maintenance and never re-locked.',
          },
          {
            id: 'cq_q_4',
            focusArea: 'Prior Attempts',
            question: 'What has been done with the heating cartridge and the quarantined lots?',
            rationale: 'Establishes current state of tooling and disposition.',
            answer:
              'Heating cartridge #2 remains in the machine pending formal CAPA sign-off. All 3 lots remain in quarantined warehouse lockup. No product has shipped to hospital distributors.',
          },
        ],
      },
    },
  },
];
