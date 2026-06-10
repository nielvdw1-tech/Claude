-- =====================================================================
-- VDW Compliance Control System - Demo seed data (Phase 1)
-- =====================================================================
-- Mirrors the demo data currently hardcoded in app/js/db.js's seedData(),
-- minus users/profiles (those depend on auth.users - see README.md).
-- Run after schema.sql and policies.sql.
-- =====================================================================

insert into public.clients (id, client_name, client_code, contact_person, contact_email, contact_phone, status, contract_end_date) overriding system value values
  (1, 'Sasol Polymers', 'SAS-001', 'J. Naidoo', 'j.naidoo@sasol.com', '011 555 0101', 'Active', current_date + 20),
  (2, 'Transnet Logistics', 'TRN-002', 'M. van Wyk', 'm.vanwyk@transnet.net', '012 555 0202', 'Active', current_date + 180);

insert into public.branches (id, client_id, branch_name, branch_code, address, region, status) overriding system value values
  (1, 1, 'Sasolburg Plant', 'SAS-SB', '1 Sasol Road, Sasolburg, 1947', 'Free State', 'Active'),
  (2, 1, 'Secunda Warehouse', 'SAS-SEC', '14 Industrial Avenue, Secunda, 2302', 'Mpumalanga', 'Active'),
  (3, 2, 'City Deep Depot', 'TRN-CD', '8 Rail Street, City Deep, Johannesburg', 'Gauteng', 'Active');

insert into public.inspection_templates (id, template_name, asset_type, inspection_frequency, active) overriding system value values
  (1, 'Fire Extinguisher Monthly Check', 'Fire Extinguisher', 30, true),
  (2, 'Forklift Pre-Use Inspection', 'Forklift', 7, true),
  (3, 'Electrical Distribution Board Inspection', 'Electrical Panel', 180, true);

insert into public.template_questions (id, template_id, question_text, category, legal_reference, risk_level, default_corrective_action, photo_required, critical, weight, active) overriding system value values
  -- Fire Extinguisher (template 1)
  (1, 1, 'Pressure gauge reading is in the green zone', 'Equipment Condition', 'SANS 1475', 'High', 'Recharge or replace the extinguisher immediately', true, true, 3, true),
  (2, 1, 'Safety pin and tamper seal are intact', 'Safety Devices', 'OHS Act Section 8', 'Medium', 'Replace seal and pin', false, false, 2, true),
  (3, 1, 'Extinguisher is mounted, signed and unobstructed', 'Accessibility', 'SANS 1475', 'Medium', 'Clear access path / remount on bracket', true, false, 1, true),
  (4, 1, 'No visible corrosion, dents or physical damage', 'Equipment Condition', 'SANS 1475', 'High', 'Remove from service and replace unit', true, true, 3, true),
  (5, 1, 'Service inspection tag is up to date', 'Documentation', 'OHS Act Section 8', 'Low', 'Schedule service with accredited provider', false, false, 1, true),
  -- Forklift (template 2)
  (6, 2, 'Service and parking brakes function correctly', 'Mechanical', 'Driven Machinery Regulations', 'Critical', 'Take forklift out of service and notify maintenance', false, true, 3, true),
  (7, 2, 'Hydraulic system free of leaks', 'Mechanical', 'DMR Regulation 18', 'High', 'Report leak and schedule repair', true, true, 3, true),
  (8, 2, 'Horn and reverse alarm are operational', 'Safety Devices', 'DMR Regulation 18', 'Medium', 'Repair horn / reverse alarm before next use', false, false, 2, true),
  (9, 2, 'Operator license is displayed and valid', 'Documentation', 'DMR Regulation 18', 'Medium', 'Verify and renew operator license', false, false, 1, true),
  (10, 2, 'Tyres are in acceptable condition', 'Mechanical', 'DMR Regulation 18', 'Medium', 'Replace worn tyres', true, false, 2, true),
  -- Electrical Panel (template 3)
  (11, 3, 'Panel cover is closed and securely fastened', 'Electrical Safety', 'SANS 10142-1', 'High', 'Secure panel cover immediately', false, true, 3, true),
  (12, 3, 'Circuit breakers are correctly labelled', 'Documentation', 'SANS 10142-1', 'Low', 'Update circuit labelling', false, false, 1, true),
  (13, 3, 'No signs of overheating, scorch marks or burning smell', 'Electrical Safety', 'SANS 10142-1', 'Critical', 'De-energise board and call a qualified electrician', true, true, 3, true),
  (14, 3, 'Clear access of 1m maintained in front of panel', 'Accessibility', 'OHS Act Section 8', 'Medium', 'Remove obstruction from panel access', true, false, 2, true),
  (15, 3, 'Earth leakage / RCD test button is functional', 'Electrical Safety', 'SANS 10142-1', 'High', 'Replace faulty RCD unit', false, true, 3, true);

insert into public.assets (id, asset_name, asset_tag, serial_number, asset_type, client_id, branch_id, template_id, location_description, status, last_inspection_date, next_inspection_date, compliance_status) overriding system value values
  (1, 'Fire Extinguisher - Loading Bay A', 'FE-SB-001', 'FX0019283', 'Fire Extinguisher', 1, 1, 1, 'Loading Bay A, near Door 3', 'Active', null, current_date - 2, 'Pending'),
  (2, 'Forklift - Toyota 8FG25', 'FL-SB-002', 'TY8FG25-4471', 'Forklift', 1, 1, 2, 'Warehouse Floor, Bay 2', 'Active', current_date - 10, current_date - 3, 'Non-Compliant'),
  (3, 'Electrical DB - Main Distribution', 'EDB-SEC-001', 'EDB-2021-118', 'Electrical Panel', 1, 2, 3, 'Plant Room, Secunda Warehouse', 'Active', current_date - 30, current_date + 150, 'Compliant'),
  (4, 'Fire Extinguisher - Office Block Reception', 'FE-CD-004', 'FX0044192', 'Fire Extinguisher', 2, 3, 1, 'Reception Area, City Deep Depot', 'Active', null, current_date + 5, 'Pending'),
  (5, 'Forklift - Hyster H2.5FT', 'FL-CD-005', 'HY25FT-9981', 'Forklift', 2, 3, 2, 'Yard, City Deep Depot', 'Active', null, current_date + 2, 'Pending');

-- Re-sync identity sequences after explicit-id inserts above.
select setval(pg_get_serial_sequence('public.clients', 'id'), (select max(id) from public.clients));
select setval(pg_get_serial_sequence('public.branches', 'id'), (select max(id) from public.branches));
select setval(pg_get_serial_sequence('public.inspection_templates', 'id'), (select max(id) from public.inspection_templates));
select setval(pg_get_serial_sequence('public.template_questions', 'id'), (select max(id) from public.template_questions));
select setval(pg_get_serial_sequence('public.assets', 'id'), (select max(id) from public.assets));
