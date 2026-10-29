/* ==========================================================================
   VDW HSEQ Management System — Prototype demonstration data
   --------------------------------------------------------------------------
   ALL DATA IN THIS FILE IS FICTIONAL DEMONSTRATION DATA.
   Scope: Document Control (sequential approvals), Assets & Inspections with
   corrective actions, and Incident Management.
   Dates are generated relative to "today" when the demo data is (re)set, so
   overdue / upcoming items always remain meaningful.
   ========================================================================== */

/* eslint-disable no-unused-vars */
function buildSeed() {
  const base = new Date(); base.setHours(0, 0, 0, 0);
  const D = (n) => { const x = new Date(base); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const T = (n, h = 9, m = 0) => { const x = new Date(base); x.setDate(x.getDate() + n); x.setHours(h, m, 0, 0); return x.toISOString(); };
  const demoFile = (name, kb) => ({ name, size: kb * 1024, type: name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream', demo: true, seeded: true });

  const S = { version: 7, seededOn: D(0) };

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
    { name: 'Managing Director', desc: 'Organisation-wide visibility; final approver for policies.', perms: ['notice.publish', 'view.all', 'doc.approve', 'action.verify', 'report.view'] },
    { name: 'HSEQ Manager', desc: 'Owns document control, verification of corrective actions, incident investigation and configuration.', perms: ['notice.publish', 'view.all', 'doc.create', 'doc.approve', 'doc.issue', 'action.create', 'action.verify', 'incident.investigate', 'admin', 'report.view', 'inspect'] },
    { name: 'Safety Consultant', desc: 'External VDW consultant with full access: documents, approvals and issue, inspections, corrective actions, incidents, reports and configuration.', perms: ['notice.publish', 'view.all', 'doc.create', 'doc.approve', 'doc.issue', 'action.create', 'action.verify', 'incident.investigate', 'admin', 'report.view', 'inspect'] },
    { name: 'Branch Manager', desc: 'Manages assets, inspections, actions and incidents at the assigned branch; approves branch documents.', perms: ['notice.publish', 'view.branch', 'doc.create', 'doc.approve', 'action.create', 'action.verify', 'incident.investigate', 'report.view', 'inspect'] },
    { name: 'Supervisor', desc: 'Conducts inspections, reports defects and incidents, updates actions assigned to them.', perms: ['view.branch', 'action.create', 'inspect', 'incident.report'] },
    { name: 'Employee', desc: 'Field access only: inspects assets by scanning their QR code and reports incidents.', perms: ['inspect.qr', 'incident.report'], fieldOnly: true }
  ];
  S.permissionDefs = [
    ['view.all', 'View all organisations / branches in scope'], ['view.branch', 'View records of assigned branch'], ['view.own', 'View own tasks & issued documents'],
    ['doc.create', 'Upload, create & revise documents'], ['doc.approve', 'Can be placed on a document approval route'], ['doc.issue', 'Issue approved documents for use'],
    ['inspect', 'Conduct inspections'], ['inspect.qr', 'Inspect an asset after scanning its QR code (field users)'], ['action.create', 'Raise corrective actions'], ['action.verify', 'Verify & close corrective actions'],
    ['incident.report', 'Report incidents'], ['incident.investigate', 'Investigate & close incidents'], ['notice.publish', 'Publish company notices'], ['report.view', 'Management reports'], ['admin', 'System configuration']
  ];

  /* ---------------- Configuration ---------------- */
  S.config = {
    priorities: [
      { name: 'Critical', days: 3, desc: 'Immediate danger — e.g. critical defect, asset out of service' },
      { name: 'High', days: 14, desc: 'Significant risk or non-compliance' },
      { name: 'Medium', days: 30, desc: 'Moderate risk' },
      { name: 'Low', days: 60, desc: 'Improvement opportunity' }
    ],
    docCategories: ['Policy', 'Procedure', 'Safe Work Procedure', 'Risk Assessment', 'Method Statement', 'Emergency Plan', 'Environmental', 'Quality', 'Form / Template', 'Manual / Work Instruction', 'Register', 'Legal Appointment', 'Training Material', 'Safety Data Sheet', 'Certificate', 'Audit / Inspection Report', 'Equipment Manual', 'Other Controlled Record'],
    // Default sequential approval routes per document category (editable in Administration and per document on submit)
    approvalRoutes: {
      'Policy': [{ label: 'HSEQ review', person: 'P-002' }, { label: 'Managing Director approval', person: 'P-001' }],
      'Procedure': [{ label: 'Technical review', person: 'P-006' }, { label: 'HSEQ approval', person: 'P-002' }],
      'Safe Work Procedure': [{ label: 'Operational review', person: 'P-005' }, { label: 'HSEQ approval', person: 'P-002' }, { label: 'Final approval', person: 'P-001' }],
      'Method Statement': [{ label: 'Technical review', person: 'P-006' }, { label: 'HSEQ approval', person: 'P-002' }],
      'Emergency Plan': [{ label: 'Branch review', person: 'P-005' }, { label: 'HSEQ approval', person: 'P-002' }],
      '*': [{ label: 'Review', person: 'P-006' }, { label: 'HSEQ approval', person: 'P-002' }]
    },
    notify: {
      docReviewLead: 30, inspectionLead: 7, maintenanceLead: 14, certLead: 30,
      channels: { inApp: true, email: false, sms: false },
      categories: { documents: true, assets: true, incidents: true, actions: true, notices: true }
    },
    complianceWeights: { documents: 20, assets: 35, actions: 30, incidents: 15 }
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
  const issuedHist = (dDays, author, approver) => [h(T(dDays - 12), author, 'Created draft'), h(T(dDays - 9), author, 'Submitted for approval'), h(T(dDays - 4), approver, 'Approved — all approval steps complete', 'Approved for issue.'), h(T(dDays), approver, 'Issued for use')];
  const route = (steps) => steps.map((x, i) => ({ step: i + 1, label: x[0], person: x[1], status: x[2], ts: x[3] || null, comment: x[4] || '' }));
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
      Object.assign(rev(2, 'In Approval', D(-6), 'KIE-SWP-022_Rev2_draft.docx', 'Added pre-lift checklist and tag-line requirements.', 'P-008', [h(T(-10), 'P-008', 'Created draft revision 2'), h(T(-6), 'P-008', 'Submitted for approval (3-step route)'), h(T(-4), 'P-005', 'Approved — step 1: Operational review', 'Checklist is practical; agreed with workshop team.')]), { draft: 1, route: route([['Operational review', 'P-005', 'Approved', T(-4), 'Checklist is practical; agreed with workshop team.'], ['HSEQ approval', 'P-002', 'Current'], ['Final approval', 'P-001', 'Pending']]) })]),
    doc('DOC-006', 'KIE-RA-005', 'Workshop Baseline Risk Assessment', 'Risk Assessment', 'Controlled record', 'S-JHB', 'Workshop & Service', 'P-002', 12, D(64), 'Internal', [
      rev(2, 'Issued for Use', D(-300), 'KIE-RA-005_Rev2.xlsx', 'Annual review.', 'P-006', issuedHist(-300, 'P-006', 'P-002'))]),
    doc('DOC-007', 'KIE-MS-003', 'Method Statement — Installation of Pallet Racking', 'Method Statement', 'Controlled document', 'S-CPT', 'Warehouse & Logistics', 'P-004', 24, D(700), 'Internal', [
      Object.assign(rev(1, 'In Approval', D(-3), 'KIE-MS-003_Rev1_draft.pdf', 'New method statement for racking extension project.', 'P-004', [h(T(-8), 'P-004', 'Created draft'), h(T(-3), 'P-004', 'Submitted for approval (2-step route)', 'Please review before contractor starts on site.')]), { draft: 1, route: route([['Technical review', 'P-006', 'Current'], ['HSEQ approval', 'P-002', 'Pending']]) })]),
    doc('DOC-008', 'KIE-EP-001', 'Emergency Response Plan — Germiston', 'Emergency Plan', 'Controlled document', 'S-JHB', 'HSEQ', 'P-002', 12, D(95), 'Internal', [
      rev(2, 'Issued for Use', D(-270), 'KIE-EP-001_Rev2.pdf', 'Updated emergency contacts and assembly point map.', 'P-002', issuedHist(-270, 'P-002', 'P-001'))]),
    doc('DOC-009', 'KIE-EP-002', 'Emergency Response Plan — Pinetown', 'Emergency Plan', 'Controlled document', 'S-DBN', 'HSEQ', 'P-003', 12, D(-40), 'Internal', [
      rev(1, 'Issued for Use', D(-405), 'KIE-EP-002_Rev1.pdf', 'First issue.', 'P-011', issuedHist(-405, 'P-011', 'P-002'))]),
    doc('DOC-010', 'KIE-EP-003', 'Emergency Response Plan — Montague Gardens', 'Emergency Plan', 'Controlled document', 'S-CPT', 'HSEQ', 'P-004', 12, D(330), 'Internal', [
      Object.assign(rev(1, 'Draft', D(-12), 'KIE-EP-003_Rev1_draft.docx', 'Initial draft — site evacuation map still outstanding.', 'P-004', [h(T(-12), 'P-004', 'Created draft')]), { draft: 1, route: [] })]),
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
      Object.assign(rev(3, 'Approved', D(-2), 'KIE-TRN-003_Rev3.pptx', 'Added chemical safety and incident reporting modules.', 'P-006', [h(T(-9), 'P-006', 'Created draft revision 3'), h(T(-7), 'P-006', 'Submitted for approval (2-step route)'), h(T(-5), 'P-003', 'Approved — step 1: Branch review'), h(T(-2), 'P-002', 'Approved — step 2: HSEQ approval', 'Approved — issue at start of next month.'), h(T(-2), 'P-002', 'All approval steps complete — approved')]), { draft: 1, route: route([['Branch review', 'P-003', 'Approved', T(-5), ''], ['HSEQ approval', 'P-002', 'Approved', T(-2), 'Approved — issue at start of next month.']]) })]),
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
      Object.assign(rev(1, 'Returned for Correction', D(-4), 'KIE-PRO-018_Rev1_draft.docx', 'New procedure.', 'P-006', [h(T(-15), 'P-006', 'Created draft'), h(T(-11), 'P-006', 'Submitted for approval (2-step route)'), h(T(-9), 'P-005', 'Approved — step 1: Operational review'), h(T(-4), 'P-002', 'Returned for correction — step 2: HSEQ approval', 'Section 6: add contractor induction & permit-to-work interface. Section 8: reference the 37(2) mandatory agreement template.')]), { draft: 1, route: route([['Operational review', 'P-005', 'Approved', T(-9), ''], ['HSEQ approval', 'P-002', 'Returned', T(-4), 'Section 6: add contractor induction & permit-to-work interface. Section 8: reference the 37(2) mandatory agreement template.']]) })]),
    doc('DOC-026', 'KIE-PRO-020', 'Permit to Work Procedure (legacy)', 'Procedure', 'Controlled document', 'ALL', 'HSEQ', 'P-002', 24, null, 'Internal', [
      rev(1, 'Obsolete', D(-900), 'KIE-PRO-020_Rev1.pdf', 'Replaced by section in Contractor Management Procedure.', 'P-002', issuedHist(-1200, 'P-002', 'P-001').concat([h(T(-90), 'P-002', 'Made obsolete', 'Superseded by KIE-PRO-018 (in development).')]))]),
    doc('DOC-027', 'KIE-FRM-002', 'Incident Report Form (paper, legacy)', 'Form / Template', 'Controlled document', 'ALL', 'HSEQ', 'P-002', 24, null, 'Internal', [
      rev(3, 'Archived', D(-1000), 'KIE-FRM-002_Rev3.pdf', 'Replaced by electronic incident reporting.', 'P-002', issuedHist(-1200, 'P-002', 'P-001').concat([h(T(-200), 'P-002', 'Made obsolete'), h(T(-180), 'P-002', 'Archived')]))]),
    doc('DOC-028', 'KIE-SWP-030', 'Battery Charging Station Safe Work Procedure', 'Safe Work Procedure', 'Controlled document', 'S-JHB', 'Warehouse & Logistics', 'P-007', 24, D(500), 'Internal', [
      rev(1, 'Issued for Use', D(-230), 'KIE-SWP-030_Rev1.pdf', 'First issue.', 'P-007', issuedHist(-230, 'P-007', 'P-002'))]),
    doc('DOC-029', 'RPV-PRO-001', 'Workshop Safety Procedure', 'Procedure', 'Controlled document', 'S-RPV', 'Workshop & Service', 'P-017', 24, D(140), 'Internal', [
      rev(1, 'Issued for Use', D(-300), 'RPV-PRO-001_Rev1.pdf', 'First issue.', 'P-017', issuedHist(-300, 'P-017', 'P-017'))])
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

  /* ---------------- Incidents ---------------- */
  const INC = (o) => Object.assign({ persons: [], witnesses: '', attachments: [], links: { assets: [], docs: [] }, investigation: null, reporting: { required: 'To be determined', status: 'Not assessed', ref: '' }, closure: null, history: [] }, o);
  S.incidents = [
    INC({ id: 'INC-2026-001', type: 'Near Miss', title: 'Forklift reversed close to pedestrian at dispatch bay', date: D(-150), time: '10:20', site: 'S-JHB', location: 'Dispatch bay crossing', reporter: 'P-009', persons: ['P-009'], description: 'FL-02 reversing out of bay; picker walked behind forklift outside walkway. Operator stopped in time.', immediate: 'Area cordoned, toolbox talk held.', injury: null, actualSev: 1, potentialSev: 5, investigator: 'P-002', status: 'Closed', investigation: { findings: 'Walkway markings faded; blue-spot light not fitted on FL-02 at time.', immediate: 'Pedestrian outside walkway', underlying: 'Faded markings; no visual warning of reversing forklift', root: 'Inspection checklist did not include walkway markings or warning lights', categories: ['Equipment / design', 'Inspection & maintenance'], completed: D(-140) }, links: { assets: ['AS-002'], docs: ['DOC-004'] }, reporting: { required: 'No', status: 'Not required', ref: '' }, closure: { by: 'P-002', date: D(-110), comment: 'Actions verified; checklist revised (KIE-FRM-031 Rev 3).' } }),
    INC({ id: 'INC-2026-002', type: 'Injury', title: 'Hand laceration while handling sheet metal', date: D(-118), time: '14:05', site: 'S-CPT', location: 'Workshop', reporter: 'P-016', persons: ['P-013'], description: 'Employee cut left hand on sharp edge of sheet metal offcut while clearing workbench.', immediate: 'First aid administered; taken to clinic for stitches.', injury: { nature: 'Laceration', body: 'Left hand', treatment: 'Medical treatment case', daysLost: 0 }, actualSev: 2, potentialSev: 3, investigator: 'P-004', status: 'Closed', investigation: { findings: 'Cut-resistant gloves not worn; offcuts not placed in scrap bin.', immediate: 'No gloves', underlying: 'Gloves not specified for task', root: 'Task not covered by risk assessment', categories: ['PPE', 'Risk assessment'], completed: D(-110) }, links: { assets: [], docs: [] }, reporting: { required: 'To be determined', status: 'Assessed — COIDA claim submitted (demo)', ref: 'Demo-ref' }, closure: { by: 'P-004', date: D(-80), comment: 'Closed.' } }),
    INC({ id: 'INC-2026-003', type: 'Environmental', title: 'Hydraulic oil spill in yard', date: D(-85), time: '08:40', site: 'S-JHB', location: 'Yard near wash bay', reporter: 'P-008', persons: [], description: 'Approx. 15 L hydraulic oil leaked from hire unit returned by customer.', immediate: 'Spill kit used; contaminated absorbent bagged as hazardous waste.', injury: null, actualSev: 2, potentialSev: 3, investigator: 'P-008', status: 'Closed', investigation: { findings: 'Returned equipment not inspected before parking on unbunded area.', immediate: 'Leaking hose', underlying: 'No returns inspection area', root: 'Returns process did not consider environmental risk', categories: ['Procedure'], completed: D(-80) }, links: { assets: [], docs: ['DOC-011'] }, reporting: { required: 'No', status: 'Not required', ref: '' }, closure: { by: 'P-002', date: D(-60), comment: '' } }),
    INC({ id: 'INC-2026-004', type: 'Property Damage', title: 'Forklift struck racking upright', date: D(-48), time: '15:30', site: 'S-CPT', location: 'Warehouse aisle C', reporter: 'P-012', persons: ['P-012'], description: 'FL-07 mast struck end-of-aisle upright while turning; upright visibly bent.', immediate: 'Bay offloaded and cordoned; racking supplier called.', injury: null, actualSev: 3, potentialSev: 5, investigator: 'P-004', status: 'Actions in Progress', investigation: { findings: 'No column guards fitted; aisle width tight for FL-07; annual racking inspection overdue.', immediate: 'Turning too tight', underlying: 'No column protection; overdue inspection', root: 'Racking inspection and protection not included in maintenance programme', categories: ['Equipment / design', 'Inspection & maintenance'], completed: D(-40) }, links: { assets: ['AS-003', 'AS-008'], docs: ['DOC-007'] }, reporting: { required: 'No', status: 'Not required', ref: '' } }),
    INC({ id: 'INC-2026-005', type: 'Injury', title: 'Solvent splash to eye during degreasing', date: D(-75), time: '11:15', site: 'S-DBN', location: 'Degreasing bay', reporter: 'P-010', persons: ['P-010'], description: 'Degreaser splashed into right eye while cleaning gearbox housing. Safety glasses pushed up on head.', immediate: 'Eye flushed with bottled water (no eyewash in bay); clinic visit.', injury: { nature: 'Chemical irritation', body: 'Right eye', treatment: 'Medical treatment case', daysLost: 1 }, actualSev: 3, potentialSev: 4, investigator: 'P-003', status: 'Actions in Progress', investigation: { findings: 'No eyewash within reach; PPE not worn correctly; SDS out of date.', immediate: 'Glasses not worn', underlying: 'No eyewash station; supervision', root: 'HCA risk assessment controls not implemented', categories: ['Risk assessment', 'PPE', 'Supervision'], completed: D(-65) }, links: { assets: [], docs: ['DOC-018'] }, reporting: { required: 'To be determined', status: 'Assessment pending by competent person', ref: '' } }),
    INC({ id: 'INC-2026-006', type: 'Near Miss', title: 'Unsecured load shifted on LDV-03', date: D(-12), time: '13:50', site: 'S-JHB', location: 'N3 en route to customer', reporter: 'P-014', persons: ['P-014'], description: 'Generator on load bed moved during braking; ratchet strap found frayed.', immediate: 'Driver stopped and re-secured load with spare strap.', injury: null, actualSev: 1, potentialSev: 4, investigator: null, status: 'Reported', links: { assets: ['AS-004'], docs: [] } }),
    INC({ id: 'INC-2026-007', type: 'Near Miss', title: 'Air receiver over-pressure — safety valve failed to lift', date: D(-9), time: '09:05', site: 'S-DBN', location: 'Workshop', reporter: 'P-010', persons: ['P-010'], description: 'Pressure switch failed; receiver gauge read above working pressure; safety valve did not lift. Compressor isolated.', immediate: 'Isolated, locked out and tagged; asset placed out of service.', injury: null, actualSev: 1, potentialSev: 5, investigator: 'P-003', status: 'Under Investigation', links: { assets: ['AS-009'], docs: [] }, reporting: { required: 'To be determined', status: 'Assessment pending', ref: '' } }),
    INC({ id: 'INC-2026-008', type: 'Near Miss', title: 'Pump casing slipped from lifting sling', date: D(-30), time: '10:00', site: 'S-RPV', location: 'Workshop bay 1', reporter: 'P-018', persons: ['P-018'], description: 'Casing slipped in sling; landed on pallet. No injury.', immediate: 'Work stopped; toolbox talk.', injury: null, actualSev: 1, potentialSev: 4, investigator: 'P-017', status: 'Closed', investigation: { findings: 'Wrong sling configuration.', immediate: 'Single-leg sling', underlying: 'No lift plan', root: 'No rigging training', categories: ['Training'], completed: D(-25) }, closure: { by: 'P-017', date: D(-15), comment: 'Rigging training scheduled.' } })
  ];
  S.incidents.forEach(i => { i.org = i.site === 'S-RPV' ? 'ORG-2' : 'ORG-1'; i.history = [{ ts: i.date + 'T' + i.time + ':00', by: i.reporter, action: 'Incident reported', comment: '' }]; });

  /* ---------------- Central corrective actions (CAPA) ---------------- */
  const AH = (ts, by, action, from, to, comment) => ({ ts, by, action, from: from || '', to: to || '', comment: comment || '' });
  const A = (o) => Object.assign({ org: o.site === 'S-RPV' ? 'ORG-2' : 'ORG-1', progress: [], evidence: [], verification: null, closed: null, escalated: false, history: [] }, o);
  S.actions = [
    A({ id: 'ACT-1001', title: 'Emergency exit E3 obstructed during drill', action: 'Mark keep-clear zone at E3 and add exit check to weekly warehouse inspection.', source: 'Other', sourceId: 'Evacuation drill (Germiston)', priority: 'High', site: 'S-JHB', owner: 'P-007', createdBy: 'P-006', created: D(-95), due: D(-80), status: 'Closed',
      progress: [{ ts: T(-88), by: 'P-007', note: 'Floor markings painted, signage installed.' }], evidence: [demoFile('E3_keep_clear_photo.jpg', 600)], verification: { by: 'P-002', ts: T(-82), decision: 'Verified', comment: 'Photo evidence reviewed; confirmed on walk-through.' }, closed: D(-82),
      history: [AH(T(-95), 'P-006', 'Created'), AH(T(-95), 'P-006', 'Assigned', '', 'P-007'), AH(T(-94), 'P-007', 'Acknowledged'), AH(T(-90), 'P-007', 'In Progress'), AH(T(-88), 'P-007', 'Submitted for Verification'), AH(T(-82), 'P-002', 'Verified'), AH(T(-82), 'P-002', 'Closed')] }),
    A({ id: 'ACT-1003', title: 'FL-07 load-test certificate expired', action: 'Book competent lifting machine inspector to examine and load test FL-07; restrict use until certified.', source: 'Asset Defect', sourceId: 'DF-302', priority: 'Critical', site: 'S-CPT', owner: 'P-016', createdBy: 'P-006', created: D(-20), due: D(-13), status: 'In Progress', escalated: true,
      progress: [{ ts: T(-15), by: 'P-016', note: 'Inspector booked; earliest slot next week.' }], history: [AH(T(-20), 'P-006', 'Created'), AH(T(-20), 'P-006', 'Assigned', '', 'P-016'), AH(T(-19), 'P-016', 'Acknowledged'), AH(T(-15), 'P-016', 'In Progress'), AH(T(-12), 'System', 'Escalated', '', 'P-004', 'Overdue — escalated to branch manager.')] }),
    A({ id: 'ACT-1005', title: 'No eyewash station at degreasing bay', action: 'Install plumbed eyewash station within reach of the degreasing bay and add to monthly inspection.', source: 'Inspection', sourceId: 'INS-1080', priority: 'High', site: 'S-DBN', owner: 'P-003', createdBy: 'P-006', created: D(-56), due: D(-12), status: 'Submitted for Verification',
      progress: [{ ts: T(-30), by: 'P-003', note: 'Plumber appointed.' }, { ts: T(-3), by: 'P-003', note: 'Eyewash installed and flow-tested.' }], evidence: [demoFile('Eyewash_installed.jpg', 750), demoFile('Plumber_invoice.pdf', 120)],
      history: [AH(T(-56), 'P-006', 'Created'), AH(T(-56), 'P-006', 'Assigned', '', 'P-003'), AH(T(-50), 'P-003', 'Acknowledged'), AH(T(-30), 'P-003', 'In Progress'), AH(T(-3), 'P-003', 'Submitted for Verification')] }),
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
    A({ id: 'ACT-1014', title: 'Compressor CMP-02 safety valve failure', action: 'Replace safety valve, test and certify receiver before return to service.', source: 'Asset Defect', sourceId: 'DF-301', priority: 'Critical', site: 'S-DBN', owner: 'P-011', createdBy: 'P-003', created: D(-9), due: D(-6), status: 'In Progress',
      progress: [{ ts: T(-7), by: 'P-011', note: 'Replacement valve ordered from supplier.' }], history: [AH(T(-9), 'P-003', 'Created'), AH(T(-9), 'P-003', 'Assigned', '', 'P-011'), AH(T(-9), 'P-011', 'Acknowledged'), AH(T(-7), 'P-011', 'In Progress')] }),
    A({ id: 'ACT-1016', title: 'Two extinguishers past service date (Pinetown)', action: 'Have extinguishers serviced by accredited provider.', source: 'Inspection', sourceId: 'INS-1090', priority: 'High', site: 'S-DBN', owner: 'P-011', createdBy: 'P-011', created: D(-40), due: D(-26), status: 'Verified',
      progress: [{ ts: T(-30), by: 'P-011', note: 'Serviced.' }], evidence: [demoFile('FE_service_slip.pdf', 90)], verification: { by: 'P-003', ts: T(-27), decision: 'Verified', comment: 'Service tags checked.' },
      history: [AH(T(-40), 'P-011', 'Created'), AH(T(-40), 'P-011', 'Assigned', '', 'P-011'), AH(T(-39), 'P-011', 'Acknowledged'), AH(T(-35), 'P-011', 'In Progress'), AH(T(-30), 'P-011', 'Submitted for Verification'), AH(T(-27), 'P-003', 'Verified')] }),
    A({ id: 'ACT-1019', title: 'Rigging training for workshop', action: 'Arrange rigging / slinging training for technicians.', source: 'Incident', sourceId: 'INC-2026-008', priority: 'Medium', site: 'S-RPV', owner: 'P-017', createdBy: 'P-017', created: D(-25), due: D(20), status: 'In Progress',
      history: [AH(T(-25), 'P-017', 'Created'), AH(T(-25), 'P-017', 'Assigned', '', 'P-017'), AH(T(-24), 'P-017', 'Acknowledged'), AH(T(-20), 'P-017', 'In Progress')] })
  ];
  // Link incident / audit / risk records to their actions (stable IDs)
  S.incidents.find(i => i.id === 'INC-2026-004').actions = ['ACT-1009', 'ACT-1010'];
  S.incidents.find(i => i.id === 'INC-2026-005').actions = ['ACT-1011'];
  S.incidents.find(i => i.id === 'INC-2026-008').actions = ['ACT-1019'];
  S.incidents.forEach(i => { if (!i.actions) i.actions = []; });

  /* ---------------- Company notices (memos / important information) ---------------- */
  S.notices = [
    { id: 'NT-001', org: 'ORG-1', title: 'New pedestrian walkways and forklift rules in the warehouse', priority: 'Important', audience: 'S-JHB', ackRequired: true, expires: null,
      body: 'From Monday, pedestrians must use the newly painted green walkways in the Germiston warehouse at all times.\n\nForklifts must stop at every walkway crossing and sound the horn. Do not walk behind a reversing forklift.\n\nYour supervisor will brief you at the next toolbox talk. Please confirm that you have read and understood this notice.',
      attachment: demoFile('Memo_Warehouse_Walkways.pdf', 140), publishedBy: 'P-005', publishedOn: T(-2, 8, 15),
      reads: { 'P-005': T(-2, 8, 15), 'P-007': T(-2, 9, 2), 'P-009': T(-1, 7, 40), 'P-002': T(-2, 10, 5) }, acks: { 'P-007': T(-2, 9, 3), 'P-009': T(-1, 7, 41) } },
    { id: 'NT-002', org: 'ORG-1', title: 'Year-end shutdown and site security', priority: 'Normal', audience: 'ALL', ackRequired: false, expires: D(60),
      body: 'All branches close for the year-end shutdown. Equipment must be switched off and isolated, and keys returned to the branch manager before you leave.\n\nThe exact dates will be confirmed by your branch manager.',
      attachment: null, publishedBy: 'P-001', publishedOn: T(-5, 11, 0), reads: { 'P-001': T(-5, 11, 0), 'P-002': T(-5, 12, 0), 'P-003': T(-4, 8, 0) }, acks: {} },
    { id: 'NT-003', org: 'ORG-1', title: 'Water supply interruption at Pinetown on Friday', priority: 'Normal', audience: 'S-DBN', ackRequired: false, expires: D(3),
      body: 'The municipality will interrupt the water supply on Friday from 08:00 to 14:00. Bottled drinking water will be provided in the canteen, and the eyewash station has its own reserve tank.',
      attachment: null, publishedBy: 'P-003', publishedOn: T(-1, 14, 30), reads: { 'P-003': T(-1, 14, 30) }, acks: {} }
  ];

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
