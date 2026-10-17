# -*- coding: utf-8 -*-
"""
Generate comprehensive Microsoft Word (.docx) User Guide for Greg Hardware Training Simulator.
Covers: Administrator, Instructor, and Trainee roles step-by-step.
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_element(name):
    return OxmlElement(name)

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_cell_border(cell, **kwargs):
    """
    kwargs: top, bottom, left, right
    values: dict(sz=12, val='single', color='FF0000', space='0')
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
    for edge in ('top', 'left', 'bottom', 'right'):
        edge_data = kwargs.get(edge)
        if edge_data:
            b_elm = parse_xml(f'<w:{edge} {nsdecls("w")} w:val="{edge_data.get("val", "single")}" w:sz="{edge_data.get("sz", 4)}" w:space="0" w:color="{edge_data.get("color", "auto")}"/>')
            tcBorders.append(b_elm)
        else:
            b_elm = parse_xml(f'<w:{edge} {nsdecls("w")} w:val="none"/>')
            tcBorders.append(b_elm)
    tcPr.append(tcBorders)

def add_callout(doc, title, text, callout_type='note'):
    """
    Types: 'note' (blue), 'tip' (green), 'warning' (amber), 'danger' (red)
    """
    colors = {
        'note': {'border': '0284C7', 'bg': 'F0F9FF', 'title_color': RGBColor(2, 132, 199), 'icon': 'ℹ️ NOTE:'},
        'tip': {'border': '059669', 'bg': 'F0FDF4', 'title_color': RGBColor(5, 150, 105), 'icon': '💡 PRO-TIP:'},
        'warning': {'border': 'D97706', 'bg': 'FFFBEB', 'title_color': RGBColor(217, 119, 6), 'icon': '⚠️ WARNING:'},
        'danger': {'border': 'DC2626', 'bg': 'FEF2F2', 'title_color': RGBColor(220, 38, 38), 'icon': '🚨 CRITICAL PROTOCOL:'},
    }
    cfg = colors.get(callout_type, colors['note'])

    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)

    set_cell_background(cell, cfg['bg'])
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    set_cell_border(cell, left=dict(sz=24, val='single', color=cfg['border']))

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    run_icon = p.add_run(f"{cfg['icon']} {title}\n")
    run_icon.bold = True
    run_icon.font.name = 'Calibri'
    run_icon.font.size = Pt(10.5)
    run_icon.font.color.rgb = cfg['title_color']

    run_text = p.add_run(text)
    run_text.font.name = 'Calibri'
    run_text.font.size = Pt(9.5)
    run_text.font.color.rgb = RGBColor(51, 65, 85)

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(4)

def format_table_headers(table, col_widths, headers, bg_color='1E3A8A'):
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        cell = hdr_cells[i]
        cell.width = Inches(col_widths[i])
        set_cell_background(cell, bg_color)
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(title)
        run.bold = True
        run.font.name = 'Calibri'
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(255, 255, 255)

def add_table_row(table, col_widths, values, is_alt=False):
    row_cells = table.add_row().cells
    bg = 'F8FAFC' if is_alt else 'FFFFFF'
    for i, val in enumerate(values):
        cell = row_cells[i]
        cell.width = Inches(col_widths[i])
        set_cell_background(cell, bg)
        set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
        set_cell_border(cell, 
                        top=dict(sz=4, val='single', color='E2E8F0'),
                        bottom=dict(sz=4, val='single', color='E2E8F0'),
                        left=dict(sz=4, val='single', color='E2E8F0'),
                        right=dict(sz=4, val='single', color='E2E8F0'))
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        run = p.add_run(str(val))
        run.font.name = 'Calibri'
        run.font.size = Pt(9)
        run.font.color.rgb = RGBColor(30, 41, 59)

