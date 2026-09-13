-- Seeds the 21 predefined roles with stable ids (idempotent via INSERT OR IGNORE),
-- gives each a default permission matrix, and backfills any existing user with no
-- role yet to Project Manager so nothing that worked before this migration breaks.

INSERT OR IGNORE INTO roles (id, name, description, status, is_system) VALUES
('role_project_manager', 'Project Manager', 'Oversees the project end-to-end; full administrative access.', 'Active', 1),
('role_technical_director', 'Technical Director', 'Provides technical oversight and direction across engineering disciplines.', 'Active', 1),
('role_project_engineer', 'Project Engineer', 'Coordinates day-to-day engineering activities on the project.', 'Active', 1),
('role_electrical_engineer', 'Electrical Engineer', 'Responsible for electrical design, installation, and testing.', 'Active', 1),
('role_mechanical_engineer', 'Mechanical Engineer', 'Responsible for mechanical design, installation, and testing.', 'Active', 1),
('role_instrumentation_control_engineer', 'Instrumentation & Control Engineer', 'Responsible for instrumentation and control systems.', 'Active', 1),
('role_plc_scada_engineer', 'PLC/SCADA Engineer', 'Responsible for PLC programming and SCADA systems.', 'Active', 1),
('role_civil_structural_engineer', 'Civil/Structural Engineer', 'Responsible for civil and structural works.', 'Active', 1),
('role_site_engineer', 'Site Engineer', 'Manages on-site engineering activities.', 'Active', 1),
('role_installation_technician', 'Installation Technician', 'Carries out on-site installation work.', 'Active', 1),
('role_commissioning_engineer', 'Commissioning Engineer', 'Responsible for system commissioning and handover.', 'Active', 1),
('role_procurement_engineer_officer', 'Procurement Engineer/Officer', 'Manages procurement of materials and equipment.', 'Active', 1),
('role_qa_qc_engineer', 'QA/QC Engineer', 'Responsible for quality assurance and quality control.', 'Active', 1),
('role_hse_officer', 'HSE Officer', 'Responsible for health, safety, and environment compliance.', 'Active', 1),
('role_design_engineer', 'Design Engineer', 'Produces engineering designs and drawings.', 'Active', 1),
('role_documentation_engineer_controller', 'Documentation Engineer/Controller', 'Manages project documentation and document control.', 'Active', 1),
('role_storekeeper_logistics_officer', 'Storekeeper/Logistics Officer', 'Manages stores, materials, and logistics.', 'Active', 1),
('role_client_owner_representative', 'Client/Owner Representative', 'Represents the client/owner on the project.', 'Active', 1),
('role_subcontractor', 'Subcontractor', 'External subcontractor working on the project.', 'Active', 1),
('role_supplier_vendor', 'Supplier/Vendor', 'External supplier or vendor to the project.', 'Active', 1),
('role_administrative_finance_officer', 'Administrative/Finance Officer', 'Handles administrative and financial matters.', 'Active', 1);
--> statement-breakpoint

-- Project Manager: full access to every module.
INSERT OR IGNORE INTO role_permissions (id, role_id, module, can_view, can_create, can_edit, can_delete) VALUES
('rp_project_manager_projects', 'role_project_manager', 'projects', 1, 1, 1, 1),
('rp_project_manager_users', 'role_project_manager', 'users', 1, 1, 1, 1),
('rp_project_manager_roles', 'role_project_manager', 'roles', 1, 1, 1, 1),
('rp_project_manager_settings', 'role_project_manager', 'settings', 1, 1, 1, 1);
--> statement-breakpoint

-- Every other predefined role: can view/create/edit projects (no delete), no access to
-- Users/Roles/Settings by default. Fully editable afterward via the Roles & Permissions page.
INSERT OR IGNORE INTO role_permissions (id, role_id, module, can_view, can_create, can_edit, can_delete) VALUES
('rp_technical_director_projects', 'role_technical_director', 'projects', 1, 1, 1, 0),
('rp_technical_director_users', 'role_technical_director', 'users', 0, 0, 0, 0),
('rp_technical_director_roles', 'role_technical_director', 'roles', 0, 0, 0, 0),
('rp_technical_director_settings', 'role_technical_director', 'settings', 0, 0, 0, 0),

