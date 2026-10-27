/* ==========================================================================
   VDW HSEQ Management System — Prototype demonstration data
   --------------------------------------------------------------------------
   ALL DATA IN THIS FILE IS FICTIONAL DEMONSTRATION DATA.
   Legal register entries are ILLUSTRATIVE ONLY and must be verified by a
   competent person against current South African legislation before use.
   Dates are generated relative to "today" when the demo data is (re)set, so
   overdue / upcoming items always remain meaningful.
   ========================================================================== */

/* eslint-disable no-unused-vars */
function buildSeed() {
  const base = new Date(); base.setHours(0, 0, 0, 0);
  const D = (n) => { const x = new Date(base); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const T = (n, h = 9, m = 0) => { const x = new Date(base); x.setDate(x.getDate() + n); x.setHours(h, m, 0, 0); return x.toISOString(); };
  const demoFile = (name, kb) => ({ name, size: kb * 1024, type: name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream', demo: true, seeded: true });

  const S = { version: 3, seededOn: D(0) };

  /* ---------------- Organisations, sites, departments ---------------- */
  S.orgs = [
    { id: 'ORG-1', name: 'Kestrel Industrial Equipment (Pty) Ltd', short: 'Kestrel Industrial', reg: 'Fictional — demo only', industry: 'Industrial equipment supply, hire & service' },
    { id: 'ORG-2', name: 'Ridgeway Pumps & Valves (Pty) Ltd', short: 'Ridgeway Pumps', reg: 'Fictional — demo only', industry: 'Pump & valve service workshop' }
  ];
  S.sites = [
    { id: 'S-JHB', org: 'ORG-1', name: 'Germiston Head Office & Warehouse', short: 'Germiston', region: 'Gauteng', manager: 'P-005', headcount: 64 },
    { id: 'S-DBN', org: 'ORG-1', name: 'Pinetown Branch, Durban', short: 'Pinetown', region: 'KwaZulu-Natal', manager: 'P-003', headcount: 27 },
    { id: 'S-CPT', org: 'ORG-1', name: 'Montague Gardens Branch, Cape Town', short: 'Montague Gardens', region: 'Western Cape', manager: 'P-004', headcount: 22 },
    { id: 'S-RPV', org: 'ORG-2', name: 'Alrode Service Workshop', short: 'Alrode', region: 'Gauteng', manager: 'P-017', headcount: 18 }
  ];
  S.departments = ['Management', 'HSEQ', 'Warehouse & Logistics', 'Workshop & Service', 'Hire Fleet', 'Sales & Administration'];

  /* ---------------- People (employees, contractors, consultants) ---------------- */
  const P = (id, name, jobTitle, site, dept, type, sysRole, email, extra = {}) => Object.assign({ id, name, jobTitle, site, org: site === 'S-RPV' ? 'ORG-2' : 'ORG-1', dept, type, sysRole, email, status: 'Active', started: D(-900 + Number(id.slice(2)) * 37) }, extra);
  S.people = [
    P('P-001', 'Thandi Mokoena', 'Managing Director', 'S-JHB', 'Management', 'Employee', 'Managing Director', 'thandi.m@kestrel.demo'),
    P('P-002', 'Johan van Wyk', 'HSEQ Manager', 'S-JHB', 'HSEQ', 'Employee', 'HSEQ Manager', 'johan.vw@kestrel.demo'),
    P('P-003', 'Sipho Ndlovu', 'Branch Manager', 'S-DBN', 'Management', 'Employee', 'Branch Manager', 'sipho.n@kestrel.demo'),
    P('P-004', 'Lerato Dlamini', 'Branch Manager', 'S-CPT', 'Management', 'Employee', 'Branch Manager', 'lerato.d@kestrel.demo'),
    P('P-005', 'Pieter Botha', 'Operations Manager', 'S-JHB', 'Management', 'Employee', 'Branch Manager', 'pieter.b@kestrel.demo'),
    P('P-006', 'Ayesha Khan', 'VDW Safety Consultant', 'S-JHB', 'HSEQ', 'Consultant', 'Safety Consultant', 'ayesha.k@vdw.demo', { company: 'VDW Health & Safety Solutions' }),
    P('P-007', 'Bongani Zulu', 'Warehouse Supervisor', 'S-JHB', 'Warehouse & Logistics', 'Employee', 'Supervisor', 'bongani.z@kestrel.demo'),
    P('P-008', 'Ruan Pretorius', 'Workshop Foreman', 'S-JHB', 'Workshop & Service', 'Employee', 'Supervisor', 'ruan.p@kestrel.demo'),
    P('P-009', 'Nomvula Sithole', 'Forklift Operator', 'S-JHB', 'Warehouse & Logistics', 'Employee', 'Employee', 'nomvula.s@kestrel.demo'),
    P('P-010', 'Kyle Naidoo', 'Workshop Technician', 'S-DBN', 'Workshop & Service', 'Employee', 'Employee', 'kyle.n@kestrel.demo'),
    P('P-011', 'Zanele Mthembu', 'Admin & SHE Coordinator', 'S-DBN', 'Sales & Administration', 'Employee', 'Supervisor', 'zanele.m@kestrel.demo'),
    P('P-012', 'Marco Fernandes', 'Forklift Operator', 'S-CPT', 'Warehouse & Logistics', 'Employee', 'Employee', 'marco.f@kestrel.demo'),
    P('P-013', 'Grace Adams', 'Storeperson', 'S-CPT', 'Warehouse & Logistics', 'Employee', 'Employee', 'grace.a@kestrel.demo'),
    P('P-014', 'Tebogo Molefe', 'Delivery Driver', 'S-JHB', 'Hire Fleet', 'Employee', 'Employee', 'tebogo.m@kestrel.demo'),
    P('P-015', 'Hendrik Swart', 'Electrical Contractor', 'S-JHB', 'Workshop & Service', 'Contractor', null, 'hendrik@swartelectrical.demo', { company: 'Swart Electrical CC (fictional)' }),
    P('P-016', 'Fatima Patel', 'Workshop Supervisor', 'S-CPT', 'Workshop & Service', 'Employee', 'Supervisor', 'fatima.p@kestrel.demo'),
    P('P-017', 'Dawid Kruger', 'Operations Manager', 'S-RPV', 'Management', 'Employee', 'Branch Manager', 'dawid.k@ridgeway.demo'),
    P('P-018', 'Lindiwe Khumalo', 'Workshop Technician', 'S-RPV', 'Workshop & Service', 'Employee', 'Employee', 'lindiwe.k@ridgeway.demo')
  ];

  /* ---------------- Roles & permissions (client-side DEMO only) ---------------- */
  S.roles = [
    { name: 'Managing Director', desc: 'Organisation-wide visibility, management review, approves policies.', perms: ['view.all', 'doc.approve', 'risk.approve', 'action.verify', 'report.view'] },
    { name: 'HSEQ Manager', desc: 'Owns the HSEQ system: documents, legal register, risk, verification, configuration.', perms: ['view.all', 'doc.create', 'doc.review', 'doc.approve', 'doc.issue', 'legal.assess', 'risk.edit', 'risk.approve', 'action.create', 'action.verify', 'incident.investigate', 'medical.view', 'admin', 'report.view', 'inspect'] },
    { name: 'Safety Consultant', desc: 'External VDW consultant: assesses compliance, reviews documents, verifies evidence.', perms: ['view.all', 'doc.create', 'doc.review', 'legal.assess', 'risk.edit', 'action.create', 'action.verify', 'incident.investigate', 'report.view', 'inspect'] },
    { name: 'Branch Manager', desc: 'Manages compliance at assigned branch; assigns and verifies branch actions.', perms: ['view.branch', 'doc.create', 'doc.review', 'risk.edit', 'action.create', 'action.verify', 'incident.investigate', 'report.view', 'inspect'] },
    { name: 'Supervisor', desc: 'Conducts inspections, reports incidents, updates actions assigned to them.', perms: ['view.branch', 'action.create', 'inspect', 'incident.report'] },
    { name: 'Employee', desc: 'Reports incidents and hazards, completes assigned actions, views issued documents.', perms: ['view.own', 'incident.report'] }
  ];
  S.permissionDefs = [
    ['view.all', 'View all organisations / branches in scope'], ['view.branch', 'View records of assigned branch'], ['view.own', 'View own tasks & issued documents'],
    ['doc.create', 'Create & revise documents'], ['doc.review', 'Review documents'], ['doc.approve', 'Approve documents'], ['doc.issue', 'Issue documents for use'],
    ['legal.assess', 'Assess legal requirements'], ['risk.edit', 'Create & edit risk assessments'], ['risk.approve', 'Approve risk assessments'],
    ['action.create', 'Raise corrective actions'], ['action.verify', 'Verify & close corrective actions'], ['incident.report', 'Report incidents'],
    ['incident.investigate', 'Investigate & close incidents'], ['inspect', 'Conduct inspections'], ['medical.view', 'View restricted medical fitness records'],
    ['report.view', 'Management reports'], ['admin', 'System configuration']
  ];

  /* ---------------- Configuration ---------------- */
  S.config = {
    riskMatrix: {
      size: 5,
      likelihood: ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain'],
      severity: ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'],
      bands: [{ name: 'Low', max: 4, cls: 'low' }, { name: 'Medium', max: 9, cls: 'medium' }, { name: 'High', max: 14, cls: 'high' }, { name: 'Critical', max: 25, cls: 'critical' }]
    },
    priorities: [
      { name: 'Critical', days: 3, desc: 'Immediate danger / legal contravention with serious consequence' },
      { name: 'High', days: 14, desc: 'Significant risk or non-compliance' },
      { name: 'Medium', days: 30, desc: 'Moderate risk or partial compliance' },
      { name: 'Low', days: 60, desc: 'Improvement opportunity' }
    ],
    docCategories: ['Policy', 'Procedure', 'Safe Work Procedure', 'Risk Assessment', 'Method Statement', 'Emergency Plan', 'Environmental', 'Quality', 'Form / Template', 'Manual / Work Instruction', 'Register', 'Legal Appointment', 'Training Material', 'Safety Data Sheet', 'Certificate', 'Audit / Inspection Report', 'Equipment Manual', 'Other Controlled Record'],
    trainingCategories: ['Legal / Mandatory', 'Operational Competency', 'Emergency', 'Awareness'],
    reviewSchedules: [
      { item: 'Policies', months: 12 }, { item: 'Procedures & SWPs', months: 24 }, { item: 'Risk assessments', months: 12 },
      { item: 'Legal register requirements', months: 12 }, { item: 'Emergency plans', months: 12 }, { item: 'Safety data sheets (internal review cycle)', months: 24 }
    ],
    notify: {
      docReviewLead: 30, trainingLead: 45, appointmentLead: 45, inspectionLead: 7, maintenanceLead: 14, legalLead: 30, drillLead: 30, certLead: 30,
      channels: { inApp: true, email: false, sms: false },
      categories: { documents: true, legal: true, people: true, assets: true, chemicals: true, emergency: true, incidents: true, actions: true }
    },
    complianceWeights: { legal: 35, documents: 10, training: 15, appointments: 10, assets: 15, actions: 15 }
  };

  /* ---------------- Asset types (configurable requirements) ---------------- */
  S.assetTypes = [
    { id: 'AT-FL', name: 'Forklift / Lift truck', icon: 'forklift', template: 'TPL-FL', inspDays: 30, fields: ['Capacity (kg)', 'Mast height (m)', 'Fuel type'],
      reqDocs: [{ name: 'Lifting machine examination & load test certificate', months: 12 }, { name: 'OEM operator manual', months: 0 }, { name: 'Service record', months: 6 }] },
    { id: 'AT-LDV', name: 'Light delivery vehicle', icon: 'truck', template: 'TPL-VEH', inspDays: 30, fields: ['Registration no.', 'Odometer (km)'],
      reqDocs: [{ name: 'Vehicle licence disc', months: 12 }, { name: 'Roadworthy / fleet inspection record', months: 12 }, { name: 'Service record', months: 12 }] },
    { id: 'AT-CRANE', name: 'Overhead crane', icon: 'crane', template: 'TPL-WS', inspDays: 30, fields: ['SWL (t)', 'Span (m)'],
      reqDocs: [{ name: 'Lifting machine examination & load test certificate', months: 12 }, { name: 'Lifting machinery inspector report', months: 12 }] },
    { id: 'AT-TACKLE', name: 'Lifting tackle', icon: 'chain', template: 'TPL-WS', inspDays: 90, fields: ['SWL (t)'],
      reqDocs: [{ name: 'Lifting tackle inspection certificate', months: 6 }] },
    { id: 'AT-COMP', name: 'Compressor / pressure equipment', icon: 'gauge', template: 'TPL-WS', inspDays: 30, fields: ['Volume (L)', 'Working pressure (kPa)'],
      reqDocs: [{ name: 'Pressure equipment inspection certificate', months: 12 }, { name: 'Safety valve test record', months: 12 }] },
    { id: 'AT-FIRE', name: 'Fire equipment', icon: 'flame', template: 'TPL-FE', inspDays: 30, fields: ['Quantity', 'Type'],
      reqDocs: [{ name: 'Annual service certificate (accredited service provider)', months: 12 }] },
    { id: 'AT-RACK', name: 'Storage racking', icon: 'grid', template: 'TPL-RACK', inspDays: 180, fields: ['Bays', 'Beam level SWL (kg)'],
      reqDocs: [{ name: 'Racking inspection report (competent person)', months: 12 }, { name: 'Load notices / rack design', months: 0 }] },
    { id: 'AT-TOOL', name: 'Portable electrical equipment', icon: 'plug', template: 'TPL-WS', inspDays: 90, fields: ['Voltage'],
      reqDocs: [{ name: 'Portable appliance test record', months: 6 }] }
  ];

  /* ---------------- Inspection templates (controlled, revisioned) ---------------- */
  const Q = (arr) => arr.map((t, i) => ({ id: 'q' + (i + 1), text: typeof t === 'string' ? t : t[0], critical: Array.isArray(t) }));
  S.templates = [
    { id: 'TPL-FL', procedure: 'DOC-004', docNumber: 'KIE-FRM-031', title: 'Forklift Monthly Inspection Checklist', scope: 'Asset: Forklift / Lift truck', owner: 'P-002',
      revisions: [
        { rev: 2, revDate: D(-540), status: 'Superseded', approvedBy: 'P-002', approvedOn: D(-540), questions: Q([['Brakes and parking brake effective'], ['Steering operates correctly'], 'Horn and reverse alarm working', ['Mast, chains and forks free of damage'], 'Tyres in good condition', 'Lights working', 'Fluid leaks absent']) },
        { rev: 3, revDate: D(-120), status: 'Approved', approvedBy: 'P-002', approvedOn: D(-120), changeNote: 'Added seatbelt, load plate and blue-spot light items following incident INC-2026-004 learning.', questions: Q([['Service and parking brakes effective'], ['Steering operates correctly'], 'Horn, reverse alarm and blue-spot warning light working', ['Mast, chains, forks and carriage free of damage / cracks'], 'Tyres and wheels in good condition', 'Seatbelt fitted and functional', 'Load capacity plate fitted and legible', 'No hydraulic, fuel or battery electrolyte leaks', 'Overhead guard intact', 'Pre-use checklist completed daily for the period']) }
      ] },
    { id: 'TPL-VEH', procedure: 'DOC-013', docNumber: 'KIE-FRM-032', title: 'Light Delivery Vehicle Inspection', scope: 'Asset: Light delivery vehicle', owner: 'P-002',
      revisions: [{ rev: 2, revDate: D(-300), status: 'Approved', approvedBy: 'P-002', approvedOn: D(-300), questions: Q([['Brakes effective'], 'Tyres incl. spare in good condition', 'Lights and indicators working', 'Licence disc valid and displayed', 'Fire extinguisher present and serviced', 'First aid kit present', ['Load securing equipment in good condition'], 'Windscreen free of cracks']) }] },
    { id: 'TPL-WS', procedure: 'DOC-014', docNumber: 'KIE-FRM-035', title: 'General Workplace & Equipment Inspection', scope: 'Site / general equipment', owner: 'P-002',
      revisions: [{ rev: 1, revDate: D(-410), status: 'Approved', approvedBy: 'P-002', approvedOn: D(-410), questions: Q([['Walkways and emergency routes unobstructed'], 'Pedestrian / forklift segregation markings visible', 'Housekeeping acceptable', ['Electrical DBs closed and labelled'], 'Machine guards in place', 'Lighting adequate', 'Ladders and steps in good condition', 'Signage (PPE, emergency, hazard) in place']) }] },
    { id: 'TPL-FE', procedure: 'DOC-008', docNumber: 'KIE-FRM-036', title: 'Fire Equipment Monthly Inspection', scope: 'Fire equipment', owner: 'P-002',
      revisions: [{ rev: 1, revDate: D(-380), status: 'Approved', approvedBy: 'P-002', approvedOn: D(-380), questions: Q([['Extinguishers in place, accessible and signed'], 'Pressure gauges in green zone', 'Service tags within date', 'Hose reels accessible and undamaged', 'Emergency lighting functional', ['Fire exits unlocked and clear']]) }] },
    { id: 'TPL-CHEM', procedure: 'DOC-024', docNumber: 'KIE-FRM-038', title: 'Chemical Store Inspection', scope: 'Chemical store', owner: 'P-002',
      revisions: [{ rev: 1, revDate: D(-260), status: 'Approved', approvedBy: 'P-002', approvedOn: D(-260), questions: Q(['Current SDS available for every product', 'Containers labelled', ['Incompatible substances segregated'], 'Spill kit present and stocked', ['Eyewash / emergency shower available and working'], 'Ventilation adequate', 'Bunding intact']) }] },
    { id: 'TPL-RACK', procedure: 'DOC-007', docNumber: 'KIE-FRM-040', title: 'Storage Racking Inspection', scope: 'Asset: Storage racking', owner: 'P-002',
      revisions: [{ rev: 1, revDate: D(-500), status: 'Approved', approvedBy: 'P-002', approvedOn: D(-500), questions: Q([['Uprights free of damage / deformation'], ['Beam locking pins in place'], 'Load notices displayed', 'Base plates anchored', 'Column guards in place', 'No overloading observed']) }] }
  ];

  /* ---------------- Assets ---------------- */
  const cert = (type, number, issued, expiry, file) => ({ type, number, issued, expiry, file: file ? demoFile(file, 220) : null });
  S.assets = [
    { id: 'AS-001', tag: 'FL-01', name: 'Electric forklift FL-01', type: 'AT-FL', make: 'Toyota', model: '8FBE20', serial: 'TY8FBE-20-77412', site: 'S-JHB', location: 'Warehouse — Aisles 1–6', responsible: 'P-007', status: 'In Service', year: 2021, custom: { 'Capacity (kg)': '2000', 'Mast height (m)': '4.7', 'Fuel type': 'Electric' },
      certs: [cert('Lifting machine examination & load test certificate', 'LT-24-0911', D(-140), D(225), 'FL-01_load_test.pdf'), cert('OEM operator manual', 'OEM-8FBE', D(-1200), null, 'Toyota_8FBE_manual.pdf'), cert('Service record', 'SR-FL01-07', D(-60), D(120), 'FL-01_service.pdf')] },
    { id: 'AS-002', tag: 'FL-02', name: 'Diesel forklift FL-02', type: 'AT-FL', make: 'Linde', model: 'H25D', serial: 'LH25-0393-55', site: 'S-JHB', location: 'Yard & loading bay', responsible: 'P-007', status: 'In Service', year: 2019, custom: { 'Capacity (kg)': '2500', 'Mast height (m)': '4.2', 'Fuel type': 'Diesel' },
      certs: [cert('Lifting machine examination & load test certificate', 'LT-24-0912', D(-330), D(35), 'FL-02_load_test.pdf'), cert('OEM operator manual', 'OEM-H25', D(-1500), null, 'Linde_H25_manual.pdf'), cert('Service record', 'SR-FL02-11', D(-170), D(13), 'FL-02_service.pdf')] },
    { id: 'AS-003', tag: 'FL-07', name: 'LPG forklift FL-07', type: 'AT-FL', make: 'Hyster', model: 'H2.5FT', serial: 'HY25FT-11820', site: 'S-CPT', location: 'Warehouse', responsible: 'P-016', status: 'In Service', year: 2018, custom: { 'Capacity (kg)': '2500', 'Mast height (m)': '4.5', 'Fuel type': 'LPG' },
      certs: [cert('Lifting machine examination & load test certificate', 'LT-23-1440', D(-392), D(-27), 'FL-07_load_test_2025.pdf'), cert('Service record', 'SR-FL07-04', D(-95), D(87), 'FL-07_service.pdf')] },
    { id: 'AS-004', tag: 'LDV-03', name: 'Toyota Hilux 2.4GD LDV-03', type: 'AT-LDV', make: 'Toyota', model: 'Hilux 2.4GD-6', serial: 'VIN AHT-DEMO-00315', site: 'S-JHB', location: 'Hire fleet', responsible: 'P-014', status: 'In Service', year: 2022, custom: { 'Registration no.': 'KIE 003 GP (fictional)', 'Odometer (km)': '118 450' },
      certs: [cert('Vehicle licence disc', 'LD-KIE003', D(-350), D(15), 'LDV-03_licence_disc.pdf'), cert('Roadworthy / fleet inspection record', 'FI-0322', D(-200), D(165), 'LDV-03_fleet_insp.pdf'), cert('Service record', 'SR-LDV03', D(-45), D(320), 'LDV-03_service.pdf')] },
    { id: 'AS-005', tag: 'LDV-06', name: 'Isuzu D-Max LDV-06', type: 'AT-LDV', make: 'Isuzu', model: 'D-Max 1.9', serial: 'VIN ISZ-DEMO-00611', site: 'S-DBN', location: 'Branch fleet', responsible: 'P-010', status: 'In Service', year: 2023, custom: { 'Registration no.': 'KIE 006 ZN (fictional)', 'Odometer (km)': '64 210' },
      certs: [cert('Vehicle licence disc', 'LD-KIE006', D(-120), D(245), 'LDV-06_licence_disc.pdf'), cert('Roadworthy / fleet inspection record', 'FI-0611', D(-80), D(285), 'LDV-06_fleet.pdf')] },
    { id: 'AS-006', tag: 'OHC-01', name: '5 t overhead crane — workshop', type: 'AT-CRANE', make: 'Demag', model: 'EKKE 5t', serial: 'DMG-5T-30215', site: 'S-JHB', location: 'Workshop bay 2', responsible: 'P-008', status: 'In Service', year: 2015, custom: { 'SWL (t)': '5', 'Span (m)': '12' },
      certs: [cert('Lifting machine examination & load test certificate', 'LT-24-0877', D(-200), D(165), 'OHC-01_load_test.pdf'), cert('Lifting machinery inspector report', 'LMI-0877', D(-200), D(165), 'OHC-01_LMI_report.pdf')] },
    { id: 'AS-007', tag: 'CB-04', name: '2 t chain block CB-04', type: 'AT-TACKLE', make: 'Yale', model: 'CB 2t', serial: 'YL-CB2-8841', site: 'S-JHB', location: 'Workshop tool store', responsible: 'P-008', status: 'In Service', year: 2020, custom: { 'SWL (t)': '2' },
      certs: [cert('Lifting tackle inspection certificate', 'LTI-0451', D(-160), D(22), 'CB-04_tackle_cert.pdf')] },
    { id: 'AS-008', tag: 'RK-A', name: 'Pallet racking — Aisles A–D', type: 'AT-RACK', make: 'Dexion', model: 'Speedlock P90', serial: 'RK-CPT-AD', site: 'S-CPT', location: 'Warehouse aisles A–D', responsible: 'P-004', status: 'In Service', year: 2017, custom: { 'Bays': '48', 'Beam level SWL (kg)': '2000' },
      certs: [cert('Racking inspection report (competent person)', 'RI-2025-07', D(-410), D(-45), 'Racking_inspection_2025.pdf')] },
    { id: 'AS-009', tag: 'CMP-02', name: '500 L air compressor CMP-02', type: 'AT-COMP', make: 'Atlas Copco', model: 'GX7', serial: 'AC-GX7-20931', site: 'S-DBN', location: 'Workshop', responsible: 'P-010', status: 'Out of Service', year: 2016, custom: { 'Volume (L)': '500', 'Working pressure (kPa)': '1000' },
      certs: [cert('Pressure equipment inspection certificate', 'PE-0931', D(-300), D(65), 'CMP-02_PE_cert.pdf')] },
    { id: 'AS-010', tag: 'FE-DBN', name: 'Fire extinguishers & hose reels (Pinetown)', type: 'AT-FIRE', make: 'Various', model: '9 kg DCP ×12, CO2 ×4, hose reels ×3', serial: 'FE-SET-DBN', site: 'S-DBN', location: 'Whole site', responsible: 'P-011', status: 'In Service', year: 2020, custom: { 'Quantity': '19', 'Type': 'DCP / CO2 / hose reel' },
      certs: [cert('Annual service certificate (accredited service provider)', 'FS-DBN-25', D(-340), D(25), 'FE_service_DBN.pdf')] },
    { id: 'AS-011', tag: 'FE-JHB', name: 'Fire extinguishers & hose reels (Germiston)', type: 'AT-FIRE', make: 'Various', model: '9 kg DCP ×30, CO2 ×8, hose reels ×6', serial: 'FE-SET-JHB', site: 'S-JHB', location: 'Whole site', responsible: 'P-007', status: 'In Service', year: 2019, custom: { 'Quantity': '44', 'Type': 'DCP / CO2 / hose reel' },
      certs: [cert('Annual service certificate (accredited service provider)', 'FS-JHB-26', D(-90), D(275), 'FE_service_JHB.pdf')] },
    { id: 'AS-012', tag: 'AG-11', name: '230 mm angle grinder AG-11', type: 'AT-TOOL', make: 'Makita', model: 'GA9020', serial: 'MK-GA-55120', site: 'S-CPT', location: 'Workshop', responsible: 'P-016', status: 'In Service', year: 2022, custom: { 'Voltage': '230 V' },
      certs: [] },
    { id: 'AS-013', tag: 'FL-R1', name: 'Diesel forklift FL-R1', type: 'AT-FL', make: 'Toyota', model: '8FD25', serial: 'TY8FD-RW-0098', site: 'S-RPV', location: 'Workshop yard', responsible: 'P-017', status: 'In Service', year: 2020, custom: { 'Capacity (kg)': '2500', 'Fuel type': 'Diesel' },
      certs: [cert('Lifting machine examination & load test certificate', 'LT-RW-0098', D(-100), D(265), 'FL-R1_load_test.pdf')] }
  ];
  S.assets.forEach(a => { a.qr = 'VDW-QR-' + a.id; });

  /* ---------------- Inspection schedules ---------------- */
  S.schedules = [
    { id: 'ISCH-01', template: 'TPL-FL', asset: 'AS-001', site: 'S-JHB', target: 'FL-01', freqDays: 30, nextDue: D(12), assignee: 'P-007' },
    { id: 'ISCH-02', template: 'TPL-FL', asset: 'AS-002', site: 'S-JHB', target: 'FL-02', freqDays: 30, nextDue: D(2), assignee: 'P-007' },
    { id: 'ISCH-03', template: 'TPL-FL', asset: 'AS-003', site: 'S-CPT', target: 'FL-07', freqDays: 30, nextDue: D(-5), assignee: 'P-016' },
    { id: 'ISCH-04', template: 'TPL-VEH', asset: 'AS-004', site: 'S-JHB', target: 'LDV-03', freqDays: 30, nextDue: D(8), assignee: 'P-014' },
    { id: 'ISCH-05', template: 'TPL-WS', asset: null, site: 'S-JHB', target: 'Germiston warehouse & workshop', freqDays: 30, nextDue: D(-3), assignee: 'P-007' },
    { id: 'ISCH-06', template: 'TPL-WS', asset: null, site: 'S-DBN', target: 'Pinetown workshop', freqDays: 30, nextDue: D(6), assignee: 'P-011' },
    { id: 'ISCH-07', template: 'TPL-FE', asset: 'AS-010', site: 'S-DBN', target: 'Fire equipment — Pinetown', freqDays: 30, nextDue: D(-10), assignee: 'P-011' },
    { id: 'ISCH-08', template: 'TPL-CHEM', asset: null, site: 'S-DBN', target: 'Chemical store — Pinetown', freqDays: 90, nextDue: D(20), assignee: 'P-011' },
    { id: 'ISCH-09', template: 'TPL-RACK', asset: 'AS-008', site: 'S-CPT', target: 'Racking aisles A–D', freqDays: 180, nextDue: D(-30), assignee: 'P-016' },
    { id: 'ISCH-10', template: 'TPL-WS', asset: null, site: 'S-CPT', target: 'Montague Gardens warehouse', freqDays: 30, nextDue: D(15), assignee: 'P-016' },
    { id: 'ISCH-11', template: 'TPL-FE', asset: 'AS-011', site: 'S-JHB', target: 'Fire equipment — Germiston', freqDays: 30, nextDue: D(18), assignee: 'P-007' },
    { id: 'ISCH-12', template: 'TPL-FL', asset: 'AS-013', site: 'S-RPV', target: 'FL-R1', freqDays: 30, nextDue: D(9), assignee: 'P-017' }
  ];

  /* ---------------- Completed inspections (history) ---------------- */
  const snap = (tplId, rev) => { const t = S.templates.find(x => x.id === tplId); const r = t.revisions.find(x => x.rev === rev); return { templateId: tplId, docNumber: t.docNumber, title: t.title, rev: r.rev, revDate: r.revDate, questions: JSON.parse(JSON.stringify(r.questions)) }; };
  const allPass = (s, fails = {}) => s.questions.map(q => ({ qid: q.id, result: fails[q.id] ? 'Fail' : 'Pass', comment: fails[q.id] || '', photo: null }));
  const i1 = snap('TPL-FL', 2), i2 = snap('TPL-FL', 3), i3 = snap('TPL-WS', 1), i4 = snap('TPL-FE', 1), i5 = snap('TPL-FL', 3), i6 = snap('TPL-VEH', 2), i7 = snap('TPL-CHEM', 1);
  S.inspections = [
    { id: 'INS-1041', template: i1, schedule: 'ISCH-01', asset: 'AS-001', site: 'S-JHB', target: 'FL-01', date: D(-140), inspector: 'P-007', reviewer: 'P-002', reviewedOn: D(-138), results: allPass(i1), summary: 'No defects. Completed on template revision 2 (since superseded).', actions: [], status: 'Reviewed' },
    { id: 'INS-1102', template: i2, schedule: 'ISCH-01', asset: 'AS-001', site: 'S-JHB', target: 'FL-01', date: D(-18), inspector: 'P-007', reviewer: 'P-002', reviewedOn: D(-17), results: allPass(i2), summary: 'Satisfactory.', actions: [], status: 'Reviewed' },
    { id: 'INS-1098', template: i5, schedule: 'ISCH-02', asset: 'AS-002', site: 'S-JHB', target: 'FL-02', date: D(-28), inspector: 'P-007', reviewer: null, results: allPass(i5, { q6: 'Seatbelt retractor slow — replaced same day.' }), summary: 'Seatbelt retractor replaced during inspection; closed on the spot.', actions: [], status: 'Completed' },
    { id: 'INS-1087', template: i3, schedule: 'ISCH-05', asset: null, site: 'S-JHB', target: 'Germiston warehouse & workshop', date: D(-33), inspector: 'P-007', reviewer: 'P-002', reviewedOn: D(-31), results: allPass(i3, { q2: 'Floor markings faded at dispatch bay crossing.' }), summary: 'One finding raised.', actions: ['ACT-1012'], status: 'Reviewed' },
    { id: 'INS-1090', template: i4, schedule: 'ISCH-07', asset: 'AS-010', site: 'S-DBN', target: 'Fire equipment — Pinetown', date: D(-40), inspector: 'P-011', reviewer: null, results: allPass(i4, { q3: 'Two extinguishers past service date.' }), summary: 'Service of 2 units required.', actions: ['ACT-1016'], status: 'Completed' },
    { id: 'INS-1095', template: i6, schedule: 'ISCH-04', asset: 'AS-004', site: 'S-JHB', target: 'LDV-03', date: D(-22), inspector: 'P-014', reviewer: 'P-005', reviewedOn: D(-21), results: allPass(i6), summary: 'Satisfactory.', actions: [], status: 'Reviewed' },
    { id: 'INS-1080', template: i7, schedule: 'ISCH-08', asset: null, site: 'S-DBN', target: 'Chemical store — Pinetown', date: D(-70), inspector: 'P-011', reviewer: 'P-003', reviewedOn: D(-69), results: allPass(i7, { q5: 'No eyewash station within reach of degreasing bay.', q1: 'SDS for Solvex 300 older than review cycle.' }), summary: 'Two findings; eyewash station linked to RA-003.', actions: ['ACT-1005'], status: 'Reviewed' }
  ];

  /* ---------------- Documents ---------------- */
  const rev = (n, status, date, file, notes, author, history, extra = {}) => Object.assign({ rev: n, draft: 0, status, date, effective: status === 'Issued for Use' || status === 'Superseded' ? date : null, file: file ? demoFile(file, 180 + n * 13) : null, notes, author, history }, extra);
  const h = (ts, by, action, comment) => ({ ts, by, action, comment: comment || '' });
  const issuedHist = (dDays, author, approver) => [h(T(dDays - 12), author, 'Created draft'), h(T(dDays - 9), author, 'Submitted for review'), h(T(dDays - 7), approver, 'Review started'), h(T(dDays - 4), approver, 'Approved', 'Approved for issue.'), h(T(dDays), approver, 'Issued for use')];
  const doc = (id, number, title, category, type, site, dept, owner, reviewMonths, nextReview, access, revisions, extra = {}) => Object.assign({ id, number, title, category, type, org: site === 'S-RPV' ? 'ORG-2' : 'ORG-1', site, dept, owner, reviewMonths, nextReview, access, revisions, related: [] }, extra);
  S.documents = [
    doc('DOC-001', 'KIE-POL-001', 'HSEQ Policy', 'Policy', 'Controlled document', 'ALL', 'Management', 'P-001', 12, D(120), 'Public', [
      rev(2, 'Superseded', D(-610), 'KIE-POL-001_Rev2.pdf', 'Annual review.', 'P-002', issuedHist(-610, 'P-002', 'P-001')),
      rev(3, 'Issued for Use', D(-245), 'KIE-POL-001_Rev3.pdf', 'Updated to include environmental and quality commitments.', 'P-002', issuedHist(-245, 'P-002', 'P-001'))]),
    doc('DOC-002', 'KIE-PRO-004', 'Document and Record Control Procedure', 'Procedure', 'Controlled document', 'ALL', 'HSEQ', 'P-002', 24, D(260), 'Internal', [
      rev(2, 'Issued for Use', D(-470), 'KIE-PRO-004_Rev2.pdf', 'Added electronic approval workflow.', 'P-002', issuedHist(-470, 'P-002', 'P-001'))]),
    doc('DOC-003', 'KIE-PRO-011', 'Incident Reporting and Investigation Procedure', 'Procedure', 'Controlled document', 'ALL', 'HSEQ', 'P-002', 24, D(-14), 'Internal', [
      rev(2, 'Issued for Use', D(-744), 'KIE-PRO-011_Rev2.pdf', 'Root-cause method updated.', 'P-002', issuedHist(-744, 'P-002', 'P-001'))]),
    doc('DOC-004', 'KIE-SWP-021', 'Forklift Operation Safe Work Procedure', 'Safe Work Procedure', 'Controlled document', 'ALL', 'Warehouse & Logistics', 'P-005', 24, D(20), 'Internal', [
      rev(3, 'Superseded', D(-1100), 'KIE-SWP-021_Rev3.pdf', 'Periodic review.', 'P-007', issuedHist(-1100, 'P-007', 'P-002')),
      rev(4, 'Issued for Use', D(-710), 'KIE-SWP-021_Rev4.pdf', 'Pedestrian exclusion zones and blue-spot lights added.', 'P-007', issuedHist(-710, 'P-007', 'P-002'))]),
    doc('DOC-005', 'KIE-SWP-022', 'Overhead Crane and Lifting Tackle Safe Work Procedure', 'Safe Work Procedure', 'Controlled document', 'S-JHB', 'Workshop & Service', 'P-008', 24, D(150), 'Internal', [
      rev(1, 'Issued for Use', D(-580), 'KIE-SWP-022_Rev1.pdf', 'First issue.', 'P-008', issuedHist(-580, 'P-008', 'P-002')),
      Object.assign(rev(2, 'Under Review', D(-6), 'KIE-SWP-022_Rev2_draft.docx', 'Added pre-lift checklist and tag-line requirements.', 'P-008', [h(T(-10), 'P-008', 'Created draft revision 2'), h(T(-6), 'P-008', 'Submitted for review'), h(T(-5), 'P-002', 'Review started')]), { draft: 1, reviewer: 'P-002', approver: 'P-002' })]),
    doc('DOC-006', 'KIE-RA-005', 'Workshop Baseline Risk Assessment', 'Risk Assessment', 'Controlled record', 'S-JHB', 'Workshop & Service', 'P-002', 12, D(64), 'Internal', [
      rev(2, 'Issued for Use', D(-300), 'KIE-RA-005_Rev2.xlsx', 'Annual review.', 'P-006', issuedHist(-300, 'P-006', 'P-002'))]),
    doc('DOC-007', 'KIE-MS-003', 'Method Statement — Installation of Pallet Racking', 'Method Statement', 'Controlled document', 'S-CPT', 'Warehouse & Logistics', 'P-004', 24, D(700), 'Internal', [
      Object.assign(rev(1, 'Submitted for Review', D(-3), 'KIE-MS-003_Rev1_draft.pdf', 'New method statement for racking extension project.', 'P-004', [h(T(-8), 'P-004', 'Created draft'), h(T(-3), 'P-004', 'Submitted for review', 'Please review before contractor starts on site.')]), { draft: 1, reviewer: 'P-006', approver: 'P-002' })]),
    doc('DOC-008', 'KIE-EP-001', 'Emergency Response Plan — Germiston', 'Emergency Plan', 'Controlled document', 'S-JHB', 'HSEQ', 'P-002', 12, D(95), 'Internal', [
      rev(2, 'Issued for Use', D(-270), 'KIE-EP-001_Rev2.pdf', 'Updated emergency contacts and assembly point map.', 'P-002', issuedHist(-270, 'P-002', 'P-001'))]),
    doc('DOC-009', 'KIE-EP-002', 'Emergency Response Plan — Pinetown', 'Emergency Plan', 'Controlled document', 'S-DBN', 'HSEQ', 'P-003', 12, D(-40), 'Internal', [
      rev(1, 'Issued for Use', D(-405), 'KIE-EP-002_Rev1.pdf', 'First issue.', 'P-011', issuedHist(-405, 'P-011', 'P-002'))]),
    doc('DOC-010', 'KIE-EP-003', 'Emergency Response Plan — Montague Gardens', 'Emergency Plan', 'Controlled document', 'S-CPT', 'HSEQ', 'P-004', 12, D(330), 'Internal', [
      Object.assign(rev(1, 'Draft', D(-12), 'KIE-EP-003_Rev1_draft.docx', 'Initial draft — site evacuation map still outstanding.', 'P-004', [h(T(-12), 'P-004', 'Created draft')]), { draft: 1 })]),
    doc('DOC-011', 'KIE-ENV-001', 'Waste Management Procedure', 'Environmental', 'Controlled document', 'ALL', 'HSEQ', 'P-002', 24, D(410), 'Internal', [
      rev(1, 'Issued for Use', D(-320), 'KIE-ENV-001_Rev1.pdf', 'First issue.', 'P-006', issuedHist(-320, 'P-006', 'P-002'))]),
    doc('DOC-012', 'KIE-QMS-002', 'Control of Nonconforming Product', 'Quality', 'Controlled document', 'ALL', 'Workshop & Service', 'P-005', 24, D(180), 'Internal', [
      rev(3, 'Issued for Use', D(-550), 'KIE-QMS-002_Rev3.pdf', 'Aligned to service workshop process.', 'P-005', issuedHist(-550, 'P-005', 'P-002'))]),
    doc('DOC-013', 'KIE-FRM-010', 'Daily Forklift Pre-use Checklist', 'Form / Template', 'Controlled document', 'ALL', 'Warehouse & Logistics', 'P-007', 24, D(300), 'Internal', [
      rev(2, 'Issued for Use', D(-430), 'KIE-FRM-010_Rev2.pdf', 'Blue-spot light added.', 'P-007', issuedHist(-430, 'P-007', 'P-002'))]),
    doc('DOC-014', 'KIE-MAN-001', 'HSEQ Management System Manual', 'Manual / Work Instruction', 'Controlled document', 'ALL', 'HSEQ', 'P-002', 24, D(220), 'Internal', [
      rev(1, 'Issued for Use', D(-510), 'KIE-MAN-001_Rev1.pdf', 'First issue.', 'P-006', issuedHist(-510, 'P-006', 'P-001'))]),
    doc('DOC-015', 'KIE-REG-001', 'Legal and Other Requirements Register (export)', 'Register', 'Controlled record', 'ALL', 'HSEQ', 'P-002', 12, D(45), 'Confidential', [
      rev(4, 'Issued for Use', D(-320), 'KIE-REG-001_Rev4.xlsx', 'Annual legal review — requires verification.', 'P-006', issuedHist(-320, 'P-006', 'P-002'))]),
    doc('DOC-016', 'KIE-APP-001', 'Appointment Letter — Section 16(2) Assignee (P. Botha)', 'Legal Appointment', 'Controlled record', 'S-JHB', 'Management', 'P-001', 24, D(390), 'Confidential', [
      rev(1, 'Issued for Use', D(-340), 'KIE-APP-001_signed.pdf', 'Signed appointment and acceptance.', 'P-002', issuedHist(-340, 'P-002', 'P-001'))]),
    doc('DOC-017', 'KIE-TRN-003', 'General HSEQ Induction Presentation', 'Training Material', 'Controlled document', 'ALL', 'HSEQ', 'P-002', 12, D(365), 'Internal', [
      rev(2, 'Issued for Use', D(-400), 'KIE-TRN-003_Rev2.pptx', 'Annual update.', 'P-006', issuedHist(-400, 'P-006', 'P-002')),
      Object.assign(rev(3, 'Approved', D(-2), 'KIE-TRN-003_Rev3.pptx', 'Added chemical safety and incident reporting modules.', 'P-006', [h(T(-9), 'P-006', 'Created draft revision 3'), h(T(-7), 'P-006', 'Submitted for review'), h(T(-6), 'P-002', 'Review started'), h(T(-2), 'P-002', 'Approved', 'Approved — issue at start of next month.')]), { draft: 1, reviewer: 'P-002', approver: 'P-002' })]),
    doc('DOC-018', 'KIE-SDS-014', 'SDS — Solvex 300 Degreaser (supplier SDS)', 'Safety Data Sheet', 'External document', 'S-DBN', 'Workshop & Service', 'P-011', 24, D(-20), 'Public', [
      rev(1, 'Issued for Use', D(-750), 'Solvex300_SDS_supplier.pdf', 'Supplier SDS received.', 'P-011', issuedHist(-750, 'P-011', 'P-003'))]),
    doc('DOC-019', 'KIE-SDS-002', 'SDS — Hydraulic Oil ISO VG 46', 'Safety Data Sheet', 'External document', 'S-JHB', 'Workshop & Service', 'P-008', 24, D(400), 'Public', [
      rev(1, 'Issued for Use', D(-330), 'HydOil46_SDS.pdf', 'Supplier SDS.', 'P-008', issuedHist(-330, 'P-008', 'P-002'))]),
    doc('DOC-020', 'KIE-SDS-005', 'SDS — Aerosol Spray Paint (Industrial Enamel)', 'Safety Data Sheet', 'External document', 'S-CPT', 'Workshop & Service', 'P-016', 24, D(25), 'Public', [
      rev(1, 'Issued for Use', D(-705), 'SprayPaint_SDS.pdf', 'Supplier SDS.', 'P-016', issuedHist(-705, 'P-016', 'P-004'))]),
    doc('DOC-021', 'KIE-CERT-007', 'Electrical Certificate of Compliance — Germiston', 'Certificate', 'Controlled record', 'S-JHB', 'Management', 'P-005', 0, null, 'Internal', [
      rev(1, 'Issued for Use', D(-800), 'CoC_Germiston.pdf', 'Issued by registered electrical contractor (fictional).', 'P-005', issuedHist(-800, 'P-005', 'P-002'))]),
    doc('DOC-022', 'KIE-AUD-2026-02', 'Internal HSEQ Audit Report — Pinetown', 'Audit / Inspection Report', 'Controlled record', 'S-DBN', 'HSEQ', 'P-006', 0, null, 'Confidential', [
      rev(1, 'Issued for Use', D(-55), 'Audit_Pinetown_2026-02.pdf', 'Audit report with 5 findings.', 'P-006', issuedHist(-55, 'P-006', 'P-002'))]),
    doc('DOC-023', 'KIE-EQM-004', 'Linde H25 Operator Manual (OEM)', 'Equipment Manual', 'External document', 'S-JHB', 'Warehouse & Logistics', 'P-007', 0, null, 'Internal', [
      rev(1, 'Issued for Use', D(-1500), 'Linde_H25_manual.pdf', 'OEM manual.', 'P-007', issuedHist(-1500, 'P-007', 'P-002'))]),
    doc('DOC-024', 'KIE-PRO-015', 'Hazardous Chemical Agents Management Procedure', 'Procedure', 'Controlled document', 'ALL', 'HSEQ', 'P-002', 24, D(10), 'Internal', [
      rev(1, 'Issued for Use', D(-720), 'KIE-PRO-015_Rev1.pdf', 'First issue.', 'P-006', issuedHist(-720, 'P-006', 'P-002'))]),
    doc('DOC-025', 'KIE-PRO-018', 'Contractor Management Procedure', 'Procedure', 'Controlled document', 'ALL', 'HSEQ', 'P-002', 24, D(700), 'Internal', [
      Object.assign(rev(1, 'Returned for Correction', D(-4), 'KIE-PRO-018_Rev1_draft.docx', 'New procedure.', 'P-006', [h(T(-15), 'P-006', 'Created draft'), h(T(-11), 'P-006', 'Submitted for review'), h(T(-9), 'P-002', 'Review started'), h(T(-4), 'P-002', 'Returned for correction', 'Section 6: add contractor induction & permit-to-work interface. Section 8: reference the 37(2) mandatory agreement template.')]), { draft: 1, reviewer: 'P-002', approver: 'P-002' })]),
    doc('DOC-026', 'KIE-PRO-020', 'Permit to Work Procedure (legacy)', 'Procedure', 'Controlled document', 'ALL', 'HSEQ', 'P-002', 24, null, 'Internal', [
      rev(1, 'Obsolete', D(-900), 'KIE-PRO-020_Rev1.pdf', 'Replaced by section in Contractor Management Procedure.', 'P-002', issuedHist(-1200, 'P-002', 'P-001').concat([h(T(-90), 'P-002', 'Made obsolete', 'Superseded by KIE-PRO-018 (in development).')]))]),
    doc('DOC-027', 'KIE-FRM-002', 'Incident Report Form (paper, legacy)', 'Form / Template', 'Controlled document', 'ALL', 'HSEQ', 'P-002', 24, null, 'Internal', [
      rev(3, 'Archived', D(-1000), 'KIE-FRM-002_Rev3.pdf', 'Replaced by electronic incident reporting.', 'P-002', issuedHist(-1200, 'P-002', 'P-001').concat([h(T(-200), 'P-002', 'Made obsolete'), h(T(-180), 'P-002', 'Archived')]))]),
    doc('DOC-028', 'KIE-SWP-030', 'Battery Charging Station Safe Work Procedure', 'Safe Work Procedure', 'Controlled document', 'S-JHB', 'Warehouse & Logistics', 'P-007', 24, D(500), 'Internal', [
      rev(1, 'Issued for Use', D(-230), 'KIE-SWP-030_Rev1.pdf', 'First issue.', 'P-007', issuedHist(-230, 'P-007', 'P-002'))]),
    doc('DOC-029', 'RPV-PRO-001', 'Workshop Safety Procedure', 'Procedure', 'Controlled document', 'S-RPV', 'Workshop & Service', 'P-017', 24, D(140), 'Internal', [
      rev(1, 'Issued for Use', D(-300), 'RPV-PRO-001_Rev1.pdf', 'First issue.', 'P-017', issuedHist(-300, 'P-017', 'P-017'))])
  ];

  /* ---------------- Legal & other requirements (ILLUSTRATIVE) ---------------- */
  const L = (id, site, source, reference, requirement, applicability, responsible, controls, evidenceReq, status, freq, lastReviewed, nextReview, docs, risks, extra = {}) =>
    Object.assign({ id, org: site === 'S-RPV' ? 'ORG-2' : 'ORG-1', site, source, reference, requirement, applicability, responsible, controls, evidenceReq, status, freq, lastReviewed, nextReview, docs, risks, evidence: [], gaps: '', naJustification: '', assessments: [] }, extra);
  const asmt = (date, by, status, note) => ({ date, by, status, note });
  S.legal = [
    L('LR-001', 'ALL', 'Occupational Health and Safety Act 85 of 1993', 'Section 8 — General duties of employers', 'Provide and maintain, as far as reasonably practicable, a working environment that is safe and without risk to the health of employees.', 'Applies to all sites with employees.', 'P-001', 'HSEQ policy, risk assessments, SWPs, inspections and action management.', 'Issued HSEQ policy; current risk assessments; inspection records.', 'Compliant', 12, D(-60), D(305), ['DOC-001', 'DOC-006', 'DOC-014'], ['RA-001', 'RA-002'], { evidence: [{ name: 'Management review minutes Q2.pdf', date: D(-60), by: 'P-002', note: 'Reviewed with MD.' }], assessments: [asmt(D(-60), 'P-006', 'Compliant', 'Systems in place and operating.')] }),
    L('LR-002', 'ALL', 'Occupational Health and Safety Act 85 of 1993', 'Section 16(2) — Assignment of duties by the chief executive officer', 'Where duties are assigned by the CEO, assignment is formal, accepted and the assignee is competent.', 'Organisation-wide.', 'P-001', 'Written 16(2) assignment, acceptance signature, annual review.', 'Signed assignment letter and acceptance.', 'Compliant', 12, D(-90), D(275), ['DOC-016'], [], { assessments: [asmt(D(-90), 'P-006', 'Compliant', 'Letter on file, accepted.')] }),
    L('LR-003', 'S-JHB', 'Occupational Health and Safety Act 85 of 1993', 'Section 17 — Health and safety representatives', 'Designate health and safety representatives where more than 20 employees are employed, in the prescribed ratio.', 'Germiston: 64 employees.', 'P-005', 'Formal designation, H&S rep training, inspection schedule for reps.', 'Designation letters; training certificates; rep inspection records.', 'Compliant', 12, D(-40), D(325), [], [], { assessments: [asmt(D(-40), 'P-002', 'Compliant', '3 reps designated and trained.')] }),
    L('LR-004', 'S-DBN', 'Occupational Health and Safety Act 85 of 1993', 'Section 17 — Health and safety representatives', 'Designate health and safety representatives where more than 20 employees are employed, in the prescribed ratio.', 'Pinetown: 27 employees.', 'P-003', 'Formal designation, H&S rep training.', 'Designation letter; training certificate.', 'Partially Compliant', 12, D(-55), D(310), [], [], { gaps: 'Representative designated but has not completed H&S representative training.', assessments: [asmt(D(-55), 'P-006', 'Partially Compliant', 'Training outstanding — see training matrix.')] }),
    L('LR-005', 'S-CPT', 'Occupational Health and Safety Act 85 of 1993', 'Section 17 — Health and safety representatives', 'Designate health and safety representatives where more than 20 employees are employed, in the prescribed ratio.', 'Montague Gardens: 22 employees.', 'P-004', 'Formal designation, H&S rep training.', 'Designation letter; training certificate.', 'Non-Compliant', 12, D(-30), D(60), [], [], { gaps: 'No health and safety representative designated since previous rep resigned.', assessments: [asmt(D(-30), 'P-006', 'Non-Compliant', 'Vacancy — designation required.')] }),
    L('LR-006', 'S-JHB', 'Occupational Health and Safety Act 85 of 1993', 'Section 19 — Health and safety committees', 'Establish health and safety committee(s) where two or more H&S representatives are designated; meet as required.', 'Germiston.', 'P-005', 'Committee constitution, meeting schedule, minutes.', 'Committee minutes for the last 3 meetings.', 'Compliant', 12, D(-40), D(325), [], [], { assessments: [asmt(D(-40), 'P-002', 'Compliant', 'Minutes available.')] }),
    L('LR-007', 'ALL', 'OHS Act 85 of 1993 & General Administrative Regulations', 'Section 24 — Report to inspector regarding certain incidents; GAR provisions on recording & investigation of incidents (regulation numbers to be verified)', 'Report qualifying incidents to the Department of Employment and Labour; record and investigate incidents.', 'All sites.', 'P-002', 'Incident procedure, incident register, investigation by competent person.', 'Incident register; investigation reports; submitted reports where applicable.', 'Partially Compliant', 12, D(-100), D(-8), ['DOC-003'], [], { gaps: 'Incident procedure overdue for review; Pinetown incident investigation not completed within internal target.', assessments: [asmt(D(-100), 'P-006', 'Partially Compliant', 'Procedure overdue for review.')] }),
    L('LR-008', 'S-JHB', 'Driven Machinery Regulations, 2015 (OHS Act)', 'Lifting machines and lifting tackle — inspection, examination and load testing (regulation number to be verified)', 'Lifting machines and tackle examined and load tested by a competent person at prescribed intervals; records kept.', 'Germiston: forklifts, overhead crane, chain blocks.', 'P-008', 'Inspection schedule; competent lifting machine inspector; tackle register.', 'Current load-test certificates; tackle inspection records.', 'Partially Compliant', 12, D(-70), D(295), ['DOC-005'], ['RA-002'], { gaps: 'Chain block CB-04 certificate expiring within 30 days; SWP-022 revision under review.', assessments: [asmt(D(-70), 'P-002', 'Partially Compliant', 'Certificates tracked; one item expiring.')] }),
    L('LR-009', 'S-CPT', 'Driven Machinery Regulations, 2015 (OHS Act)', 'Lifting machines — inspection, examination and load testing (regulation number to be verified)', 'Lifting machines examined and load tested by a competent person at prescribed intervals; records kept.', 'Montague Gardens: forklift FL-07.', 'P-016', 'Certificate tracking; booking of lifting machine inspector.', 'Current load-test certificate for FL-07.', 'Non-Compliant', 12, D(-20), D(345), [], ['RA-004'], { gaps: 'FL-07 load-test certificate expired.', assessments: [asmt(D(-20), 'P-006', 'Non-Compliant', 'Certificate expired — action raised.')] }),
    L('LR-010', 'S-DBN', 'Hazardous Chemical Agents Regulations, 2021 (OHS Act)', 'Information, risk assessment and control of exposure (regulation numbers to be verified)', 'Maintain current SDSs, assess exposure risks, implement controls and train exposed employees.', 'Pinetown workshop — degreasers and solvents.', 'P-003', 'Chemical register, SDS file, risk assessment, PPE, eyewash.', 'Current SDSs; HCA risk assessment; training records.', 'Partially Compliant', 12, D(-70), D(295), ['DOC-018', 'DOC-024'], ['RA-003'], { gaps: 'Solvex 300 SDS overdue for review; eyewash station not installed at degreasing bay.', assessments: [asmt(D(-70), 'P-006', 'Partially Compliant', 'Gaps linked to RA-003.')] }),
    L('LR-011', 'S-JHB', 'Hazardous Chemical Agents Regulations, 2021 (OHS Act)', 'Information, risk assessment and control of exposure (regulation numbers to be verified)', 'Maintain current SDSs, assess exposure risks, implement controls and train exposed employees.', 'Germiston — oils, battery electrolyte.', 'P-008', 'Chemical register, SDS file, battery charging SWP.', 'Current SDSs; risk assessment.', 'Compliant', 12, D(-80), D(285), ['DOC-019', 'DOC-024', 'DOC-028'], [], { assessments: [asmt(D(-80), 'P-002', 'Compliant', '')] }),
    L('LR-012', 'S-JHB', 'Electrical Installation Regulations, 2009 (OHS Act)', 'Certificate of compliance for electrical installation', 'Hold a valid certificate of compliance for the electrical installation, issued by a registered person.', 'Germiston premises.', 'P-005', 'CoC on file; changes to installation certified.', 'Certificate of compliance.', 'Compliant', 24, D(-180), D(550), ['DOC-021'], ['RA-005'], { assessments: [asmt(D(-180), 'P-002', 'Compliant', 'CoC on file; no alterations since issue.')] }),
    L('LR-013', 'S-DBN', 'Electrical Installation Regulations, 2009 (OHS Act)', 'Certificate of compliance for electrical installation', 'Hold a valid certificate of compliance for the electrical installation, issued by a registered person.', 'Pinetown premises (leased).', 'P-003', 'Obtain CoC from landlord / registered person.', 'Certificate of compliance.', 'Not Assessed', 24, null, D(-15), [], [], {}),
    L('LR-014', 'S-CPT', 'Environmental Regulations for Workplaces (OHS Act)', 'Fire precautions and means of egress (regulation number to be verified)', 'Provide adequate firefighting equipment, keep it maintained and keep escape routes clear.', 'Montague Gardens.', 'P-004', 'Fire equipment service contract; monthly inspection; evacuation drills.', 'Service certificate; inspection records; drill records.', 'Compliant', 12, D(-120), D(245), ['DOC-010'], [], { assessments: [asmt(D(-120), 'P-006', 'Compliant', '')] }),
    L('LR-015', 'S-DBN', 'General Safety Regulations (OHS Act)', 'First aid, emergency equipment and procedures (regulation number to be verified)', 'Provide first aid boxes and trained first aiders in the prescribed ratio.', 'Pinetown.', 'P-003', 'First aider appointments; first aid box inspections.', 'First aid certificates; box checklist.', 'Compliant', 12, D(-110), D(255), [], [], { assessments: [asmt(D(-110), 'P-006', 'Compliant', '')] }),
    L('LR-016', 'ALL', 'Compensation for Occupational Injuries and Diseases Act 130 of 1993', 'Registration and reporting of occupational injuries to the Compensation Fund', 'Register with the Compensation Fund, submit returns and report qualifying injuries within prescribed periods.', 'All employing entities.', 'P-001', 'Payroll/HR process; incident procedure.', 'Letter of good standing; claim submissions.', 'Compliant', 12, D(-150), D(215), ['DOC-003'], [], { assessments: [asmt(D(-150), 'P-002', 'Compliant', 'Letter of good standing on file.')] }),
    L('LR-017', 'ALL', 'National Environmental Management Act 107 of 1998', 'Section 28 — Duty of care and remediation of environmental damage', 'Take reasonable measures to prevent pollution or degradation of the environment.', 'All sites (oils, chemicals, waste).', 'P-002', 'Waste procedure, spill kits, bunding.', 'Waste records; spill kit inspections.', 'Compliant', 12, D(-90), D(275), ['DOC-011'], [], { assessments: [asmt(D(-90), 'P-006', 'Compliant', '')] }),
    L('LR-018', 'S-CPT', 'National Environmental Management: Waste Act 59 of 2008', 'General duty in respect of waste management; safe storage and disposal records', 'Manage waste so as to avoid harm; use authorised service providers; keep disposal records.', 'Montague Gardens: used oil, filters, scrap.', 'P-004', 'Waste contractor, safe disposal certificates.', 'Safe disposal certificates.', 'Not Assessed', 12, null, D(-5), ['DOC-011'], [], {}),
    L('LR-019', 'ALL', 'Construction Regulations, 2014 (OHS Act)', 'Applicability', 'Requirements for construction work.', 'Not applicable to routine operations.', 'P-002', '—', '—', 'Not Applicable', 12, D(-90), D(275), [], [], { naJustification: 'Kestrel does not perform construction work as defined. Racking installation by contractors is managed under the Contractor Management Procedure; re-assess if building works are commissioned.', assessments: [asmt(D(-90), 'P-006', 'Not Applicable', 'Justification recorded.')] }),
    L('LR-020', 'ALL', 'ISO 45001:2018 (voluntary commitment — other requirement)', 'Clause 9.2 — Internal audit', 'Conduct internal audits at planned intervals.', 'Organisation-wide (certification objective).', 'P-002', 'Audit programme, competent auditors.', 'Audit programme and reports.', 'Compliant', 12, D(-55), D(310), ['DOC-022'], [], { assessments: [asmt(D(-55), 'P-002', 'Compliant', 'Programme on track.')] }),
    L('LR-021', 'S-CPT', 'Facilities Regulations, 2004 (OHS Act)', 'Sanitation, changing facilities and drinking water (regulation numbers to be verified)', 'Provide sanitary, changing and eating facilities as prescribed.', 'Montague Gardens.', 'P-004', 'Facilities inspection.', 'Workplace inspection records.', 'Compliant', 12, D(-140), D(225), [], [], { assessments: [asmt(D(-140), 'P-006', 'Compliant', '')] }),
    L('LR-022', 'S-JHB', 'General Safety Regulations (OHS Act)', 'First aid, emergency equipment and procedures (regulation number to be verified)', 'Provide first aid boxes and trained first aiders in the prescribed ratio.', 'Germiston.', 'P-005', 'First aider appointments; first aid box inspections.', 'First aid certificates; box checklist.', 'Compliant', 12, D(-30), D(335), [], [], { assessments: [asmt(D(-30), 'P-002', 'Compliant', '')] }),
    L('LR-023', 'S-CPT', 'General Safety Regulations (OHS Act)', 'First aid, emergency equipment and procedures (regulation number to be verified)', 'Provide first aid boxes and trained first aiders in the prescribed ratio.', 'Montague Gardens.', 'P-004', 'First aider appointments.', 'First aid certificates.', 'Partially Compliant', 12, D(-30), D(335), [], [], { gaps: 'Only one valid first aider; certificate of second first aider expired.', assessments: [asmt(D(-30), 'P-006', 'Partially Compliant', '')] }),
    L('LR-101', 'S-RPV', 'Occupational Health and Safety Act 85 of 1993', 'Section 8 — General duties of employers', 'Provide and maintain a safe working environment as far as reasonably practicable.', 'Alrode workshop.', 'P-017', 'Workshop procedure, inspections.', 'Procedure; inspection records.', 'Compliant', 12, D(-60), D(305), ['DOC-029'], ['RA-009'], { assessments: [asmt(D(-60), 'P-006', 'Compliant', '')] }),
    L('LR-102', 'S-RPV', 'Driven Machinery Regulations, 2015 (OHS Act)', 'Lifting machines — inspection and load testing (regulation number to be verified)', 'Lifting machines examined and load tested at prescribed intervals.', 'Alrode: forklift FL-R1.', 'P-017', 'Certificate tracking.', 'Load-test certificate.', 'Compliant', 12, D(-100), D(265), [], [], { assessments: [asmt(D(-100), 'P-006', 'Compliant', '')] }),
    L('LR-103', 'S-RPV', 'Occupational Health and Safety Act 85 of 1993', 'Section 17 — Health and safety representatives', 'Designate H&S representatives where required.', 'Alrode: 18 employees — threshold to be confirmed.', 'P-017', '—', 'Headcount confirmation.', 'Not Assessed', 12, null, D(20), [], [], {})
  ];

  /* ---------------- Risk assessments ---------------- */
  const ctrl = (id, text, owner, due, status, action) => ({ id, text, owner, due, status, action: action || null });
  const R = (id, site, activity, hazard, consequence, exposed, existing, L1, S1, controls, responsible, due, L2, S2, reviewDate, approval, links, extra = {}) =>
    Object.assign({ id, org: site === 'S-RPV' ? 'ORG-2' : 'ORG-1', site, activity, hazard, consequence, exposed, existing, L1, S1, controls, responsible, due, L2, S2, reviewDate, approval, legal: links.legal || [], docs: links.docs || [], assets: links.assets || [], evidence: [], file: null, history: [], created: D(-200) }, extra);
  S.risks = [
    R('RA-001', 'S-JHB', 'Forklift operation in warehouse', 'Moving forklifts in areas shared with pedestrians', 'Pedestrian struck — serious injury or fatality', 'Warehouse staff, drivers, visitors', 'Trained & authorised operators; pre-use checklist; speed limit 10 km/h; reverse alarms.', 4, 5,
      [ctrl('C1', 'Install blue-spot warning lights on all forklifts', 'P-007', D(-200), 'Implemented'), ctrl('C2', 'Repaint pedestrian walkways and crossings at dispatch bay', 'P-007', D(10), 'Planned', 'ACT-1012')], 'P-005', D(10), 2, 5, D(160), 'Approved', { legal: ['LR-001', 'LR-008'], docs: ['DOC-004', 'DOC-013'], assets: ['AS-001', 'AS-002'] }, { history: [{ ts: T(-200), by: 'P-006', action: 'Assessment approved', comment: '' }] }),
    R('RA-002', 'S-JHB', 'Lifting with overhead crane and chain blocks', 'Suspended loads; tackle failure', 'Dropped load — crush injury', 'Workshop technicians', 'Certified crane; tackle register; trained operators.', 3, 5,
      [ctrl('C1', 'Introduce documented pre-lift checklist and tag lines (SWP-022 Rev 2)', 'P-008', D(14), 'Planned')], 'P-008', D(14), 2, 4, D(90), 'Approved', { legal: ['LR-008'], docs: ['DOC-005'], assets: ['AS-006', 'AS-007'] }),
    R('RA-003', 'S-DBN', 'Degreasing components with solvent degreaser', 'Solvent splash and vapour inhalation', 'Eye injury, dermatitis, respiratory irritation', 'Workshop technicians', 'Chemical gloves; safety glasses; general ventilation.', 4, 3,
      [ctrl('C1', 'Install plumbed eyewash station within 10 s reach of degreasing bay', 'P-003', D(-12), 'Planned', 'ACT-1005'), ctrl('C2', 'Switch to water-based degreaser where practicable', 'P-010', D(45), 'Planned')], 'P-003', D(-12), 2, 3, D(-5), 'Approved', { legal: ['LR-010'], docs: ['DOC-018', 'DOC-024'], assets: [] }),
    R('RA-004', 'S-CPT', 'Storage on pallet racking; forklift loading at height', 'Racking collapse from impact or overload', 'Crush injuries; stock damage', 'Warehouse staff, operators', 'Load notices; trained operators.', 3, 5,
      [ctrl('C1', 'Competent person racking inspection (annual)', 'P-004', D(-45), 'Planned', 'ACT-1009'), ctrl('C2', 'Fit column guards on end-of-aisle uprights', 'P-016', D(30), 'Planned')], 'P-004', D(30), 2, 5, D(40), 'Approved', { legal: ['LR-009'], docs: ['DOC-007'], assets: ['AS-008', 'AS-003'] }),
    R('RA-005', 'S-JHB', 'Electrical testing and repair of hire equipment', 'Contact with live parts', 'Electric shock, burns', 'Workshop technicians, contractors', 'Lock-out procedure; RCD-protected test bench; competent electricians.', 2, 5,
      [ctrl('C1', 'Annual verification of RCD trip times on test bench', 'P-015', D(-100), 'Implemented')], 'P-008', D(-100), 1, 5, D(200), 'Approved', { legal: ['LR-012'], docs: ['DOC-006'], assets: [] }),
    R('RA-006', 'ALL', 'Driving company vehicles to customer sites', 'Road traffic, fatigue, load shift', 'Vehicle collision; injury', 'Drivers, public', 'Valid licences; vehicle inspections; load securing.', 3, 4,
      [ctrl('C1', 'Defensive driver training for all drivers', 'P-005', D(60), 'Planned')], 'P-005', D(60), 2, 4, D(210), 'Approved', { legal: [], docs: [], assets: ['AS-004', 'AS-005'] }),
    R('RA-007', 'S-DBN', 'Manual handling of stock and components', 'Heavy and awkward loads', 'Musculoskeletal injury', 'Storepersons, technicians', 'Trolleys; team lifts for > 25 kg.', 3, 3,
      [], 'P-003', D(30), 3, 2, D(110), 'Approved', { legal: ['LR-001'], docs: [], assets: [] }),
    R('RA-008', 'S-CPT', 'Grinding and hot work in workshop', 'Sparks, flying particles, noise', 'Eye injuries, burns, fire, hearing loss', 'Workshop technicians', 'Face shields; hearing protection; fire extinguisher at bay.', 3, 4,
      [ctrl('C1', 'Introduce hot-work permit for work outside the designated bay', 'P-016', D(25), 'Planned')], 'P-016', D(25), 2, 3, D(365), 'Draft', { legal: [], docs: [], assets: ['AS-012'] }),
    R('RA-009', 'S-RPV', 'Pump overhaul in workshop', 'Stored pressure, heavy components', 'Crush injury; projectile', 'Technicians', 'Isolation & depressurisation procedure.', 2, 4, [], 'P-017', D(40), 1, 4, D(180), 'Approved', { legal: ['LR-101'], docs: ['DOC-029'], assets: [] })
  ];

  /* ---------------- Training courses, role requirements, records ---------------- */
  S.courses = [
    { id: 'CRS-IND', name: 'General HSEQ induction', category: 'Legal / Mandatory', months: 12, provider: 'Internal (KIE-TRN-003)', doc: 'DOC-017' },
    { id: 'CRS-FLT', name: 'Lift truck (forklift) operator training', category: 'Operational Competency', months: 24, provider: 'ForkSkill Training (fictional)', doc: 'DOC-004' },
    { id: 'CRS-FA1', name: 'First aid level 1', category: 'Emergency', months: 36, provider: 'MedAid Training (fictional)' },
    { id: 'CRS-FF', name: 'Basic fire fighting', category: 'Emergency', months: 24, provider: 'FireReady SA (fictional)' },
    { id: 'CRS-HSR', name: 'Health & safety representative training', category: 'Legal / Mandatory', months: 36, provider: 'VDW Health & Safety Solutions' },
    { id: 'CRS-HCA', name: 'Hazardous chemical agents awareness', category: 'Awareness', months: 24, provider: 'VDW Health & Safety Solutions', doc: 'DOC-024' },
    { id: 'CRS-INV', name: 'Incident investigation & root-cause analysis', category: 'Operational Competency', months: 36, provider: 'VDW Health & Safety Solutions', doc: 'DOC-003' },
    { id: 'CRS-CRN', name: 'Overhead crane & lifting tackle operation', category: 'Operational Competency', months: 24, provider: 'LiftSafe Academy (fictional)', doc: 'DOC-005' },
    { id: 'CRS-DD', name: 'Defensive driving', category: 'Operational Competency', months: 36, provider: 'RoadWise (fictional)' }
  ];
  S.roleReqs = {
    'Forklift Operator': ['CRS-IND', 'CRS-FLT', 'CRS-FF'],
    'Warehouse Supervisor': ['CRS-IND', 'CRS-FLT', 'CRS-FA1', 'CRS-INV'],
    'Workshop Foreman': ['CRS-IND', 'CRS-CRN', 'CRS-FA1', 'CRS-HCA', 'CRS-INV'],
    'Workshop Technician': ['CRS-IND', 'CRS-HCA', 'CRS-CRN'],
    'Workshop Supervisor': ['CRS-IND', 'CRS-HCA', 'CRS-FA1', 'CRS-INV'],
    'Admin & SHE Coordinator': ['CRS-IND', 'CRS-FA1', 'CRS-FF', 'CRS-HSR'],
    'Storeperson': ['CRS-IND', 'CRS-FF'],
    'Delivery Driver': ['CRS-IND', 'CRS-DD'],
    'Branch Manager': ['CRS-IND', 'CRS-INV'],
    'Operations Manager': ['CRS-IND', 'CRS-INV'],
    'HSEQ Manager': ['CRS-IND', 'CRS-INV', 'CRS-HCA'],
    'Managing Director': ['CRS-IND']
  };
  const TRc = (id, person, course, date, verified) => { const c = S.courses.find(x => x.id === course); const exp = new Date(date); exp.setMonth(exp.getMonth() + c.months); return { id, person, course, date, expiry: c.months ? exp.toISOString().slice(0, 10) : null, provider: c.provider, certificate: demoFile(id + '_certificate.pdf', 140), competency: verified ? { by: verified, date: date, method: 'Practical assessment / observation' } : null }; };
  S.training = [
    TRc('TR-001', 'P-009', 'CRS-IND', D(-200), 'P-007'), TRc('TR-002', 'P-009', 'CRS-FLT', D(-690), 'P-007'), TRc('TR-003', 'P-009', 'CRS-FF', D(-300), null),
    TRc('TR-004', 'P-007', 'CRS-IND', D(-250), null), TRc('TR-005', 'P-007', 'CRS-FLT', D(-400), 'P-005'), TRc('TR-006', 'P-007', 'CRS-FA1', D(-1080), null), TRc('TR-007', 'P-007', 'CRS-INV', D(-500), null),
    TRc('TR-008', 'P-008', 'CRS-IND', D(-300), null), TRc('TR-009', 'P-008', 'CRS-CRN', D(-500), 'P-005'), TRc('TR-010', 'P-008', 'CRS-FA1', D(-600), null), TRc('TR-011', 'P-008', 'CRS-HCA', D(-200), null), TRc('TR-012', 'P-008', 'CRS-INV', D(-300), null),
    TRc('TR-013', 'P-010', 'CRS-IND', D(-380), null), TRc('TR-014', 'P-010', 'CRS-HCA', D(-200), null),
    TRc('TR-015', 'P-011', 'CRS-IND', D(-100), null), TRc('TR-016', 'P-011', 'CRS-FA1', D(-700), null), TRc('TR-017', 'P-011', 'CRS-FF', D(-500), null),
    TRc('TR-018', 'P-012', 'CRS-IND', D(-120), null), TRc('TR-019', 'P-012', 'CRS-FLT', D(-760), 'P-016'), TRc('TR-020', 'P-012', 'CRS-FF', D(-200), null),
    TRc('TR-021', 'P-013', 'CRS-IND', D(-60), null), TRc('TR-022', 'P-013', 'CRS-FF', D(-200), null),
    TRc('TR-023', 'P-014', 'CRS-IND', D(-90), null), TRc('TR-024', 'P-014', 'CRS-DD', D(-400), null),
    TRc('TR-025', 'P-016', 'CRS-IND', D(-150), null), TRc('TR-026', 'P-016', 'CRS-HCA', D(-680), null), TRc('TR-027', 'P-016', 'CRS-FA1', D(-1110), null), TRc('TR-028', 'P-016', 'CRS-INV', D(-200), null),
    TRc('TR-029', 'P-003', 'CRS-IND', D(-200), null), TRc('TR-030', 'P-003', 'CRS-INV', D(-400), null),
    TRc('TR-031', 'P-004', 'CRS-IND', D(-340), null),
    TRc('TR-032', 'P-005', 'CRS-IND', D(-180), null), TRc('TR-033', 'P-005', 'CRS-INV', D(-500), null),
    TRc('TR-034', 'P-002', 'CRS-IND', D(-150), null), TRc('TR-035', 'P-002', 'CRS-INV', D(-700), null), TRc('TR-036', 'P-002', 'CRS-HCA', D(-300), null),
    TRc('TR-037', 'P-001', 'CRS-IND', D(-200), null),
    TRc('TR-038', 'P-018', 'CRS-IND', D(-100), null), TRc('TR-039', 'P-017', 'CRS-IND', D(-120), null)
  ];

  /* ---------------- Legal appointments ---------------- */
  const AP = (id, person, type, legalRef, site, appointedBy, date, expiry, accepted, file) => ({ id, person, type, legalRef, site, appointedBy, date, expiry, accepted, acceptedOn: accepted ? date : null, letter: file ? demoFile(file, 95) : null });
  S.appointments = [
    AP('APP-001', 'P-005', 'Section 16(2) assignee', 'OHS Act s16(2)', 'S-JHB', 'P-001', D(-340), D(390), true, 'APP-001_16-2_Botha.pdf'),
    AP('APP-002', 'P-003', 'Section 16(2) assignee', 'OHS Act s16(2)', 'S-DBN', 'P-001', D(-500), D(230), true, 'APP-002_16-2_Ndlovu.pdf'),
    AP('APP-003', 'P-004', 'Section 16(2) assignee', 'OHS Act s16(2)', 'S-CPT', 'P-001', D(-700), D(30), true, 'APP-003_16-2_Dlamini.pdf'),
    AP('APP-004', 'P-007', 'Health & safety representative', 'OHS Act s17', 'S-JHB', 'P-005', D(-400), D(330), true, 'APP-004_HSR_Zulu.pdf'),
    AP('APP-005', 'P-011', 'Health & safety representative', 'OHS Act s17', 'S-DBN', 'P-003', D(-150), D(580), true, 'APP-005_HSR_Mthembu.pdf'),
    AP('APP-006', 'P-008', 'Lifting machinery supervisor', 'Driven Machinery Regulations (to be verified)', 'S-JHB', 'P-005', D(-380), D(350), true, 'APP-006_LMS_Pretorius.pdf'),
    AP('APP-007', 'P-007', 'First aider', 'General Safety Regulations (to be verified)', 'S-JHB', 'P-005', D(-1080), D(10), true, 'APP-007_FA_Zulu.pdf'),
    AP('APP-008', 'P-016', 'First aider', 'General Safety Regulations (to be verified)', 'S-CPT', 'P-004', D(-1110), D(-15), true, 'APP-008_FA_Patel.pdf'),
    AP('APP-009', 'P-011', 'First aider', 'General Safety Regulations (to be verified)', 'S-DBN', 'P-003', D(-700), D(400), true, 'APP-009_FA_Mthembu.pdf'),
    AP('APP-010', 'P-012', 'Fire fighter / emergency team member', 'Environmental Regulations for Workplaces (to be verified)', 'S-CPT', 'P-004', D(-30), D(700), false, 'APP-010_FF_Fernandes.pdf'),
    AP('APP-011', 'P-002', 'Incident investigator', 'General Administrative Regulations (to be verified)', 'ALL', 'P-001', D(-300), D(430), true, 'APP-011_INV_vanWyk.pdf'),
    AP('APP-012', 'P-016', 'Stacking & storage supervisor', 'General Safety Regulations (to be verified)', 'S-CPT', 'P-004', D(-200), D(530), true, null)
  ];

  /* ---------------- Medical fitness (RESTRICTED) ---------------- */
  S.medical = [
    { id: 'MED-001', person: 'P-009', type: 'Periodic — forklift operator', date: D(-300), next: D(65), result: 'Fit', practitioner: 'Occupational health practitioner (fictional)', restrictions: '' },
    { id: 'MED-002', person: 'P-012', type: 'Periodic — forklift operator', date: D(-380), next: D(-15), result: 'Fit with restrictions', practitioner: 'Occupational health practitioner (fictional)', restrictions: 'Corrective lenses required while operating.' },
    { id: 'MED-003', person: 'P-014', type: 'Periodic — driver', date: D(-200), next: D(165), result: 'Fit', practitioner: 'Occupational health practitioner (fictional)', restrictions: '' },
    { id: 'MED-004', person: 'P-010', type: 'Baseline — HCA exposure', date: D(-380), next: D(-15), result: 'Fit', practitioner: 'Occupational health practitioner (fictional)', restrictions: '' }
  ];

  /* ---------------- Maintenance & defects ---------------- */
  S.maintenance = [
    { id: 'MT-201', asset: 'AS-001', type: 'Planned', description: '500-hour service', due: D(55), completed: null, by: 'P-008', notes: '', evidence: [] },
    { id: 'MT-202', asset: 'AS-002', type: 'Planned', description: '6-monthly service incl. brakes and mast chains', due: D(13), completed: null, by: 'P-008', notes: '', evidence: [] },
    { id: 'MT-203', asset: 'AS-003', type: 'Planned', description: 'LPG system leak test and service', due: D(-8), completed: null, by: 'P-016', notes: '', evidence: [] },
    { id: 'MT-204', asset: 'AS-006', type: 'Planned', description: 'Crane brake and limit switch service', due: D(40), completed: null, by: 'P-008', notes: '', evidence: [] },
    { id: 'MT-205', asset: 'AS-004', type: 'Planned', description: '120 000 km service', due: D(20), completed: null, by: 'P-014', notes: '', evidence: [] },
    { id: 'MT-190', asset: 'AS-001', type: 'Planned', description: '250-hour service', due: D(-62), completed: D(-60), by: 'P-008', notes: 'Completed, no issues.', evidence: [demoFile('MT-190_jobcard.pdf', 80)] },
    { id: 'MT-195', asset: 'AS-009', type: 'Breakdown', description: 'Investigate safety valve failure', due: D(-6), completed: null, by: 'P-010', notes: 'Replacement valve on order.', evidence: [] },
    { id: 'MT-206', asset: 'AS-013', type: 'Planned', description: 'Service', due: D(30), completed: null, by: 'P-018', notes: '', evidence: [] }
  ];
  S.defects = [
    { id: 'DF-301', asset: 'AS-009', reported: D(-9), by: 'P-010', description: 'Pressure relief / safety valve did not lift on test; receiver over-pressurised.', severity: 'Critical', status: 'Action Raised', outOfService: true, action: 'ACT-1014', source: null },
    { id: 'DF-302', asset: 'AS-003', reported: D(-20), by: 'P-012', description: 'Load-test certificate expired — operation restricted pending examination.', severity: 'Major', status: 'Action Raised', outOfService: false, action: 'ACT-1003', source: null },
    { id: 'DF-298', asset: 'AS-002', reported: D(-28), by: 'P-007', description: 'Seatbelt retractor slow to retract.', severity: 'Minor', status: 'Closed', outOfService: false, action: null, source: 'INS-1098', closed: D(-28) }
  ];

  /* ---------------- PPE ---------------- */
  S.ppeTypes = [
    { id: 'PPE-01', name: 'Safety boots (steel toe)', months: 12, standard: 'SANS / ISO marked', roles: 'All operational staff', inspect: false },
    { id: 'PPE-02', name: 'High-visibility vest', months: 6, standard: 'Class 2', roles: 'Warehouse, yard, drivers', inspect: false },
    { id: 'PPE-03', name: 'Safety glasses', months: 6, standard: 'Impact rated', roles: 'Workshop, warehouse', inspect: false },
    { id: 'PPE-04', name: 'Hearing protection (ear muffs)', months: 12, standard: 'SNR ≥ 25 dB', roles: 'Workshop (grinding)', inspect: true },
    { id: 'PPE-05', name: 'Chemical-resistant gloves (nitrile)', months: 1, standard: 'Chemical rated', roles: 'Degreasing, battery charging', inspect: true },
    { id: 'PPE-06', name: 'Face shield', months: 12, standard: 'Impact rated', roles: 'Grinding, battery charging', inspect: true },
    { id: 'PPE-07', name: 'Full body harness', months: 60, standard: 'Fall arrest', roles: 'Work at height (racking)', inspect: true }
  ];
  const PI = (id, person, ppe, issued, months, size) => { const x = new Date(issued); x.setMonth(x.getMonth() + months); return { id, person, ppe, issued, replaceBy: x.toISOString().slice(0, 10), size, signed: true, lastInspected: null }; };
  S.ppeIssues = [
    PI('PI-01', 'P-009', 'PPE-01', D(-300), 12, '6'), PI('PI-02', 'P-009', 'PPE-02', D(-200), 6, 'M'), PI('PI-03', 'P-010', 'PPE-05', D(-40), 1, 'L'), PI('PI-04', 'P-010', 'PPE-03', D(-100), 6, '—'),
    PI('PI-05', 'P-012', 'PPE-01', D(-380), 12, '9'), PI('PI-06', 'P-012', 'PPE-02', D(-60), 6, 'L'), PI('PI-07', 'P-013', 'PPE-01', D(-90), 12, '5'), PI('PI-08', 'P-016', 'PPE-06', D(-200), 12, '—'),
    PI('PI-09', 'P-008', 'PPE-04', D(-330), 12, '—'), PI('PI-10', 'P-014', 'PPE-02', D(-170), 6, 'XL'), PI('PI-11', 'P-007', 'PPE-01', D(-120), 12, '8')
  ];
  S.ppeStock = [
    { site: 'S-JHB', ppe: 'PPE-01', qty: 14, min: 10 }, { site: 'S-JHB', ppe: 'PPE-02', qty: 22, min: 15 }, { site: 'S-JHB', ppe: 'PPE-05', qty: 40, min: 50 },
    { site: 'S-DBN', ppe: 'PPE-05', qty: 6, min: 30 }, { site: 'S-DBN', ppe: 'PPE-03', qty: 12, min: 10 }, { site: 'S-CPT', ppe: 'PPE-01', qty: 3, min: 6 },
    { site: 'S-CPT', ppe: 'PPE-07', qty: 2, min: 2 }, { site: 'S-CPT', ppe: 'PPE-04', qty: 8, min: 5 }
  ];

  /* ---------------- Hazardous chemicals ---------------- */
  S.chemicals = [
    { id: 'CH-001', name: 'Solvex 300 Degreaser', supplier: 'ChemServe Supplies (fictional)', site: 'S-DBN', location: 'Chemical store / degreasing bay', qty: '4 × 25 L', hazard: 'Flammable liquid; skin & eye irritant; may cause drowsiness (per supplier SDS — verify)', sds: 'DOC-018', sdsDate: D(-750), sdsReviewDue: D(-20), handling: 'Use only in ventilated degreasing bay; keep away from ignition sources; decant with pump.', ppe: ['PPE-05', 'PPE-03'], risks: ['RA-003'], course: 'CRS-HCA', emergency: 'Eye contact: flush 15 min at eyewash. Spill: absorb with spill kit, dispose as hazardous waste.' },
    { id: 'CH-002', name: 'Hydraulic Oil ISO VG 46', supplier: 'LubeCo SA (fictional)', site: 'S-JHB', location: 'Workshop oil store', qty: '6 × 20 L', hazard: 'Low hazard; environmental — avoid release (verify with SDS)', sds: 'DOC-019', sdsDate: D(-330), sdsReviewDue: D(400), handling: 'Drip trays; bunded storage.', ppe: ['PPE-05'], risks: [], course: 'CRS-HCA', emergency: 'Spill kit; prevent entry to drains.' },
    { id: 'CH-003', name: 'LPG (forklift cylinders)', supplier: 'GasPoint (fictional)', site: 'S-CPT', location: 'External gas cage', qty: '8 × 9 kg', hazard: 'Extremely flammable gas; gas under pressure (verify with SDS)', sds: null, sdsDate: null, sdsReviewDue: D(-1), handling: 'Store upright in ventilated cage; change cylinders outdoors only.', ppe: ['PPE-05'], risks: ['RA-004'], course: 'CRS-FLT', emergency: 'Leak: isolate, evacuate, no ignition sources.' },
    { id: 'CH-004', name: 'Battery electrolyte (sulphuric acid solution)', supplier: 'PowerCell (fictional)', site: 'S-JHB', location: 'Battery charging station', qty: 'In batteries + 2 × 5 L top-up', hazard: 'Causes severe skin burns and eye damage (verify with SDS)', sds: null, sdsDate: D(-200), sdsReviewDue: D(530), handling: 'Charging SWP KIE-SWP-030; face shield and gloves; neutraliser available.', ppe: ['PPE-05', 'PPE-06'], risks: [], course: 'CRS-HCA', emergency: 'Eyewash at charging station; neutralise spills.' },
    { id: 'CH-005', name: 'Industrial enamel aerosol spray paint', supplier: 'PaintPro (fictional)', site: 'S-CPT', location: 'Flammable cabinet', qty: '36 cans', hazard: 'Extremely flammable aerosol (verify with SDS)', sds: 'DOC-020', sdsDate: D(-705), sdsReviewDue: D(25), handling: 'Use in ventilated area; store in flammable cabinet.', ppe: ['PPE-03'], risks: ['RA-008'], course: 'CRS-HCA', emergency: 'Fire: CO2/DCP extinguisher.' },
    { id: 'CH-006', name: 'Brake & parts cleaner', supplier: 'ChemServe Supplies (fictional)', site: 'S-DBN', location: 'Workshop', qty: '24 cans', hazard: 'Flammable aerosol; may cause drowsiness (verify with SDS)', sds: null, sdsDate: null, sdsReviewDue: D(-60), handling: 'Use in ventilated area.', ppe: ['PPE-05', 'PPE-03'], risks: ['RA-003'], course: 'CRS-HCA', emergency: 'Ventilate; extinguish ignition sources.' }
  ];

  /* ---------------- Emergency preparedness ---------------- */
  S.emergency = {
    plans: { 'S-JHB': 'DOC-008', 'S-DBN': 'DOC-009', 'S-CPT': 'DOC-010' },
    contacts: [
      { site: 'ALL', name: 'National emergency (cell phones)', role: 'Emergency services', phone: '112' },
      { site: 'ALL', name: 'Ambulance (national)', role: 'Emergency services', phone: '10177' },
      { site: 'S-JHB', name: 'Bongani Zulu', role: 'Chief fire warden', phone: '082 555 0107 (fictional)' },
      { site: 'S-JHB', name: 'Pieter Botha', role: 'Site emergency controller', phone: '082 555 0105 (fictional)' },
      { site: 'S-DBN', name: 'Zanele Mthembu', role: 'Emergency coordinator / first aider', phone: '083 555 0111 (fictional)' },
      { site: 'S-CPT', name: 'Lerato Dlamini', role: 'Site emergency controller', phone: '084 555 0104 (fictional)' }
    ],
    assembly: [
      { site: 'S-JHB', name: 'AP1 — Main gate parking', capacity: 80 }, { site: 'S-JHB', name: 'AP2 — Rear yard', capacity: 40 },
      { site: 'S-DBN', name: 'AP1 — Front parking', capacity: 40 }, { site: 'S-CPT', name: 'AP1 — Visitor parking (to be confirmed in ERP)', capacity: 30 }
    ],
    firstAid: [
      { site: 'S-JHB', item: 'First aid box — warehouse', lastCheck: D(-20), next: D(10) }, { site: 'S-JHB', item: 'First aid box — workshop', lastCheck: D(-20), next: D(10) },
      { site: 'S-DBN', item: 'First aid box — workshop', lastCheck: D(-45), next: D(-15) }, { site: 'S-CPT', item: 'First aid box — warehouse', lastCheck: D(-10), next: D(20) }
    ]
  };
  S.drills = [
    { id: 'DR-401', site: 'S-JHB', type: 'Full evacuation', scheduled: D(-95), conducted: D(-95), status: 'Completed', duration: '4 min 30 s', participants: 58, result: 'Satisfactory with findings', findings: 'Emergency exit E3 partially obstructed by pallets; 2 visitors not accounted for on register.', actions: ['ACT-1001'], observer: 'P-006' },
    { id: 'DR-402', site: 'S-DBN', type: 'Full evacuation', scheduled: D(-15), conducted: null, status: 'Scheduled', duration: '', participants: 0, result: '', findings: '', actions: [], observer: 'P-011' },
    { id: 'DR-403', site: 'S-CPT', type: 'Full evacuation', scheduled: D(20), conducted: null, status: 'Scheduled', duration: '', participants: 0, result: '', findings: '', actions: [], observer: 'P-004' },
    { id: 'DR-404', site: 'S-DBN', type: 'Chemical spill response', scheduled: D(45), conducted: null, status: 'Scheduled', duration: '', participants: 0, result: '', findings: '', actions: [], observer: 'P-011' },
    { id: 'DR-399', site: 'S-CPT', type: 'Full evacuation', scheduled: D(-200), conducted: D(-198), status: 'Completed', duration: '3 min 50 s', participants: 20, result: 'Satisfactory', findings: 'No findings.', actions: [], observer: 'P-004' }
  ];

  /* ---------------- Incidents ---------------- */
  const INC = (o) => Object.assign({ persons: [], witnesses: '', attachments: [], links: { risks: [], assets: [], docs: [], training: [] }, investigation: null, reporting: { required: 'To be determined', status: 'Not assessed', ref: '' }, closure: null, history: [] }, o);
  S.incidents = [
    INC({ id: 'INC-2026-001', type: 'Near Miss', title: 'Forklift reversed close to pedestrian at dispatch bay', date: D(-150), time: '10:20', site: 'S-JHB', location: 'Dispatch bay crossing', reporter: 'P-009', persons: ['P-009'], description: 'FL-02 reversing out of bay; picker walked behind forklift outside walkway. Operator stopped in time.', immediate: 'Area cordoned, toolbox talk held.', injury: null, actualSev: 1, potentialSev: 5, investigator: 'P-002', status: 'Closed', investigation: { findings: 'Walkway markings faded; blue-spot light not fitted on FL-02 at time.', immediate: 'Pedestrian outside walkway', underlying: 'Faded markings; no visual warning of reversing forklift', root: 'Inspection checklist did not include walkway markings or warning lights', categories: ['Equipment / design', 'Inspection & maintenance'], completed: D(-140) }, links: { risks: ['RA-001'], assets: ['AS-002'], docs: ['DOC-004'], training: [] }, reporting: { required: 'No', status: 'Not required', ref: '' }, closure: { by: 'P-002', date: D(-110), comment: 'Actions verified; checklist revised (KIE-FRM-031 Rev 3).' } }),
    INC({ id: 'INC-2026-002', type: 'Injury', title: 'Hand laceration while handling sheet metal', date: D(-118), time: '14:05', site: 'S-CPT', location: 'Workshop', reporter: 'P-016', persons: ['P-013'], description: 'Employee cut left hand on sharp edge of sheet metal offcut while clearing workbench.', immediate: 'First aid administered; taken to clinic for stitches.', injury: { nature: 'Laceration', body: 'Left hand', treatment: 'Medical treatment case', daysLost: 0 }, actualSev: 2, potentialSev: 3, investigator: 'P-004', status: 'Closed', investigation: { findings: 'Cut-resistant gloves not worn; offcuts not placed in scrap bin.', immediate: 'No gloves', underlying: 'Gloves not specified for task', root: 'Task not covered by risk assessment', categories: ['PPE', 'Risk assessment'], completed: D(-110) }, links: { risks: [], assets: [], docs: [], training: [] }, reporting: { required: 'To be determined', status: 'Assessed — COIDA claim submitted (demo)', ref: 'Demo-ref' }, closure: { by: 'P-004', date: D(-80), comment: 'Closed.' } }),
    INC({ id: 'INC-2026-003', type: 'Environmental', title: 'Hydraulic oil spill in yard', date: D(-85), time: '08:40', site: 'S-JHB', location: 'Yard near wash bay', reporter: 'P-008', persons: [], description: 'Approx. 15 L hydraulic oil leaked from hire unit returned by customer.', immediate: 'Spill kit used; contaminated absorbent bagged as hazardous waste.', injury: null, actualSev: 2, potentialSev: 3, investigator: 'P-008', status: 'Closed', investigation: { findings: 'Returned equipment not inspected before parking on unbunded area.', immediate: 'Leaking hose', underlying: 'No returns inspection area', root: 'Returns process did not consider environmental risk', categories: ['Procedure'], completed: D(-80) }, links: { risks: [], assets: [], docs: ['DOC-011'], training: [] }, reporting: { required: 'No', status: 'Not required', ref: '' }, closure: { by: 'P-002', date: D(-60), comment: '' } }),
    INC({ id: 'INC-2026-004', type: 'Property Damage', title: 'Forklift struck racking upright', date: D(-48), time: '15:30', site: 'S-CPT', location: 'Warehouse aisle C', reporter: 'P-012', persons: ['P-012'], description: 'FL-07 mast struck end-of-aisle upright while turning; upright visibly bent.', immediate: 'Bay offloaded and cordoned; racking supplier called.', injury: null, actualSev: 3, potentialSev: 5, investigator: 'P-004', status: 'Actions in Progress', investigation: { findings: 'No column guards fitted; aisle width tight for FL-07; annual racking inspection overdue.', immediate: 'Turning too tight', underlying: 'No column protection; overdue inspection', root: 'Racking inspection and protection not included in maintenance programme', categories: ['Equipment / design', 'Inspection & maintenance'], completed: D(-40) }, links: { risks: ['RA-004'], assets: ['AS-003', 'AS-008'], docs: ['DOC-007'], training: ['CRS-FLT'] }, reporting: { required: 'No', status: 'Not required', ref: '' } }),
    INC({ id: 'INC-2026-005', type: 'Injury', title: 'Solvent splash to eye during degreasing', date: D(-75), time: '11:15', site: 'S-DBN', location: 'Degreasing bay', reporter: 'P-010', persons: ['P-010'], description: 'Degreaser splashed into right eye while cleaning gearbox housing. Safety glasses pushed up on head.', immediate: 'Eye flushed with bottled water (no eyewash in bay); clinic visit.', injury: { nature: 'Chemical irritation', body: 'Right eye', treatment: 'Medical treatment case', daysLost: 1 }, actualSev: 3, potentialSev: 4, investigator: 'P-003', status: 'Actions in Progress', investigation: { findings: 'No eyewash within reach; PPE not worn correctly; SDS out of date.', immediate: 'Glasses not worn', underlying: 'No eyewash station; supervision', root: 'HCA risk assessment controls not implemented', categories: ['Risk assessment', 'PPE', 'Supervision'], completed: D(-65) }, links: { risks: ['RA-003'], assets: [], docs: ['DOC-018'], training: ['CRS-HCA'] }, reporting: { required: 'To be determined', status: 'Assessment pending by competent person', ref: '' } }),
    INC({ id: 'INC-2026-006', type: 'Near Miss', title: 'Unsecured load shifted on LDV-03', date: D(-12), time: '13:50', site: 'S-JHB', location: 'N3 en route to customer', reporter: 'P-014', persons: ['P-014'], description: 'Generator on load bed moved during braking; ratchet strap found frayed.', immediate: 'Driver stopped and re-secured load with spare strap.', injury: null, actualSev: 1, potentialSev: 4, investigator: null, status: 'Reported', links: { risks: ['RA-006'], assets: ['AS-004'], docs: [], training: ['CRS-DD'] } }),
    INC({ id: 'INC-2026-007', type: 'Near Miss', title: 'Air receiver over-pressure — safety valve failed to lift', date: D(-9), time: '09:05', site: 'S-DBN', location: 'Workshop', reporter: 'P-010', persons: ['P-010'], description: 'Pressure switch failed; receiver gauge read above working pressure; safety valve did not lift. Compressor isolated.', immediate: 'Isolated, locked out and tagged; asset placed out of service.', injury: null, actualSev: 1, potentialSev: 5, investigator: 'P-003', status: 'Under Investigation', links: { risks: [], assets: ['AS-009'], docs: [], training: [] }, reporting: { required: 'To be determined', status: 'Assessment pending', ref: '' } }),
    INC({ id: 'INC-2026-008', type: 'Near Miss', title: 'Pump casing slipped from lifting sling', date: D(-30), time: '10:00', site: 'S-RPV', location: 'Workshop bay 1', reporter: 'P-018', persons: ['P-018'], description: 'Casing slipped in sling; landed on pallet. No injury.', immediate: 'Work stopped; toolbox talk.', injury: null, actualSev: 1, potentialSev: 4, investigator: 'P-017', status: 'Closed', investigation: { findings: 'Wrong sling configuration.', immediate: 'Single-leg sling', underlying: 'No lift plan', root: 'No rigging training', categories: ['Training'], completed: D(-25) }, closure: { by: 'P-017', date: D(-15), comment: 'Rigging training scheduled.' } })
  ];
  S.incidents.forEach(i => { i.org = i.site === 'S-RPV' ? 'ORG-2' : 'ORG-1'; i.history = [{ ts: i.date + 'T' + i.time + ':00', by: i.reporter, action: 'Incident reported', comment: '' }]; });

  /* ---------------- Audits ---------------- */
  S.audits = [
    { id: 'AUD-2026-01', title: 'Internal HSEQ audit — Germiston', type: 'Internal HSEQ audit', site: 'S-JHB', planned: D(-160), conducted: D(-158), auditor: 'P-006', status: 'Completed', scope: 'ISO 45001 / 14001 / 9001 integrated system', report: 'DOC-022' },
    { id: 'AUD-2026-02', title: 'Internal HSEQ audit — Pinetown', type: 'Internal HSEQ audit', site: 'S-DBN', planned: D(-58), conducted: D(-56), auditor: 'P-006', status: 'Completed', scope: 'Integrated HSEQ system & legal compliance', report: 'DOC-022' },
    { id: 'AUD-2026-03', title: 'Legal compliance audit — Montague Gardens', type: 'Legal compliance audit', site: 'S-CPT', planned: D(-7), conducted: null, auditor: 'P-006', status: 'Planned', scope: 'OHS Act and regulations (legal register)', report: null },
    { id: 'AUD-2026-04', title: 'Customer supplier audit — MineCo (fictional)', type: 'Customer audit', site: 'S-JHB', planned: D(28), conducted: null, auditor: 'External', status: 'Planned', scope: 'Contractor HSE pre-qualification', report: null },
    { id: 'AUD-2026-05', title: 'Internal HSEQ audit — Montague Gardens', type: 'Internal HSEQ audit', site: 'S-CPT', planned: D(75), conducted: null, auditor: 'P-006', status: 'Planned', scope: 'Integrated HSEQ system', report: null },
    { id: 'AUD-2026-06', title: 'Management system audit — Alrode', type: 'Internal HSEQ audit', site: 'S-RPV', planned: D(50), conducted: null, auditor: 'P-006', status: 'Planned', scope: 'Workshop safety', report: null }
  ];
  S.findings = [
    { id: 'FND-01', audit: 'AUD-2026-01', clause: 'ISO 45001 cl. 7.2', description: 'Two forklift operators without verified competency records on file.', grade: 'Minor NC', action: 'ACT-1002' },
    { id: 'FND-02', audit: 'AUD-2026-01', clause: 'ISO 14001 cl. 8.1', description: 'Returns area not assessed for environmental aspects.', grade: 'Observation', action: null },
    { id: 'FND-03', audit: 'AUD-2026-02', clause: 'HCA Regs (verify)', description: 'No eyewash station at degreasing bay.', grade: 'Major NC', action: 'ACT-1005' },
    { id: 'FND-04', audit: 'AUD-2026-02', clause: 'OHS Act s17', description: 'H&S representative not trained.', grade: 'Minor NC', action: 'ACT-1006' },
    { id: 'FND-05', audit: 'AUD-2026-02', clause: 'ISO 45001 cl. 8.2', description: 'Emergency plan overdue for review; drill not conducted in last 12 months.', grade: 'Minor NC', action: 'ACT-1015' },
    { id: 'FND-06', audit: 'AUD-2026-02', clause: 'ISO 45001 cl. 7.5', description: 'Obsolete SDS versions found in workshop file.', grade: 'Observation', action: null },
    { id: 'FND-07', audit: 'AUD-2026-02', clause: 'ISO 9001 cl. 10.2', description: 'Opportunity: trend analysis of customer returns.', grade: 'OFI', action: null }
  ];

  /* ---------------- Central corrective actions (CAPA) ---------------- */
  const AH = (ts, by, action, from, to, comment) => ({ ts, by, action, from: from || '', to: to || '', comment: comment || '' });
  const A = (o) => Object.assign({ org: o.site === 'S-RPV' ? 'ORG-2' : 'ORG-1', progress: [], evidence: [], verification: null, closed: null, escalated: false, history: [] }, o);
  S.actions = [
    A({ id: 'ACT-1001', title: 'Emergency exit E3 obstructed during drill', action: 'Mark keep-clear zone at E3 and add exit check to weekly warehouse inspection.', source: 'Emergency Drill', sourceId: 'DR-401', priority: 'High', site: 'S-JHB', owner: 'P-007', createdBy: 'P-006', created: D(-95), due: D(-80), status: 'Closed',
      progress: [{ ts: T(-88), by: 'P-007', note: 'Floor markings painted, signage installed.' }], evidence: [demoFile('E3_keep_clear_photo.jpg', 600)], verification: { by: 'P-002', ts: T(-82), decision: 'Verified', comment: 'Photo evidence reviewed; confirmed on walk-through.' }, closed: D(-82),
      history: [AH(T(-95), 'P-006', 'Created'), AH(T(-95), 'P-006', 'Assigned', '', 'P-007'), AH(T(-94), 'P-007', 'Acknowledged'), AH(T(-90), 'P-007', 'In Progress'), AH(T(-88), 'P-007', 'Submitted for Verification'), AH(T(-82), 'P-002', 'Verified'), AH(T(-82), 'P-002', 'Closed')] }),
    A({ id: 'ACT-1002', title: 'Forklift operator competency records missing', action: 'Conduct practical competency assessment for operators and file verification records.', source: 'Audit', sourceId: 'FND-01', priority: 'Medium', site: 'S-JHB', owner: 'P-007', createdBy: 'P-006', created: D(-158), due: D(-120), status: 'Closed',
      progress: [{ ts: T(-130), by: 'P-007', note: 'Assessments done for Nomvula Sithole and self.' }], evidence: [demoFile('Competency_assessments.pdf', 300)], verification: { by: 'P-006', ts: T(-125), decision: 'Verified', comment: 'Records reviewed.' }, closed: D(-125),
      history: [AH(T(-158), 'P-006', 'Created'), AH(T(-158), 'P-006', 'Assigned', '', 'P-007'), AH(T(-150), 'P-007', 'Acknowledged'), AH(T(-140), 'P-007', 'In Progress'), AH(T(-130), 'P-007', 'Submitted for Verification'), AH(T(-125), 'P-006', 'Verified'), AH(T(-125), 'P-006', 'Closed')] }),
    A({ id: 'ACT-1003', title: 'FL-07 load-test certificate expired', action: 'Book competent lifting machine inspector to examine and load test FL-07; restrict use until certified.', source: 'Legal', sourceId: 'LR-009', priority: 'Critical', site: 'S-CPT', owner: 'P-016', createdBy: 'P-006', created: D(-20), due: D(-13), status: 'In Progress', escalated: true,
      progress: [{ ts: T(-15), by: 'P-016', note: 'Inspector booked; earliest slot next week.' }], history: [AH(T(-20), 'P-006', 'Created'), AH(T(-20), 'P-006', 'Assigned', '', 'P-016'), AH(T(-19), 'P-016', 'Acknowledged'), AH(T(-15), 'P-016', 'In Progress'), AH(T(-12), 'System', 'Escalated', '', 'P-004', 'Overdue — escalated to branch manager.')] }),
    A({ id: 'ACT-1005', title: 'No eyewash station at degreasing bay', action: 'Install plumbed eyewash station within reach of the degreasing bay and add to monthly inspection.', source: 'Risk Assessment', sourceId: 'RA-003', priority: 'High', site: 'S-DBN', owner: 'P-003', createdBy: 'P-006', created: D(-56), due: D(-12), status: 'Submitted for Verification',
      progress: [{ ts: T(-30), by: 'P-003', note: 'Plumber appointed.' }, { ts: T(-3), by: 'P-003', note: 'Eyewash installed and flow-tested.' }], evidence: [demoFile('Eyewash_installed.jpg', 750), demoFile('Plumber_invoice.pdf', 120)],
      history: [AH(T(-56), 'P-006', 'Created'), AH(T(-56), 'P-006', 'Assigned', '', 'P-003'), AH(T(-50), 'P-003', 'Acknowledged'), AH(T(-30), 'P-003', 'In Progress'), AH(T(-3), 'P-003', 'Submitted for Verification')] }),
    A({ id: 'ACT-1006', title: 'H&S representative not trained (Pinetown)', action: 'Enrol Zanele Mthembu on H&S representative training and file certificate.', source: 'Training', sourceId: 'P-011', priority: 'Medium', site: 'S-DBN', owner: 'P-003', createdBy: 'P-006', created: D(-56), due: D(25), status: 'Acknowledged',
      history: [AH(T(-56), 'P-006', 'Created'), AH(T(-56), 'P-006', 'Assigned', '', 'P-003'), AH(T(-40), 'P-003', 'Acknowledged')] }),
    A({ id: 'ACT-1007', title: 'Designate H&S representative — Montague Gardens', action: 'Elect/designate H&S representative, issue designation letter and enrol on training.', source: 'Legal', sourceId: 'LR-005', priority: 'High', site: 'S-CPT', owner: 'P-004', createdBy: 'P-006', created: D(-30), due: D(-2), status: 'Assigned',
      history: [AH(T(-30), 'P-006', 'Created'), AH(T(-30), 'P-006', 'Assigned', '', 'P-004')] }),
    A({ id: 'ACT-1008', title: 'Incident procedure overdue for review', action: 'Review KIE-PRO-011 and align with current reporting practice; re-issue.', source: 'Document Review', sourceId: 'DOC-003', priority: 'Medium', site: 'S-JHB', owner: 'P-002', createdBy: 'P-006', created: D(-10), due: D(20), status: 'In Progress',
      progress: [{ ts: T(-4), by: 'P-002', note: 'Draft changes started.' }], history: [AH(T(-10), 'P-006', 'Created'), AH(T(-10), 'P-006', 'Assigned', '', 'P-002'), AH(T(-9), 'P-002', 'Acknowledged'), AH(T(-4), 'P-002', 'In Progress')] }),
    A({ id: 'ACT-1009', title: 'Racking inspection overdue — aisles A–D', action: 'Appoint competent racking inspector; repair or replace damaged upright in aisle C.', source: 'Incident', sourceId: 'INC-2026-004', priority: 'High', site: 'S-CPT', owner: 'P-004', createdBy: 'P-004', created: D(-40), due: D(-5), status: 'In Progress',
      progress: [{ ts: T(-20), by: 'P-004', note: 'Quote received from racking supplier.' }], history: [AH(T(-40), 'P-004', 'Created'), AH(T(-40), 'P-004', 'Assigned', '', 'P-004'), AH(T(-38), 'P-004', 'Acknowledged'), AH(T(-20), 'P-004', 'In Progress')] }),
    A({ id: 'ACT-1010', title: 'Fit column guards on end-of-aisle uprights', action: 'Purchase and install column guards on all end-of-aisle uprights.', source: 'Incident', sourceId: 'INC-2026-004', priority: 'Medium', site: 'S-CPT', owner: 'P-016', createdBy: 'P-004', created: D(-40), due: D(30), status: 'Assigned',
      history: [AH(T(-40), 'P-004', 'Created'), AH(T(-40), 'P-004', 'Assigned', '', 'P-016')] }),
    A({ id: 'ACT-1011', title: 'HCA refresher for Pinetown workshop', action: 'Deliver HCA awareness refresher incl. correct PPE use to workshop staff.', source: 'Incident', sourceId: 'INC-2026-005', priority: 'Medium', site: 'S-DBN', owner: 'P-011', createdBy: 'P-003', created: D(-65), due: D(-20), status: 'Submitted for Verification',
      progress: [{ ts: T(-22), by: 'P-011', note: 'Training delivered to 6 staff.' }], evidence: [demoFile('HCA_attendance_register.pdf', 210)], history: [AH(T(-65), 'P-003', 'Created'), AH(T(-65), 'P-003', 'Assigned', '', 'P-011'), AH(T(-60), 'P-011', 'Acknowledged'), AH(T(-30), 'P-011', 'In Progress'), AH(T(-21), 'P-011', 'Submitted for Verification')] }),
    A({ id: 'ACT-1012', title: 'Faded pedestrian walkway markings at dispatch bay', action: 'Repaint pedestrian walkway and crossing markings at dispatch bay.', source: 'Inspection', sourceId: 'INS-1087', priority: 'Medium', site: 'S-JHB', owner: 'P-007', createdBy: 'P-007', created: D(-33), due: D(10), status: 'In Progress',
      progress: [{ ts: T(-10), by: 'P-007', note: 'Paint ordered; weekend shutdown booked.' }], history: [AH(T(-33), 'P-007', 'Created'), AH(T(-33), 'P-007', 'Assigned', '', 'P-007'), AH(T(-32), 'P-007', 'Acknowledged'), AH(T(-10), 'P-007', 'In Progress')] }),
    A({ id: 'ACT-1013', title: 'Solvex 300 SDS overdue for review', action: 'Obtain current SDS from supplier, review hazards against controls, update chemical register.', source: 'Chemical', sourceId: 'CH-001', priority: 'Medium', site: 'S-DBN', owner: 'P-011', createdBy: 'P-002', created: D(-18), due: D(12), status: 'Assigned',
      history: [AH(T(-18), 'P-002', 'Created'), AH(T(-18), 'P-002', 'Assigned', '', 'P-011')] }),
    A({ id: 'ACT-1014', title: 'Compressor CMP-02 safety valve failure', action: 'Replace safety valve, test and certify receiver before return to service.', source: 'Asset Defect', sourceId: 'DF-301', priority: 'Critical', site: 'S-DBN', owner: 'P-010', createdBy: 'P-003', created: D(-9), due: D(-6), status: 'In Progress',
      progress: [{ ts: T(-7), by: 'P-010', note: 'Replacement valve ordered from supplier.' }], history: [AH(T(-9), 'P-003', 'Created'), AH(T(-9), 'P-003', 'Assigned', '', 'P-010'), AH(T(-9), 'P-010', 'Acknowledged'), AH(T(-7), 'P-010', 'In Progress')] }),
    A({ id: 'ACT-1015', title: 'Pinetown emergency plan review & evacuation drill', action: 'Review KIE-EP-002 and conduct full evacuation drill.', source: 'Audit', sourceId: 'FND-05', priority: 'High', site: 'S-DBN', owner: 'P-011', createdBy: 'P-006', created: D(-56), due: D(-15), status: 'Rejected',
      progress: [{ ts: T(-18), by: 'P-011', note: 'Plan reviewed.' }], evidence: [demoFile('EP-002_markup.pdf', 160)], verification: { by: 'P-006', ts: T(-16), decision: 'Returned', comment: 'Drill has not yet been conducted — evidence incomplete. Please complete drill DR-402 and attach drill report.' },
      history: [AH(T(-56), 'P-006', 'Created'), AH(T(-56), 'P-006', 'Assigned', '', 'P-011'), AH(T(-50), 'P-011', 'Acknowledged'), AH(T(-30), 'P-011', 'In Progress'), AH(T(-18), 'P-011', 'Submitted for Verification'), AH(T(-16), 'P-006', 'Returned for further work', '', '', 'Drill has not yet been conducted — evidence incomplete.')] }),
    A({ id: 'ACT-1016', title: 'Two extinguishers past service date (Pinetown)', action: 'Have extinguishers serviced by accredited provider.', source: 'Inspection', sourceId: 'INS-1090', priority: 'High', site: 'S-DBN', owner: 'P-011', createdBy: 'P-011', created: D(-40), due: D(-26), status: 'Verified',
      progress: [{ ts: T(-30), by: 'P-011', note: 'Serviced.' }], evidence: [demoFile('FE_service_slip.pdf', 90)], verification: { by: 'P-003', ts: T(-27), decision: 'Verified', comment: 'Service tags checked.' },
      history: [AH(T(-40), 'P-011', 'Created'), AH(T(-40), 'P-011', 'Assigned', '', 'P-011'), AH(T(-39), 'P-011', 'Acknowledged'), AH(T(-35), 'P-011', 'In Progress'), AH(T(-30), 'P-011', 'Submitted for Verification'), AH(T(-27), 'P-003', 'Verified')] }),
    A({ id: 'ACT-1017', title: 'Defensive driver training', action: 'Schedule defensive driving training for all drivers.', source: 'Risk Assessment', sourceId: 'RA-006', priority: 'Low', site: 'S-JHB', owner: 'P-005', createdBy: 'P-002', created: D(-25), due: D(60), status: 'Created',
      history: [AH(T(-25), 'P-002', 'Created')] }),
    A({ id: 'ACT-1018', title: 'Second first aider required (Montague Gardens)', action: 'Send second employee on first aid level 1; renew Fatima Patel certificate.', source: 'Legal', sourceId: 'LR-023', priority: 'High', site: 'S-CPT', owner: 'P-004', createdBy: 'P-006', created: D(-30), due: D(5), status: 'Acknowledged',
      history: [AH(T(-30), 'P-006', 'Created'), AH(T(-30), 'P-006', 'Assigned', '', 'P-004'), AH(T(-28), 'P-004', 'Acknowledged')] }),
    A({ id: 'ACT-1019', title: 'Rigging training for workshop', action: 'Arrange rigging / slinging training for technicians.', source: 'Incident', sourceId: 'INC-2026-008', priority: 'Medium', site: 'S-RPV', owner: 'P-017', createdBy: 'P-017', created: D(-25), due: D(20), status: 'In Progress',
      history: [AH(T(-25), 'P-017', 'Created'), AH(T(-25), 'P-017', 'Assigned', '', 'P-017'), AH(T(-24), 'P-017', 'Acknowledged'), AH(T(-20), 'P-017', 'In Progress')] })
  ];
  // Link incident / audit / risk records to their actions (stable IDs)
  S.incidents.find(i => i.id === 'INC-2026-004').actions = ['ACT-1009', 'ACT-1010'];
  S.incidents.find(i => i.id === 'INC-2026-005').actions = ['ACT-1011'];
  S.incidents.find(i => i.id === 'INC-2026-008').actions = ['ACT-1019'];
  S.incidents.forEach(i => { if (!i.actions) i.actions = []; });

  /* ---------------- Activity & notification state ---------------- */
  S.activity = [
    { ts: T(-1, 16, 10), by: 'P-006', text: 'Started review of KIE-SWP-022 Rev 2 (draft 1)', link: '#/documents/DOC-005' },
    { ts: T(-2, 11, 30), by: 'P-002', text: 'Approved KIE-TRN-003 Rev 3 — awaiting issue', link: '#/documents/DOC-017' },
    { ts: T(-3, 15, 5), by: 'P-003', text: 'Submitted ACT-1005 for verification (eyewash station installed)', link: '#/actions/ACT-1005' },
    { ts: T(-3, 9, 20), by: 'P-004', text: 'Submitted KIE-MS-003 for review', link: '#/documents/DOC-007' },
    { ts: T(-4, 14, 0), by: 'P-002', text: 'Returned KIE-PRO-018 for correction', link: '#/documents/DOC-025' },
    { ts: T(-9, 9, 30), by: 'P-010', text: 'Reported INC-2026-007 — compressor CMP-02 placed out of service', link: '#/incidents/INC-2026-007' },
    { ts: T(-12, 14, 0), by: 'P-014', text: 'Reported near miss INC-2026-006 (load shift on LDV-03)', link: '#/incidents/INC-2026-006' },
    { ts: T(-12, 8, 0), by: 'System', text: 'ACT-1003 escalated to Lerato Dlamini (overdue)', link: '#/actions/ACT-1003' }
  ];
  S.events = []; // event-driven notifications created by user actions
  S.readNotifs = {};
  S.ui = { org: 'ORG-1', site: 'ALL', user: 'P-002', navCollapsed: {} };
  return S;
}