def build_user_guide():
    doc = docx.Document()

    # Set standard margins (1 inch)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Configure Header and Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("GREG HARDWARE TRAINING SIMULATOR | COMPREHENSIVE USER GUIDE")
        hrun.font.name = 'Calibri'
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(148, 163, 184)

        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("https://hardware.gregicthub.com  •  Confidential & Proprietary Training Documentation")
        frun.font.name = 'Calibri'
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(148, 163, 184)

    # -------------------------------------------------------------
    # COVER PAGE
    # -------------------------------------------------------------
    cov_p0 = doc.add_paragraph()
    cov_p0.paragraph_format.space_before = Pt(36)
    cov_p0.paragraph_format.space_after = Pt(12)
    cov_run0 = cov_p0.add_run("GREG ICT HUB  •  TECHNICAL EDUCATION & SIMULATION DIVISION")
    cov_run0.bold = True
    cov_run0.font.name = 'Calibri'
    cov_run0.font.size = Pt(11)
    cov_run0.font.color.rgb = RGBColor(2, 132, 199)

    cov_p1 = doc.add_paragraph()
    cov_p1.paragraph_format.space_before = Pt(0)
    cov_p1.paragraph_format.space_after = Pt(6)
    cov_run1 = cov_p1.add_run("HARDWARE TRAINING SIMULATOR")
    cov_run1.bold = True
    cov_run1.font.name = 'Calibri'
    cov_run1.font.size = Pt(28)
    cov_run1.font.color.rgb = RGBColor(30, 58, 138) # Deep Navy

    cov_p2 = doc.add_paragraph()
    cov_p2.paragraph_format.space_before = Pt(0)
    cov_p2.paragraph_format.space_after = Pt(24)
    cov_run2 = cov_p2.add_run("Complete Trainee, Instructor & Administrator Step-by-Step User Manual")
    cov_run2.font.name = 'Calibri'
    cov_run2.font.size = Pt(15)
    cov_run2.font.color.rgb = RGBColor(71, 85, 105)

    # Decorative cover box
    cov_box = doc.add_table(rows=1, cols=1)
    cov_box.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_cell = cov_box.cell(0, 0)
    c_cell.width = Inches(6.5)
    set_cell_background(c_cell, "F1F5F9")
    set_cell_margins(c_cell, top=180, bottom=180, left=200, right=200)
    set_cell_border(c_cell, left=dict(sz=36, val='single', color='1E3A8A'))
    
    cb_p = c_cell.paragraphs[0]
    cb_p.paragraph_format.line_spacing = 1.3
    cb_r = cb_p.add_run(
        "Platform URL: https://hardware.gregicthub.com\n"
        "Document Version: 2.5 (Enterprise Edition)\n"
        "Coverage: Administrator Operations, Course & Lab Management, Visual Wiring Canvas, "
        "UEFI BIOS Utility, POST Code Engine, Multimeter Probing, Sizing Calculator, Hardware Catalog, "
        "and Universal Multi-Lab Custom Reports\n"
        "Release Date: October 2026\n"
        "Classification: Institutional Practical Laboratory Manual"
    )
    cb_r.font.name = 'Calibri'
    cb_r.font.size = Pt(10)
    cb_r.font.color.rgb = RGBColor(30, 41, 59)

    doc.add_page_break()

    # -------------------------------------------------------------
    # HELPER FUNCTIONS FOR CHAPTERS
    # -------------------------------------------------------------
    def add_h1(text):
        h = doc.add_heading(text, level=1)
        h.paragraph_format.space_before = Pt(20)
        h.paragraph_format.space_after = Pt(8)
        h.paragraph_format.keep_with_next = True
        run = h.runs[0]
        run.font.name = 'Calibri'
        run.font.size = Pt(18)
        run.font.color.rgb = RGBColor(30, 58, 138)
        return h

    def add_h2(text):
        h = doc.add_heading(text, level=2)
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(6)
        h.paragraph_format.keep_with_next = True
        run = h.runs[0]
        run.font.name = 'Calibri'
        run.font.size = Pt(13.5)
        run.font.color.rgb = RGBColor(2, 132, 199)
        return h

    def add_h3(text):
        h = doc.add_heading(text, level=3)
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(4)
        h.paragraph_format.keep_with_next = True
        run = h.runs[0]
        run.font.name = 'Calibri'
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(51, 65, 85)
        return h

    def add_p(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.name = 'Calibri'
            r_pre.font.size = Pt(10)
            r_pre.font.color.rgb = RGBColor(15, 23, 42)
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(51, 65, 85)
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.name = 'Calibri'
            r_pre.font.size = Pt(10)
            r_pre.font.color.rgb = RGBColor(15, 23, 42)
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(51, 65, 85)
        return p

    # -------------------------------------------------------------
    # SECTION 1: EXECUTIVE OVERVIEW & PLATFORM ARCHITECTURE
    # -------------------------------------------------------------
    add_h1("1. Executive Overview & Platform Architecture")
    
    add_p(
        "The Greg Hardware Training Simulator (accessible online at https://hardware.gregicthub.com) is an enterprise-grade, "
        "interactive training and evaluation workstation engine built specifically for computer systems hardware engineering, "
        "PC building, diagnostic troubleshooting, and preventive maintenance education. Developed as a companion platform to the "
        "Solar PV Training Simulator, it bridges the gap between theoretical computer architecture textbooks and physical laboratory workbench practice."
    )

    add_h2("1.1 Core Pedagogical Capabilities")
    add_bullet("Interactive Visual Wiring Canvas: Realistic ReactFlow-powered modular cable routing with physical keying rules, live multimeter voltage probing, and thermal FLIR imaging.", "• ")
    add_bullet("UEFI BIOS Firmware Setup Utility: Functional keyboard-driven BIOS simulator featuring boot priority configuration, XMP/DOCP memory tuning, and fan curves.", "• ")
    add_bullet("Motherboard Diagnostic POST Engine: Hardware state machine simulating 7-segment hex display codes (00, 55, d6, A2, AA) and diagnostic beep codes.", "• ")
    add_bullet("PC Power Supply Sizing & Bottleneck Engine: Calculates total power budgets, +12V single-rail amperage, minor rail wattages, and resolution-specific CPU/GPU bottlenecks.", "• ")
    add_bullet("Centralized Hardware Catalog & Telemetry Blueprint: Detailed technical specifications, pinout matrices, operational thermal thresholds, and failure modes for CPUs, GPUs, motherboards, and PSUs.", "• ")
    add_bullet("Universal Multi-Lab Custom Report Builder & Cohorts Analytics: Advanced query console with 1-click RFC-4180 CSV export for institutional grading and accreditation.", "• ")

    add_h2("1.2 System Requirements & Supported Browsers")
    add_p("To ensure seamless rendering of interactive canvas workstations, thermal gradients, and responsive layouts, the following client specifications are recommended:")
    
    tbl_req = doc.add_table(rows=1, cols=3)
    tbl_req.alignment = WD_TABLE_ALIGNMENT.CENTER
    format_table_headers(tbl_req, [1.8, 2.3, 2.4], ["System Component", "Minimum Requirement", "Recommended Specification"])
    add_table_row(tbl_req, [1.8, 2.3, 2.4], ["Web Browser", "Google Chrome 98+, MS Edge 98+, Firefox 96+", "Latest Google Chrome or Edge (WebGL enabled)"], False)
    add_table_row(tbl_req, [1.8, 2.3, 2.4], ["Display Resolution", "1280 x 720 (HD)", "1920 x 1080 (Full HD) or higher"], True)
    add_table_row(tbl_req, [1.8, 2.3, 2.4], ["RAM Memory", "4 GB Physical RAM", "8 GB+ RAM for smooth canvas physics"], False)
    add_table_row(tbl_req, [1.8, 2.3, 2.4], ["Network Connectivity", "1 Mbps Broadband", "5 Mbps+ Low-Latency Fiber / LTE"], True)
    add_table_row(tbl_req, [1.8, 2.3, 2.4], ["Input Devices", "Standard Mouse & Keyboard", "Mouse with scroll wheel for zoom/pan canvas"], False)

    add_p("")
    add_h2("1.3 Role-Based Access Control (RBAC) Matrix")
    add_p("The platform implements strict permission boundaries across three primary user roles:")

    tbl_rbac = doc.add_table(rows=1, cols=4)
    tbl_rbac.alignment = WD_TABLE_ALIGNMENT.CENTER
    format_table_headers(tbl_rbac, [2.5, 1.3, 1.3, 1.4], ["System Feature / Workstation Route", "Administrator", "Instructor", "Trainee"])
    add_table_row(tbl_rbac, [2.5, 1.3, 1.3, 1.4], ["User Account Creation & Password Reset", "Full (All Roles)", "Trainees Only", "No Access"], False)
    add_table_row(tbl_rbac, [2.5, 1.3, 1.3, 1.4], ["Database Backups & Snapshot Restore", "Full Access", "No Access", "No Access"], True)
    add_table_row(tbl_rbac, [2.5, 1.3, 1.3, 1.4], ["System Audit Logs & Security Inspection", "Full Access", "No Access", "No Access"], False)
    add_table_row(tbl_rbac, [2.5, 1.3, 1.3, 1.4], ["Course Syllabus & Module Editor", "Full Access", "Full Access", "View Assigned"], True)
    add_table_row(tbl_rbac, [2.5, 1.3, 1.3, 1.4], ["Simulation Lab Creator & Configurator", "Full Access", "Full Access", "No Access"], False)
    add_table_row(tbl_rbac, [2.5, 1.3, 1.3, 1.4], ["1-Click Practice vs. Graded Mode Switch", "Full Access", "Full Access", "No Access"], True)
    add_table_row(tbl_rbac, [2.5, 1.3, 1.3, 1.4], ["Submissions Gradebook & PDF Download", "Full Access", "Full Access", "Personal Only"], False)
    add_table_row(tbl_rbac, [2.5, 1.3, 1.3, 1.4], ["Multi-Lab Reports & CSV Data Export", "Full Access", "Full Access", "No Access"], True)
    add_table_row(tbl_rbac, [2.5, 1.3, 1.3, 1.4], ["Interactive Laboratory Workstations", "Full Access", "Full Access", "Assigned Labs"], False)
    add_table_row(tbl_rbac, [2.5, 1.3, 1.3, 1.4], ["PSU Sizing & Bottleneck Engine (/sizing)", "Full Access", "Full Access", "Full Access"], True)
    add_table_row(tbl_rbac, [2.5, 1.3, 1.3, 1.4], ["Hardware Equipment Catalog (/components)", "Full Access", "Full Access", "Full Access"], False)

    add_callout(doc, "Universal Dark / Light Theme Toggle", 
                "Every authenticated screen includes a quick toggle button (☀️ Light / 🌙 Dark) in the top-right header. "
                "The preferred theme is stored in browser local storage and persists across sessions for maximum visual ergonomics.", "tip")

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 2: ADMINISTRATOR OPERATIONS MANUAL
    # -------------------------------------------------------------
    add_h1("2. Administrator Operations Manual")
    add_p(
        "Administrators possess top-level authority over system configuration, user provisioning, database backups, "
        "and security audit logs. This section provides detailed step-by-step instructions for all administrative workflows."
    )

    add_h2("2.1 Administrator Authentication & Navigation")
    add_bullet("Navigate to the web application URL: https://hardware.gregicthub.com/login", "Step 1: ")
    add_bullet("Enter your authorized administrative email address (e.g., admin@gregco.local) and secure password.", "Step 2: ")
    add_bullet("Click 'Sign In'. The system verifies credentials, records an audit log entry (ACTION: USER_LOGIN), and redirects to the Admin Dashboard.", "Step 3: ")
    add_bullet("Inspect the primary navigation bar: Dashboard, User Accounts, Simulation Labs, Course Editor, Gradebook, Multi-Lab Reports, Database Backups, and System Audit.", "Step 4: ")

    add_h2("2.2 Managing User Accounts (Manual Provisioning)")
    add_p("To register, update, or suspend users individually:")
    add_bullet("Click 'User Accounts' in the main navigation menu (/admin/users).", "Step 1: ")
    add_bullet("Click the green '+ Register New User' button above the user table to open the registration modal.", "Step 2: ")
    add_bullet("Fill in the required fields: Full Name, Email Address, Phone Number (optional), Cohort / Batch (e.g. Cohort 2026-A), Role (Administrator, Instructor, or Trainee), and Password.", "Step 3: ")
    add_bullet("Click 'Create Account'. The user is immediately provisioned and existing active simulation labs are automatically assigned.", "Step 4: ")

    add_p("Account Maintenance & Lifecycle Actions in the Table:")
    add_bullet("Status Toggle: Click the green '🟢 Active' or gray '⚪ Suspended' button in the status column to instantly activate or deactivate an account. Suspended accounts cannot log in.", "• ")
    add_bullet("Password Reset: Click the key icon '🔑' to assign a new temporary password directly without requiring email dispatch.", "• ")
    add_bullet("Edit Details: Click 'Edit' to update the user's name, email, phone number, cohort, or assigned system role.", "• ")
    add_bullet("Move to Trash (Soft Delete): Click the red trash icon '🗑️'. The user is moved to the 'Trash' tab and can be restored at any time.", "• ")
    add_bullet("Restore from Trash: Switch to the 'Trash' tab, locate the user, and click '♻️ Restore'.", "• ")
    add_bullet("Permanent Deletion (Wipe): In the 'Trash' tab, click '❌ Wipe' and confirm the prompt to permanently purge the user and their historical database records.", "• ")

    add_callout(doc, "Data Protection via Soft Deletes", 
                "The platform uses Laravel Eloquent Soft Deletes. When an account is moved to trash, attempt histories and exam grades "
                "are safely retained in the database until an administrator explicitly executes a permanent wipe.", "note")

    add_h2("2.3 Bulk User Account Provisioning (CSV Batch Ingestion)")
    add_p("When onboarding an entire classroom or enterprise cohort (e.g. 50+ students at once):")
    add_bullet("Navigate to /admin/users and click '📤 Bulk CSV Import'.", "Step 1: ")
    add_bullet("Prepare a standard UTF-8 CSV spreadsheet with the following required column headers: name, email, role, cohort, password.", "Step 2: ")
    add_bullet("Example Row: John Doe, john.doe@institution.edu, trainee, Cohort 2026-A, Welcome@123", "Step 3: ")
    add_bullet("Click 'Browse / Choose File', select your prepared .csv document, and click 'Upload & Ingest'.", "Step 4: ")
    add_bullet("The batch importer processes records transactionally, skips duplicate emails with warning notices, and automatically provisions laboratory assignment portfolios for all valid trainees.", "Step 5: ")

    add_h2("2.4 Database Backups & Disaster Recovery")
    add_p(
        "The automated backup engine (/admin/backups) protects institutional training data, completed submissions, "
        "and lab configurations by creating complete MySQL database dumps with gzip compression (.sql.gz)."
    )
    add_bullet("Navigate to 'Database Backups' in the top navigation (/admin/backups).", "Step 1: ")
    add_bullet("To create an immediate on-demand backup snapshot, click '💾 Create Snapshot Now'. The system executes mysqldump, compresses the payload, and saves it to storage/app/backups/.", "Step 2: ")
    add_bullet("To download a backup copy to your local machine, click '⬇️ Download' beside the target snapshot.", "Step 3: ")
    add_bullet("To restore the system to an earlier snapshot state, click '♻️ Restore' and confirm the security warning. The database tables are atomically repopulated from the snapshot.", "Step 4: ")
    add_bullet("To remove obsolete backups, click '🗑️ Delete'.", "Step 5: ")

    add_callout(doc, "Database Restoration Warning", 
                "Restoring a database snapshot replaces all current database tables with the state preserved in the backup archive. "
                "Always download a fresh backup snapshot immediately prior to executing any restoration operation.", "warning")

    add_h2("2.5 System Audit Logs & Forensic Tracking")
    add_p("The Audit Log console (/admin/logs) records immutable activity entries for institutional accountability:")
    add_bullet("Timestamp: UTC and localized execution time.", "• ")
    add_bullet("Operator: User ID, name, and role initiating the action.", "• ")
    add_bullet("Action Code: e.g., USER_LOGIN, TRAINEE_CREATE, LAB_MODE_TOGGLE, LAB_EXPIRE_SET, LAB_SUBMIT, BACKUP_CREATE.", "• ")
    add_bullet("IP Address: Client IPv4 or IPv6 address.", "• ")
    add_bullet("Forensic Details: Full description of parameters modified, scores earned, or files altered.", "• ")

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 3: INSTRUCTOR & LABORATORY MANAGEMENT MANUAL
    # -------------------------------------------------------------
    add_h1("3. Instructor & Laboratory Management Manual")
    add_p(
        "Instructors hold pedagogical authority over the curriculum, simulator configurations, cohort assignments, "
        "grade evaluations, and institutional performance reports. This section covers all instructor workflows."
    )

    add_h2("3.1 Managing Courses & Syllabus Modules")
    add_bullet("Navigate to 'Course Editor' in the main navigation (/instructor/courses).", "Step 1: ")
    add_bullet("Create Course: Click '+ Add New Course', provide a descriptive Title (e.g. 'PC Hardware Engineering & Maintenance Masterclass') and Syllabus Overview, then click 'Save Course'.", "Step 2: ")
    add_bullet("Add Curriculum Modules: In the course card, click '+ Add Module'. Enter Module Title (e.g., 'Module 4: Motherboard Layout & Power Distribution'), Module Description, and display order number.", "Step 3: ")
    add_bullet("Order Sequencing: Modules automatically order numerically, establishing clear prerequisite learning paths for trainees.", "Step 4: ")

    add_h2("3.2 Simulation Lab Directory & Lifecycle Management")
    add_p("Navigate to 'Simulation Labs' (/instructor/labs). The lab directory displays all active and trashed simulator stations.")
    add_bullet("Layout Switching: Click '🔲 Cards' for the visual card layout or '📋 Table' for the compact table layout.", "• ")
    add_bullet("Create New Lab: Click '+ Create Simulator', select the parent Module, enter Lab Title, Description, Simulator Type (from 11 options), Pass Score (default 70%), Time Limit, and initial Evaluation Mode (Graded vs. Practice).", "• ")
    add_bullet("Activation Toggle: Click '🟢 ACTIVE' or '⚪ INACTIVE' to instantly enable or disable trainee access.", "• ")

    add_h2("3.3 1-Click Practice Mode vs. Graded Examination Mode Switcher")
    add_p(
        "A critical feature replicated from the Solar PV Training platform is the 1-Click Evaluation Mode Switcher. "
        "Instructors can change a lab's operational mode instantly without editing forms or breaking student workflows:"
    )

    tbl_mode = doc.add_table(rows=1, cols=3)
    tbl_mode.alignment = WD_TABLE_ALIGNMENT.CENTER
    format_table_headers(tbl_mode, [2.0, 2.2, 2.3], ["Feature / Constraint", "🧪 Practice Mode (Self-Study)", "🏆 Graded Exam Mode (Monitored)"])
    add_table_row(tbl_mode, [2.0, 2.2, 2.3], ["Attempt Retries", "Unlimited retries & rewiring resets", "Single formal recorded run per session"], False)
    add_table_row(tbl_mode, [2.0, 2.2, 2.3], ["Wiring & Pinout Hints", "Live hints & cheatsheets enabled", "Hidden during assessment session"], True)
    add_table_row(tbl_mode, [2.0, 2.2, 2.3], ["Multimeter Telemetry", "Instant live probe voltage feedback", "Formal reading entry required"], False)
    add_table_row(tbl_mode, [2.0, 2.2, 2.3], ["Time Limit", "Relaxed / untimed self-study", "Strict countdown timer enforced"], True)
    add_table_row(tbl_mode, [2.0, 2.2, 2.3], ["GPA & Gradebook Impact", "Zero penalty on permanent GPA", "Formally committed to gradebook & transcript"], False)

    add_p("")
    add_p("How to Toggle Mode with 1 Click:", "Instructions: ")
    add_bullet("In the Labs directory (/instructor/labs), locate any lab card in Grid view or table row in Table view.", "1. ")
    add_bullet("Look for the mode button: either '🧪 Practice' (cyan pill) or '🏆 Graded' (indigo pill).", "2. ")
    add_bullet("Click the button. The system updates the mode instantly via AJAX/Inertia without page reload and logs an audit entry.", "3. ")
    add_bullet("Trainees entering the workstation will immediately see the updated mode banner and adjusted rules.", "4. ")

    add_h2("3.4 Scheduling Access Windows & Expiration Timers")
    add_p("To prevent students from accessing an exam before or after a designated class testing window:")
    add_bullet("In the lab card or table row, click '⚙️ Set Window'.", "Step 1: ")
    add_bullet("Quick Preset: Click '7 Days', '14 Days', or '30 Days' to instantly set an automatic expiration deadline from the current moment.", "Step 2: ")
    add_bullet("Custom Date/Time: Enter an exact expiration date and time in the datetime picker (e.g. 2026-10-25 18:00) and click 'Save Window'.", "Step 3: ")
    add_bullet("Perpetual Access: Click 'Clear Window (Make Perpetual)' if the lab should remain accessible indefinitely.", "Step 4: ")

    add_h2("3.5 Configuring the 11 Specialized Simulator Workstations")
    add_p("Click '⚙️ Configure Station' on any lab to open the configuration studio (/instructor/labs/{id}/edit):")
    add_bullet("Interactive Visual Wiring Canvas (visual_wiring): Configures modular PSU nodes, motherboard headers, GPU PCIe connectors, SATA drives, and front panel jumpers. Automatic verification checks pin keying and short-circuit prevention.", "1. ")
    add_bullet("Component Identification (component_id): Upload component photos, enter correct names and technical functions, and define multiple-choice distractor options.", "2. ")
    add_bullet("Motherboard Hotspot Pinpoint (motherboard_hotspot): Upload high-resolution motherboard PCB images. Click directly on the image to place coordinate pins (e.g. CPU Socket, VRM Inductors, CMOS Battery, M.2 Slot) with pixel radius tolerances.", "3. ")
    add_bullet("Chassis Assembly Sequence (assembly_sequence): Define sequential build steps, detailed instructions, step hints, and flag critical steps with 'is_safety_critical' (e.g., Installing Brass Motherboard Standoffs, Applying Anti-Static ESD Wrist Strap).", "4. ")
    add_bullet("UEFI BIOS Utility (bios_config): Sets expected boot priority order, XMP profile activation, fan calibration target RPMs, and hardware monitor voltage validation.", "5. ")
    add_bullet("POST Hex Code & Beeps (beep_code_diagnostic): Configures diagnostic hex scenarios (00, 55, d6, A2, AA) and audio beep frequencies (1 long 2 short, continuous) for trainee fault conclusion.", "6. ")
    add_bullet("Service Repair Report (repair_report): Sets up diagnostic prompt scenarios where trainees inspect symptoms, identify faulty parts, and draft a formal repair invoice.", "7. ")

    add_h2("3.6 Universal Multi-Lab Custom Report Builder & Cohorts Analytics")
    add_p("Accessible at /instructor/reports, this centralized executive reporting suite aggregates student metrics across all labs:")
    add_bullet("Cohort Filtering: Filter metrics by class batch (e.g. Cohort 2026-A, Cohort 2026-B) to compare class performance.", "• ")
    add_bullet("Course & Lab Filters: Drill down into specific courses or individual lab stations.", "• ")
    add_bullet("Outcome Filters: Segment submissions by Passed (Score ≥ 70%), Failed, Submitted (Pending Review), or In Progress.", "• ")
    add_bullet("Date Range Filters: Analyze submissions completed within a specific academic date window.", "• ")
    add_bullet("Search Query: Instant search by student name or email.", "• ")
    add_bullet("1-Click CSV Export: Click '📥 Export to CSV' to download an RFC-4180 compliant spreadsheet containing attempt IDs, student details, cohort, course, lab, score, safety compliance, duration, and completion timestamps.", "• ")
    add_bullet("Executive Print: Click '🖨️ Print Report' to format the current view for clean PDF or physical printer output.", "• ")

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 4: TRAINEE PRACTICAL LABORATORY MANUAL
    # -------------------------------------------------------------
    add_h1("4. Trainee Practical Laboratory Manual")
    add_p(
        "Welcome to the Greg Hardware Training Simulator! This section guides trainees and students through "
        "logging in, navigating the dashboard, operating simulation workstations, using diagnostic tools, and reviewing scores."
    )

    add_h2("4.1 Trainee Login & Dashboard Overview")
    add_bullet("Open your browser and navigate to https://hardware.gregicthub.com/login", "Step 1: ")
    add_bullet("Enter your student email and password assigned by your instructor.", "Step 2: ")
    add_bullet("Click 'Sign In'. You will be directed to your Trainee Dashboard (/trainee/dashboard).", "Step 3: ")
    add_bullet("Dashboard KPI Bar: Shows your Total Assigned Labs, In-Progress Stations, and Successfully Completed Labs.", "Step 4: ")
    add_bullet("Lab Cards: Each assigned lab displays its Course title, Module name, Lab title, Category icon, Pass Score threshold, and Mode Badge (🧪 Practice vs. 🏆 Graded).", "Step 5: ")
    add_bullet("Click 'Launch Simulator' on any card to enter the workstation sandbox.", "Step 6: ")

    add_h2("4.2 Dual-View Sandbox: Simulator vs. Lesson Guide")
    add_p("Every lab workstation features a dual-mode workspace in the top navigation:")
    add_bullet("🔬 Workstation Simulator Tab: Your active hands-on virtual laboratory where you perform wiring, component identification, BIOS configuration, or diagnostics.", "• ")
    add_bullet("📖 Lesson Guide & Theory Tab: A comprehensive engineering reference guide containing learning objectives, architectural concepts, standard procedures, and instructor pro-tips. Consult this whenever you need theoretical guidance.", "• ")

    add_h2("4.3 Step-by-Step Guide: Interactive Visual Wiring Canvas Lab")
    add_p("This flagship simulation workstation trains students on PC power distribution, cable keying, live multimeter voltage probing, and thermal monitoring:")
    
    add_h3("Phase 1: Anti-Static ESD Grounding")
    add_p("Before touching electronic components, click the 'ESD Ground Verified' checkbox in the Commissioning Checklist sidebar. Failure to verify ESD ground incurs a 30% safety penalty!")

    add_h3("Phase 2: Modular Cable Routing & Physical Keying")
    add_bullet("Switch to 'Wiring Mode' in the bottom toolbar.", "1. ")
    add_bullet("Connect ATX 24-Pin Main Power: Click and drag from the PSU '24-Pin ATX Main Power' handle to the Motherboard 'ATX 24-Pin Main Power Header'. A thick, dark blue cable will snap into place.", "2. ")
    add_bullet("Connect EPS 8-Pin CPU Power: Drag from PSU '8-Pin (4+4) EPS CPU Power' to the Motherboard '8-Pin EPS CPU 12V Header' (located at the top-left near VRMs).", "3. ")
    add_bullet("Connect PCIe 8-Pin GPU Power: Drag from PSU '8-Pin (6+2) PCIe Power' to the Graphics Card '8-Pin PCIe Power Header'. Note: The simulator prevents plugging PCIe cables into CPU headers to replicate physical keying notches!", "4. ")
    add_bullet("Connect SATA Power & Data: Drag from PSU 'SATA Power Harness' to the SSD 'SATA 15-Pin Power Input'. Next, drag from Motherboard 'SATA 6Gb/s Port 1' to SSD 'SATA 7-Pin Data Input'.", "5. ")
    add_bullet("Connect Front Panel Power Switch: Drag from Front Panel 'PWR_SW (Pins 6,8)' to the Motherboard 'F_PANEL Power SW Header'.", "6. ")
    add_bullet("Connect CPU Cooler Fan: Drag from Cooler '4-Pin PWM Fan Connector' to Motherboard 'CPU_FAN 4-Pin PWM Header'.", "7. ")

    add_h3("Phase 3: Live Multimeter DC Voltage Probing")
    add_bullet("In the bottom toolbar, click '⚡ Multimeter Probe'. The cursor transforms into precision test probes.", "1. ")
    add_bullet("Click on the PSU ATX 24P handle: The multimeter overlay displays +12.18V DC on yellow pins, +5.04V on red pins, and +3.31V on orange pins.", "2. ")
    add_bullet("Click on the EPS CPU handle: Verify a stable +12.15V DC rail.", "3. ")
    add_bullet("Click on the GPU PCIe handle: Verify high-amperage +12.12V DC rail.", "4. ")
    add_bullet("Click on the Purple wire (+5VSB Standby): Verify +5.02V DC is active even before the PC is switched on.", "5. ")

    add_h3("Phase 4: Thermal FLIR Heat Inspection")
    add_bullet("Click '🔥 Thermal FLIR' in the toolbar. The workstation switches to an infrared thermographic overlay.", "1. ")
    add_bullet("Inspect the Motherboard VRM phases (65°C - 78°C normal operational temperature).", "2. ")
    add_bullet("Inspect the GPU VRAM and core hotspot (68°C - 82°C).", "3. ")
    add_bullet("Inspect the CPU cooler cold plate heat dissipation.", "4. ")

    add_h3("Phase 5: Power Switch Test & POST Commissioning")
    add_bullet("Click '🔌 Power Switch (POST Test)' in the top workbench header.", "1. ")
    add_bullet("If cables are correctly seated: Motherboard Q-LED transitions from RED (CPU) -> ORANGE (DRAM) -> WHITE (VGA) -> GREEN (BOOT). The 7-segment debug display shows 'Code AA' (System Has Booted Successfully).", "2. ")
    add_bullet("If a cable is missing or misrouted: The system halts on diagnostic codes (Code 00: CPU power missing; Code d6: GPU power missing; Code 55: RAM training error).", "3. ")
    add_bullet("Click 'Submit Practical Wiring Assessment'. The automated engine scores cabling accuracy (80%) + ESD safety compliance (20%) and submits your gradebook attempt.", "4. ")

    add_callout(doc, "Practice Mode Rewiring", 
                "If the lab is in 'Practice Mode', you can click 'Reset Canvas' at any time to clear cables and rewire as many times "
                "as needed to achieve 100% mastery without affecting your formal grade.", "tip")

    add_h2("4.4 Step-by-Step Guide: UEFI BIOS Configuration Utility")
    add_p("In BIOS configuration labs (/trainee/labs/{id}):")
    add_bullet("Navigate between BIOS tabs using keyboard keys or tab buttons: Main, Advanced, AI Tweaker, H/W Monitor, Boot, Exit.", "1. ")
    add_bullet("Boot Priority Configuration: Under the 'Boot' tab, set the primary boot sequence: UEFI USB Flash Drive (for OS installation) -> NVMe SSD -> SATA Drive.", "2. ")
    add_bullet("Memory Overclocking (XMP / EXPO): Under the 'AI Tweaker / Extreme Tweaker' tab, toggle XMP Profile to 'Profile 1 (DDR5-6000 CL30)'. Confirm DRAM frequency updates.", "3. ")
    add_bullet("Hardware Monitor Fan Curves: Under the 'Monitor' tab, adjust the CPU fan curve to 'Standard PWM' or 'Performance' to maintain temperatures below 75°C under load.", "4. ")
    add_bullet("Save & Exit: Press F10 or select 'Save Changes & Reset'. Confirm the CMOS settings dialog to submit your BIOS practical.", "5. ")

    add_h2("4.5 Step-by-Step Guide: Diagnostic POST Codes & Beep Frequency Analysis")
    add_p("In POST diagnostic labs:")
    add_bullet("Review the diagnostic symptom provided by the virtual bench (e.g., Motherboard displays Code 55 with 3 rapid beeps).", "1. ")
    add_bullet("Analyze the symptom using the Diagnostic Reference Table in Chapter 5.", "2. ")
    add_bullet("Code 55 = Memory not detected or unseated in slots A2/B2.", "3. ")
    add_bullet("Code 00 = CPU processor failure or 8-Pin EPS power not connected.", "4. ")
    add_bullet("Code d6 = GPU display card not detected or PCIe auxiliary power disconnected.", "5. ")
    add_bullet("Code A2 = SATA / NVMe drive detection issue or corrupted boot partition.", "6. ")
    add_bullet("Select your diagnostic conclusions and corrective maintenance steps, then submit for scoring.", "7. ")

    add_h2("4.6 Centralized Hardware Catalog & Spec Sheet (/components)")
    add_p("Accessible anytime via the top navigation bar:")
    add_bullet("Filter by 8 equipment categories: CPUs, Motherboards, GPUs, PSUs, RAM, Storage, Coolers, Chassis.", "• ")
    add_bullet("Search by keyword (e.g., '14900K', 'RTX 4090', 'DDR5', '1000W').", "• ")
    add_bullet("Click '🔍 View Blueprint & Specs' on any component card to open the technical modal.", "• ")
    add_bullet("Inspect Technical Specs: Socket, core counts, bus widths, TDP, and dimensions.", "• ")
    add_bullet("Inspect Multimeter Telemetry: Factory VCore ranges, rail voltages, and safe operating temperatures.", "• ")
    add_bullet("Inspect Failure Modes & Maintenance SOPs: Common field failure signs and preventative maintenance tips.", "• ")

    add_h2("4.7 PC Power Supply (PSU) Sizing & Bottleneck Calculator (/sizing)")
    add_p("Accessible via the top navigation link '⚡ PSU Sizing & Bottlenecks':")
    add_bullet("Tab 1: PSU Wattage & Rail Sizing: Select your CPU, GPU, Motherboard, RAM, Storage, and Fans. The engine calculates Total Estimated Wattage, +12V Rail Amps, Minor Rail Wattage (+5V/+3.3V), and recommends the ideal 80 PLUS PSU capacity with 15% transient buffer.", "• ")
    add_bullet("Tab 2: Hardware Bottleneck Engine: Computes CPU vs. GPU bottleneck percentages at 1080p, 1440p, and 4K resolutions; flags socket mismatches (e.g. LGA1700 CPU on AM5 board); flags RAM generation incompatibilities; and verifies cooler TDP dissipation vs. CPU boost load.", "• ")

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 5: DIAGNOSTIC TELEMETRY, ERROR CODES & REFERENCE TABLES
    # -------------------------------------------------------------
    add_h1("5. Diagnostic Telemetry, Error Codes & Technical Reference")
    add_p(
        "This reference section provides institutional standards for motherboard debug codes, audio beeps, "
        "and DC power rail tolerances used across all lab simulations and evaluations."
    )

    add_h2("5.1 Motherboard 7-Segment Debug Hex Codes Quick Reference")
    tbl_hex = doc.add_table(rows=1, cols=4)
    tbl_hex.alignment = WD_TABLE_ALIGNMENT.CENTER
    format_table_headers(tbl_hex, [1.0, 1.8, 2.2, 1.5], ["Hex Code", "Subsystem / Component", "Fault Description", "Corrective Action"])
    add_table_row(tbl_hex, [1.0, 1.8, 2.2, 1.5], ["00", "CPU Processor", "CPU not detected or internal microcode failure", "Reseat CPU, check socket pins, verify 8-Pin EPS power"], False)
    add_table_row(tbl_hex, [1.0, 1.8, 2.2, 1.5], ["15 / 55", "DRAM Memory", "Memory initialization error or no RAM detected", "Reseat RAM in slots A2/B2, test sticks individually"], True)
    add_table_row(tbl_hex, [1.0, 1.8, 2.2, 1.5], ["99", "Super I/O / PCIe", "PCIe device initialization in progress", "Reseat add-in cards, verify front panel connections"], False)
    add_table_row(tbl_hex, [1.0, 1.8, 2.2, 1.5], ["d6", "Graphics (VGA)", "No console output / GPU not detected", "Verify PCIe 8-Pin / 12VHPWR power, reseat GPU"], True)
    add_table_row(tbl_hex, [1.0, 1.8, 2.2, 1.5], ["A2", "Storage (IDE/SATA)", "Detecting storage drives / bootloader", "Check SATA power & data cables, verify NVMe seating"], False)
    add_table_row(tbl_hex, [1.0, 1.8, 2.2, 1.5], ["AA", "System Boot", "System has successfully booted into OS", "Normal operational state (No action required)"], True)

    add_p("")
    add_h2("5.2 BIOS Audio Beep Code Diagnostic Reference (AMI Standards)")
    tbl_beep = doc.add_table(rows=1, cols=3)
    tbl_beep.alignment = WD_TABLE_ALIGNMENT.CENTER
    format_table_headers(tbl_beep, [1.8, 2.3, 2.4], ["Beep Pattern", "Identified Hardware Fault", "Standard Maintenance Procedure"])
    add_table_row(tbl_beep, [1.8, 2.3, 2.4], ["1 Short Beep", "System POST Success", "Normal boot (Display initializes normally)"], False)
    add_table_row(tbl_beep, [1.8, 2.3, 2.4], ["1 Long, 2 Short Beeps", "Graphics Card (GPU) Failure", "Reseat dedicated graphics card and verify auxiliary PCIe power cables"], True)
    add_table_row(tbl_beep, [1.8, 2.3, 2.4], ["1 Long, 3 Short Beeps", "Video Memory / Display Error", "Check monitor cable connection or test integrated motherboard video output"], False)
    add_table_row(tbl_beep, [1.8, 2.3, 2.4], ["Continuous Beeping", "RAM Memory Failure or Unseated", "Remove all DIMM modules, clean gold contacts with isopropyl alcohol, and reseat in slots 2 and 4"], True)
    add_table_row(tbl_beep, [1.8, 2.3, 2.4], ["Rapid High/Low Siren", "CPU Overheating / Thermal Trip", "Verify cooler cold plate protective sticker was removed and check CPU_FAN header tachometer"], False)

    add_p("")
    add_h2("5.3 Power Supply Unit (PSU) Rail Voltage Tolerances")
    tbl_volt = doc.add_table(rows=1, cols=4)
    tbl_volt.alignment = WD_TABLE_ALIGNMENT.CENTER
    format_table_headers(tbl_volt, [1.5, 1.5, 1.8, 1.7], ["Voltage Rail", "Standard Wire Color", "ATX Specification Tolerance", "Multimeter Safe Range"])
    add_table_row(tbl_volt, [1.5, 1.5, 1.8, 1.7], ["+12V Rail", "Yellow", "±5% (+11.40V to +12.60V)", "+11.90V to +12.30V DC"], False)
    add_table_row(tbl_volt, [1.5, 1.5, 1.8, 1.7], ["+5V Rail", "Red", "±5% (+4.75V to +5.25V)", "+4.95V to +5.15V DC"], True)
    add_table_row(tbl_volt, [1.5, 1.5, 1.8, 1.7], ["+3.3V Rail", "Orange", "±5% (+3.14V to +3.47V)", "+3.25V to +3.38V DC"], False)
    add_table_row(tbl_volt, [1.5, 1.5, 1.8, 1.7], ["+5VSB (Standby)", "Purple", "±5% (+4.75V to +5.25V)", "+5.00V to +5.10V DC (Always Active)"], True)
    add_table_row(tbl_volt, [1.5, 1.5, 1.8, 1.7], ["PS_ON# (Signal)", "Green", "Active LOW to Ground", "0.0V (Run) / +5.0V (Off)"], False)
    add_table_row(tbl_volt, [1.5, 1.5, 1.8, 1.7], ["PWR_OK (Power Good)", "Grey", "Asserted HIGH (+5V)", "+5.0V within 100-500ms of boot"], True)

    add_p("")
    add_callout(doc, "Laboratory Safety Notice", 
                "When measuring physical PC hardware with a digital multimeter, always connect the black probe to Ground (Chassis or Black wire) "
                "before contacting live voltage test points. Never probe inside the internal high-voltage primary capacitor side of a power supply unit!", "danger")

    # -------------------------------------------------------------
    # SECTION 6: FREQUENTLY ASKED QUESTIONS & SUPPORT
    # -------------------------------------------------------------
    add_h1("6. Frequently Asked Questions & Support")
    add_bullet("Q: Why does my visual wiring connection turn red and fail to connect?", "Q: ")
    add_bullet("A: The simulator enforces physical keying notches. For example, EPS 8-pin CPU cables cannot be connected to GPU PCIe headers, and SATA data cables cannot connect to front panel jumper headers.", "• ")

    add_bullet("Q: Why is my lab marked as 'Inactive / Deactivated'?", "Q: ")
    add_bullet("A: Your instructor has temporarily closed access or the scheduled expiration window has passed. Contact your course instructor to extend the access window.", "• ")

    add_bullet("Q: Can I practice a lab without lowering my grade?", "Q: ")
    add_bullet("A: Yes! When an instructor sets a lab to 'Practice Mode' (cyan badge), you can retry and rewire as many times as you want with zero impact on your transcript GPA.", "• ")

    add_bullet("Q: How do instructors export student grades for university records?", "Q: ")
    add_bullet("A: Navigate to 'Multi-Lab Reports' (/instructor/reports), select your cohort or date filter, and click '📥 Export to CSV'. The generated file opens directly in Microsoft Excel, Google Sheets, or institutional LMS gradebooks.", "• ")

    add_p("")
    add_p("Technical Support & Inquiries:", "Platform Helpdesk: ")
    add_p("Web Portal: https://hardware.gregicthub.com  •  System Administrator: admin@gregco.local  •  Greg ICT Hub Engineering")

    # Save to public/docs and root
    target_path = "public/docs/Greg_Hardware_Training_Simulator_User_Guide.docx"
    doc.save(target_path)
    
    # Also save to root
    root_path = "Greg_Hardware_Training_Simulator_User_Guide.docx"
    doc.save(root_path)

    print(f"Document successfully created at:\n1. {target_path}\n2. {root_path}")

if __name__ == '__main__':
    build_user_guide()