('rp_project_engineer_projects', 'role_project_engineer', 'projects', 1, 1, 1, 0),
('rp_project_engineer_users', 'role_project_engineer', 'users', 0, 0, 0, 0),
('rp_project_engineer_roles', 'role_project_engineer', 'roles', 0, 0, 0, 0),
('rp_project_engineer_settings', 'role_project_engineer', 'settings', 0, 0, 0, 0),

('rp_electrical_engineer_projects', 'role_electrical_engineer', 'projects', 1, 1, 1, 0),
('rp_electrical_engineer_users', 'role_electrical_engineer', 'users', 0, 0, 0, 0),
('rp_electrical_engineer_roles', 'role_electrical_engineer', 'roles', 0, 0, 0, 0),
('rp_electrical_engineer_settings', 'role_electrical_engineer', 'settings', 0, 0, 0, 0),

('rp_mechanical_engineer_projects', 'role_mechanical_engineer', 'projects', 1, 1, 1, 0),
('rp_mechanical_engineer_users', 'role_mechanical_engineer', 'users', 0, 0, 0, 0),
('rp_mechanical_engineer_roles', 'role_mechanical_engineer', 'roles', 0, 0, 0, 0),
('rp_mechanical_engineer_settings', 'role_mechanical_engineer', 'settings', 0, 0, 0, 0),

('rp_instrumentation_control_engineer_projects', 'role_instrumentation_control_engineer', 'projects', 1, 1, 1, 0),
('rp_instrumentation_control_engineer_users', 'role_instrumentation_control_engineer', 'users', 0, 0, 0, 0),
('rp_instrumentation_control_engineer_roles', 'role_instrumentation_control_engineer', 'roles', 0, 0, 0, 0),
('rp_instrumentation_control_engineer_settings', 'role_instrumentation_control_engineer', 'settings', 0, 0, 0, 0),

('rp_plc_scada_engineer_projects', 'role_plc_scada_engineer', 'projects', 1, 1, 1, 0),
('rp_plc_scada_engineer_users', 'role_plc_scada_engineer', 'users', 0, 0, 0, 0),
('rp_plc_scada_engineer_roles', 'role_plc_scada_engineer', 'roles', 0, 0, 0, 0),
('rp_plc_scada_engineer_settings', 'role_plc_scada_engineer', 'settings', 0, 0, 0, 0),

('rp_civil_structural_engineer_projects', 'role_civil_structural_engineer', 'projects', 1, 1, 1, 0),
('rp_civil_structural_engineer_users', 'role_civil_structural_engineer', 'users', 0, 0, 0, 0),
('rp_civil_structural_engineer_roles', 'role_civil_structural_engineer', 'roles', 0, 0, 0, 0),
('rp_civil_structural_engineer_settings', 'role_civil_structural_engineer', 'settings', 0, 0, 0, 0),

('rp_site_engineer_projects', 'role_site_engineer', 'projects', 1, 1, 1, 0),
('rp_site_engineer_users', 'role_site_engineer', 'users', 0, 0, 0, 0),
('rp_site_engineer_roles', 'role_site_engineer', 'roles', 0, 0, 0, 0),
('rp_site_engineer_settings', 'role_site_engineer', 'settings', 0, 0, 0, 0),

('rp_installation_technician_projects', 'role_installation_technician', 'projects', 1, 1, 1, 0),
('rp_installation_technician_users', 'role_installation_technician', 'users', 0, 0, 0, 0),
('rp_installation_technician_roles', 'role_installation_technician', 'roles', 0, 0, 0, 0),
('rp_installation_technician_settings', 'role_installation_technician', 'settings', 0, 0, 0, 0),

('rp_commissioning_engineer_projects', 'role_commissioning_engineer', 'projects', 1, 1, 1, 0),
('rp_commissioning_engineer_users', 'role_commissioning_engineer', 'users', 0, 0, 0, 0),
('rp_commissioning_engineer_roles', 'role_commissioning_engineer', 'roles', 0, 0, 0, 0),
('rp_commissioning_engineer_settings', 'role_commissioning_engineer', 'settings', 0, 0, 0, 0),

('rp_procurement_engineer_officer_projects', 'role_procurement_engineer_officer', 'projects', 1, 1, 1, 0),
('rp_procurement_engineer_officer_users', 'role_procurement_engineer_officer', 'users', 0, 0, 0, 0),
('rp_procurement_engineer_officer_roles', 'role_procurement_engineer_officer', 'roles', 0, 0, 0, 0),
('rp_procurement_engineer_officer_settings', 'role_procurement_engineer_officer', 'settings', 0, 0, 0, 0),

