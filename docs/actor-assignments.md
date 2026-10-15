# Actor assignments

Each row is one choice. `actor` records who can act on the harm that choice causes,
using the three answers taught in GEL2026 L06: technical design, company policy, or law.
All 249 choices that change a score are covered.

**The test applied:** if the remedy is a change to how the product or system works, it is
`design`. If it is a change to a company rule, contract, notice or process, it is `policy`.
If the company cannot fix it alone, it is `law`.

**Convention:** choices that raise no risk are also labelled, using whatever the choice
actually does. One entry choice per scenario has no `effects` at all and is left unlabelled.

## ai-fitness

| # | Node | Choice | Effects | Actor | Reason |
|---|---|---|---|---|---|
| 1 | `c1_segment` | Go deep on trail-running and cycling communities, master one nar | `pmf+2 moat+1` | **design** | Narrow the customer definition, so less is collected or taken on. A change to the product's scope. |
| 2 | `c1_segment` | Target everyone who exercises and chase volume first | `business+2 ethics+1` | **design** | Take on everything to raise volume. Different jobs, clients or categories mean the checks get thin. A company operating discipline. |
| 3 | `c1_problem` | Interview two hundred runners; confirm the pain is route safety  | `pmf+2` | **policy** | Interview users properly before building. Research discipline, set by the company. |
| 4 | `c1_problem` | Boost retention with leaderboards and badges; ship first, ask la | `business+2 ethics+1` | **design** | Build a headline feature that removes the check. The mechanic itself is the defect. |
| 5 | `c1_problem` | Build what the biggest buyer wants: a corporate wellness version | `business+3 pmf-1` | **policy** | Build for the largest buyer. Which customer the company serves is a company choice. |
| 6 | `c2_mvp` | Build the AI coach: personalised training and injury warnings | `pmf+2 moat+1` | **design** | Build the AI coach. The data pipeline is a design decision. |
| 7 | `c2_mvp` | Build the route heat map: visual, viral, easy acquisition | `business+2 national_security+1` | **design** | Build the heat map. Whether to aggregate and publish location data is a design decision. |
| 8 | `c2_mapdata` | Use only locally licensed maps and open data | `pmf+1` | **policy** | Use licensed, traceable map data. Sourcing discipline is a company rule. |
| 9 | `c2_mapdata` | Use the overseas high-precision dataset and ship | `national_security+2 legal+1 pmf+1` | **law** | Use overseas high-precision surveying data. Surveying and cross-border transfer are regulated. |
| 10 | `c2_training` | Use public event data plus user data collected with explicit con | `pmf+1` | **policy** | Use consented data only. Consent handling is a company practice. |
| 11 | `c2_training` | Buy a third-party data pack to fill the gaps | `pmf+2 legal+2 ethics+2` | **law** | Buy or blend in material of unclear origin. Lawful basis is a legal question. |
| 12 | `ai-fitness_b1_clean` | Put data provenance and the model's limits on one in-app page us | `pmf+1 moat+1` | **policy** | Publish provenance and limits as a deliverable. A disclosure practice. |
| 13 | `ai-fitness_b1_clean` | Claim compliance publicly; explain provenance only when asked | `business+2 ethics+1` | **policy** | Claim compliance, produce the evidence only on demand. Honesty in disclosure is a company practice. |
| 14 | `ai-fitness_b1_dirty` | Stop using the batch, retrain, and notify affected users | `legal-1 ethics-1 pmf-1` | **policy** | Stop, retrain, tell those affected in writing. Notification is a company practice. |
| 15 | `ai-fitness_b1_dirty` | Keep using it, ship the build, deal with questions later | `pmf+1 legal+1 ethics+1` | **law** | Keep going until challenged. Whether the basis is lawful is a legal question. |
| 16 | `c3_bias` | Publish the limits, add human review, fix data representativenes | `pmf+2 moat+1` | **design** | Publish limits, add review, fix the training set. The representation defect is technical. |
| 17 | `c3_bias` | Ship now; declare the default user to be a healthy adult | `ethics+3 legal+1 business+1` | **law** | Ship a known-biased output with a disclaimer. Liability for that is a legal matter. |
| 18 | `ai-fitness_b2_fixed` | Write the intended population and review flow into both product  | `moat+2` | **policy** | Write the limits and the review into contracts. A contractual commitment. |
| 19 | `ai-fitness_b2_fixed` | To protect engagement, collapse the review notice and keep pushi | `business+2 ethics+2` | **design** | Downgrade the safeguard to protect throughput. The safeguard itself is part of the product. |
| 20 | `ai-fitness_b2_paper` | Add population limits and a human review channel, contact high-r | `ethics-1 legal-1 business-1 pmf+1` | **policy** | Add the safeguard back and re-check past work. Re-checking is a system action. |
| 21 | `ai-fitness_b2_paper` | Stay silent and add 'not for people with chronic conditions' to  | `ethics+2 business+2` | **law** | Stay silent and rely on the clause or the letter. Liability is a legal matter. |
| 22 | `c4_heatmap` | Refuse to change it: this is user-generated content, the platfor | `national_security+3 legal+2 business+1` | **law** | Refuse to change anything. 'User-generated content' is not a legal defence. |
| 23 | `c4_heatmap` | Commission a third-party geographic compliance audit; mask sensi | `moat+2 business-1` | **design** | Audit, then mask or freeze. Masking and freezing are product changes. |
| 24 | `c4_heatmap` | Handle it reactively: remove the heat layer only where someone c | `national_security+1 ethics+1 business+1` | **design** | Act only where someone complains. The remedy is to act on the whole system. |
| 25 | `ai-fitness_b1_clean_money` | Subscriptions, with a public promise never to monetise location  | `business+2 moat+1` | **policy** | A written promise or contract term. A company commitment. |
| 26 | `ai-fitness_b1_clean_money` | Free app; sell 'de-identified' movement tracks to insurers | `business+4 legal+2 ethics+3` | **law** | Selling or sublicensing other people's material. Regulated; the company cannot fix it alone. |
| 27 | `ai-fitness_b1_clean_channel` | Grow through campus, run clubs and community word of mouth; take | `business+1 pmf+1` | **policy** | How the company chooses to grow. An internal commercial decision. |
| 28 | `ai-fitness_b1_clean_channel` | Paid acquisition plus referral cash to climb the app-store chart | `business+3 legal+1 ethics+1` | **law** | Commission, rebate or advertising promises engage platform, agency, tax or consumer-protection rules. |
| 29 | `ai-fitness_b1_clean_deploy` | Label it clearly and offer a human-coach review path | `moat+1` | **design** | Whether a human decision-maker or a label stays in the product is a design choice. |
| 30 | `ai-fitness_b1_clean_deploy` | Skip the label; let users believe a human coach wrote it | `business+2 legal+3 ethics+2` | **law** | Record-keeping and disclosure duties are set by law in this sector. |
| 31 | `ai-fitness_b1_dirty_money` | Monthly subscription, promising never to train new models on que | `business+2 moat+1` | **policy** | A written promise or contract term. A company commitment. |
| 32 | `ai-fitness_b1_dirty_money` | Free app; sell 'de-identified' tracks to insurers, questionable  | `business+4 legal+2 ethics+3` | **law** | Selling or sublicensing other people's material. Regulated; the company cannot fix it alone. |
| 33 | `ai-fitness_b1_dirty_channel` | Only do flagships you can serve; do not chase user count | `business+1 pmf+1` | **policy** | How the company chooses to grow. An internal commercial decision. |
| 34 | `ai-fitness_b1_dirty_channel` | Paid acquisition plus referral cash to climb the chart | `business+3 legal+1 ethics+1` | **law** | Commission, rebate or advertising promises engage platform, agency, tax or consumer-protection rules. |
| 35 | `ai-fitness_b1_dirty_deploy` | Add conspicuous labels plus human review | `moat+1` | **design** | Whether a human decision-maker or a label stays in the product is a design choice. |
| 36 | `ai-fitness_b1_dirty_deploy` | Skip the label; let users believe a human coach wrote it | `business+2 legal+3 ethics+2` | **law** | Record-keeping and disclosure duties are set by law in this sector. |
| 37 | `ai-fitness_b2_fixed_funding` | Take a local industry fund: slower expansion, but keep data sove | `business+1 moat+2` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 38 | `ai-fitness_b2_fixed_funding` | Take offshore strategic investment and open data interfaces to t | `business+3 national_security+2 legal+1` | **law** | Opening data interfaces to an overseas group raises regulated cross-border transfer. |
| 39 | `ai-fitness_b2_fixed_funding` | Take no funding; grow on subscription revenue alone | `business-1 moat+1` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 40 | `ai-fitness_b2_paper_funding` | Take a local industry fund: slower expansion, but keep data sove | `business+1 moat+2` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 41 | `ai-fitness_b2_paper_funding` | Take offshore strategic investment and open data interfaces to t | `business+3 national_security+2 legal+1` | **law** | Opening data interfaces to an overseas group raises regulated cross-border transfer. |
| 42 | `ai-fitness_b2_paper_funding` | Take no funding; grow on subscription revenue alone | `business-1 moat+1` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |

## ai-hiring

| # | Node | Choice | Effects | Actor | Reason |
|---|---|---|---|---|---|
| 1 | `c1_segment` | Go deep on technical roles at small and mid-sized tech firms | `pmf+2 moat+1` | **design** | Narrow the customer definition, so less is collected or taken on. A change to the product's scope. |
| 2 | `c1_segment` | Serve every industry and every role; scale CV volume first | `business+2 ethics+1` | **design** | Take on everything to raise volume. Different jobs, clients or categories mean the checks get thin. A company operating discipline. |
| 3 | `c1_problem` | Interview twenty HR leads; confirm the pain is weak evidence, no | `pmf+2` | **policy** | Interview users properly before building. Research discipline, set by the company. |
| 4 | `c1_problem` | Ship an AI score and talent leaderboard so decisions take one cl | `business+2 ethics+1` | **design** | Build a headline feature that removes the check. The mechanic itself is the defect. |
| 5 | `c1_problem` | Build what the biggest buyer wants: a university careers-edition | `business+3 pmf-1` | **policy** | Build for the largest buyer. Which customer the company serves is a company choice. |
| 6 | `c2_product` | Interview coaching plus skills assessment: produce a checkable e | `pmf+2 moat+1` | **design** | Build an evidence-based product. The method is a technical decision. |
| 7 | `c2_product` | Candidate search with a scoring leaderboard so companies can 'sh | `business+2 national_security+1` | **design** | Build the feature that aggregates, profiles or decides automatically. Whether to build it is a design decision. |
| 8 | `c2_keyresource` | Build a local taxonomy on published industry classification stan | `pmf+1` | **policy** | Build the reference data in-house from official sources. Internal standard-setting. |
| 9 | `c2_keyresource` | Plug in the overseas vendor API and get moving | `national_security+2 legal+1 pmf+1` | **law** | Plug in an outside source you cannot trace. Regulated cross-border or licensing exposure. |
| 10 | `c2_training` | Use only data the pilot covered in writing and accept a small sa | `pmf+1` | **policy** | Use consented data only. Consent handling is a company practice. |
| 11 | `c2_training` | Scrape public job boards and social profiles to fill the sample | `pmf+2 legal+2 ethics+2` | **law** | Buy or blend in material of unclear origin. Lawful basis is a legal question. |
| 12 | `ai-hiring_b1_clean` | Make 'explainable scoring basis' a standard deliverable for HR | `pmf+1 moat+1` | **policy** | Publish provenance and limits as a deliverable. A disclosure practice. |
| 13 | `ai-hiring_b1_clean` | Claim algorithmic compliance; release the basis only after a com | `business+2 ethics+1` | **policy** | Claim compliance, produce the evidence only on demand. Honesty in disclosure is a company practice. |
| 14 | `ai-hiring_b1_dirty` | Delete the scraped data, retrain, and notify affected candidates | `legal-1 ethics-1 pmf-1` | **policy** | Stop, retrain, tell those affected in writing. Notification is a company practice. |
| 15 | `ai-hiring_b1_dirty` | Keep using it until someone complains formally | `pmf+1 legal+1 ethics+1` | **law** | Keep going until challenged. Whether the basis is lawful is a legal question. |
| 16 | `c3_harm` | Publish the limitations, add human review, resample to fix the t | `pmf+2 moat+1` | **design** | Publish limits, add review, fix the defect. Correcting systematic bias is technical. |
| 17 | `c3_harm` | Ship now and declare the intended population as 'graduates of le | `ethics+3 legal+1 business+1` | **law** | Ship and narrow the stated population. Legal responsibility for the harm is a legal question. |
| 18 | `ai-hiring_b2_fixed` | Write review logs and bias fixes into the delivery standard and  | `moat+2` | **policy** | Write the limits and the review into contracts. A contractual commitment. |
| 19 | `ai-hiring_b2_fixed` | To stay 'easy to use', reduce review to a rubber stamp | `business+2 ethics+2` | **design** | Downgrade the safeguard to protect throughput. The safeguard itself is part of the product. |
| 20 | `ai-hiring_b2_paper` | Add score explanations and a human review channel; publish the k | `ethics-1 legal-1 business-1 pmf+1` | **policy** | Add the safeguard back and re-check past work. Re-checking is a system action. |
| 21 | `ai-hiring_b2_paper` | Stay silent and sharpen the line 'the employer decides in the en | `ethics+2 business+2` | **law** | Stay silent and rely on the clause or the letter. Liability is a legal matter. |
| 22 | `c4_incident` | Refuse to disclose: the algorithm is a trade secret and scores a | `national_security+3 legal+2 business+1` | **law** | Deny it and shift the responsibility. Regulators or the other party decide this, not the company. |
| 23 | `c4_incident` | Commission an independent algorithm audit, publish a summary, bu | `moat+2 business-1` | **design** | Commission an audit, then freeze or mask the affected output. A product change. |
| 24 | `c4_incident` | Handle it reactively: manually review only the candidates who co | `national_security+1 ethics+1 business+1` | **design** | Act only on the cases that get raised. The remedy is to act on every case. |
| 25 | `ai-hiring_b1_clean_money` | Per-seat subscription with a written promise never to resell can | `business+2 moat+1` | **policy** | A written promise or contract term. A company commitment. |
| 26 | `ai-hiring_b1_clean_money` | Free trial, then resell the candidate profiles to third parties | `business+4 legal+2 ethics+3` | **law** | Selling or sublicensing other people's material. Regulated; the company cannot fix it alone. |
| 27 | `ai-hiring_b1_clean_channel` | Grow through HR communities and referrals, taking only clients y | `business+1 pmf+1` | **policy** | How the company chooses to grow. An internal commercial decision. |
| 28 | `ai-hiring_b1_clean_channel` | Distribute through recruiters with per-head commission to drive  | `business+3 legal+1 ethics+1` | **law** | Commission, rebate or advertising promises engage platform, agency, tax or consumer-protection rules. |
| 29 | `ai-hiring_b1_clean_deploy` | Disclose automated scoring to candidates and offer appeal plus h | `moat+1` | **policy** | The disclosure, appeal and record-keeping processes the company operates. |
| 30 | `ai-hiring_b1_clean_deploy` | No candidate-facing disclosure; externally it is a 'system asses | `business+2 legal+3 ethics+2` | **law** | Record-keeping and disclosure duties are set by law in this sector. |
| 31 | `ai-hiring_b1_dirty_money` | Monthly subscription, promise never to resell candidate data — e | `business+2 moat+1` | **policy** | A written promise or contract term. A company commitment. |
| 32 | `ai-hiring_b1_dirty_money` | Free, then resell candidate profiles to third parties, questiona | `business+4 legal+2 ethics+3` | **law** | Selling or sublicensing other people's material. Regulated; the company cannot fix it alone. |
| 33 | `ai-hiring_b1_dirty_channel` | Only do flagships you can serve; do not chase contract count | `business+1 pmf+1` | **policy** | How the company chooses to grow. An internal commercial decision. |
| 34 | `ai-hiring_b1_dirty_channel` | Distribute through recruiters with per-head commission to drive  | `business+3 legal+1 ethics+1` | **law** | Commission, rebate or advertising promises engage platform, agency, tax or consumer-protection rules. |
| 35 | `ai-hiring_b1_dirty_deploy` | Add disclosure plus appeal and human review | `moat+1` | **policy** | The disclosure, appeal and record-keeping processes the company operates. |
| 36 | `ai-hiring_b1_dirty_deploy` | No disclosure; let clients present it as a 'system assessment' | `business+2 legal+3 ethics+2` | **law** | Record-keeping and disclosure duties are set by law in this sector. |
| 37 | `ai-hiring_b2_fixed_funding` | Take a local industry fund: slower expansion, data stays local | `business+1 moat+2` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 38 | `ai-hiring_b2_fixed_funding` | Take strategic investment from an offshore HR SaaS giant and ope | `business+3 national_security+2 legal+1` | **law** | Opening data interfaces to an overseas group raises regulated cross-border transfer. |
| 39 | `ai-hiring_b2_fixed_funding` | Take no funding; grow on subscriptions alone | `business-1 moat+1` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 40 | `ai-hiring_b2_paper_funding` | Take a local industry fund: slower expansion, data stays local | `business+1 moat+2` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 41 | `ai-hiring_b2_paper_funding` | Take strategic investment from an offshore HR SaaS giant and ope | `business+3 national_security+2 legal+1` | **law** | Opening data interfaces to an overseas group raises regulated cross-border transfer. |
| 42 | `ai-hiring_b2_paper_funding` | Take no funding; grow on subscriptions alone | `business-1 moat+1` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |

## ai-avatar

| # | Node | Choice | Effects | Actor | Reason |
|---|---|---|---|---|---|
| 1 | `c1_segment` | Go deep on local merchants: food, retail and service shops | `pmf+2 moat+1` | **design** | Narrow the customer definition, so less is collected or taken on. A change to the product's scope. |
| 2 | `c1_segment` | Serve every live-commerce scenario and scale the number of avata | `business+2 ethics+1` | **policy** | Take on everything to raise volume. Different jobs, clients or categories mean the checks get thin. A company operating discipline. |
| 3 | `c1_problem` | Interview fifteen stores; confirm the pain is unstaffed night ho | `pmf+2` | **policy** | Interview users properly before building. Research discipline, set by the company. |
| 4 | `c1_problem` | Ship one-click celebrity-look hosts and acquire users with spect | `business+2 ethics+1` | **design** | Build a headline feature that removes the check. The mechanic itself is the defect. |
| 5 | `c1_problem` | Build what the biggest client wants: a bespoke version for one M | `business+3 pmf-1` | **policy** | Build for the largest buyer. Which customer the company serves is a company choice. |
| 6 | `c2_product` | Brand-exclusive avatars requiring the person to appear and autho | `pmf+2 moat+1` | **policy** | Build an evidence-based product. The method is a technical decision. |
| 7 | `c2_product` | Shared templates with one-click generation: no identity checks,  | `business+2 national_security+1` | **design** | Build the feature that aggregates, profiles or decides automatically. Whether to build it is a design decision. |
| 8 | `c2_keyresource` | Sign local models and students with explicit likeness and voice  | `pmf+1` | **policy** | Build the reference data in-house from official sources. Internal standard-setting. |
| 9 | `c2_keyresource` | Scrape influencer streams for the training set and get results f | `national_security+2 legal+1 pmf+1` | **law** | Plug in an outside source you cannot trace. Regulated cross-border or licensing exposure. |
| 10 | `c2_training` | Use authorised data only and accept slightly worse lip sync | `pmf+1` | **policy** | Use consented data only. Consent handling is a company practice. |
| 11 | `c2_training` | Blend in third-party libraries and scraped samples | `pmf+2 legal+2 ethics+2` | **law** | Buy or blend in material of unclear origin. Lawful basis is a legal question. |
| 12 | `c3_harm` | Publish known misuse patterns, add public-figure detection and h | `pmf+2 moat+1` | **design** | Publish limits, add review, fix the defect. Correcting systematic bias is technical. |
| 13 | `c3_harm` | Do nothing for now; write 'prohibited for disinformation' into t | `ethics+3 legal+1 business+1` | **law** | Ship and narrow the stated population. Legal responsibility for the harm is a legal question. |
| 14 | `cln_ops` | Turn the provenance list and licences into a deliverable standar | `pmf+1 moat+1` | **policy** | Turn provenance and licences into a standard deliverable. A company practice. |
| 15 | `cln_ops` | Make the demo dazzling first; supply licence docs only when pres | `business+2 ethics+1` | **policy** | Turn provenance and licences into a standard deliverable. A company practice. |
| 16 | `cln_money` | Monthly subscription stating that likeness and voice are never s | `business+2 moat+1` | **policy** | A written promise or contract term. A company commitment. |
| 17 | `cln_money` | Free generation plus revenue share, with assets sublicensable to | `business+4 legal+2 ethics+3` | **law** | Selling or sublicensing other people's material. Regulated; the company cannot fix it alone. |
| 18 | `cln_channel` | Build flagship references and district referrals; take only what | `business+1 pmf+1` | **policy** | How the company chooses to grow. An internal commercial decision. |
| 19 | `cln_channel` | Distribute through field sales with signing bonuses to drive sto | `business+3 legal+1 ethics+1` | **law** | Commission, rebate or advertising promises engage platform, agency, tax or consumer-protection rules. |
| 20 | `cln_deploy` | Conspicuous label plus invisible watermark and generation metada | `moat+1` | **design** | Whether a human decision-maker or a label stays in the product is a design choice. |
| 21 | `cln_deploy` | No label: users are paying for something that looks real | `business+2 legal+3 ethics+2` | **law** | Record-keeping and disclosure duties are set by law in this sector. |
| 22 | `drt_ops` | Pull the affected model, delete untraceable samples, go back for | `legal-1 ethics-1 pmf-1` | **policy** | Turn provenance and licences into a standard deliverable. A company practice. |
| 23 | `drt_ops` | Delay until someone formally asserts their rights | `pmf+1 legal+1 ethics+1` | **law** | Whether you may keep using the material at all is a legal question. |
| 24 | `drt_money` | Monthly subscription, no sublicensing — even if growth is slow | `business+2 moat+1` | **policy** | A written promise or contract term. A company commitment. |
| 25 | `drt_money` | Free generation plus revenue share, with assets sublicensable | `business+4 legal+2 ethics+3` | **law** | Selling or sublicensing other people's material. Regulated; the company cannot fix it alone. |
| 26 | `drt_channel` | Only do flagships you can serve; do not chase store count | `business+1 pmf+1` | **policy** | How the company chooses to grow. An internal commercial decision. |
| 27 | `drt_channel` | Distribute through field sales with signing bonuses to drive sto | `business+3 legal+1 ethics+1` | **law** | Commission, rebate or advertising promises engage platform, agency, tax or consumer-protection rules. |
| 28 | `drt_deploy` | Add conspicuous labels plus watermark and generation metadata | `moat+1` | **design** | Whether a human decision-maker or a label stays in the product is a design choice. |
| 29 | `drt_deploy` | No label: users are paying for something that looks real | `business+2 legal+3 ethics+2` | **law** | Record-keeping and disclosure duties are set by law in this sector. |
| 30 | `fxd_incident` | Commission an independent misuse audit, publish the findings and | `moat+2 business-1` | **design** | Build the detection, blocking or takedown capability into the product. |
| 31 | `fxd_incident` | Respond that the generator is neutral and users bear responsibil | `national_security+3 legal+2 business+1` | **law** | Whether the misuse is lawful and who bears the liability is a legal question. |
| 32 | `fxd_funding` | Take a local industry fund: slower expansion, assets and licence | `business+1 moat+2` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 33 | `fxd_funding` | Take strategic investment from an overseas short-video platform  | `business+3 national_security+2 legal+1` | **law** | Opening data interfaces to an overseas group raises regulated cross-border transfer. |
| 34 | `fxd_funding` | Take no funding; grow on subscriptions alone | `business-1 moat+1` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 35 | `ppr_incident` | Add public-figure detection and human review; apologise publicly | `ethics-1 legal-1 business-1 pmf+1` | **design** | Build the detection, blocking or takedown capability into the product. |
| 36 | `ppr_incident` | Stay silent, wait for the news cycle to pass, keep chasing sign- | `ethics+2 business+2` | **law** | Whether the misuse is lawful and who bears the liability is a legal question. |
| 37 | `ppr_funding` | Take a local industry fund: slower expansion, assets and licence | `business+1 moat+2` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 38 | `ppr_funding` | Take strategic investment from an overseas short-video platform  | `business+3 national_security+2 legal+1` | **law** | Opening data interfaces to an overseas group raises regulated cross-border transfer. |
| 39 | `ppr_funding` | Take no funding; grow on subscriptions alone | `business-1 moat+1` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |

## edu-analytics

| # | Node | Choice | Effects | Actor | Reason |
|---|---|---|---|---|---|
| 1 | `c1_segment` | Go deep on secondary schools: master marking and error attributi | `pmf+2 moat+1` | **design** | Narrow the customer definition, so less is collected or taken on. A change to the product's scope. |
| 2 | `c1_segment` | Cover all learning scenarios, add a parent app, and scale users  | `business+2 ethics+1` | **design** | Take on everything to raise volume. Different jobs, clients or categories mean the checks get thin. A company operating discipline. |
| 3 | `c1_problem` | Interview twelve teachers; confirm the pain is diagnosis, not ma | `pmf+2` | **policy** | Interview users properly before building. Research discipline, set by the company. |
| 4 | `c1_problem` | Ship one-click automatic comments and mistake books | `business+2 ethics+1` | **design** | Build a headline feature that removes the check. The mechanic itself is the defect. |
| 5 | `c1_problem` | Build what the biggest buyer wants: a district-level exam analyt | `business+3 pmf-1` | **policy** | Build for the largest buyer. Which customer the company serves is a company choice. |
| 6 | `c2_product` | Misconception diagnosis plus lesson planning, with evidence behi | `pmf+2 moat+1` | **design** | Build an evidence-based product. The method is a technical decision. |
| 7 | `c2_product` | Student profiles and ranking dashboards: a principal sees the wh | `business+2 national_security+1` | **design** | Build the feature that aggregates, profiles or decides automatically. Whether to build it is a design decision. |
| 8 | `c2_keyresource` | License from the publisher; start on public curriculum standards | `pmf+1` | **law** | Build the reference data in-house from official sources. Internal standard-setting. |
| 9 | `c2_keyresource` | Use scanned workbooks to build the knowledge base and get result | `national_security+2 legal+1 pmf+1` | **law** | Plug in an outside source you cannot trace. Regulated cross-border or licensing exposure. |
| 10 | `c2_training` | Use only data the school authorised in writing and accept a smal | `pmf+1` | **policy** | Use consented data only. Consent handling is a company practice. |
| 11 | `c2_training` | Blend in forum answers and third-party homework packs | `pmf+2 legal+2 ethics+2` | **law** | Buy or blend in material of unclear origin. Lawful basis is a legal question. |
| 12 | `edu-analytics_b1_clean` | Publish provenance and retention on one page for parents and tea | `pmf+1 moat+1` | **policy** | Publish provenance and limits as a deliverable. A disclosure practice. |
| 13 | `edu-analytics_b1_clean` | Claim compliance; release the detail when parents ask | `business+2 ethics+1` | **policy** | Claim compliance, produce the evidence only on demand. Honesty in disclosure is a company practice. |
| 14 | `edu-analytics_b1_dirty` | Delete the batch, retrain, and notify the school and parents in  | `legal-1 ethics-1 pmf-1` | **policy** | Stop, retrain, tell those affected in writing. Notification is a company practice. |
| 15 | `edu-analytics_b1_dirty` | Keep using it and secure the pilot school's renewal first | `pmf+1 legal+1 ethics+1` | **law** | Keep going until challenged. Whether the basis is lawful is a legal question. |
| 16 | `c3_harm` | Publish the limitations, reweight for school differences, add te | `pmf+2 moat+1` | **design** | Publish limits, add review, fix the defect. Correcting systematic bias is technical. |
| 17 | `c3_harm` | Ship now and declare it suitable for 'well-resourced schools' | `ethics+3 legal+1 business+1` | **law** | Ship and narrow the stated population. Legal responsibility for the harm is a legal question. |
| 18 | `edu-analytics_b2_fixed` | Write override rights and scope limits into both the product not | `moat+2` | **policy** | Write the limits and the review into contracts. A contractual commitment. |
| 19 | `edu-analytics_b2_fixed` | To make the system 'decisive', default the review to pass | `business+2 ethics+2` | **design** | Downgrade the safeguard to protect throughput. The safeguard itself is part of the product. |
| 20 | `edu-analytics_b2_paper` | Fix school-difference weighting, add teacher review, re-check ge | `ethics-1 legal-1 business-1 pmf+1` | **design** | Add the safeguard back and re-check past work. Re-checking is a system action. |
| 21 | `edu-analytics_b2_paper` | Leave it and expand the scope notes | `ethics+2 business+2` | **law** | Stay silent and rely on the clause or the letter. Liability is a legal matter. |
| 22 | `c4_incident` | Deny it and demand parents produce proof: the school is responsi | `national_security+3 legal+2 business+1` | **law** | Deny it and shift the responsibility. Regulators or the other party decide this, not the company. |
| 23 | `c4_incident` | Commission an independent data-compliance audit, publish a summa | `moat+2 business-1` | **policy** | Commission an audit, then freeze or mask the affected output. A product change. |
| 24 | `c4_incident` | Handle reactively: explain once when asked, then carry on as bef | `national_security+1 ethics+1 business+1` | **design** | Act only on the cases that get raised. The remedy is to act on every case. |
| 25 | `edu-analytics_b1_clean_money` | Per-grade subscription with a written promise never to export st | `business+2 moat+1` | **policy** | A written promise or contract term. A company commitment. |
| 26 | `edu-analytics_b1_clean_money` | Free to schools; sell 'needs-improvement lists' to tutoring comp | `business+4 legal+2 ethics+3` | **law** | Selling or sublicensing other people's material. Regulated; the company cannot fix it alone. |
| 27 | `edu-analytics_b1_clean_channel` | Become indispensable in one school and let research-group reputa | `business+1 pmf+1` | **policy** | How the company chooses to grow. An internal commercial decision. |
| 28 | `edu-analytics_b1_clean_channel` | Bundle with the reseller into district deals and advertise avera | `business+3 legal+1 ethics+1` | **law** | Commission, rebate or advertising promises engage platform, agency, tax or consumer-protection rules. |
| 29 | `edu-analytics_b1_clean_deploy` | AI drafts only, clearly labelled, never effective until a teache | `moat+1` | **design** | Whether a human decision-maker or a label stays in the product is a design choice. |
| 30 | `edu-analytics_b1_clean_deploy` | AI marks become final and system logs keep no record of the corr | `business+2 legal+3 ethics+2` | **law** | Record-keeping and disclosure duties are set by law in this sector. |
| 31 | `edu-analytics_b1_dirty_money` | Monthly subscription, promising never to train new models on que | `business+2 moat+1` | **policy** | A written promise or contract term. A company commitment. |
| 32 | `edu-analytics_b1_dirty_money` | Free to schools; sell 'needs-improvement lists' to tutoring comp | `business+4 legal+2 ethics+3` | **law** | Selling or sublicensing other people's material. Regulated; the company cannot fix it alone. |
| 33 | `edu-analytics_b1_dirty_channel` | Only do flagships you can serve; do not chase student count | `business+1 pmf+1` | **policy** | How the company chooses to grow. An internal commercial decision. |
| 34 | `edu-analytics_b1_dirty_channel` | Bundle with the reseller into district deals and advertise avera | `business+3 legal+1 ethics+1` | **law** | Commission, rebate or advertising promises engage platform, agency, tax or consumer-protection rules. |
| 35 | `edu-analytics_b1_dirty_deploy` | Add conspicuous labels plus a teacher review path | `moat+1` | **design** | Whether a human decision-maker or a label stays in the product is a design choice. |
| 36 | `edu-analytics_b1_dirty_deploy` | AI marks become final and system logs keep no record of the corr | `business+2 legal+3 ethics+2` | **law** | Record-keeping and disclosure duties are set by law in this sector. |
| 37 | `edu-analytics_b2_fixed_funding` | Take local education or industry funding: slower expansion, data | `business+1 moat+2` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 38 | `edu-analytics_b2_fixed_funding` | Take an offshore edtech fund and open your student-data interfac | `business+3 national_security+2 legal+1` | **law** | Opening data interfaces to an overseas group raises regulated cross-border transfer. |
| 39 | `edu-analytics_b2_fixed_funding` | Take no funding; grow on subscriptions alone | `business-1 moat+1` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 40 | `edu-analytics_b2_paper_funding` | Take local education or industry funding: slower expansion, data | `business+1 moat+2` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 41 | `edu-analytics_b2_paper_funding` | Take an offshore edtech fund and open your student-data interfac | `business+3 national_security+2 legal+1` | **law** | Opening data interfaces to an overseas group raises regulated cross-border transfer. |
| 42 | `edu-analytics_b2_paper_funding` | Take no funding; grow on subscriptions alone | `business-1 moat+1` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |

## drone-inspection

| # | Node | Choice | Effects | Actor | Reason |
|---|---|---|---|---|---|
| 1 | `c1_segment` | Go deep on infrastructure: bridges, water works and solar farms | `pmf+2 moat+1` | **design** | Narrow the customer definition, so less is collected or taken on. A change to the product's scope. |
| 2 | `c1_segment` | Take every aerial job going and grow logged flight hours | `business+2 ethics+1` | **policy** | Take on everything to raise volume. Different jobs, clients or categories mean the checks get thin. A company operating discipline. |
| 3 | `c1_problem` | Interview eight operators; confirm the pain is an auditable, com | `pmf+2` | **policy** | Interview users properly before building. Research discipline, set by the company. |
| 4 | `c1_problem` | Lead with 'ten times faster than humans' and take any job | `business+2 ethics+1` | **policy** | Build a headline feature that removes the check. The mechanic itself is the defect. |
| 5 | `c1_problem` | Build what the biggest buyer wants: a patrol version for one lar | `business+3 pmf-1` | **policy** | Build for the largest buyer. Which customer the company serves is a company choice. |
| 6 | `c2_product` | Edge recognition: upload only defect clips and coordinates | `pmf+2 moat+1` | **design** | Build an evidence-based product. The method is a technical decision. |
| 7 | `c2_product` | Live cloud mapping plus a complete imagery library | `business+2 national_security+1` | **design** | Build the feature that aggregates, profiles or decides automatically. Whether to build it is a design decision. |
| 8 | `c2_keyresource` | Use official airspace data and file permits case by case | `pmf+1` | **policy** | Build the reference data in-house from official sources. Internal standard-setting. |
| 9 | `c2_keyresource` | Plan with the overseas no-fly dataset and try to avoid sensitive | `national_security+2 legal+1 pmf+1` | **law** | Plug in an outside source you cannot trace. Regulated cross-border or licensing exposure. |
| 10 | `c2_training` | Use only your own flights and data clients authorised | `pmf+1` | **policy** | Use consented data only. Consent handling is a company practice. |
| 11 | `c2_training` | Blend in the external pack to fill the defect samples | `pmf+2 legal+2 ethics+2` | **law** | Buy or blend in material of unclear origin. Lawful basis is a legal question. |
| 12 | `drone-inspection_b1_clean` | Attach airspace approvals and image authorisations to every repo | `pmf+1 moat+1` | **policy** | Publish provenance and limits as a deliverable. A disclosure practice. |
| 13 | `drone-inspection_b1_clean` | Claim compliance; produce approvals only when challenged | `business+2 ethics+1` | **policy** | Claim compliance, produce the evidence only on demand. Honesty in disclosure is a company practice. |
| 14 | `drone-inspection_b1_dirty` | Stop using the pack, retrain, and tell clients in writing | `legal-1 ethics-1 pmf-1` | **policy** | Stop, retrain, tell those affected in writing. Notification is a company practice. |
| 15 | `drone-inspection_b1_dirty` | Keep using it and get these jobs delivered first | `pmf+1 legal+1 ethics+1` | **law** | Keep going until challenged. Whether the basis is lawful is a legal question. |
| 16 | `c3_harm` | Publish operating limits and require human review of low-confide | `pmf+2 moat+1` | **design** | Publish limits, add review, fix the defect. Correcting systematic bias is technical. |
| 17 | `c3_harm` | Ship it as reliable by default and put the limits into the liabi | `ethics+3 legal+1 business+1` | **law** | Ship and narrow the stated population. Legal responsibility for the harm is a legal question. |
| 18 | `drone-inspection_b2_fixed` | Write review records and operating limits into the contract anne | `moat+2` | **policy** | Write the limits and the review into contracts. A contractual commitment. |
| 19 | `drone-inspection_b2_fixed` | To keep the schedule, downgrade review to spot checks | `business+2 ethics+2` | **design** | Downgrade the safeguard to protect throughput. The safeguard itself is part of the product. |
| 20 | `drone-inspection_b2_paper` | Add mandatory review of low-confidence results and re-check the  | `ethics-1 legal-1 business-1 pmf+1` | **design** | Add the safeguard back and re-check past work. Re-checking is a system action. |
| 21 | `drone-inspection_b2_paper` | Rely on the liability clause and let the claim process run | `ethics+2 business+2` | **law** | Stay silent and rely on the clause or the letter. Liability is a legal matter. |
| 22 | `c4_incident` | Respond that clients set the routes and own the imagery | `national_security+3 legal+2 business+1` | **law** | Deny it and shift the responsibility. Regulators or the other party decide this, not the company. |
| 23 | `c4_incident` | Commission an independent survey-and-data audit, freeze imagery  | `moat+2 business-1` | **design** | Commission an audit, then freeze or mask the affected output. A product change. |
| 24 | `c4_incident` | Handle reactively: delete specific segments only after each inqu | `national_security+1 ethics+1 business+1` | **design** | Act only on the cases that get raised. The remedy is to act on every case. |
| 25 | `drone-inspection_b1_clean_money` | Charge per inspection distance, promising never to release image | `business+2 moat+1` | **policy** | A written promise or contract term. A company commitment. |
| 26 | `drone-inspection_b1_clean_money` | Inspect cheap or free, then sell the route imagery library to da | `business+4 legal+2 ethics+3` | **law** | Selling or sublicensing other people's material. Regulated; the company cannot fix it alone. |
| 27 | `drone-inspection_b1_clean_channel` | Grow on delivery quality and industry referrals; build reference | `business+1 pmf+1` | **policy** | How the company chooses to grow. An internal commercial decision. |
| 28 | `drone-inspection_b1_clean_channel` | Win with low bids and relationship management; prioritise projec | `business+3 legal+1 ethics+1` | **law** | Commission, rebate or advertising promises engage platform, agency, tax or consumer-protection rules. |
| 29 | `drone-inspection_b1_clean_deploy` | Keep full flight logs and geofence records, and accept being que | `moat+1` | **policy** | The disclosure, appeal and record-keeping processes the company operates. |
| 30 | `drone-inspection_b1_clean_deploy` | Turn logging and geofence records off: better coverage, fewer he | `business+2 legal+3 ethics+2` | **law** | Record-keeping and disclosure duties are set by law in this sector. |
| 31 | `drone-inspection_b1_dirty_money` | Monthly subscription, promising never to train new models on que | `business+2 moat+1` | **policy** | A written promise or contract term. A company commitment. |
| 32 | `drone-inspection_b1_dirty_money` | Cheap inspection plus selling the route imagery library to data  | `business+4 legal+2 ethics+3` | **law** | Selling or sublicensing other people's material. Regulated; the company cannot fix it alone. |
| 33 | `drone-inspection_b1_dirty_channel` | Only do flagships you can serve; do not chase client count | `business+1 pmf+1` | **policy** | How the company chooses to grow. An internal commercial decision. |
| 34 | `drone-inspection_b1_dirty_channel` | Low bids plus relationship management to drive project count | `business+3 legal+1 ethics+1` | **law** | Commission, rebate or advertising promises engage platform, agency, tax or consumer-protection rules. |
| 35 | `drone-inspection_b1_dirty_deploy` | Add full flight logs and geofence records | `moat+1` | **policy** | The disclosure, appeal and record-keeping processes the company operates. |
| 36 | `drone-inspection_b1_dirty_deploy` | Turn logging and geofence records off: better coverage, fewer he | `business+2 legal+3 ethics+2` | **law** | Record-keeping and disclosure duties are set by law in this sector. |
| 37 | `drone-inspection_b2_fixed_funding` | Take a local industry fund: slower expansion, data and complianc | `business+1 moat+2` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 38 | `drone-inspection_b2_fixed_funding` | Take offshore funding and make your imagery searchable for its g | `business+3 national_security+2 legal+1` | **law** | Opening data interfaces to an overseas group raises regulated cross-border transfer. |
| 39 | `drone-inspection_b2_fixed_funding` | Take no funding; grow on service fees alone | `business-1 moat+1` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 40 | `drone-inspection_b2_paper_funding` | Take a local industry fund: slower expansion, data and complianc | `business+1 moat+2` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 41 | `drone-inspection_b2_paper_funding` | Take offshore funding and make your imagery searchable for its g | `business+3 national_security+2 legal+1` | **law** | Opening data interfaces to an overseas group raises regulated cross-border transfer. |
| 42 | `drone-inspection_b2_paper_funding` | Take no funding; grow on service fees alone | `business-1 moat+1` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |

## trade-doc-ai

| # | Node | Choice | Effects | Actor | Reason |
|---|---|---|---|---|---|
| 1 | `c1_segment` | Go deep on small exporters: hardware, auto parts and appliances | `pmf+2 moat+1` | **design** | Narrow the customer definition, so less is collected or taken on. A change to the product's scope. |
| 2 | `c1_segment` | Serve every forwarder and customs broker; scale document volume  | `business+2 ethics+1` | **policy** | Take on everything to raise volume. Different jobs, clients or categories mean the checks get thin. A company operating discipline. |
| 3 | `c1_problem` | Interview ten firms; confirm the pain is uncertain classificatio | `pmf+2` | **policy** | Interview users properly before building. Research discipline, set by the company. |
| 4 | `c1_problem` | Lead with 'one click generates your full declaration pack' | `business+2 ethics+1` | **design** | Build a headline feature that removes the check. The mechanic itself is the defect. |
| 5 | `c1_problem` | Build what the biggest buyer wants: a bespoke integration for on | `business+3 pmf-1` | **policy** | Build for the largest buyer. Which customer the company serves is a company choice. |
| 6 | `c2_product` | A document assistant: organise files, flag doubts, leave classif | `pmf+2 moat+1` | **design** | Build an evidence-based product. The method is a technical decision. |
| 7 | `c2_product` | Fully automated: output declarations ready to submit | `business+2 national_security+1` | **design** | Build the feature that aggregates, profiles or decides automatically. Whether to build it is a design decision. |
| 8 | `c2_keyresource` | Use only the latest official tariff codes and control lists | `pmf+1` | **policy** | Build the reference data in-house from official sources. Internal standard-setting. |
| 9 | `c2_keyresource` | Plug in the list library of unclear provenance for better covera | `national_security+2 legal+1 pmf+1` | **law** | Plug in an outside source you cannot trace. Regulated cross-border or licensing exposure. |
| 10 | `c2_training` | Use only documents clients authorised in writing and accept a li | `pmf+1` | **policy** | Use consented data only. Consent handling is a company practice. |
| 11 | `c2_training` | Blend in sample documents obtained from external channels | `pmf+2 legal+2 ethics+2` | **law** | Buy or blend in material of unclear origin. Lawful basis is a legal question. |
| 12 | `trade-doc-ai_b1_clean` | Give clients a statement of what was authorised and when it is d | `pmf+1 moat+1` | **policy** | Publish provenance and limits as a deliverable. A disclosure practice. |
| 13 | `trade-doc-ai_b1_clean` | Claim compliance; assemble the authorisation list when inspected | `business+2 ethics+1` | **policy** | Claim compliance, produce the evidence only on demand. Honesty in disclosure is a company practice. |
| 14 | `trade-doc-ai_b1_dirty` | Stop using the batch, retrain, and tell clients in writing | `legal-1 ethics-1 pmf-1` | **policy** | Stop, retrain, tell those affected in writing. Notification is a company practice. |
| 15 | `trade-doc-ai_b1_dirty` | Keep using it and clear the peak-season backlog first | `pmf+1 legal+1 ethics+1 national_security+1` | **law** | Keep going until challenged. Whether the basis is lawful is a legal question. |
| 16 | `c3_harm` | Add hard-rule blocking and human review for controlled-item matc | `pmf+2 moat+1` | **design** | Publish limits, add review, fix the defect. Correcting systematic bias is technical. |
| 17 | `c3_harm` | Keep it as is and state 'the client bears final responsibility' | `ethics+3 legal+1 business+1` | **law** | Ship and narrow the stated population. Legal responsibility for the harm is a legal question. |
| 18 | `trade-doc-ai_b2_fixed` | Write the blocking rules and review logs into the service agreem | `moat+2` | **policy** | Write the limits and the review into contracts. A contractual commitment. |
| 19 | `trade-doc-ai_b2_fixed` | To protect turnaround, downgrade blocking to a warning the clien | `business+2 ethics+2` | **design** | Downgrade the safeguard to protect throughput. The safeguard itself is part of the product. |
| 20 | `trade-doc-ai_b2_paper` | Add hard-rule blocking and human review; re-check past classific | `ethics-1 legal-1 business-1 pmf+1` | **design** | Add the safeguard back and re-check past work. Re-checking is a system action. |
| 21 | `trade-doc-ai_b2_paper` | Leave it and sharpen the notification letter | `ethics+2 business+2 national_security+1` | **law** | Stay silent and rely on the clause or the letter. Liability is a legal matter. |
| 22 | `c4_incident` | Respond that you only process text and declarants are responsibl | `national_security+3 legal+2 business+1` | **law** | Deny it and shift the responsibility. Regulators or the other party decide this, not the company. |
| 23 | `c4_incident` | Commission an export-control audit, freeze auto-generation for h | `moat+2 business-1` | **design** | Commission an audit, then freeze or mask the affected output. A product change. |
| 24 | `c4_incident` | Handle reactively: suspend only the batches that get flagged | `national_security+1 ethics+1 business+1` | **design** | Act only on the cases that get raised. The remedy is to act on every case. |
| 25 | `trade-doc-ai_b1_clean_money` | Charge per document, with a written promise never to take any po | `business+2 moat+1` | **policy** | A written promise or contract term. A company commitment. |
| 26 | `trade-doc-ai_b1_clean_money` | Take a share of the duty you save clients, and lean classificati | `business+4 legal+2 ethics+3` | **design** | The payment model itself rewards the wrong outcome. An incentive-design problem. |
| 27 | `trade-doc-ai_b1_clean_channel` | Go deep in one chamber of commerce and let peer word of mouth sp | `business+1 pmf+1` | **policy** | How the company chooses to grow. An internal commercial decision. |
| 28 | `trade-doc-ai_b1_clean_channel` | Spend heavily on ads promising 'clears every time, one step fewe | `business+3 legal+1 ethics+1` | **law** | Commission, rebate or advertising promises engage platform, agency, tax or consumer-protection rules. |
| 29 | `trade-doc-ai_b1_clean_deploy` | Retain suggested classifications and every edit so decisions are | `moat+1` | **policy** | The disclosure, appeal and record-keeping processes the company operates. |
| 30 | `trade-doc-ai_b1_clean_deploy` | Keep no validation trail; market the tool as lightweight | `business+2 legal+3 ethics+2` | **law** | Record-keeping and disclosure duties are set by law in this sector. |
| 31 | `trade-doc-ai_b1_dirty_money` | Monthly subscription, with a written promise never to train new  | `business+2 moat+1` | **policy** | A written promise or contract term. A company commitment. |
| 32 | `trade-doc-ai_b1_dirty_money` | Free tool; sell 'de-identified' document records to trade consul | `business+4 legal+2 ethics+3` | **law** | Selling or sublicensing other people's material. Regulated; the company cannot fix it alone. |
| 33 | `trade-doc-ai_b1_dirty_channel` | Only do flagship clients you can serve; do not chase client coun | `business+1 pmf+1` | **policy** | How the company chooses to grow. An internal commercial decision. |
| 34 | `trade-doc-ai_b1_dirty_channel` | Paid acquisition plus a 'clears every time' promise to climb the | `business+3 legal+1 ethics+1` | **law** | Commission, rebate or advertising promises engage platform, agency, tax or consumer-protection rules. |
| 35 | `trade-doc-ai_b1_dirty_deploy` | Add full logging, and keep a human-review channel | `moat+1` | **policy** | The disclosure, appeal and record-keeping processes the company operates. |
| 36 | `trade-doc-ai_b1_dirty_deploy` | Keep no validation trail; market the tool as lightweight | `business+2 legal+3 ethics+2` | **law** | Record-keeping and disclosure duties are set by law in this sector. |
| 37 | `trade-doc-ai_b2_fixed_funding` | Take a local industry fund: slower expansion, data and complianc | `business+1 moat+2` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 38 | `trade-doc-ai_b2_fixed_funding` | Take an offshore trade fund and open your document data to its g | `business+3 national_security+2 legal+1` | **law** | Opening data interfaces to an overseas group raises regulated cross-border transfer. |
| 39 | `trade-doc-ai_b2_fixed_funding` | Take no funding; grow on service fees alone | `business-1 moat+1` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 40 | `trade-doc-ai_b2_paper_funding` | Take a local industry fund: slower expansion, data and complianc | `business+1 moat+2` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |
| 41 | `trade-doc-ai_b2_paper_funding` | Take an offshore trade fund and open your document data to its g | `business+3 national_security+2 legal+1` | **law** | Opening data interfaces to an overseas group raises regulated cross-border transfer. |
| 42 | `trade-doc-ai_b2_paper_funding` | Take no funding; grow on service fees alone | `business-1 moat+1` | **policy** | Which investor to take, and on what terms. An internal commercial decision. |

## Distribution

| Actor | Count | Share |
|---|---|---|
| design | 57 | 22% |
| policy | 108 | 43% |
| law | 84 | 33% |
| **total** | **249** | |

