/* ==========================================================================
   Legal library — Act / Regulation → section / regulation → sub-regulation
   --------------------------------------------------------------------------
   ILLUSTRATIVE ONLY. Legislation names are real South African instruments,
   but section / regulation numbers, wording and applicability are summarised
   for demonstration and MUST be verified by a competent person. References
   marked "(verify)" are known to need confirmation of the exact number.

   Each sub-item lists:
     ob  — obligations: what must be in place to BE compliant. Each has a
           'k' (kind) that tells the system how to check existing records:
           doc, appt, training, asset, insp, drill, chem, risk, ppe, incident,
           firstaid, audit, actions, manual (needs confirmation with evidence)
     mt  — maintain: recurring activities to STAY compliant
   ========================================================================== */
'use strict';

const O = (t, k, x = {}) => Object.assign({ t, k }, x);
const LEGAL_LIBRARY = [
  { id: 'OHSA', type: 'Act', name: 'Occupational Health and Safety Act 85 of 1993', parts: [
    { id: 'OHSA-7', ref: 'Section 7', title: 'Health and safety policy', items: [
      { id: 'OHSA-7-1', ref: 's7', title: 'Written health and safety policy (where directed by the chief inspector; good practice for all)', text: 'Prepare a written policy on the protection of the health and safety of employees, signed by the CEO and displayed prominently.', freq: 12,
        ob: [O('Signed HSEQ / H&S policy issued for use', 'doc', { cat: 'Policy' }), O('Policy displayed prominently at the workplace', 'manual')],
        mt: [O('Review the policy annually and re-sign', 'review', { every: 'Annually' })] }
    ] },
    { id: 'OHSA-8', ref: 'Section 8', title: 'General duties of employers to their employees', items: [
      { id: 'OHSA-8-2a', ref: 's8(2)(a)', title: 'Safe plant and systems of work', text: 'Provide and maintain systems of work, plant and machinery that are, as far as reasonably practicable, safe and without risks to health.', freq: 12,
        ob: [O('Safe work procedures issued for high-risk tasks', 'doc', { cat: 'Safe Work Procedure' }), O('Plant and equipment certificates current', 'asset', { any: true }), O('Workplace inspections scheduled and up to date', 'insp', { tpl: 'TPL-WS' })],
        mt: [O('Monthly workplace inspection', 'insp', { tpl: 'TPL-WS', every: 'Monthly', days: 30 }), O('Planned maintenance of plant', 'review', { every: 'Per maintenance plan' })] },
      { id: 'OHSA-8-2b', ref: 's8(2)(b)', title: 'Eliminate or mitigate hazards before resorting to PPE', text: 'Take steps to eliminate or mitigate any hazard or potential hazard before resorting to personal protective equipment.', freq: 12,
        ob: [O('Risk assessments approved and within review date', 'risk'), O('Additional controls implemented (no overdue corrective actions)', 'actions')],
        mt: [O('Review risk assessments at least annually or after change / incident', 'review', { every: 'Annually' })] },
      { id: 'OHSA-8-2d', ref: 's8(2)(d)', title: 'Hazard identification and precautionary measures', text: 'Establish what hazards to health or safety are attached to work performed and the precautionary measures required.', freq: 12,
        ob: [O('Baseline / issue-based risk assessments approved', 'risk'), O('Hazardous chemicals identified with current SDSs', 'chem')],
        mt: [O('Annual baseline risk assessment review', 'review', { every: 'Annually' })] },
      { id: 'OHSA-8-2e', ref: 's8(2)(e)', title: 'Information, instructions, training and supervision', text: 'Provide information, instructions, training and supervision necessary to ensure the health and safety of employees.', freq: 12,
        ob: [O('HSEQ induction completed and current', 'training', { course: 'CRS-IND' }), O('Task-specific training per training matrix current', 'trainingAll'), O('Competency of operators verified', 'manual')],
        mt: [O('Annual induction refresher', 'review', { every: 'Annually' }), O('Monitor training expiry (training matrix)', 'review', { every: 'Continuous' })] }
    ] },
    { id: 'OHSA-9', ref: 'Section 9', title: 'Duties to persons other than employees', items: [
      { id: 'OHSA-9-1', ref: 's9(1)', title: 'Contractors, visitors and the public', text: 'Conduct the undertaking so that persons other than employees who may be directly affected are not exposed to hazards.', freq: 12,
        ob: [O('Contractor management procedure issued', 'doc', { kw: 'Contractor' }), O('Visitor induction / sign-in in place', 'manual')],
        mt: [O('Annual review of contractor safety files', 'review', { every: 'Annually' })] }
    ] },
    { id: 'OHSA-16', ref: 'Section 16', title: 'Chief executive officer charged with certain duties', items: [
      { id: 'OHSA-16-1', ref: 's16(1)', title: 'CEO accountability', text: 'The CEO shall as far as is reasonably practicable ensure that the duties of the employer are properly discharged.', freq: 12,
        ob: [O('Management review of HSEQ performance held', 'manual')], mt: [O('Quarterly management review of compliance dashboard', 'review', { every: 'Quarterly' })] },
      { id: 'OHSA-16-2', ref: 's16(2)', title: 'Assignment of duties', text: 'The CEO may assign duties to persons under his or her control; assignment does not relieve the CEO of responsibility.', freq: 12,
        ob: [O('Written 16(2) assignment, accepted by the assignee', 'appt', { kw: '16(2)' })], mt: [O('Renew assignment on change of person / expiry', 'review', { every: 'On change' })] }
    ] },
    { id: 'OHSA-17', ref: 'Section 17', title: 'Health and safety representatives', items: [
      { id: 'OHSA-17-1', ref: 's17(1)', title: 'Designation of H&S representatives', text: 'An employer with more than 20 employees shall designate health and safety representatives in the prescribed ratio.', freq: 12,
        ob: [O('H&S representative(s) designated in writing', 'appt', { kw: 'Health & safety representative' }), O('H&S representatives trained', 'training', { course: 'CRS-HSR' })],
        mt: [O('Representatives conduct monthly workplace inspections', 'insp', { tpl: 'TPL-WS', every: 'Monthly', days: 30 }), O('Re-designate on resignation / expiry', 'review', { every: 'On change' })] }
    ] },
    { id: 'OHSA-19', ref: 'Section 19', title: 'Health and safety committees', items: [
      { id: 'OHSA-19-1', ref: 's19(1)', title: 'Establish H&S committee', text: 'Where two or more H&S representatives are designated, establish one or more health and safety committees.', freq: 12,
        ob: [O('Committee constituted with terms of reference', 'manual')], mt: [O('Committee meets at least once every three months; minutes kept', 'review', { every: 'Quarterly' })] }
    ] },
    { id: 'OHSA-24', ref: 'Section 24', title: 'Report to inspector regarding certain incidents', items: [
      { id: 'OHSA-24-1', ref: 's24', title: 'Reporting qualifying incidents', text: 'Report qualifying incidents (e.g. death, serious injury, major incident) to an inspector within the prescribed period.', freq: 12,
        ob: [O('Incident reporting procedure issued', 'doc', { kw: 'Incident' }), O('Incidents reported and investigated promptly', 'incident'), O('Competent incident investigator appointed', 'appt', { kw: 'Incident investigator' })],
        mt: [O('Monthly incident register review', 'review', { every: 'Monthly' })] }
    ] },
    { id: 'OHSA-37', ref: 'Section 37', title: 'Acts or omissions by employees or mandataries', items: [
      { id: 'OHSA-37-2', ref: 's37(2)', title: 'Written agreement with mandataries (contractors)', text: 'Enter into a written agreement with mandataries regarding arrangements and procedures to ensure compliance with the Act.', freq: 12,
        ob: [O('Contractor management procedure incl. agreement template', 'doc', { kw: 'Contractor' }), O('Signed agreements on file for active contractors', 'manual')],
        mt: [O('Check agreements before each new contract', 'review', { every: 'Per contract' })] }
    ] }
  ] },
  { id: 'GAR', type: 'Regulation', name: 'General Administrative Regulations, 2003 (OHS Act)', parts: [
    { id: 'GAR-A', ref: 'Administrative', title: 'Copy of the Act and records', items: [
      { id: 'GAR-4', ref: 'reg. 4 (verify)', title: 'Copy of the Act available to employees', text: 'Keep a copy of the Act and relevant regulations readily available for perusal by employees.', freq: 12,
        ob: [O('Current copy of the Act and regulations available on site', 'manual')], mt: [O('Annual check that copies are current', 'review', { every: 'Annually' })] }
    ] },
    { id: 'GAR-I', ref: 'Incidents', title: 'Recording, investigation and reporting of incidents', items: [
      { id: 'GAR-8', ref: 'reg. 8 (verify)', title: 'Recording and investigation of incidents', text: 'Record and investigate incidents that must be reported, and keep the records available for inspection.', freq: 12,
        ob: [O('Incident register maintained; incidents investigated', 'incident'), O('Incident investigator appointed', 'appt', { kw: 'Incident investigator' }), O('Investigation training completed', 'training', { course: 'CRS-INV' })],
        mt: [O('Monthly incident register review', 'review', { every: 'Monthly' })] },
      { id: 'GAR-9', ref: 'reg. 9 (verify)', title: 'Reporting of incidents to the inspector', text: 'Report qualifying incidents to the provincial director in the prescribed form and period.', freq: 12,
        ob: [O('Reporting procedure issued', 'doc', { kw: 'Incident' }), O('Reportability assessed for each incident', 'manual')], mt: [O('Review reportability on every incident', 'review', { every: 'Per incident' })] }
    ] }
  ] },
  { id: 'GSR', type: 'Regulation', name: 'General Safety Regulations (OHS Act)', parts: [
    { id: 'GSR-2', ref: 'reg. 2', title: 'Personal safety equipment and facilities', items: [
      { id: 'GSR-2-1', ref: 'reg. 2', title: 'Provide suitable PPE free of charge', text: 'Where it is not practicable to make the work environment safe, provide suitable PPE, and ensure it is used and maintained.', freq: 12,
        ob: [O('PPE requirements identified in risk assessments', 'risk'), O('PPE issued, signed for and within replacement date', 'ppe')],
        mt: [O('Monitor PPE replacement and stock levels', 'review', { every: 'Monthly' })] }
    ] },
    { id: 'GSR-2A', ref: 'reg. 2A', title: 'Intoxication', items: [
      { id: 'GSR-2A-1', ref: 'reg. 2A', title: 'No intoxicated persons at the workplace', text: 'Do not permit intoxicated persons to enter or remain at the workplace.', freq: 12,
        ob: [O('Alcohol & drug policy / procedure', 'manual'), O('Testing or screening arrangements', 'manual')], mt: [O('Record screening results', 'review', { every: 'Per shift / random' })] }
    ] },
    { id: 'GSR-3', ref: 'reg. 3', title: 'First aid, emergency equipment and procedures', items: [
      { id: 'GSR-3-1', ref: 'reg. 3', title: 'Trained first aiders in the prescribed ratio', text: 'Where more than 10 employees are present, ensure a sufficient number of persons with a valid first aid certificate (ratio to be verified).', freq: 12,
        ob: [O('First aiders appointed', 'appt', { kw: 'First aider' }), O('First aid certificates valid', 'training', { course: 'CRS-FA1' })],
        mt: [O('Renew first aid certificates before expiry', 'review', { every: 'Every 3 years' })] },
      { id: 'GSR-3-2', ref: 'reg. 3', title: 'First aid boxes and emergency equipment', text: 'Provide first aid boxes with prescribed contents, readily accessible, and keep them stocked.', freq: 12,
        ob: [O('First aid boxes checked and stocked', 'firstaid')], mt: [O('Monthly first aid box checks', 'firstaid', { every: 'Monthly' })] }
    ] },
    { id: 'GSR-4', ref: 'reg. 4', title: 'Use and storage of flammable liquids', items: [
      { id: 'GSR-4-1', ref: 'reg. 4', title: 'Safe storage and use of flammable liquids', text: 'Store and use flammable liquids so as to prevent fire; limit quantities in workrooms; use approved storage.', freq: 12,
        ob: [O('Flammable products registered with current SDSs', 'chem'), O('Approved flammable store / cabinet in place', 'manual')],
        mt: [O('Quarterly chemical store inspection', 'insp', { tpl: 'TPL-CHEM', every: 'Quarterly', days: 90 })] }
    ] },
    { id: 'GSR-8', ref: 'reg. 8', title: 'Stacking of articles', items: [
      { id: 'GSR-8-1', ref: 'reg. 8', title: 'Stacking and racking under supervision of a competent person', text: 'Stack articles safely, under supervision of a competent person, with racking suitable and not overloaded.', freq: 12,
        ob: [O('Stacking supervisor appointed', 'appt', { kw: 'Stacking' }), O('Racking inspection certificates current', 'asset', { type: 'AT-RACK' }), O('Racking inspections up to date', 'insp', { tpl: 'TPL-RACK' })],
        mt: [O('Six-monthly racking inspection', 'insp', { tpl: 'TPL-RACK', every: 'Six-monthly', days: 180 }), O('Annual competent-person racking inspection', 'review', { every: 'Annually' })] }
    ] },
    { id: 'GSR-13A', ref: 'reg. 13A', title: 'Ladders', items: [
      { id: 'GSR-13A-1', ref: 'reg. 13A', title: 'Ladders safe and inspected', text: 'Ensure ladders are of sound construction, suitable and inspected; damaged ladders withdrawn.', freq: 12,
        ob: [O('Ladders included in workplace inspections', 'insp', { tpl: 'TPL-WS' })], mt: [O('Monthly workplace inspection', 'insp', { tpl: 'TPL-WS', every: 'Monthly', days: 30 })] }
    ] }
  ] },
  { id: 'ERW', type: 'Regulation', name: 'Environmental Regulations for Workplaces, 1987 (OHS Act)', parts: [
    { id: 'ERW-3', ref: 'reg. 3', title: 'Lighting', items: [
      { id: 'ERW-3-1', ref: 'reg. 3', title: 'Adequate lighting levels', text: 'Ensure workplaces are lit to the prescribed levels.', freq: 24,
        ob: [O('Lighting survey by approved inspection authority / competent person', 'manual')], mt: [O('Repeat lighting survey after changes or every 2 years (internal policy)', 'review', { every: 'Every 2 years' })] }
    ] },
    { id: 'ERW-9', ref: 'reg. 9', title: 'Fire precautions and means of egress', items: [
      { id: 'ERW-9-1', ref: 'reg. 9', title: 'Firefighting equipment provided and maintained', text: 'Provide sufficient, suitable firefighting equipment, maintained in good order and serviced.', freq: 12,
        ob: [O('Fire equipment service certificates current', 'asset', { type: 'AT-FIRE' }), O('Monthly fire equipment inspections up to date', 'insp', { tpl: 'TPL-FE' })],
        mt: [O('Monthly fire equipment inspection', 'insp', { tpl: 'TPL-FE', every: 'Monthly', days: 30 }), O('Annual service by accredited provider', 'review', { every: 'Annually' })] },
      { id: 'ERW-9-2', ref: 'reg. 9', title: 'Escape routes, emergency plan and evacuation', text: 'Keep escape routes clear and marked, and ensure employees can evacuate safely.', freq: 12,
        ob: [O('Emergency response plan issued for the site', 'doc', { cat: 'Emergency Plan' }), O('Evacuation drill completed in the last 12 months', 'drill'), O('Fire fighters / emergency team appointed and trained', 'appt', { kw: 'Fire fighter' })],
        mt: [O('Evacuation drill at least annually (6-monthly recommended)', 'drill', { every: 'Six-monthly', days: 182 }), O('Annual emergency plan review', 'review', { every: 'Annually' })] }
    ] }
  ] },
  { id: 'FAC', type: 'Regulation', name: 'Facilities Regulations, 2004 (OHS Act)', parts: [
    { id: 'FAC-S', ref: 'Sanitation', title: 'Sanitary, changing and eating facilities', items: [
      { id: 'FAC-S-1', ref: 'regs (verify)', title: 'Toilets, washing and changing facilities', text: 'Provide sanitary, washing and changing facilities in the prescribed numbers, clean and maintained.', freq: 12,
        ob: [O('Facilities included in workplace inspections', 'insp', { tpl: 'TPL-WS' }), O('Facility numbers meet headcount requirements', 'manual')], mt: [O('Monthly workplace inspection', 'insp', { tpl: 'TPL-WS', every: 'Monthly', days: 30 })] }
    ] }
  ] },
  { id: 'DMR', type: 'Regulation', name: 'Driven Machinery Regulations, 2015 (OHS Act)', parts: [
    { id: 'DMR-LM', ref: 'Lifting machines & tackle (verify reg. no.)', title: 'Lifting machines and lifting tackle', items: [
      { id: 'DMR-LM-1', ref: 'Lifting machines (verify)', title: 'Examination and load testing of lifting machines', text: 'Lifting machines (incl. forklifts and cranes) examined and load tested by a competent lifting machine inspector at prescribed intervals.', freq: 12,
        ob: [O('Forklift load-test certificates current', 'asset', { type: 'AT-FL' }), O('Crane load-test certificates current', 'asset', { type: 'AT-CRANE' }), O('Lifting machinery supervisor appointed', 'appt', { kw: 'Lifting machinery' })],
        mt: [O('Monthly forklift inspection', 'insp', { tpl: 'TPL-FL', every: 'Monthly', days: 30 }), O('Annual examination & load test', 'review', { every: 'Annually' })] },
      { id: 'DMR-LM-2', ref: 'Lifting tackle (verify)', title: 'Lifting tackle register and inspection', text: 'Keep a register of lifting tackle; inspect at prescribed intervals; withdraw defective tackle.', freq: 12,
        ob: [O('Lifting tackle inspection certificates current', 'asset', { type: 'AT-TACKLE' })], mt: [O('Tackle inspections per register', 'review', { every: 'Quarterly / six-monthly' })] },
      { id: 'DMR-LM-3', ref: 'Operators (verify)', title: 'Trained and authorised operators', text: 'Only trained and authorised persons may operate lifting machines.', freq: 12,
        ob: [O('Forklift operator training current', 'training', { course: 'CRS-FLT' }), O('Operator competency verified and authorised', 'manual')], mt: [O('Retraining before certificate expiry', 'review', { every: 'Every 2 years' })] }
    ] }
  ] },
  { id: 'EIR', type: 'Regulation', name: 'Electrical Installation Regulations, 2009 (OHS Act)', parts: [
    { id: 'EIR-7', ref: 'reg. 7 (verify)', title: 'Certificate of compliance', items: [
      { id: 'EIR-7-1', ref: 'reg. 7 (verify)', title: 'Valid certificate of compliance for the installation', text: 'Hold a valid certificate of compliance for every electrical installation, issued by a registered person.', freq: 24,
        ob: [O('Certificate of compliance on file in Document Control', 'doc', { cat: 'Certificate', kw: 'Compliance' })], mt: [O('New CoC after any alteration or addition', 'review', { every: 'On change' })] },
      { id: 'EIR-7-2', ref: 'Work by registered persons (verify)', title: 'Electrical work by registered persons only', text: 'Electrical installation work only by or under supervision of a registered person.', freq: 12,
        ob: [O('Contractor registration verified on file', 'manual')], mt: [O('Check registration before each job', 'review', { every: 'Per job' })] }
    ] }
  ] },
  { id: 'EMR', type: 'Regulation', name: 'Electrical Machinery Regulations, 2011 (OHS Act)', parts: [
    { id: 'EMR-P', ref: 'Portable equipment (verify)', title: 'Portable electrical equipment', items: [
      { id: 'EMR-P-1', ref: 'Portable equipment (verify)', title: 'Portable tools safe and tested', text: 'Portable electrical equipment safe, protected (earth-leakage) and periodically tested.', freq: 12,
        ob: [O('Portable appliance test records current', 'asset', { type: 'AT-TOOL' })], mt: [O('Six-monthly portable appliance testing (internal policy)', 'review', { every: 'Six-monthly' })] }
    ] }
  ] },
  { id: 'HCA', type: 'Regulation', name: 'Hazardous Chemical Agents Regulations, 2021 (OHS Act)', parts: [
    { id: 'HCA-I', ref: 'Information & training (verify)', title: 'Information, instruction and training', items: [
      { id: 'HCA-I-1', ref: 'Information & training (verify)', title: 'Train exposed employees', text: 'Inform and train employees who may be exposed on hazards, precautions, PPE and emergency procedures.', freq: 12,
        ob: [O('HCA awareness training current', 'training', { course: 'CRS-HCA' })], mt: [O('Refresher training', 'review', { every: 'Every 2 years' })] }
    ] },
    { id: 'HCA-R', ref: 'Risk assessment (verify)', title: 'Risk assessment and control of exposure', items: [
      { id: 'HCA-R-1', ref: 'Risk assessment (verify)', title: 'Assess exposure to hazardous chemical agents', text: 'Assess the risk of exposure and record the assessment; review periodically and after changes.', freq: 12,
        ob: [O('Chemical risk assessment approved and current', 'risk'), O('Chemical management procedure issued', 'doc', { kw: 'Chemical' })], mt: [O('Review assessment at prescribed interval / after change', 'review', { every: 'Per assessment' })] },
      { id: 'HCA-R-2', ref: 'Control & PPE (verify)', title: 'Control of exposure and PPE', text: 'Control exposure using the hierarchy of controls; provide and maintain suitable PPE.', freq: 12,
        ob: [O('PPE issued and current', 'ppe'), O('Corrective actions for chemical controls on schedule', 'actions')], mt: [O('Quarterly chemical store inspection', 'insp', { tpl: 'TPL-CHEM', every: 'Quarterly', days: 90 })] }
    ] },
    { id: 'HCA-S', ref: 'Labelling & SDS (verify)', title: 'Safety data sheets and labelling', items: [
      { id: 'HCA-S-1', ref: 'SDS (verify)', title: 'Current SDS available for every hazardous chemical', text: 'Keep a current safety data sheet for every hazardous chemical agent and make it available to employees.', freq: 12,
        ob: [O('All chemicals have a current SDS in Document Control', 'chem')], mt: [O('SDS review cycle (internal: every 2 years or when supplier updates)', 'review', { every: 'Every 2 years' })] },
      { id: 'HCA-S-2', ref: 'Medical surveillance (verify)', title: 'Medical surveillance where required', text: 'Place employees under medical surveillance where exposure warrants it.', freq: 12,
        ob: [O('Medical surveillance programme in place (restricted records)', 'manual')], mt: [O('Periodic medical examinations', 'review', { every: 'Per programme' })] }
    ] }
  ] },
  { id: 'PER', type: 'Regulation', name: 'Pressure Equipment Regulations, 2009 (OHS Act)', parts: [
    { id: 'PER-I', ref: 'Inspection & testing (verify)', title: 'Periodic inspection and testing', items: [
      { id: 'PER-I-1', ref: 'Inspection & testing (verify)', title: 'Pressure equipment inspected and tested at intervals', text: 'Have pressure equipment (e.g. air receivers) inspected and tested by an approved inspection authority at prescribed intervals.', freq: 12,
        ob: [O('Pressure equipment certificates current', 'asset', { type: 'AT-COMP' })], mt: [O('Inspection at prescribed interval', 'review', { every: 'Per AIA schedule' })] }
    ] }
  ] },
  { id: 'NIHL', type: 'Regulation', name: 'Noise-Induced Hearing Loss Regulations, 2003 (OHS Act)', parts: [
    { id: 'NIHL-A', ref: 'Assessment & control (verify)', title: 'Noise assessment, control and hearing protection', items: [
      { id: 'NIHL-A-1', ref: 'Noise survey (verify)', title: 'Noise assessment and zoning', text: 'Assess noise exposure; demarcate noise zones at or above the noise-rating limit.', freq: 24,
        ob: [O('Noise survey by approved inspection authority', 'manual')], mt: [O('Repeat survey every 2 years or after changes (verify)', 'review', { every: 'Every 2 years' })] },
      { id: 'NIHL-A-2', ref: 'Hearing protection (verify)', title: 'Hearing protection provided', text: 'Provide hearing protective equipment in noise zones and ensure it is used.', freq: 12,
        ob: [O('Hearing protection issued and current', 'ppe')], mt: [O('Monitor PPE replacement', 'review', { every: 'Monthly' })] }
    ] }
  ] },
  { id: 'COIDA', type: 'Act', name: 'Compensation for Occupational Injuries and Diseases Act 130 of 1993', parts: [
    { id: 'COIDA-R', ref: 'Registration & reporting', title: 'Registration and reporting of injuries', items: [
      { id: 'COIDA-R-1', ref: 'Registration (verify)', title: 'Registered with the Compensation Fund', text: 'Register as an employer, submit annual returns of earnings and keep a letter of good standing.', freq: 12,
        ob: [O('Letter of good standing on file', 'manual')], mt: [O('Annual return of earnings', 'review', { every: 'Annually' })] },
      { id: 'COIDA-R-2', ref: 'Reporting (verify)', title: 'Report occupational injuries and diseases', text: 'Report injuries and diseases to the Compensation Fund within the prescribed period.', freq: 12,
        ob: [O('Injury incidents recorded and assessed', 'incident')], mt: [O('Report per injury', 'review', { every: 'Per injury' })] }
    ] }
  ] },
  { id: 'NEMA', type: 'Act', name: 'National Environmental Management Act 107 of 1998', parts: [
    { id: 'NEMA-28', ref: 'Section 28', title: 'Duty of care and remediation of environmental damage', items: [
      { id: 'NEMA-28-1', ref: 's28(1)', title: 'Reasonable measures to prevent pollution', text: 'Take reasonable measures to prevent pollution or degradation of the environment, or to minimise and rectify it.', freq: 12,
        ob: [O('Environmental / waste procedure issued', 'doc', { cat: 'Environmental' }), O('Chemicals stored with current SDSs', 'chem'), O('Spill kits available and inspected', 'manual')],
        mt: [O('Quarterly chemical store inspection', 'insp', { tpl: 'TPL-CHEM', every: 'Quarterly', days: 90 })] }
    ] }
  ] },
  { id: 'NEMWA', type: 'Act', name: 'National Environmental Management: Waste Act 59 of 2008', parts: [
    { id: 'NEMWA-16', ref: 'Section 16 (verify)', title: 'General duty in respect of waste management', items: [
      { id: 'NEMWA-16-1', ref: 's16 (verify)', title: 'Avoid, minimise and safely dispose of waste', text: 'Avoid and minimise waste, store it safely and dispose through authorised service providers.', freq: 12,
        ob: [O('Waste management procedure issued', 'doc', { kw: 'Waste' }), O('Safe disposal certificates on file', 'manual')], mt: [O('Monthly reconciliation of disposal certificates', 'review', { every: 'Monthly' })] }
    ] }
  ] },
  { id: 'NRTA', type: 'Act', name: 'National Road Traffic Act 93 of 1996', parts: [
    { id: 'NRTA-V', ref: 'Vehicles & drivers (verify)', title: 'Vehicle licensing and roadworthiness', items: [
      { id: 'NRTA-V-1', ref: 'Licensing (verify)', title: 'Vehicles licensed and roadworthy', text: 'Company vehicles licensed (valid licence disc) and maintained in roadworthy condition.', freq: 12,
        ob: [O('Vehicle licence discs and fleet inspections current', 'asset', { type: 'AT-LDV' }), O('Monthly vehicle inspections up to date', 'insp', { tpl: 'TPL-VEH' })],
        mt: [O('Monthly vehicle inspection', 'insp', { tpl: 'TPL-VEH', every: 'Monthly', days: 30 }), O('Annual licence renewal', 'review', { every: 'Annually' })] },
      { id: 'NRTA-V-2', ref: 'Drivers (verify)', title: 'Drivers licensed (and PrDP where required)', text: 'Drivers hold valid licences and professional driving permits where required.', freq: 12,
        ob: [O('Driver licence / PrDP copies on file', 'manual'), O('Defensive driving training', 'training', { course: 'CRS-DD' })], mt: [O('Check licence expiry dates', 'review', { every: 'Quarterly' })] }
    ] }
  ] },
  { id: 'ISO45001', type: 'Other requirement', name: 'ISO 45001:2018 (voluntary commitment)', parts: [
    { id: 'ISO-6', ref: 'Clause 6', title: 'Planning', items: [
      { id: 'ISO-6-1-2', ref: 'cl. 6.1.2', title: 'Hazard identification and assessment of risks', text: 'Establish processes for ongoing, proactive hazard identification and risk assessment.', freq: 12,
        ob: [O('Risk assessments approved and current', 'risk')], mt: [O('Annual risk review', 'review', { every: 'Annually' })] }
    ] },
    { id: 'ISO-9', ref: 'Clause 9', title: 'Performance evaluation', items: [
      { id: 'ISO-9-2', ref: 'cl. 9.2', title: 'Internal audit', text: 'Conduct internal audits at planned intervals.', freq: 12,
        ob: [O('Internal audit completed in the last 12 months', 'audit')], mt: [O('Annual audit programme', 'review', { every: 'Annually' })] },
      { id: 'ISO-9-3', ref: 'cl. 9.3', title: 'Management review', text: 'Top management reviews the OH&S management system at planned intervals.', freq: 12,
        ob: [O('Management review minutes on file', 'manual')], mt: [O('Management review', 'review', { every: 'Annually' })] }
    ] },
    { id: 'ISO-10', ref: 'Clause 10', title: 'Improvement', items: [
      { id: 'ISO-10-2', ref: 'cl. 10.2', title: 'Incident, nonconformity and corrective action', text: 'Investigate incidents and nonconformities and take corrective action, reviewing its effectiveness.', freq: 12,
        ob: [O('Incidents investigated promptly', 'incident'), O('Corrective actions on schedule and verified', 'actions')], mt: [O('Monthly action register review', 'review', { every: 'Monthly' })] }
    ] }
  ] }
];
const LIB_INDEX = {};
LEGAL_LIBRARY.forEach(ins => ins.parts.forEach(p => p.items.forEach(it => { LIB_INDEX[it.id] = { ins, part: p, item: it }; })));

