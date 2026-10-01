import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import os

def create_element(name):
    return OxmlElement(name)

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_callout(doc, text_list, title="NOTE", alert_type="note"):
    # alert_type: note (blue), tip (green), warning (amber), caution (red)
    colors = {
        "note": {"border": "2563EB", "bg": "F0F7FF", "title_color": RGBColor(37, 99, 235), "icon": "ℹ️ "},
        "tip": {"border": "059669", "bg": "F0FDF4", "title_color": RGBColor(5, 150, 105), "icon": "💡 "},
        "warning": {"border": "D97706", "bg": "FFFBEB", "title_color": RGBColor(217, 119, 6), "icon": "⚠️ "},
        "caution": {"border": "DC2626", "bg": "FEF2F2", "title_color": RGBColor(220, 38, 38), "icon": "🛑 "}
    }
    cfg = colors.get(alert_type, colors["note"])
    
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, cfg["bg"])
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Left border thick, other borders none
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="36" w:space="0" w:color="{cfg['border']}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(3)
    r_title = p.add_run(f"{cfg['icon']}{title}\n")
    r_title.bold = True
    r_title.font.size = Pt(10.5)
    r_title.font.color.rgb = cfg["title_color"]
    
    for item in text_list:
        p2 = cell.add_paragraph()
        p2.paragraph_format.space_before = Pt(1)
        p2.paragraph_format.space_after = Pt(2)
        r = p2.add_run(item)
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(51, 65, 85) # slate-700
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def style_table(table, header_bg="0F172A", alt_bg="F8FAFC"):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, row in enumerate(table.rows):
        # Prevent row split across pages
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        
        if idx == 0:
            trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
            for cell in row.cells:
                set_cell_background(cell, header_bg)
                set_cell_margins(cell, top=140, bottom=140, left=150, right=150)
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(2)
                    p.paragraph_format.space_after = Pt(2)
                    for r in p.runs:
                        r.bold = True
                        r.font.color.rgb = RGBColor(255, 255, 255)
                        r.font.size = Pt(9.5)
        else:
            bg = alt_bg if idx % 2 == 1 else "FFFFFF"
            for cell in row.cells:
                set_cell_background(cell, bg)
                set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(2)
                    p.paragraph_format.space_after = Pt(2)
                    for r in p.runs:
                        r.font.size = Pt(9)
                        r.font.color.rgb = RGBColor(30, 41, 59)