('rp_qa_qc_engineer_projects', 'role_qa_qc_engineer', 'projects', 1, 1, 1, 0),
('rp_qa_qc_engineer_users', 'role_qa_qc_engineer', 'users', 0, 0, 0, 0),
('rp_qa_qc_engineer_roles', 'role_qa_qc_engineer', 'roles', 0, 0, 0, 0),
('rp_qa_qc_engineer_settings', 'role_qa_qc_engineer', 'settings', 0, 0, 0, 0),

('rp_hse_officer_projects', 'role_hse_officer', 'projects', 1, 1, 1, 0),
('rp_hse_officer_users', 'role_hse_officer', 'users', 0, 0, 0, 0),
('rp_hse_officer_roles', 'role_hse_officer', 'roles', 0, 0, 0, 0),
('rp_hse_officer_settings', 'role_hse_officer', 'settings', 0, 0, 0, 0),

('rp_design_engineer_projects', 'role_design_engineer', 'projects', 1, 1, 1, 0),
('rp_design_engineer_users', 'role_design_engineer', 'users', 0, 0, 0, 0),
('rp_design_engineer_roles', 'role_design_engineer', 'roles', 0, 0, 0, 0),
('rp_design_engineer_settings', 'role_design_engineer', 'settings', 0, 0, 0, 0),

('rp_documentation_engineer_controller_projects', 'role_documentation_engineer_controller', 'projects', 1, 1, 1, 0),
('rp_documentation_engineer_controller_users', 'role_documentation_engineer_controller', 'users', 0, 0, 0, 0),
('rp_documentation_engineer_controller_roles', 'role_documentation_engineer_controller', 'roles', 0, 0, 0, 0),
('rp_documentation_engineer_controller_settings', 'role_documentation_engineer_controller', 'settings', 0, 0, 0, 0),

('rp_storekeeper_logistics_officer_projects', 'role_storekeeper_logistics_officer', 'projects', 1, 1, 1, 0),
('rp_storekeeper_logistics_officer_users', 'role_storekeeper_logistics_officer', 'users', 0, 0, 0, 0),
('rp_storekeeper_logistics_officer_roles', 'role_storekeeper_logistics_officer', 'roles', 0, 0, 0, 0),
('rp_storekeeper_logistics_officer_settings', 'role_storekeeper_logistics_officer', 'settings', 0, 0, 0, 0),

('rp_client_owner_representative_projects', 'role_client_owner_representative', 'projects', 1, 1, 1, 0),
('rp_client_owner_representative_users', 'role_client_owner_representative', 'users', 0, 0, 0, 0),
('rp_client_owner_representative_roles', 'role_client_owner_representative', 'roles', 0, 0, 0, 0),
('rp_client_owner_representative_settings', 'role_client_owner_representative', 'settings', 0, 0, 0, 0),

('rp_subcontractor_projects', 'role_subcontractor', 'projects', 1, 1, 1, 0),
('rp_subcontractor_users', 'role_subcontractor', 'users', 0, 0, 0, 0),
('rp_subcontractor_roles', 'role_subcontractor', 'roles', 0, 0, 0, 0),
('rp_subcontractor_settings', 'role_subcontractor', 'settings', 0, 0, 0, 0),

('rp_supplier_vendor_projects', 'role_supplier_vendor', 'projects', 1, 1, 1, 0),
('rp_supplier_vendor_users', 'role_supplier_vendor', 'users', 0, 0, 0, 0),
('rp_supplier_vendor_roles', 'role_supplier_vendor', 'roles', 0, 0, 0, 0),
('rp_supplier_vendor_settings', 'role_supplier_vendor', 'settings', 0, 0, 0, 0),

('rp_administrative_finance_officer_projects', 'role_administrative_finance_officer', 'projects', 1, 1, 1, 0),
('rp_administrative_finance_officer_users', 'role_administrative_finance_officer', 'users', 0, 0, 0, 0),
('rp_administrative_finance_officer_roles', 'role_administrative_finance_officer', 'roles', 0, 0, 0, 0),
('rp_administrative_finance_officer_settings', 'role_administrative_finance_officer', 'settings', 0, 0, 0, 0);
--> statement-breakpoint

-- Backfill: any existing user created before roles existed keeps full access (Project Manager)
-- rather than suddenly losing access to data they already own.
UPDATE users SET role_id = 'role_project_manager' WHERE role_id IS NULL;