/* ---------------- Automatic obligation checks against live records ---------------- */
function siteMatch(rec, siteId) { if (!rec) return false; const org = rec.org || (site(rec.site) || {}).org; if (org && org !== S.ui.org && org !== siteOrgOf(siteId)) return false; return siteId === 'ALL' || !rec.site || rec.site === 'ALL' || rec.site === siteId; }
function inOrgSite(rec, siteId) { if (!rec) return false; const org = siteOrgOf(siteId); const ro = rec.org || (site(rec.site) || {}).org; return (!ro || ro === org) && siteMatch(rec, siteId); }
function oblCheck(o, siteId, l) {
  const R = (met, detail, link) => ({ met, detail, link: link || '' });
  const key = o.t;
  if (o.k === 'manual') { const c = l && l.oblConfirm && l.oblConfirm[key]; return c ? R(true, `Confirmed by ${pname(c.by)} on ${fmt(c.date)}${c.file ? ' — ' + c.file : ''}`) : R(null, 'Requires confirmation with evidence'); }
  if (o.k === 'doc') {
    const ds = S.documents.filter(d => inOrgSite(d, siteId) && docActive(d) && docIssued(d) && (!o.cat || d.category === o.cat) && (!o.kw || d.title.toLowerCase().includes(o.kw.toLowerCase())));
    if (!ds.length) return R(false, `No issued ${o.cat || 'document'}${o.kw ? ' matching "' + o.kw + '"' : ''} for this site`, '#/documents');
    const od = ds.filter(docReviewOverdue); return od.length ? R(false, `${od.map(d => d.number).join(', ')} overdue for review`, '#/documents/' + od[0].id) : R(true, ds.map(d => d.number).join(', '), '#/documents/' + ds[0].id);
  }
  if (o.k === 'appt') {
    const as = S.appointments.filter(a => inOrgSite(a, siteId) && a.type.toLowerCase().includes(o.kw.toLowerCase()));
    const ok = as.filter(a => ['Valid', 'Expiring'].includes(apptStatus(a)));
    if (!as.length) return R(false, 'No appointment on file', '#/people/appointments');
    return ok.length ? R(true, ok.map(a => pname(a.person)).join(', ') + (ok.some(a => apptStatus(a) === 'Expiring') ? ' (expiring soon)' : ''), '#/people/appointments') : R(false, `${as.map(a => pname(a.person) + ' — ' + apptStatus(a).toLowerCase()).join(', ')}`, '#/people/appointments');
  }
  if (o.k === 'training' || o.k === 'trainingAll') {
    const ppl = S.people.filter(p => inOrgSite(p, siteId) && p.type !== 'Contractor');
    if (o.k === 'trainingAll') { let req = 0, bad = 0; ppl.forEach(p => requiredCourses(p).forEach(c => { req++; if (['Missing', 'Expired'].includes(trainingStatus(p.id, c).status)) bad++; })); return bad ? R(false, `${bad} of ${req} required training items missing or expired`, '#/people/matrix') : R(true, `All ${req} required items current`, '#/people/matrix'); }
    const c = byId('courses', o.course); const st = ppl.map(p => trainingStatus(p.id, o.course).status);
    const valid = st.filter(s => s === 'Valid' || s === 'Expiring').length; const needing = ppl.filter(p => requiredCourses(p).includes(o.course)); const gaps = needing.filter(p => ['Missing', 'Expired'].includes(trainingStatus(p.id, o.course).status));
    if (!valid) return R(false, `Nobody holds valid "${c.name}"`, '#/people/matrix');
    return gaps.length ? R(false, `${valid} valid; gaps: ${gaps.map(p => p.name).join(', ')}`, '#/people/matrix') : R(true, `${valid} person(s) with valid certificate`, '#/people/matrix');
  }
  if (o.k === 'asset') {
    const as = S.assets.filter(a => inOrgSite(a, siteId) && (o.any || a.type === o.type) && a.status !== 'Decommissioned');
    if (!as.length) return R(true, 'Not applicable — no such equipment at this site');
    const bad = as.filter(a => assetDocStatus(a).some(d => d.status === 'Expired' || d.status === 'Missing'));
    return bad.length ? R(false, `${bad.map(a => a.tag).join(', ')}: certificate expired or missing`, '#/assets/' + bad[0].id + '?tab=documents') : R(true, `${as.length} asset(s), certificates current`, '#/assets');
  }
  if (o.k === 'insp') {
    const sc = S.schedules.filter(s => inOrgSite(s, siteId) && s.template === o.tpl);
    const t = byId('templates', o.tpl);
    if (!sc.length) return R(false, `No "${t.title}" scheduled`, '#/audits/schedule');
    const od = sc.filter(s => daysTo(s.nextDue) < 0); return od.length ? R(false, `${od.map(s => s.target).join(', ')} overdue`, '#/inspect/' + od[0].id) : R(true, `${sc.length} schedule(s) current — next ${fmt(sc.map(s => s.nextDue).sort()[0])}`, '#/audits/schedule');
  }
  if (o.k === 'drill') {
    const ds = S.drills.filter(d => inOrgSite(d, siteId));
    const recent = ds.filter(d => d.status === 'Completed' && daysTo(d.conducted) >= -365); const od = ds.filter(d => d.status === 'Scheduled' && daysTo(d.scheduled) < 0);
    if (od.length) return R(false, `Drill ${od[0].id} overdue (scheduled ${fmt(od[0].scheduled)})`, '#/emergency/drills');
    return recent.length ? R(true, `Last drill ${fmt(recent.map(d => d.conducted).sort().pop())}`, '#/emergency/drills') : R(false, 'No drill in the last 12 months', '#/emergency/drills');
  }
  if (o.k === 'chem') {
    const cs = S.chemicals.filter(c => inOrgSite(c, siteId)); if (!cs.length) return R(true, 'No hazardous chemicals registered for this site');
    const bad = cs.filter(c => ['Missing', 'Overdue'].includes(sdsState(c))); return bad.length ? R(false, `${bad.map(c => c.name).join(', ')}: SDS missing / overdue`, '#/chemicals/' + bad[0].id) : R(true, `${cs.length} chemical(s), SDSs current`, '#/chemicals');
  }
  if (o.k === 'risk') {
    const rs = S.risks.filter(r => inOrgSite(r, siteId)); const ok = rs.filter(r => r.approval === 'Approved'); const od = rs.filter(r => daysTo(r.reviewDate) < 0 || r.needsReview);
    if (!ok.length) return R(false, 'No approved risk assessment', '#/risks');
    return od.length ? R(false, `${od.map(r => r.id).join(', ')} review overdue / required`, '#/risks/' + od[0].id) : R(true, `${ok.length} approved assessment(s)`, '#/risks');
  }
  if (o.k === 'ppe') {
    const iss = S.ppeIssues.filter(x => inOrgSite(person(x.person), siteId)); const od = iss.filter(x => daysTo(x.replaceBy) < 0);
    const low = S.ppeStock.filter(x => inOrgSite(x, siteId) && x.qty < x.min);
    if (!iss.length) return R(false, 'No PPE issue records', '#/ppe');
    return od.length || low.length ? R(false, `${od.length} replacement(s) overdue; ${low.length} stock item(s) below minimum`, '#/ppe') : R(true, `${iss.length} issue records current`, '#/ppe');
  }
  if (o.k === 'incident') {
    const is = S.incidents.filter(i => inOrgSite(i, siteId)); const late = is.filter(i => i.status === 'Reported' && daysTo(i.date) < -3);
    return late.length ? R(false, `${late.map(i => i.id).join(', ')} not yet investigated`, '#/incidents/' + late[0].id) : R(true, `${is.length} incident(s) recorded; none awaiting investigation > 3 days`, '#/incidents');
  }
  if (o.k === 'firstaid') {
    const fa = S.emergency.firstAid.filter(f => inOrgSite(f, siteId)); if (!fa.length) return R(false, 'No first aid boxes recorded', '#/emergency/equipment');
    const od = fa.filter(f => daysTo(f.next) < 0); return od.length ? R(false, `${od.length} first aid box check(s) overdue`, '#/emergency/equipment') : R(true, `${fa.length} box(es) checked`, '#/emergency/equipment');
  }
  if (o.k === 'audit') {
    const as = S.audits.filter(a => inOrgSite(a, siteId)); const done = as.filter(a => a.status === 'Completed' && daysTo(a.conducted) >= -365);
    return done.length ? R(true, `Last audit ${fmt(done.map(a => a.conducted).sort().pop())}`, '#/audits') : R(false, 'No internal audit in the last 12 months', '#/audits');
  }
  if (o.k === 'actions') {
    const od = S.actions.filter(a => inOrgSite(a, siteId) && actionOverdue(a)); return od.length ? R(false, `${od.length} overdue corrective action(s)`, '#/actions?status=overdue') : R(true, 'No overdue corrective actions', '#/actions');
  }
  return R(null, '');
}
function proposedStatus(checks) {
  const auto = checks.filter(c => c.met !== null);
  const met = auto.filter(c => c.met).length, unmet = auto.length - met, manual = checks.filter(c => c.met === null).length;
  if (unmet && !met) return 'Non-Compliant';
  if (unmet) return 'Partially Compliant';
  if (manual) return 'Partially Compliant';
  return 'Compliant';
}
function maintainNext(m, siteId) {
  if (m.k === 'insp') { const sc = S.schedules.filter(s => inOrgSite(s, siteId) && s.template === m.tpl).sort((a, b) => a.nextDue.localeCompare(b.nextDue))[0]; return sc ? { text: dueText(sc.nextDue), exists: true, link: '#/inspect/' + sc.id } : { text: '<span class="due amber">Not scheduled</span>', exists: false }; }
  if (m.k === 'drill') { const d = S.drills.filter(x => inOrgSite(x, siteId) && x.status === 'Scheduled').sort((a, b) => a.scheduled.localeCompare(b.scheduled))[0]; return d ? { text: dueText(d.scheduled), exists: true, link: '#/emergency/drills' } : { text: '<span class="due amber">Not scheduled</span>', exists: false }; }
  if (m.k === 'firstaid') { const f = S.emergency.firstAid.filter(x => inOrgSite(x, siteId)).sort((a, b) => a.next.localeCompare(b.next))[0]; return f ? { text: dueText(f.next), exists: true, link: '#/emergency/equipment' } : { text: '—', exists: false }; }
  return { text: `<span class="muted">${esc(m.every || '')}</span>`, exists: true };
}
function oblIcon(met) { return met === true ? `<span style="color:var(--green)">${icon('checkCircle', 'sm')}</span>` : met === false ? `<span style="color:var(--red)">${icon('alert', 'sm')}</span>` : `<span style="color:var(--amber)">${icon('clock', 'sm')}</span>`; }