def build_guide():
    doc = docx.Document()
    
    # Page setup - Margins
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)
        
        # Header / Footer
        footer = s.footer
        f_p = footer.paragraphs[0]
        f_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        f_run = f_p.add_run("Greg Hardware Training Simulator — Official Comprehensive User Guide")
        f_run.font.size = Pt(8.5)
        f_run.font.color.rgb = RGBColor(148, 163, 184)

    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Segoe UI'
    normal_style.font.size = Pt(10)
    normal_style.font.color.rgb = RGBColor(30, 41, 59) # Slate 800

    # -------------------------------------------------------------
    # COVER / TITLE BLOCK
    # -------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(24)
    title_p.paragraph_format.space_after = Pt(4)
    r_badge = title_p.add_run("GREG HARDWARE TRAINING SIMULATOR\n")
    r_badge.font.size = Pt(11)
    r_badge.bold = True
    r_badge.font.color.rgb = RGBColor(37, 99, 235) # Blue-600

    r_main_title = title_p.add_run("Comprehensive Step-by-Step Lab User & Operations Manual")
    r_main_title.font.size = Pt(24)
    r_main_title.bold = True
    r_main_title.font.color.rgb = RGBColor(15, 23, 42) # Slate-900

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(4)
    sub_p.paragraph_format.space_after = Pt(20)
    r_sub = sub_p.add_run("A Unified Practical Guide for System Administrators, Instructors, and Trainees across All Virtual Hardware Diagnostic & Maintenance Workstations")
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = RGBColor(71, 85, 105)

    # Metadata table
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Platform Version:", "Greg Hardware Training Simulator v2.4 (Enterprise Edition)"),
        ("Target Roles:", "System Administrators, Instructors, and Enrolled Trainees"),
        ("Supported Workstations:", "UEFI BIOS, PSU/Multimeter, POST Audio/LED, Component ID, Hotspots, Assembly, PC Builder, Fault Diagnostics, Preventive Maintenance, Service Reports"),
        ("Deployment Environment:", "Local LAN / Offline Standalone Training Server (Windows Server / Laragon WAMP / Apache MySQL)")
    ]
    for idx, (k, v) in enumerate(meta_data):
        cell_k = meta_table.cell(idx, 0)
        cell_v = meta_table.cell(idx, 1)
        cell_k.text = k
        cell_v.text = v
        cell_k.paragraphs[0].runs[0].bold = True
        cell_k.width = Inches(2.2)
        cell_v.width = Inches(4.6)
    style_table(meta_table, header_bg="1E293B", alt_bg="F1F5F9")

    doc.add_page_break()

    # -------------------------------------------------------------
    # TABLE OF CONTENTS
    # -------------------------------------------------------------
    toc_head = doc.add_heading("Table of Contents", level=1)
    toc_head.paragraph_format.space_before = Pt(12)
    toc_head.paragraph_format.space_after = Pt(12)

    toc_items = [
        ("1. System Overview & Technical Architecture", "Platform philosophy, role-based access, and dark theme environment"),
        ("2. System Administrator Guide", "Account lifecycle, CSV bulk imports, audit trail logging, and database backup recovery"),
        ("3. Instructor Operations Guide", "Curriculum structure, lab activation/expiration, interactive authoring, and assignment tracking"),
        ("4. Trainee Interactive Workstation Manual", "Step-by-step walkthroughs for all 10 simulation practicals and service reporting"),
        ("    4.1 Lab 1: Interactive UEFI BIOS Setup & Boot Sequencing", "Virtual BIOS menus, CPU virtualization, TPM 2.0, Secure Boot, XMP profiles"),
        ("    4.2 Lab 2: Power Supply Unit (PSU) & Multimeter Probing", "24-pin ATX paperclip jump-start, ±12V/±5V/3.3V voltage tolerances"),
        ("    4.3 Lab 3: POST Audio Diagnostic Beeps & 7-Segment Debug LEDs", "Audio frequency synthesis, Phoenix/AMI codes, hex error code analysis"),
        ("    4.4 Lab 4: Visual Component Identification & Function Matching", "High-res hardware recognition, distractors, and functional definition quizzes"),
        ("    4.5 Lab 5: Motherboard Hotspots & Port Mapping", "Point-and-click coordinate identification of sockets, slots, and headers"),
        ("    4.6 Lab 6: Desktop PC Assembly Sequence & Safety Protocols", "ESD safety, CPU socket latching, dual-channel RAM, thermal management"),
        ("    4.7 Lab 7: PC Builder & Hardware Compatibility Configurator", "Socket matching, TDP thermal balance, PCIe bandwidth, PSU wattage"),
        ("    4.8 Lab 8: Real-World Hardware Fault Troubleshooting", "Customer tickets, symptom isolation, diagnostic testing, root cause findings"),
        ("    4.9 Lab 9: Preventive Maintenance, Dust Clearing & Repasting", "Compressed air handling, thermal paste repasting, cable airflow optimization"),
        ("    4.10 Lab 10: Formal Computer Repair Service Report", "Standardized documentation, fault writeups, parts replaced, recommendations"),
        ("5. Gradebook, Feedback & PDF Export", "Automated score telemetry, instructor grading, and formal certificate generation"),
        ("6. Troubleshooting, FAQ & Offline LAN Best Practices", "Common operational issues, password recovery, database restoration safeguards")
    ]

    for title, desc in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        r_t = p.add_run(f"• {title}")
        r_t.bold = True
        r_t.font.color.rgb = RGBColor(15, 23, 42)
        r_d = p.add_run(f" — {desc}")
        r_d.font.color.rgb = RGBColor(100, 116, 139)
        r_d.font.size = Pt(9)

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 1: SYSTEM OVERVIEW
    # -------------------------------------------------------------
    h1 = doc.add_heading("1. System Overview & Technical Architecture", level=1)
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(8)

    p = doc.add_paragraph(
        "The Greg Hardware Training Simulator is an enterprise-grade virtual laboratory and diagnostic training suite "
        "engineered for computer hardware technicians, engineering students, and IT maintenance apprentices. "
        "The system replaces expensive, fragile physical lab setups with high-fidelity interactive software workstations "
        "that simulate realistic hardware behaviors, electrical voltage testing, POST audio beeps, and component level diagnostics."
    )
    p.paragraph_format.space_after = Pt(8)

    # User Roles Table
    doc.add_heading("Platform Access Roles & Permissions", level=2)
    role_tbl = doc.add_table(rows=4, cols=3)
    role_data = [
        ("Role", "Permissions & Access Scope", "Primary Interfaces"),
        ("System Administrator", "Full system governance, user directory management, soft-delete restoration/purging, automated database backups, database restoration, and system audit trail monitoring.", "Admin Dashboard, User Management, Database Backups, Audit Logs"),
        ("Instructor", "Course syllabus structuring, module creation, simulation lab lifecycle management (activate, deactivate, set expiration dates), question/hotspot authoring, cohort task assignments, submission grading, and PDF report generation.", "Instructor Dashboard, Course Curriculum, Lab Directory, Lab Assignments, Gradebook Tracker, Lab Configurator"),
        ("Trainee", "Interactive lab execution across 10 specialized workstations, real-time scorecards, service report submission, review of instructor feedback, and downloadable completion certificates.", "Trainee Dashboard, Simulation Workstations, Scorecards, PDF Performance Downloads")
    ]
    for r_idx, row in enumerate(role_data):
        for c_idx, val in enumerate(row):
            role_tbl.cell(r_idx, c_idx).text = val
    style_table(role_tbl, header_bg="0F172A", alt_bg="F8FAFC")
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_callout(doc, [
        "The platform utilizes an eye-comfort Dark Slate theme (bg-slate-900 / bg-slate-950) with high-contrast text and responsive cards to reduce eye fatigue during long simulation practicals.",
        "The system operates fully offline without requiring an external internet connection, making it ideal for isolated school computer labs and military/secure training networks."
    ], title="OFFLINE LAN DEPLOYMENT READY", alert_type="tip")

    # -------------------------------------------------------------
    # SECTION 2: SYSTEM ADMINISTRATOR GUIDE
    # -------------------------------------------------------------
    h2 = doc.add_heading("2. System Administrator Guide", level=1)
    h2.paragraph_format.space_before = Pt(16)
    h2.paragraph_format.space_after = Pt(8)

    doc.add_paragraph(
        "Administrators oversee the structural health, user base, and data integrity of the training simulator. "
        "The primary tools accessible to administrators are located at the top navigation bar under Admin Dashboard, Users, Backups, and Audit Logs."
    )

    doc.add_heading("2.1 User Account Management & Cohort Enrollment", level=2)
    doc.add_paragraph("Administrators can register new users through three distinct provisioning mechanisms:")
    
    user_prov_table = doc.add_table(rows=4, cols=3)
    prov_data = [
        ("Provisioning Method", "Ideal Use Case", "Step-by-Step Procedure"),
        ("Single User Registration", "Onboarding individual instructors or administrative staff.", "1. Navigate to 'Users' > click '+ Single User'.\n2. Fill Full Name, Email, Phone, Password, and Role (Admin, Instructor, Trainee).\n3. Click 'Register User Account'."),
        ("CSV Bulk Import", "Enrolling large cohorts of trainees (e.g. 50+ students at once).", "1. Click '📁 CSV Bulk Import'.\n2. Download the CSV template ('📥 Template (.CSV)').\n3. Populate columns: Name, Email, Phone, Password.\n4. Upload the file or paste CSV text.\n5. Click 'Import Users' to auto-register all accounts."),
        ("Quick Batch Entry Grid", "Rapid manual key-in for small groups without preparing spreadsheets.", "1. Click '⚡ Quick Batch Entry'.\n2. Enter names and emails directly in the interactive rows.\n3. Default passwords automatically assigned as 'Password@123'.\n4. Click 'Save All Users'.")
    ]
    for r_idx, row in enumerate(prov_data):
        for c_idx, val in enumerate(row):
            user_prov_table.cell(r_idx, c_idx).text = val
    style_table(user_prov_table, header_bg="1E293B", alt_bg="F8FAFC")
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    doc.add_heading("2.2 Account Actions: Suspension, Password Reset & Soft Deletes", level=2)
    doc.add_paragraph(
        "To protect historical training records, user accounts employ **Soft Deletes**. Trashed accounts retain all previous simulation attempt records and can be restored at any time."
    )
    doc.add_paragraph("• 🟢 Account Status Toggle: Click the active/suspended badge on any user row to instantly suspend access without deleting their account.")
    doc.add_paragraph("• 🔑 Reset Password: Click 'Reset' to assign a new temporary password to any user who forgot their credentials.")
    doc.add_paragraph("• 🗑️ Soft Delete: Click the trash icon to move the account to the Trash Bin. Trashed users cannot log in.")
    doc.add_paragraph("• ♻️ Restore / ❌ Wipe: In the '🗑️ Trash' tab, click 'Restore' to reactivate the account, or 'Wipe' to permanently delete records.")

    doc.add_heading("2.3 Database Backups & Instant Snapshot Recovery", level=2)
    doc.add_paragraph(
        "The Backup Console allows administrators to take complete SQL database snapshots before major exams or syllabus overhauls, ensuring zero data loss."
    )
    doc.add_paragraph("1. Navigate to top menu: Admin > Database Backups (`/admin/backups`).")
    doc.add_paragraph("2. Click '⚡ Take New Database Backup' — The system invokes `mysqldump` to create a standalone SQL snapshot archive in `storage/app/backups/`.")
    doc.add_paragraph("3. 📥 Download Snapshot: Download the `.sql` archive to an external USB flash drive or secure storage.")
    doc.add_paragraph("4. ♻️ Restore Database: Click 'Restore' next to any snapshot to roll back the database to that exact timestamp. The system prompts for explicit confirmation.")
    doc.add_paragraph("5. 🗑️ Delete Backup: Remove older snapshots to reclaim disk space.")

    add_callout(doc, [
        "Always create a fresh database snapshot before importing new trainee cohorts or upgrading simulator files on your Windows Server.",
        "Database restoration temporarily locks table writes for a few seconds while SQL schema and records are re-seeded."
    ], title="BEST PRACTICE: REGULAR SNAPSHOTS", alert_type="warning")

    doc.add_heading("2.4 System Activity Audit Trail & Log Inspection", level=2)
    doc.add_paragraph(
        "Every critical administrative action is recorded in an immutable system audit trail. Administrators can review timestamps, actor IP addresses, and event details."
    )
    doc.add_paragraph("• Accessible via Admin > System Logs (`/admin/logs`).")
    doc.add_paragraph("• Filter by Action Type: User Logins, User Registration, Lab State Updates, Database Restores, Password Resets.")
    doc.add_paragraph("• Filter by Actor: Search by instructor or admin name/email.")
    doc.add_paragraph("• Export CSV: Click '📥 Export CSV Audit' to produce compliance reports for institutional audits.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 3: INSTRUCTOR OPERATIONS GUIDE
    # -------------------------------------------------------------
    h3 = doc.add_heading("3. Instructor Operations Guide", level=1)
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(8)

    doc.add_paragraph(
        "Instructors hold full pedagogical control over the simulator. They organize modules, calibrate practical simulations, "
        "distribute lab tasks to trainees, grade diagnostic reports, and monitor cohort mastery."
    )

    doc.add_heading("3.1 Managing Simulation Labs: Grid Cards, Expiration & Status", level=2)
    doc.add_paragraph(
        "The Simulation Lab Manager (`/instructor/labs`) presents all 10 virtual workstations in a clean **Responsive Grid Card Layout**."
    )
    doc.add_paragraph("• 🔲 Card vs 📋 Table View: Toggle between visually rich hardware category cards or a compact tabular data grid.")
    doc.add_paragraph("• 🟢 Active / Deactivated Toggle: Switch practicals on or off instantly. Deactivated labs are hidden from trainees.")
    doc.add_paragraph("• ⏳ Expiration Date Limits: Set a specific cut-off date (e.g. End of Semester). When the date arrives, the lab automatically locks against new attempts and displays an 'Expired' notice.")
    doc.add_paragraph("• ⚙️ Time Limit & Pass Score: Configure required time limits (e.g., 20 mins) and minimum passing scores (e.g., 75%).")
    doc.add_paragraph("• 🗑️ Soft Delete Labs: Retire old labs without losing previous trainee submissions.")

    doc.add_heading("3.2 Authoring & Calibrating Lab Workstations", level=2)
    doc.add_paragraph("Click '⚙️ Configure' on any lab card to customize its interactive elements:")

    lab_cfg_table = doc.add_table(rows=5, cols=2)
    cfg_data = [
        ("Lab Workstation Type", "Authoring Options & Instructor Controls"),
        ("Component Identification", "Upload hardware component graphics, input correct component names and detailed functional explanations, and provide comma-separated distractor choices for multiple-choice testing."),
        ("Motherboard Hotspots", "Upload high-resolution motherboard diagrams or photos. Click directly on the image coordinate to drop numbered hotspot markers (CPU Socket, VRM, DIMM slots, M.2, SATA, CMOS, Front Panel headers) and specify target labels."),
        ("Assembly Sequence & Maintenance", "Define sequential assembly/cleaning steps, write helpful guidance hints, and flag dangerous procedural errors with the '⚠️ Safety Critical' toggle."),
        ("Troubleshooting Scenarios", "Write scenario contexts (e.g. 'PC powers on, fans spin at max speed, no video display'). Provide symptom checklists, inspection steps (Name | Finding | Safety Critical), and define the correct diagnostic root cause conclusion.")
    ]
    for r_idx, row in enumerate(cfg_data):
        for c_idx, val in enumerate(row):
            lab_cfg_table.cell(r_idx, c_idx).text = val
    style_table(lab_cfg_table, header_bg="0F172A", alt_bg="F8FAFC")
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    doc.add_heading("3.3 Assigning Labs & Tracking Cohort Submissions", level=2)
    doc.add_paragraph("1. Navigate to Instructor > Assignments (`/instructor/assignments`).")
    doc.add_paragraph("2. Click '+ Assign Lab Task'.")
    doc.add_paragraph("3. Select the target Lab Simulator from the dropdown.")
    doc.add_paragraph("4. Check off individual trainees or entire cohorts.")
    doc.add_paragraph("5. Optional: Specify an assignment Due Date & Time.")
    doc.add_paragraph("6. Click 'Assign Lab to Selected Trainees' — The lab immediately appears on the trainees' dashboards.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 4: TRAINEE INTERACTIVE WORKSTATIONS MANUAL
    # -------------------------------------------------------------
    h4 = doc.add_heading("4. Trainee Interactive Workstation Manual", level=1)
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(8)

    doc.add_paragraph(
        "Trainees access all training simulations from their central **Trainee Dashboard**. "
        "Labs are organized by hardware specialty cards with progress indicators (Assigned, In Progress, Completed), "
        "time targets, and passing score criteria."
    )

    # 4.1 UEFI BIOS
    doc.add_heading("4.1 Lab 1: Interactive UEFI / BIOS Configuration & Boot Order Setup", level=2)
    doc.add_paragraph(
        "Objective: Master firmware configuration, hardware virtualization activation, Secure Boot enforcement, "
        "XMP memory overclocking, and primary boot drive prioritization."
    )
    doc.add_paragraph("Step-by-Step Procedure:")
    doc.add_paragraph("1. Power on virtual station and press `DEL` or `F2` to enter the UEFI BIOS Setup Utility.")
    doc.add_paragraph("2. Main Menu: Verify CPU Model, clock speed, installed RAM capacity, and firmware version.")
    doc.add_paragraph("3. Advanced Menu: Enable Intel VT-x / AMD-V (CPU Virtualization) for hypervisor support.")
    doc.add_paragraph("4. Overclocking / AI Tweaker: Enable X.M.P. (Extreme Memory Profile) Profile 1 to run RAM at rated 3200MHz/3600MHz frequency.")
    doc.add_paragraph("5. Security Menu: Ensure TPM 2.0 (Intel PTT / AMD fTPM) and Secure Boot are set to 'Enabled' (Windows 11 compliance).")
    doc.add_paragraph("6. Boot Menu: Set 'Boot Option #1' to UEFI OS NVMe SSD. Move USB Flash Drive to secondary priority.")
    doc.add_paragraph("7. Save & Exit: Press `F10` or click 'Save Changes & Reset' to commit settings.")

    # 4.2 PSU Testing
    doc.add_heading("4.2 Lab 2: Power Supply Unit (PSU) & Multimeter Voltage Testing", level=2)
    doc.add_paragraph(
        "Objective: Perform cold jump-start bench testing on ATX power supplies and verify rail voltages with digital multimeters."
    )
    doc.add_paragraph("Step-by-Step Procedure:")
    doc.add_paragraph("1. Disconnect PSU from all internal components. Ensure AC power rocker switch is OFF (O).")
    doc.add_paragraph("2. 24-Pin ATX Jump Start: Locate Pin 16 (Green wire — PS_ON#) and any Ground pin (Black wire — COM, e.g. Pin 15 or 17). Insert conductive jumper bridge.")
    doc.add_paragraph("3. Flip AC switch to ON (I). Verify PSU internal fan starts spinning smoothly.")
    doc.add_paragraph("4. Set Digital Multimeter to DC Volts (20V scale). Insert Black probe into a COM ground terminal.")
    doc.add_paragraph("5. Probe Yellow Wire (+12V Rail): Tolerance range is +11.40V to +12.60V (Powers CPU & GPU).")
    doc.add_paragraph("6. Probe Red Wire (+5V Rail): Tolerance range is +4.75V to +5.25V (Powers logic circuits & SATA SSDs).")
    doc.add_paragraph("7. Probe Orange Wire (+3.3V Rail): Tolerance range is +3.14V to +3.47V (Powers PCIe bus & motherboard chipset).")
    doc.add_paragraph("8. Probe Purple Wire (+5VSB Standby): Must read +5.0V even when PC is in sleep/soft-off.")
    doc.add_paragraph("9. Probe Gray Wire (Power Good / PWR_OK): Must stabilize to +5.0V within 100-500ms after power-on.")

    # 4.3 POST Beeps & Debug LED
    doc.add_heading("4.3 Lab 3: POST Audio Beep Codes & 7-Segment Diagnostic Debug LEDs", level=2)
    doc.add_paragraph(
        "Objective: Diagnose hardware failures before video initialization by analyzing motherboard buzzer sound patterns and 2-digit hex debug codes."
    )
    
    beep_tbl = doc.add_table(rows=6, cols=3)
    beep_data = [
        ("Beep Pattern", "Hex Debug Code", "Root Cause Diagnosis & Solution"),
        ("1 Short Beep", "Code AA / 00", "Normal POST Successful — System booting into OS."),
        ("1 Long, 2 Short Beeps", "Code d6 / 79", "GPU / Video Display Adapter Failure — Re-seat graphics card and check PCIe 8-pin power cables."),
        ("Continuous Beeps", "Code 55 / 50", "Memory (RAM) Initialization Error — Re-seat DIMM sticks in slots A2/B2, clean gold contacts with isopropyl alcohol."),
        ("5 Short Beeps", "Code 00 / FF", "Processor (CPU) Failure — Inspect socket pins, thermal paste, and 8-pin EPS 12V CPU power connector."),
        ("High Pitch Siren", "Code 98 / 99", "Overheating / Fan Header Fault — Check CPU cooler mount, thermal paste, and CPU_FAN header cable.")
    ]
    for r_idx, row in enumerate(beep_data):
        for c_idx, val in enumerate(row):
            beep_tbl.cell(r_idx, c_idx).text = val
    style_table(beep_tbl, header_bg="1E293B", alt_bg="F8FAFC")
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # 4.4 Component ID
    doc.add_heading("4.4 Lab 4: Visual Component Identification & Function Matching", level=2)
    doc.add_paragraph("1. Review the rendered high-resolution hardware component graphic.")
    doc.add_paragraph("2. Identify the component family (e.g., NVMe M.2 SSD, DDR5 DIMM, PCIe Video Card, ATX Power Supply, AIO Liquid Cooler).")
    doc.add_paragraph("3. Select the precise technical function from the randomized options.")
    doc.add_paragraph("4. Time is tracked — complete all 10 cards accurately to achieve a 100% score.")

    # 4.5 Motherboard Hotspots
    doc.add_heading("4.5 Lab 5: Motherboard Hotspots & Port Mapping", level=2)
    doc.add_paragraph("1. Inspect the interactive motherboard blueprint.")
    doc.add_paragraph("2. The prompt requests specific locations: 'Click the LGA1700 CPU Socket', 'Click the Front Panel Audio Header (AAFP)', etc.")
    doc.add_paragraph("3. Click precisely within the hotspot target zone on the motherboard.")
    doc.add_paragraph("4. Immediate feedback highlights green (correct) or red (incorrect).")

    # 4.6 Desktop PC Assembly
    doc.add_heading("4.6 Lab 6: Desktop PC Assembly Sequence & Safety Protocols", level=2)
    doc.add_paragraph(
        "Objective: Follow standardized industrial assembly procedures while strictly observing ESD (Electrostatic Discharge) safety rules."
    )
    doc.add_paragraph("1. Step 1: Wear Anti-Static Wrist Strap and connect alligator clip to unpainted metal chassis ground.")
    doc.add_paragraph("2. Step 2: Unbox Motherboard and place onto non-conductive cardboard box top (never on outside of static shield bag).")
    doc.add_paragraph("3. Step 3: Open CPU socket retention lever, align golden triangle on CPU with socket notch, drop CPU gently with zero insertion force, and lock lever.")
    doc.add_paragraph("4. Step 4: Install RAM modules into recommended Dual-Channel slots (Slots 2 & 4 / A2 & B2) until latches click.")
    doc.add_paragraph("5. Step 5: Install M.2 NVMe SSD into Primary CPU-attached M.2 slot and fasten with standoff screw.")
    doc.add_paragraph("6. Step 6: Apply thermal compound (pea-sized dot in center of CPU IHS) and mount CPU cooler firmly in cross-pattern.")
    doc.add_paragraph("7. Step 7: Install Motherboard I/O Shield, screw motherboard standoffs into chassis, lower motherboard and secure with screws.")
    doc.add_paragraph("8. Step 8: Mount Power Supply Unit (PSU), route 24-pin ATX and 8-pin CPU cables through chassis grommets.")
    doc.add_paragraph("9. Step 9: Install PCIe Graphics Card into top PCIe x16 slot and attach PCIe power cables.")
    doc.add_paragraph("10. Step 10: Connect Front Panel headers (Power SW, Reset SW, Power LED, HDD LED) matching polarity (+/-).")

    # 4.7 PC Builder
    doc.add_heading("4.7 Lab 7: PC Builder & Hardware Compatibility Configurator", level=2)
    doc.add_paragraph(
        "Objective: Architect a balanced computer system ensuring socket compatibility, thermal headroom, and power sufficiency."
    )
    doc.add_paragraph("• Ensure CPU socket matches Motherboard chipset (e.g. Intel Core i7-14700K with Z790 LGA1700).")
    doc.add_paragraph("• Verify CPU Cooler TDP rating exceeds CPU Max Turbo Power draw (e.g., 250W TDP Cooler for 253W CPU).")
    doc.add_paragraph("• Calculate Total System Wattage (CPU + GPU + Motherboard + Drives) and select a PSU with minimum 20% overhead margin (80 Plus Gold certified).")

    # 4.8 Fault Troubleshooting
    doc.add_heading("4.8 Lab 8: Real-World Hardware Fault Troubleshooting", level=2)
    doc.add_paragraph(
        "Objective: Follow structured diagnostic methodologies to isolate root causes in failing client systems."
    )
    doc.add_paragraph("1. Read Service Ticket: Review reported symptoms (e.g., 'PC restarts automatically after 15 minutes of 3D gaming').")
    doc.add_paragraph("2. Execute Inspection Steps: Check event viewer logs, monitor HWMonitor temperatures, test memory with MemTest86, check PSU voltages under load.")
    doc.add_paragraph("3. Observe Findings: GPU temperature spikes to 105°C and thermal throttles due to dried thermal paste and clogged fan bearings.")
    doc.add_paragraph("4. Submit Root Cause Conclusion: 'GPU Thermal Throttling & Fan Failure'.")

    # 4.9 Preventive Maintenance
    doc.add_heading("4.9 Lab 9: Preventive Maintenance, Dust Clearing & Repasting", level=2)
    doc.add_paragraph("1. Disconnect all AC power and hold power button for 10 seconds to discharge motherboard capacitors.")
    doc.add_paragraph("2. Remove magnetic dust filters and clean under running water or dry brush.")
    doc.add_paragraph("3. Use compressed air in short bursts while holding fan blades stationary to prevent back-EMF voltage generation into headers.")
    doc.add_paragraph("4. Clean old hardened thermal paste from CPU and heatsink base using 99% Isopropyl Alcohol and lint-free microfiber cloth.")
    doc.add_paragraph("5. Apply fresh high-thermal-conductivity compound and remount cooler evenly.")

    # 4.10 Service Report
    doc.add_heading("4.10 Lab 10: Formal Computer Repair Service Report", level=2)
    doc.add_paragraph(
        "Objective: Document complete technical interventions in a professional, audit-ready service report ticket."
    )
    doc.add_paragraph("Trainees must complete the 8 formal report fields:")
    doc.add_paragraph("1. Fault Reported: Summary of customer complaint.")
    doc.add_paragraph("2. Symptoms Observed: Observable physical and software symptoms during intake bench testing.")
    doc.add_paragraph("3. Diagnostic Steps Performed: Tests and measurements conducted (multimeter, beep analysis, memtest).")
    doc.add_paragraph("4. Diagnostic Findings & Root Cause: Definitive root cause identified.")
    doc.add_paragraph("5. Corrective Action Taken: Physical repairs, replacements, and firmware tweaks performed.")
    doc.add_paragraph("6. Replacement Parts / Consumables: Exact hardware part numbers, thermal pads, or paste used.")
    doc.add_paragraph("7. Safety Precautions Followed: ESD safeguards, capacitor discharge, and thermal handling.")
    doc.add_paragraph("8. Recommendations for Customer: Advice to prevent recurrence (e.g. surge protector, room ventilation).")

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 5: GRADEBOOK, FEEDBACK & PDF EXPORT
    # -------------------------------------------------------------
    h5 = doc.add_heading("5. Gradebook, Feedback & PDF Export", level=1)
    h5.paragraph_format.space_before = Pt(14)
    h5.paragraph_format.space_after = Pt(8)

    doc.add_paragraph(
        "Upon lab completion, the system automatically grades objective parameters and routes the attempt to the "
        "Instructor Gradebook Tracker (`/instructor/submissions`)."
    )
    doc.add_paragraph("• Automated Scoring Telemetry: Component Identification Accuracy (%), Assembly Order Correctness (%), Diagnostic Precision (%), and Safety Protocol Compliance (%).")
    doc.add_paragraph("• Instructor Assessment: Instructors review the submission, adjust the overall score percentage, and input qualitative feedback comments.")
    doc.add_paragraph("• Official PDF Report Generation: Both instructors and trainees can click 'PDF Report' to generate a downloadable, printable assessment transcript complete with institutional branding, trainee details, score breakdown, and instructor sign-off.")

    # -------------------------------------------------------------
    # SECTION 6: TROUBLESHOOTING & FAQ
    # -------------------------------------------------------------
    h6 = doc.add_heading("6. Troubleshooting, FAQ & Offline Best Practices", level=1)
    h6.paragraph_format.space_before = Pt(14)
    h6.paragraph_format.space_after = Pt(8)

    faq_items = [
        ("Q: A trainee forgot their password and cannot log in.",
         "A: The Admin or Instructor can navigate to 'Users' or 'Trainees' directory, locate the trainee row, click '🔑 Reset', and provide them with a new temporary password (e.g., Password@123)."),
        ("Q: A lab card shows '⛔ Expired' and trainees cannot start it.",
         "A: The lab has passed its configured expiration date. The instructor can edit the lab under 'Instructor > Simulation Labs', clear or extend the 'Expiration Date' field, and save changes."),
        ("Q: Can the simulator run without an active internet connection?",
         "A: Yes. All interactive components, graphics, audio synthesizers, and database engines run entirely locally on the host Windows/Laragon server. No external cloud dependencies exist."),
        ("Q: How do we restore the database if test data needs to be cleared?",
         "A: An Administrator can navigate to Admin > Database Backups, select a pristine snapshot archive (e.g., initial baseline seed), and click 'Restore'. The database will revert within seconds.")
    ]

    for q, a in faq_items:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(4)
        p_q.paragraph_format.space_after = Pt(1)
        r_q = p_q.add_run(q)
        r_q.bold = True
        r_q.font.color.rgb = RGBColor(15, 23, 42)
        
        p_a = doc.add_paragraph()
        p_a.paragraph_format.space_before = Pt(1)
        p_a.paragraph_format.space_after = Pt(6)
        r_a = p_a.add_run(a)
        r_a.font.color.rgb = RGBColor(51, 65, 85)

    add_callout(doc, [
        "For additional institutional customization, contact the lead systems engineer or refer to the project source repository.",
        "Always execute 'php artisan optimize:clear' whenever deploying server-side updates on the Windows server."
    ], title="SUPPORT & SYSTEM INTEGRITY", alert_type="note")

    # Save document
    output_path = r"c:\laragon\www\Greg-Hardware-Training-Simulator\Greg_Hardware_Simulator_Comprehensive_Lab_User_Guide.docx"
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    build_guide()
