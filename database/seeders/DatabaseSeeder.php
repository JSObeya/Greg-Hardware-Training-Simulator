<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Course;
use App\Models\Module;
use App\Models\Lab;
use App\Models\LabAsset;
use App\Models\ComponentQuestion;
use App\Models\HotspotQuestion;
use App\Models\AssemblyStep;
use App\Models\TroubleshootingScenario;
use App\Models\AuditLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Roles
        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
        ], [
            'description' => 'System Administrator with full access',
        ]);

        $instructorRole = Role::firstOrCreate([
            'name' => 'instructor',
        ], [
            'description' => 'Instructor who creates courses, labs, and reviews attempts',
        ]);

        $traineeRole = Role::firstOrCreate([
            'name' => 'trainee',
        ], [
            'description' => 'Trainee who completes simulators and repair reports',
        ]);

        // 2. Seed Users
        User::firstOrCreate([
            'email' => 'admin@gregco.local',
        ], [
            'name' => 'Greg Admin',
            'password' => Hash::make('Password@123'),
            'role_id' => $adminRole->id,
        ]);

        $instructor = User::firstOrCreate([
            'email' => 'instructor@gregco.local',
        ], [
            'name' => 'Prof. Jane Smith',
            'password' => Hash::make('Password@123'),
            'role_id' => $instructorRole->id,
        ]);

        $trainee = User::firstOrCreate([
            'email' => 'trainee@gregco.local',
        ], [
            'name' => 'John Doe',
            'password' => Hash::make('Password@123'),
            'role_id' => $traineeRole->id,
        ]);

        // 3. Seed Course & 13 Modules
        $course = Course::firstOrCreate([
            'title' => 'Computer Hardware Basics',
        ], [
            'description' => 'Practical computer hardware assembly, safety, troubleshooting, and repair training simulator.',
        ]);

        $modulesData = [
            1 => 'Introduction to Computer Hardware',
            2 => 'Safety and ESD Precautions',
            3 => 'Components Identification',
            4 => 'Motherboard Parts',
            5 => 'Storage Devices',
            6 => 'Power Supply Unit',
            7 => 'RAM and CPU Installation',
            8 => 'Desktop Assembly Flow',
            9 => 'BIOS/UEFI Basics',
            10 => 'Preventive Maintenance',
            11 => 'Hardware Troubleshooting',
            12 => 'Fault Diagnosis & Report',
            13 => 'Final Capstone Project'
        ];

        $modules = [];
        foreach ($modulesData as $num => $title) {
            $modules[$num] = Module::firstOrCreate([
                'course_id' => $course->id,
                'title' => $title,
            ], [
                'order_index' => $num,
                'description' => "Training curriculum exercises for Module {$num}: {$title}."
            ]);
        }

        // 4. Seed Comprehensive Practical Labs Across All Modules
        $allLabs = [];

        // Lab 1: Safety and ESD Precautions (Module 2)
        $labSafety = Lab::firstOrCreate([
            'module_id' => $modules[2]->id,
            'title' => 'Safety & Anti-Static ESD Protocols Workshop',
        ], [
            'type' => 'assembly_sequence',
            'description' => 'Master electrostatic discharge (ESD) safety protocols, grounding procedures, and workspace preparation before touching delicate silicon chips.'
        ]);
        $allLabs[] = $labSafety;

        AssemblyStep::firstOrCreate(['lab_id' => $labSafety->id, 'step_number' => 1], [
            'instruction' => 'Disconnect all AC power cables from the wall outlet and switch off PSU rocker switch.',
            'is_safety_critical' => true
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labSafety->id, 'step_number' => 2], [
            'instruction' => 'Wear an anti-static wrist strap and attach the alligator clip to an unpainted metal chassis surface.',
            'is_safety_critical' => true
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labSafety->id, 'step_number' => 3], [
            'instruction' => 'Place anti-static ESD mat on a clean, non-conductive workbench surface.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labSafety->id, 'step_number' => 4], [
            'instruction' => 'Hold RAM memory modules and expansion cards strictly by their fiberglass edges, never touching gold contacts.',
            'is_safety_critical' => true
        ]);

        // Lab 2: Desktop Components Identification Workshop (Module 3)
        $labCompId = Lab::firstOrCreate([
            'module_id' => $modules[3]->id,
            'title' => 'Desktop Components Identification Workshop',
        ], [
            'type' => 'component_id',
            'description' => 'Identify central desktop internal units (CPU, RAM, GPU, PSU, Motherboard, Storage) and define their technical system roles.'
        ]);
        $allLabs[] = $labCompId;

        ComponentQuestion::firstOrCreate(['lab_id' => $labCompId->id, 'correct_name' => 'RAM'], [
            'image_path' => '/images/ram_module.png',
            'correct_function' => 'Temporarily stores system data and running applications for high-speed processor access.',
            'options' => ['PSU', 'CPU', 'Hard Drive'],
            'function_options' => [
                'Converts AC power to DC voltage',
                'Executes mathematical and logic instructions',
                'Provides long-term magnetic storage'
            ]
        ]);

        ComponentQuestion::firstOrCreate(['lab_id' => $labCompId->id, 'correct_name' => 'CPU'], [
            'image_path' => '/images/cpu_processor.png',
            'correct_function' => 'Acts as the central brain of the computer to execute system instructions and calculations.',
            'options' => ['GPU', 'Motherboard', 'PSU'],
            'function_options' => [
                'Provides persistent storage for files',
                'Connects peripheral graphics cards',
                'Supplies 12V rail power to motherboard'
            ]
        ]);

        ComponentQuestion::firstOrCreate(['lab_id' => $labCompId->id, 'correct_name' => 'PSU'], [
            'image_path' => '/images/power_supply_unit.png',
            'correct_function' => 'Converts AC wall power (110V/220V) to clean DC voltages (+3.3V, +5V, +12V) for internal hardware.',
            'options' => ['Hard Drive', 'RAM', 'GPU'],
            'function_options' => [
                'Acts as the high-speed data bus',
                'Stores BIOS firmware settings',
                'Renders graphical 3D polygon shaders'
            ]
        ]);

        ComponentQuestion::firstOrCreate(['lab_id' => $labCompId->id, 'correct_name' => 'Motherboard'], [
            'image_path' => '/images/motherboard_layout.png',
            'correct_function' => 'Main printed circuit board (PCB) that houses and interconnects CPU, memory, expansion buses, and peripherals.',
            'options' => ['Chassis Case', 'Heatsink Fan', 'CMOS Battery'],
            'function_options' => [
                'Encloses components against dust and moisture',
                'Dissipates heat from the CPU integrated heat spreader',
                'Supplies backup current for real-time clock only'
            ]
        ]);

        ComponentQuestion::firstOrCreate(['lab_id' => $labCompId->id, 'correct_name' => 'Hard Drive (HDD)'], [
            'image_path' => '/images/hard_drive.png',
            'correct_function' => 'Non-volatile secondary storage device using spinning magnetic platters to persist operating system and user files.',
            'options' => ['RAM', 'Optical Drive', 'SSD'],
            'function_options' => [
                'Volatile working memory for active programs',
                'Reads optical laser compact discs',
                'Converts digital signals to analog audio'
            ]
        ]);

        // Lab 3: Motherboard Hotspot Coordinates Lab (Module 4)
        $labHotspot = Lab::firstOrCreate([
            'module_id' => $modules[4]->id,
            'title' => 'Motherboard Hotspot & Architecture Lab',
        ], [
            'type' => 'motherboard_hotspot',
            'description' => 'Pinpoint CPU Socket (LGA/AM4), Dual-Channel RAM DIMMs, PCIe x16 lane, SATA headers, and CMOS battery on the motherboard.'
        ]);
        $allLabs[] = $labHotspot;

        LabAsset::firstOrCreate([
            'lab_id' => $labHotspot->id,
            'file_path' => '/images/motherboard_layout.png',
        ], [
            'asset_type' => 'background'
        ]);

        HotspotQuestion::firstOrCreate(['lab_id' => $labHotspot->id, 'label' => 'CPU Socket (LGA/PGA)'], [
            'x_coord' => 42.0, 'y_coord' => 35.0, 'radius' => 10.0
        ]);
        HotspotQuestion::firstOrCreate(['lab_id' => $labHotspot->id, 'label' => 'RAM DIMM Slots (DDR4/DDR5)'], [
            'x_coord' => 65.0, 'y_coord' => 35.0, 'radius' => 10.0
        ]);
        HotspotQuestion::firstOrCreate(['lab_id' => $labHotspot->id, 'label' => 'PCIe x16 GPU Expansion Slot'], [
            'x_coord' => 42.0, 'y_coord' => 62.0, 'radius' => 10.0
        ]);
        HotspotQuestion::firstOrCreate(['lab_id' => $labHotspot->id, 'label' => 'CMOS Battery (CR2032)'], [
            'x_coord' => 75.0, 'y_coord' => 75.0, 'radius' => 8.0
        ]);
        HotspotQuestion::firstOrCreate(['lab_id' => $labHotspot->id, 'label' => 'ATX 24-Pin Main Power Connector'], [
            'x_coord' => 78.0, 'y_coord' => 40.0, 'radius' => 9.0
        ]);

        // Lab 4: Storage Devices Configuration (Module 5)
        $labStorage = Lab::firstOrCreate([
            'module_id' => $modules[5]->id,
            'title' => 'Storage Drive Mounting & Configuration Lab',
        ], [
            'type' => 'assembly_sequence',
            'description' => 'Install NVMe M.2 solid state drive with thermal heat spreader pad and mount 2.5-inch SATA SSD with 6Gbps data cable.'
        ]);
        $allLabs[] = $labStorage;

        AssemblyStep::firstOrCreate(['lab_id' => $labStorage->id, 'step_number' => 1], [
            'instruction' => 'Unscrew motherboard M.2 heatsink shield and install standoff screw in slot 2280 position.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labStorage->id, 'step_number' => 2], [
            'instruction' => 'Insert M.2 NVMe SSD into M-key slot at a 30-degree angle and push down gently.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labStorage->id, 'step_number' => 3], [
            'instruction' => 'Fasten M.2 retention screw, peel plastic film off thermal pad, and screw down heatsink cover.',
            'is_safety_critical' => true
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labStorage->id, 'step_number' => 4], [
            'instruction' => 'Mount 2.5-inch SATA drive in drive bay cage and connect SATA 6Gb/s data cable and 15-pin SATA power connector.',
            'is_safety_critical' => false
        ]);

        // Lab 5: Power Supply & Cable Pinouts Simulator (Module 6)
        $labPsu = Lab::firstOrCreate([
            'module_id' => $modules[6]->id,
            'title' => 'Power Supply & Cable Pinouts Simulator',
        ], [
            'type' => 'cable_pinout',
            'description' => 'Connect ATX 24-Pin motherboard power, EPS 8-Pin CPU 12V, PCIe 8-Pin GPU power, SATA power, and Front Panel header jumpers (Power SW, Reset SW, HDD LED).'
        ]);
        $allLabs[] = $labPsu;

        // Lab 6: CPU Alignment & Dual-Channel RAM Installation (Module 7)
        $labCpuRam = Lab::firstOrCreate([
            'module_id' => $modules[7]->id,
            'title' => 'CPU Alignment & Dual-Channel RAM Installation',
        ], [
            'type' => 'assembly_sequence',
            'description' => 'Align CPU processor gold triangle with socket pin 1, clamp retention lever, insert dual-channel RAM in slots A2/B2, and apply thermal paste.'
        ]);
        $allLabs[] = $labCpuRam;

        AssemblyStep::firstOrCreate(['lab_id' => $labCpuRam->id, 'step_number' => 1], [
            'instruction' => 'Lift socket load lever and open CPU socket retention plate without touching socket pins.',
            'is_safety_critical' => true
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labCpuRam->id, 'step_number' => 2], [
            'instruction' => 'Align the golden triangle corner mark on CPU with Pin 1 notch on socket and drop gently with zero insertion force (ZIF).',
            'is_safety_critical' => true
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labCpuRam->id, 'step_number' => 3], [
            'instruction' => 'Lower retention bracket and lock down load lever under the latch catch.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labCpuRam->id, 'step_number' => 4], [
            'instruction' => 'Open DIMM slot retaining clips and insert matching RAM sticks into Dual-Channel slots 2 and 4 (DIMM A2 & B2) until latches click.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labCpuRam->id, 'step_number' => 5], [
            'instruction' => 'Apply a pea-sized dot of thermal paste onto CPU center, mount cooler heatsink, and plug 4-pin PWM cable into CPU_FAN header.',
            'is_safety_critical' => true
        ]);

        // Lab 7: Desktop Case Assembly Flow (Module 8)
        $labAssembly = Lab::firstOrCreate([
            'module_id' => $modules[8]->id,
            'title' => 'Desktop Case Assembly Sequence Simulation',
        ], [
            'type' => 'assembly_sequence',
            'description' => 'Arrange computer build steps from safety grounding to final power tests.'
        ]);
        $allLabs[] = $labAssembly;

        AssemblyStep::firstOrCreate(['lab_id' => $labAssembly->id, 'step_number' => 1], [
            'instruction' => 'Connect ESD ground strap and install motherboard I/O shield plate into rear case cutout.',
            'is_safety_critical' => true
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labAssembly->id, 'step_number' => 2], [
            'instruction' => 'Screw brass motherboard standoff risers into chassis tray matching motherboard form factor (ATX/mATX).',
            'is_safety_critical' => true
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labAssembly->id, 'step_number' => 3], [
            'instruction' => 'Mount motherboard on standoffs and secure with non-conductive washer screws.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labAssembly->id, 'step_number' => 4], [
            'instruction' => 'Mount PSU in lower chassis shroud compartment and fasten 4 rear hex screws.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labAssembly->id, 'step_number' => 5], [
            'instruction' => 'Connect 24-pin ATX power, 8-pin EPS CPU power, and front panel power switch jumpers.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labAssembly->id, 'step_number' => 6], [
            'instruction' => 'Insert Dedicated Graphics Card (GPU) into primary PCIe x16 slot and secure rear bracket.',
            'is_safety_critical' => false
        ]);

        // Lab 8: Drag-and-Drop Chassis Build (Module 8)
        $labDrag = Lab::firstOrCreate([
            'module_id' => $modules[8]->id,
            'title' => 'Chassis Drag-and-Drop Components Mount Simulator',
        ], [
            'type' => 'drag_drop_build',
            'description' => 'Assemble internal components graphically into the computer chassis case tray.'
        ]);
        $allLabs[] = $labDrag;

        AssemblyStep::firstOrCreate(['lab_id' => $labDrag->id, 'step_number' => 1], [
            'instruction' => 'Install ATX Motherboard Tray inside the computer chassis cabinet.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labDrag->id, 'step_number' => 2], [
            'instruction' => 'Insert CPU Processor inside the motherboard socket.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labDrag->id, 'step_number' => 3], [
            'instruction' => 'Mount RAM memory stick in the motherboard DIMM slots.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labDrag->id, 'step_number' => 4], [
            'instruction' => 'Mount PSU Power Supply Unit inside the chassis cabinet compartment.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labDrag->id, 'step_number' => 5], [
            'instruction' => 'Mount Hard Drive Disk (HDD) into the drive storage cage bays.',
            'is_safety_critical' => false
        ]);

        // Lab 9: BIOS/UEFI Basics (Module 9)
        $labBios = Lab::firstOrCreate([
            'module_id' => $modules[9]->id,
            'title' => 'BIOS / UEFI Setup & Boot Priority Configuration',
        ], [
            'type' => 'bios_config',
            'description' => 'Interact with UEFI BIOS firmware setup: adjust Boot Device Priority order (USB Installer -> NVMe SSD), enable XMP memory frequency profile, calibrate CPU fan speeds, and save CMOS changes.'
        ]);
        $allLabs[] = $labBios;

        // Lab 10: Preventive Maintenance (Module 10)
        $labMaintenance = Lab::firstOrCreate([
            'module_id' => $modules[10]->id,
            'title' => 'Preventive Maintenance & Deep Cleaning Lab',
        ], [
            'type' => 'preventive_maintenance',
            'description' => 'Perform routine computer hardware maintenance: dust removal with compressed air, holding fan blades, cleaning old thermal paste with 99% isopropyl alcohol, and checking cable routing.'
        ]);
        $allLabs[] = $labMaintenance;

        AssemblyStep::firstOrCreate(['lab_id' => $labMaintenance->id, 'step_number' => 1], [
            'instruction' => 'Unplug AC power cable, switch PSU rocker to O (Off), and press front power button for 5 seconds to discharge capacitor residue.',
            'is_safety_critical' => true
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labMaintenance->id, 'step_number' => 2], [
            'instruction' => 'Hold cooling fan blades steady with a finger while blowing canned compressed air to prevent over-spinning bearing damage.',
            'is_safety_critical' => true
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labMaintenance->id, 'step_number' => 3], [
            'instruction' => 'Wipe dry, crusty thermal compound from CPU heat spreader using lint-free microfiber wipe dampened with 90%+ Isopropyl Alcohol (IPA).',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labMaintenance->id, 'step_number' => 4], [
            'instruction' => 'Apply fresh thermal interface material (TIM) and inspect motherboard capacitors for bulging or electrolyte leakage.',
            'is_safety_critical' => false
        ]);

        // Lab 11: Hardware POST Hex Code & Beep Diagnostics (Module 11)
        $labBeep = Lab::firstOrCreate([
            'module_id' => $modules[11]->id,
            'title' => 'Hardware POST Hex Code & Beep Diagnostics',
        ], [
            'type' => 'beep_code_diagnostic',
            'description' => 'Interpret 7-segment motherboard debug LED hex codes (Code 00, 55, A2, d6) and chassis speaker beep codes (1 Long 2 Short, Continuous loop) to identify failed hardware components.'
        ]);
        $allLabs[] = $labBeep;

        // Lab 12: Hardware Troubleshooting (Module 11)
        $labTrouble = Lab::firstOrCreate([
            'module_id' => $modules[11]->id,
            'title' => 'Diagnose a Desktop That Will Not Power On',
        ], [
            'type' => 'troubleshooting',
            'description' => 'Isolate and diagnose a power issue safely step-by-step.'
        ]);
        $allLabs[] = $labTrouble;

        TroubleshootingScenario::firstOrCreate(['lab_id' => $labTrouble->id], [
            'title' => 'Diagnose a Desktop That Will Not Power On',
            'scenario_text' => 'A trainee receives a desktop computer that does not power on when pressing the front button. No LED illuminates and fans remain motionless. Follow standard safety isolation procedures before touching internal circuit components.',
            'symptoms' => ['No power', 'No fan spin', 'No beep sound', 'No motherboard standby LED'],
            'correct_conclusion' => 'Disconnected Power Cable',
            'steps' => [
                [
                    'name' => 'Check Wall Socket & Surge Protector',
                    'finding' => 'Wall outlet supplies normal 220V AC voltage. Surge protector power switch is ON.',
                    'is_safety_critical' => true
                ],
                [
                    'name' => 'Inspect Power Cable into PSU Socket',
                    'finding' => 'Power cable is loose and unplugged from the desktop PSU rear socket.',
                    'is_safety_critical' => true
                ],
                [
                    'name' => 'Inspect Front Panel Power Switch Jumpers',
                    'finding' => 'Front panel PWR_SW header connector is firmly seated on motherboard pins.',
                    'is_safety_critical' => false
                ],
                [
                    'name' => 'Inspect 24-Pin ATX Main Power Cable',
                    'finding' => '24-pin harness is fully locked into motherboard socket.',
                    'is_safety_critical' => false
                ]
            ]
        ]);

        // Lab 13: Hardware Troubleshooting - Overheating (Module 11)
        $labThermal = Lab::firstOrCreate([
            'module_id' => $modules[11]->id,
            'title' => 'Diagnose Sudden Thermal Shutdown & Overheating',
        ], [
            'type' => 'troubleshooting',
            'description' => 'Diagnose a desktop system that boots into Windows but abruptly shuts down after 3 minutes under load.'
        ]);
        $allLabs[] = $labThermal;

        TroubleshootingScenario::firstOrCreate(['lab_id' => $labThermal->id], [
            'title' => 'Diagnose Sudden Thermal Shutdown & Overheating',
            'scenario_text' => 'A newly built workstation powers up normally but crashes or shuts down within 2-3 minutes of running applications. BIOS hardware monitor reports CPU temperature exceeding 100°C (212°F).',
            'symptoms' => ['System shuts down after 2 minutes', 'CPU temperature 100°C', 'Thermal throttling warning', 'High fan noise'],
            'correct_conclusion' => 'Unpeeled Plastic Film on CPU Cooler Base',
            'steps' => [
                [
                    'name' => 'Inspect CPU Fan Header & RPM',
                    'finding' => 'CPU cooler fan is plugged into CPU_FAN header and spinning at 2200 RPM.',
                    'is_safety_critical' => true
                ],
                [
                    'name' => 'Check CPU Heatsink Mounting Screws',
                    'finding' => 'Mounting brackets are tight with adequate spring tension.',
                    'is_safety_critical' => false
                ],
                [
                    'name' => 'Dismount Cooler & Inspect Thermal Contact Surface',
                    'finding' => 'Clear plastic protective warning film ("Peel Before Install") was left attached between copper cold plate and CPU thermal paste.',
                    'is_safety_critical' => true
                ]
            ]
        ]);

        // Lab 14: Repair Report (Module 12)
        $labReport = Lab::firstOrCreate([
            'module_id' => $modules[12]->id,
            'title' => 'Service Audit Repair Report Worksheet',
        ], [
            'type' => 'repair_report',
            'description' => 'Complete a manual maintenance log audit for a diagnosed device.'
        ]);
        $allLabs[] = $labReport;

        // Lab 15: Final Practical Capstone Project (Module 13)
        $labCapstone = Lab::firstOrCreate([
            'module_id' => $modules[13]->id,
            'title' => 'Final Capstone Practical Build & Verification',
        ], [
            'type' => 'assembly_sequence',
            'description' => 'Execute complete end-to-end practical workstation build: ESD safety, motherboard mounting, dual-channel memory, NVMe SSD, cable management, and successful POST validation.'
        ]);
        $allLabs[] = $labCapstone;

        AssemblyStep::firstOrCreate(['lab_id' => $labCapstone->id, 'step_number' => 1], [
            'instruction' => 'Establish ESD workstation grounding, verify AC disconnect, and prepare tools (Phillips #2, zip ties).',
            'is_safety_critical' => true
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labCapstone->id, 'step_number' => 2], [
            'instruction' => 'Install CPU in socket, mount M.2 NVMe SSD with heatsink pad, and insert dual-channel DDR4/DDR5 RAM sticks outside the chassis.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labCapstone->id, 'step_number' => 3], [
            'instruction' => 'Install rear I/O shield, align motherboard standoffs, and screw motherboard into chassis cabinet.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labCapstone->id, 'step_number' => 4], [
            'instruction' => 'Install PSU, route ATX 24-pin and CPU 8-pin cables through grommets, and mount dedicated GPU with PCIe power.',
            'is_safety_critical' => false
        ]);
        AssemblyStep::firstOrCreate(['lab_id' => $labCapstone->id, 'step_number' => 5], [
            'instruction' => 'Connect front panel header pins (PWR_SW, RESET, HDD_LED) and perform initial Power-On Self Test (POST).',
            'is_safety_critical' => true
        ]);

        // Auto-assign ALL labs to the demo trainee
        foreach ($allLabs as $labItem) {
            \App\Models\LabAssignment::firstOrCreate([
                'lab_id' => $labItem->id,
                'trainee_id' => $trainee->id,
            ], [
                'assigned_by' => $instructor->id,
                'status' => 'pending'
            ]);
        }

        // Seed sample audit logs
        AuditLog::create([
            'user_id' => $trainee->id,
            'action' => 'LOGIN',
            'details' => 'Trainee logged in from workstation client.',
            'ip_address' => '127.0.0.1'
        ]);

        AuditLog::create([
            'user_id' => $instructor->id,
            'action' => 'LAB_CREATE',
            'details' => 'Created practical hardware training curriculum with 15 interactive labs across 13 modules.',
            'ip_address' => '127.0.0.1'
        ]);

        AuditLog::create([
            'user_id' => $instructor->id,
            'action' => 'ASSIGNMENT_CREATE',
            'details' => 'Assigned desktop assembly lab courseware to trainee: John Doe.',
            'ip_address' => '127.0.0.1'
        ]);
    }
}