/* ---------------- "Add requirement" picker ---------------- */
const PICK = { ins: '', open: {}, sel: {} };
ACT.legalCustom = ACT.legalNew;   // keep the free-text form for requirements not in the library
ACT.legalNew = () => {
  PICK.ins = ''; PICK.open = {}; PICK.sel = {};
  const groups = ['Act', 'Regulation', 'Other requirement'];
  openModal({ title: 'Add legal requirements from the library', sub: 'Choose an Act or Regulation, open a section, and tick the sub-regulations that apply. The system works out what is needed to become and stay compliant, and checks your existing records.', size: 'wide',
    body: `${LEGAL_DISCLAIMER}<div class="form-grid">
      ${fld({ name: 'site', label: 'Site', type: 'select', options: siteOptions(defaultSite()), required: true })}
      ${fld({ name: 'responsible', label: 'Responsible person', type: 'select', options: personOptions(S.ui.user), required: true })}
      <div class="field full"><label for="f_ins">Act / regulations<span class="req">*</span></label><select id="f_ins" name="ins"><option value="">— Select an Act or Regulation —</option>${groups.map(g => `<optgroup label="${g === 'Act' ? 'Acts' : g === 'Regulation' ? 'Regulations' : 'Other requirements'}">${LEGAL_LIBRARY.filter(i => i.type === g).map(i => `<option value="${i.id}">${esc(i.name)}</option>`).join('')}</optgroup>`).join('')}</select></div>
    </div>
    <div id="pickTree" class="mt"></div><div id="pickPlan" class="mt"></div>
    <div class="mt"><a href="#" id="pickCustom" class="muted">Requirement not in the library? Add a custom requirement instead</a></div>`,
    onOpen: m => {
      const draw = () => drawPicker(m);
      m.querySelector('[name=ins]').addEventListener('change', e => { PICK.ins = e.target.value; const ins = LEGAL_LIBRARY.find(i => i.id === PICK.ins); PICK.open = {}; if (ins && ins.parts.length === 1) PICK.open[ins.parts[0].id] = true; draw(); });
      m.querySelector('[name=site]').addEventListener('change', draw);
      m.addEventListener('click', e => {
        const t = e.target.closest('[data-pk]'); if (!t) return;
        if (t.dataset.pk === 'part') { e.preventDefault(); PICK.open[t.dataset.id] = !PICK.open[t.dataset.id]; draw(); }
      });
      m.addEventListener('change', e => {
        const t = e.target; if (!t.dataset || !t.dataset.pki) return;
        if (t.dataset.pki === 'all') { const part = LEGAL_LIBRARY.find(i => i.id === PICK.ins).parts.find(p => p.id === t.dataset.id); part.items.forEach(it => { if (!existingReq(it.id, m.querySelector('[name=site]').value)) PICK.sel[it.id] = t.checked; }); PICK.open[part.id] = true; }
        else PICK.sel[t.dataset.pki] = t.checked;
        draw();
      });
      m.querySelector('#pickCustom').addEventListener('click', e => { e.preventDefault(); closeModal(); setTimeout(ACT.legalCustom, 30); });
      draw();
    },
    buttons: [{ label: 'Add selected to register', cls: 'primary', id: 'pickAdd', onClick: m => addFromLibrary(m) }]
  });
};
function existingReq(itemId, siteId) { return S.legal.find(l => l.lib === itemId && l.site === siteId && siteOrgOf(siteId) === l.org); }
function drawPicker(m) {
  const siteId = m.querySelector('[name=site]').value; const ins = LEGAL_LIBRARY.find(i => i.id === PICK.ins);
  const tree = m.querySelector('#pickTree'), plan = m.querySelector('#pickPlan');
  if (!ins) { tree.innerHTML = '<div class="empty" style="padding:18px">Select an Act or Regulation to see its sections.</div>'; plan.innerHTML = ''; updAddBtn(m); return; }
  tree.innerHTML = `<h4 class="mb">${esc(ins.name)} — sections / regulations</h4><div class="card">${ins.parts.map(p => {
    const sel = p.items.filter(it => PICK.sel[it.id]).length;
    return `<div style="border-bottom:1px solid var(--grey-100)"><div style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;background:${PICK.open[p.id] ? 'var(--blue-50)' : '#fff'}" data-pk="part" data-id="${p.id}">
      <input type="checkbox" data-pki="all" data-id="${p.id}" ${sel && sel === p.items.filter(it => !existingReq(it.id, siteId)).length ? 'checked' : ''} aria-label="Select all in ${esc(p.ref)}" onclick="event.stopPropagation()">
      <span style="flex:1"><b>${esc(p.ref)}</b> — ${esc(p.title)} <span class="muted">(${p.items.length} item${p.items.length > 1 ? 's' : ''})</span></span>${sel ? badge(sel + ' selected', 'blue', true) : ''}<span style="transform:rotate(${PICK.open[p.id] ? 0 : -90}deg);display:inline-flex">${icon('chevron', 'sm')}</span></div>
      ${PICK.open[p.id] ? `<div style="padding:4px 14px 12px 44px">${p.items.map(it => { const ex = existingReq(it.id, siteId); return `<label class="check" style="padding:7px 0;border-top:1px dashed var(--grey-200);${ex ? 'opacity:.6' : ''}"><input type="checkbox" data-pki="${it.id}" ${PICK.sel[it.id] ? 'checked' : ''} ${ex ? 'disabled' : ''}><span><b>${esc(it.ref)}</b> — ${esc(it.title)}<br><small class="muted">${esc(it.text)}</small>${ex ? `<br><small>Already in register as <a href="#/legal/${ex.id}">${ex.id}</a> (${esc(ex.status)})</small>` : ''}</span></label>`; }).join('')}</div>` : ''}</div>`;
  }).join('')}</div>`;
  const chosen = Object.keys(PICK.sel).filter(k => PICK.sel[k]).map(k => LIB_INDEX[k]).filter(Boolean);
  if (!chosen.length) { plan.innerHTML = '<p class="muted">Tick one or more sub-regulations to see what is required.</p>'; updAddBtn(m); return; }
  const anyGaps = chosen.some(c => c.item.ob.some(o => oblCheck(o, siteId).met === false));
  const missingSched = chosen.some(c => c.item.mt.some(x => ['insp', 'drill'].includes(x.k) && !maintainNext(x, siteId).exists));
  plan.innerHTML = `<h4 class="mb">What the system picked up for ${esc(siteId === 'ALL' ? 'all sites' : site(siteId).short)}</h4>${chosen.map(c => {
    const checks = c.item.ob.map(o => Object.assign({ o }, oblCheck(o, siteId)));
    const st = proposedStatus(checks);
    return `<div class="card mb"><div class="card-head"><div><h3>${esc(c.item.ref)} — ${esc(c.item.title)}</h3><span class="ch-sub">${esc(c.ins.name)}</span></div><div>Proposed status: ${sbadge(st)}</div></div><div class="card-body"><div class="grid g2">
      <div><h4>To be compliant</h4><ul class="link-list">${checks.map(ch => `<li><div class="ll-main" style="display:flex;gap:8px">${oblIcon(ch.met)}<div><b style="font-weight:600">${esc(ch.o.t)}</b><div>${esc(ch.detail)}</div></div></div></li>`).join('')}</ul></div>
      <div><h4>To maintain compliance</h4><ul class="link-list">${c.item.mt.map(x => { const n = maintainNext(x, siteId); return `<li><div class="ll-main"><b style="font-weight:600">${esc(x.t)}</b><div>${esc(x.every || '')}</div></div><span>${n.text}</span></li>`; }).join('')}<li><div class="ll-main"><b style="font-weight:600">Re-assess this requirement</b><div>Every ${c.item.freq} months</div></div></li></ul></div>
    </div></div></div>`;
  }).join('')}
  <div class="fieldset"><legend>When adding</legend>
    <label class="check"><input type="checkbox" id="pkActions" ${anyGaps ? 'checked' : 'disabled'}> <span>Raise a corrective action for each gap found (${chosen.reduce((s, c) => s + c.item.ob.filter(o => oblCheck(o, siteId).met === false).length, 0)} gap(s)), assigned to the responsible person</span></label>
    <label class="check mt-s"><input type="checkbox" id="pkSched" ${missingSched ? 'checked' : 'disabled'}> <span>Create missing recurring inspections / drills so compliance is maintained</span></label>
    <p class="muted mt-s">Items marked ${oblIcon(null)} cannot be checked automatically — confirm them with evidence on the requirement page.</p></div>`;
  updAddBtn(m);
}
function updAddBtn(m) { const n = Object.values(PICK.sel).filter(Boolean).length; const b = m.querySelector('#pickAdd'); if (b) { b.textContent = n ? `Add ${n} requirement${n > 1 ? 's' : ''} to register` : 'Add selected to register'; b.disabled = !n; } }
function addFromLibrary(m) {
  if (!validateForm(m)) return false;
  const siteId = m.querySelector('[name=site]').value, resp = m.querySelector('[name=responsible]').value;
  const chosen = Object.keys(PICK.sel).filter(k => PICK.sel[k]).map(k => LIB_INDEX[k]).filter(c => c && !existingReq(c.item.id, siteId));
  if (!chosen.length) { toast('Tick at least one sub-regulation.', 'error'); return false; }
  const doActs = m.querySelector('#pkActions') && m.querySelector('#pkActions').checked, doSched = m.querySelector('#pkSched') && m.querySelector('#pkSched').checked;
  const actSite = siteId === 'ALL' ? defaultSite() : siteId;
  let nActs = 0, nSched = 0; const ids = [];
  chosen.forEach(c => {
    const it = c.item; const id = nextId('LR-', 'legal');
    const checks = it.ob.map(o => Object.assign({ o }, oblCheck(o, siteId)));
    const status = proposedStatus(checks); const gaps = checks.filter(x => x.met === false);
    const l = { id, org: siteOrgOf(siteId), site: siteId, lib: it.id, source: c.ins.name, reference: `${it.ref} — ${it.title}`, requirement: it.text, applicability: `Selected from legal library for ${siteId === 'ALL' ? 'all sites' : site(siteId).name}.`, responsible: resp,
      controls: it.ob.map(o => o.t).join('; '), evidenceReq: it.ob.map(o => o.t).join('; '), status, freq: it.freq, lastReviewed: TODAY, nextReview: addMonths(TODAY, it.freq), docs: [], risks: [], evidence: [],
      gaps: gaps.map(g => `${g.o.t}: ${g.detail}`).join(' · '), naJustification: '', oblConfirm: {},
      assessments: [{ date: TODAY, by: S.ui.user, status, note: `Auto-assessed from existing records: ${checks.filter(x => x.met).length} met, ${gaps.length} gap(s), ${checks.filter(x => x.met === null).length} to confirm. Confirm with a competent-person assessment.` }] };
    S.legal.push(l); ids.push(id);
    if (doActs) gaps.forEach(g => { createAction({ source: 'Legal', sourceId: id, title: `${it.ref}: ${g.o.t}`, action: `Close gap — ${g.detail}`, owner: resp, priority: status === 'Non-Compliant' ? 'High' : 'Medium', site: actSite }); nActs++; });
    if (doSched) it.mt.forEach(x => {
      if (x.k === 'insp' && !maintainNext(x, siteId).exists) { S.schedules.push({ id: nextId('ISCH-', 'schedules', 2), template: x.tpl, asset: null, site: actSite, target: `${byId('templates', x.tpl).title} — ${site(actSite).short}`, freqDays: x.days || 30, nextDue: addDays(TODAY, 7), assignee: resp }); nSched++; }
      if (x.k === 'drill' && !maintainNext(x, siteId).exists) { S.drills.push({ id: nextId('DR-', 'drills', 3, 400), site: actSite, type: 'Full evacuation', scheduled: addDays(TODAY, 30), conducted: null, status: 'Scheduled', duration: '', participants: 0, result: '', findings: '', actions: [], observer: resp }); nSched++; }
    });
    log(`Added ${id} from legal library: ${it.ref} ${it.title} (${status})`, '#/legal/' + id);
  });
  save();
  toast(`${ids.length} requirement(s) added to the register${nActs ? `, ${nActs} corrective action(s) raised` : ''}${nSched ? `, ${nSched} recurring task(s) scheduled` : ''}.`);
  navigate(ids.length === 1 ? '#/legal/' + ids[0] : '#/legal');
}

/* ---------------- Obligations panel on the requirement page ---------------- */
function legalObligationsHtml(l) {
  const e = l.lib && LIB_INDEX[l.lib]; if (!e) return '';
  const checks = e.item.ob.map(o => Object.assign({ o }, oblCheck(o, l.site, l)));
  const st = proposedStatus(checks);
  return `<div class="card"><div class="card-head"><div><h2>What is needed to be compliant</h2><span class="ch-sub">Checked live against existing records · library item ${esc(e.item.id)}</span></div><div>System view: ${sbadge(st)} ${st !== l.status && l.status !== 'Awaiting Verification' && can('legal.assess') ? `<button class="btn sm" data-act="oblApply" data-id="${l.id}">Apply</button>` : ''}</div></div><div class="card-body"><ul class="link-list">
    ${checks.map((c, i) => `<li><div class="ll-main" style="display:flex;gap:8px">${oblIcon(c.met)}<div><b style="font-weight:600">${esc(c.o.t)}</b><div>${c.link ? `<a href="${c.link}">${esc(c.detail)}</a>` : esc(c.detail)}</div></div></div><div class="btn-row">${(() => { const a = S.actions.find(x => x.source === 'Legal' && x.sourceId === l.id && actionOpen(x) && x.title.endsWith(c.o.t)); return a ? `<a href="#/actions/${a.id}">${a.id}</a> ${sbadge(a.status)}` : ''; })()}${c.met === false && !S.actions.some(x => x.source === 'Legal' && x.sourceId === l.id && actionOpen(x) && x.title.endsWith(c.o.t)) ? permBtn('action.create', `<button class="btn sm" data-act="oblAction" data-id="${l.id}" data-i="${i}">Raise action</button>`) : ''}${c.o.k === 'manual' && c.met === null ? permBtn('legal.assess', `<button class="btn sm primary" data-act="oblConfirm" data-id="${l.id}" data-i="${i}">Confirm with evidence</button>`) : ''}</div></li>`).join('')}
  </ul></div></div>
  <div class="card"><div class="card-head"><h2>Maintaining compliance</h2><span class="ch-sub">Recurring activities</span></div><div class="card-body"><ul class="link-list">
    ${e.item.mt.map(x => { const n = maintainNext(x, l.site); return `<li><div class="ll-main"><b style="font-weight:600">${n.link ? `<a href="${n.link}">${esc(x.t)}</a>` : esc(x.t)}</b><div>${esc(x.every || '')}</div></div><span>${n.text}</span></li>`; }).join('')}
    <li><div class="ll-main"><b style="font-weight:600">Re-assess this requirement</b><div>Every ${l.freq} months</div></div><span>${dueText(l.nextReview)}</span></li>
  </ul></div></div>`;
}
ACT.oblAction = (el) => { const l = byId('legal', el.dataset.id), e = LIB_INDEX[l.lib], o = e.item.ob[+el.dataset.i], c = oblCheck(o, l.site, l); raiseActionModal({ source: 'Legal', sourceId: l.id, title: `${e.item.ref}: ${o.t}`, action: `Close gap — ${c.detail}`, owner: l.responsible, site: l.site === 'ALL' ? defaultSite() : l.site, priority: 'High' }); };
ACT.oblConfirm = (el) => { const l = byId('legal', el.dataset.id), o = LIB_INDEX[l.lib].item.ob[+el.dataset.i];
  openModal({ title: 'Confirm obligation', sub: esc(o.t), body: `<div class="form-grid">${fld({ name: 'file', label: 'Evidence', type: 'file', required: true, full: true })}${fld({ name: 'note', label: 'What was verified', type: 'textarea', required: true, full: true })}</div>`,
    buttons: [{ label: 'Confirm', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); l.oblConfirm = l.oblConfirm || {}; l.oblConfirm[o.t] = { by: S.ui.user, date: TODAY, file: v.file.name, note: v.note }; l.evidence.unshift({ name: v.file.name, date: TODAY, by: S.ui.user, note: `${o.t}: ${v.note}` }); log(`${l.id}: confirmed "${o.t}"`, '#/legal/' + l.id); save(); toast('Obligation confirmed with evidence.'); rerender(); } }] }); };
ACT.oblApply = (el) => { const l = byId('legal', el.dataset.id), e = LIB_INDEX[l.lib]; const checks = e.item.ob.map(o => Object.assign({ o }, oblCheck(o, l.site, l))); const st = proposedStatus(checks);
  confirmBox('Apply system assessment', `Update ${l.id} from <b>${esc(l.status)}</b> to <b>${esc(st)}</b> based on the live obligation checks?`, 'Update status', () => { l.status = st; l.lastReviewed = TODAY; l.nextReview = addMonths(TODAY, l.freq || 12); l.gaps = checks.filter(c => c.met === false).map(c => `${c.o.t}: ${c.detail}`).join(' · '); l.assessments.unshift({ date: TODAY, by: S.ui.user, status: st, note: 'Status updated from live obligation checks.' }); log(`${l.id} re-assessed as ${st}`, '#/legal/' + l.id); save(); toast(`${l.id} updated to ${esc(st)}.`); rerender(); }); };
