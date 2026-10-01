import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Comprehensive technical lesson explainers for each module/lab type
const LESSON_EXPLAINERS = {
    safety_esd: {
        title: 'Module 2: Electrostatic Discharge (ESD) & Laboratory Safety',
        category: 'Safety & ESD Protocols',
        summary: 'Electrostatic discharge can destroy silicon transistors at voltages as low as 100V—far below the 3,000V threshold that humans can physically feel as a spark.',
        objectives: [
            'Understand why ungrounded static charge damages delicate CMOS components',
            'Learn how to properly wear and ground an anti-static wrist strap',
            'Prepare a clean, non-conductive ESD workbench',
            'Master safe component handling techniques strictly by outer fiberglass edges'
        ],
        keyConcepts: [
            { term: 'Electrostatic Discharge (ESD)', def: 'The sudden flow of electricity between two electrically charged objects caused by contact, a dielectric breakdown, or static charge buildup.' },
            { term: 'Anti-Static Wrist Strap', def: 'A conductive fabric band with an integrated 1-Megaohm safety resistor that drains static charge safely to chassis ground.' },
            { term: 'Residual Capacitor Discharge', def: 'Holding the case power button for 5 seconds with AC power unplugged to discharge lingering energy inside PSU and motherboard capacitors.' },
        ],
        procedure: [
            '1. Disconnect the AC power cord from the wall outlet and flip the PSU rocker switch to O (Off).',
            '2. Press and hold the computer case power button for 5 seconds to drain residual capacitor voltages.',
            '3. Wear an anti-static wrist strap and attach the crocodile clip to bare, unpainted metal inside the chassis frame.',
            '4. Always place sensitive components (RAM, CPU, expansion cards) on an anti-static ESD mat or in antistatic bags—never on top of antistatic bags or carpet.',
            '5. Handle RAM and PCIe cards strictly by their plastic edges without touching gold pin contacts.'
        ],
        proTips: '⚠️ Pro-Tip: Never wear an ESD grounding wrist strap when servicing inside CRT monitors or opened Power Supply Units (PSUs) due to hazardous lethal high voltages.'
    },
    components: {
        title: 'Module 3: Core Desktop Computer Hardware Components',
        category: 'Component Identification & Role',
        summary: 'A computer system is built from specialized modular units working synchronously across high-speed data and electrical buses.',
        objectives: [
            'Identify primary computer hardware components visually and structurally',
            'Understand the technical function of CPU, RAM, PSU, GPU, Motherboard, and Storage',
            'Recognize critical interface ports and mounting sockets'
        ],
        keyConcepts: [
            { term: 'CPU (Central Processing Unit)', def: 'Executes mathematical computations, logic instructions, and coordinates system peripherals via control units (ALU/CU).' },
            { term: 'RAM (Random Access Memory)', def: 'High-speed, volatile primary system memory that holds currently active instructions and OS data for instant CPU cache access.' },
            { term: 'PSU (Power Supply Unit)', def: 'Converts high-voltage AC current into regulated, clean DC voltage rails (+3.3V, +5V, +12V) required by digital integrated circuits.' },
            { term: 'Motherboard / Mainboard', def: 'The central multi-layered PCB linking CPU, chipset (PCH), memory buses, PCIe lanes, storage, and I/O headers.' },
            { term: 'Storage (NVMe SSD / SATA HDD)', def: 'Non-volatile secondary storage preserving the OS kernel, applications, and persistent user files.' }
        ],
        procedure: [
            '1. Inspect the form factor, dimensions, and heatsinks of each component on your workstation.',
            '2. Match components with their system roles and electrical voltage rails.',
            '3. Verify socket compatibility (e.g. Intel LGA1700 vs AMD AM5, DDR4 vs DDR5 DIMMs).'
        ],
        proTips: '💡 Pro-Tip: RAM is volatile (erases on power loss), whereas SSDs and HDDs retain data permanently until deleted.'
    },
    motherboard: {
        title: 'Module 4: Motherboard Layout, Sockets & Buses',
        category: 'Motherboard Architecture',
        summary: 'The motherboard architecture determines expansion limits, bus bandwidth, and component power delivery (VRM).',
        objectives: [
            'Locate and identify CPU sockets (LGA vs PGA), RAM DIMM slots, and PCIe x16 slots',
            'Identify ATX 24-Pin and EPS 8-Pin power connectors on the PCB',
            'Locate the CMOS battery, front panel headers, and SATA 6Gb/s ports'
        ],
        keyConcepts: [
            { term: 'CPU Socket', def: 'LGA (Land Grid Array - pins on motherboard) or PGA (Pin Grid Array - pins on CPU) that seats the processor.' },
            { term: 'RAM DIMM Slots', def: 'Color-coded memory slots supporting dual-channel memory interleaving (Slots 2 & 4 / A2 & B2).' },
            { term: 'PCIe x16 Slot', def: 'High-bandwidth expansion bus delivering up to 75W of slot power directly for dedicated graphics cards (GPUs).' },
            { term: 'CMOS Battery (CR2032)', def: 'A 3V lithium coin cell providing constant micro-current to preserve real-time clock (RTC) and BIOS firmware settings.' }
        ],
        procedure: [
            '1. Examine the motherboard blueprint or PCB layout.',
            '2. Click on the target parts in the checklist and accurately place coordinate pins on the motherboard.',
            '3. Confirm connector orientations (e.g. notch keying on DIMMs and latch clips on PCIe slots).'
        ],
        proTips: '💡 Pro-Tip: If BIOS settings keep resetting every time the PC is unplugged, replace the CR2032 3V CMOS battery.'
    },
    cabling: {
        title: 'Module 6: Power Supply Unit Rails & Cable Pinouts',
        category: 'Power Supply & Pinouts',
        summary: 'The PSU delivers multiple DC voltage rails (+3.3V, +5V, +12V). Incorrect cable seating can prevent POST or damage sensitive circuit paths.',
        objectives: [
            'Connect ATX 24-Pin main power, EPS 8-Pin CPU 12V, and PCIe 8-Pin GPU cables',
            'Understand Front Panel Header wiring: Power Switch, Reset Switch, HDD Activity LED, Power LED',
            'Distinguish EPS 8-pin CPU power (4+4 split) from PCIe 8-pin GPU power (6+2 split)'
        ],
        keyConcepts: [
            { term: '24-Pin ATX Connector', def: 'Main system power providing +3.3V (Orange), +5V (Red), +12V (Yellow), +5VSB Standby (Purple), and Ground (Black).' },
            { term: '8-Pin (4+4) EPS 12V', def: 'Dedicated power for CPU voltage regulation modules (VRMs). Must never be confused with PCIe cables.' },
            { term: '8-Pin (6+2) PCIe', def: 'High-current 12V auxiliary power for discrete graphics cards.' },
            { term: 'Front Panel Header (F_PANEL)', def: 'Pin cluster connecting case pushbuttons and status indicator LEDs.' }
        ],
        procedure: [
            '1. Match each PSU modular harness to its corresponding motherboard/chassis destination.',
            '2. For Front Panel jumpers: connect PWR_SW to pins 6 & 8, RESET_SW to pins 5 & 7, HDD_LED to pins 1 & 3.',
            '3. Ensure all locking clips latch firmly with zero gaps.'
        ],
        proTips: '⚠️ Pro-Tip: Switch jumpers (Power SW & Reset SW) are momentary switches with no polarity; however, LEDs (HDD LED, Power LED) are diodes and require correct (+) and (-) orientation.'
    },
    assembly: {
        title: 'Module 8: Complete Desktop PC Chassis Assembly Flow',
        category: 'Assembly Flow & Build Sequence',
        summary: 'Following a standardized, safety-verified assembly sequence avoids component collision, ESD hazards, and short-circuit damage.',
        objectives: [
            'Execute safe assembly order from bench preparation to final POST validation',
            'Install CPU, dual-channel RAM, and M.2 SSD outside the case before motherboard installation',
            'Ensure brass standoff risers prevent PCB ground shorts against the chassis'
        ],
        keyConcepts: [
            { term: 'Motherboard Standoffs', def: 'Brass risers threaded into the chassis tray that elevate the motherboard PCB, preventing solder points from shorting on bare steel.' },
            { term: 'I/O Shield Plate', def: 'Grounded metal faceplate seated into the rear case opening that shields against electromagnetic interference (EMI).' },
            { term: 'Thermal Interface Material (TIM)', def: 'Microscopic gap filler eliminating air pockets between the CPU integrated heat spreader (IHS) and cooler copper cold plate.' }
        ],
        procedure: [
            '1. Install CPU, RAM, and M.2 SSD onto the motherboard on an anti-static surface outside the case.',
            '2. Press the rear I/O shield firmly into the chassis opening until all four corners click.',
            '3. Screw in motherboard standoffs matching the board form factor (ATX / mATX).',
            '4. Lower the motherboard onto standoffs, align rear ports, and fasten with screws.',
            '5. Mount the PSU in the lower shroud, route cables, install the GPU, and connect power/header jumpers.'
        ],
        proTips: '💡 Pro-Tip: Extra standoffs installed in locations where there are no motherboard screw holes can short-circuit internal traces and kill the board!'
    },
    bios: {
        title: 'Module 9: BIOS / UEFI Firmware Setup & Configuration',
        category: 'BIOS/UEFI Configuration',
        summary: 'UEFI (Unified Extensible Firmware Interface) initializes hardware, performs POST tests, and hands control over to the Operating System bootloader.',
        objectives: [
            'Navigate BIOS setup utility using keyboard shortcuts (Del, F2, F10)',
            'Configure Boot Device Priority sequence (USB Installer -> NVMe SSD)',
            'Enable XMP (Extreme Memory Profile) / DOCP to unlock full rated RAM speeds',
            'Calibrate CPU cooling fan PWM curves and verify hardware monitor temps'
        ],
        keyConcepts: [
            { term: 'Boot Priority Order', def: 'The hierarchy of storage devices the BIOS queries to locate a valid OS bootloader (e.g. bootmgfw.efi or GRUB).' },
            { term: 'XMP (Extreme Memory Profile)', def: 'Intel/AMD pre-configured high-frequency RAM timings profile stored on the memory SPD EEPROM chip.' },
            { term: 'Hardware Monitor (H/W Monitor)', def: 'Real-time telemetry showing CPU core temperatures, fan RPM speeds, and 12V/5V/3.3V power rails.' },
            { term: 'Secure Boot', def: 'Security standard ensuring only cryptographically signed OS bootloaders execute, blocking bootkit malware.' }
        ],
        procedure: [
            '1. In the Main/Advanced tab: verify CPU model, total recognized RAM, and system clock.',
            '2. In the AI Tweaker / OC tab: enable XMP / DOCP Profile 1.',
            '3. In the Boot tab: set Boot Option #1 to your installation media (e.g. UEFI USB Flash Drive).',
            '4. In the Monitor tab: ensure CPU temperature is below 45°C idle and fan profile is Standard/PWM.',
            '5. Press F10 to Save Changes and Exit.'
        ],
        proTips: '💡 Pro-Tip: Without enabling XMP, DDR4-3200 or DDR5-6000 RAM will run at standard JEDEC baseline speeds (2133MHz or 4800MHz).'
    },
    maintenance: {
        title: 'Module 10: Hardware Preventive Maintenance & Deep Cleaning',
        category: 'Preventive Maintenance',
        summary: 'Regular maintenance prevents thermal throttling, bearing failure, and electrolytic capacitor degradation.',
        objectives: [
            'Safely clean dust buildup using compressed air without damaging fan bearings',
            'Remove dried thermal paste using 90%+ Isopropyl Alcohol (IPA)',
            'Inspect capacitors for bulging, doming, or electrolyte leakage'
        ],
        keyConcepts: [
            { term: 'Thermal Throttling', def: 'CPU automatic frequency down-clocking when core temperatures exceed safety thresholds (e.g. 95°C-100°C) to prevent silicon meltdown.' },
            { term: 'Back-EMF Voltage', def: 'High-speed spinning of unpowered fan blades by compressed air creates generator voltage that can feed backward into the motherboard fan header.' },
            { term: 'Capacitor Doming', def: 'Electrolytic capacitor tops bulging upward due to internal overheating and gas expansion, indicating impending power circuit failure.' }
        ],
        procedure: [
            '1. Disconnect AC mains, turn off PSU switch, and discharge capacitors.',
            '2. Hold fan blades stationary with a finger or zip tie while blowing canned compressed air in short bursts.',
            '3. Clean heatsink fins and use 90%+ Isopropyl Alcohol with microfiber wipe to clean old thermal paste.',
            '4. Re-apply a small pea-sized drop of thermal paste and remount cooler with balanced diagonal screw pressure.'
        ],
        proTips: '⚠️ Pro-Tip: Never use a standard household vacuum cleaner inside a PC chassis—the nozzle creates immense static charge that can zap chips!'
    },
    troubleshooting: {
        title: 'Module 11: Hardware Fault Isolation & Diagnostic Tree',
        category: 'Troubleshooting & Diagnostics',
        summary: 'Systematic troubleshooting isolates faults from simplest (cables, power switches) to complex (motherboard, RAM, GPU, thermal throttling).',
        objectives: [
            'Isolate No-Power, No-POST, and No-Video conditions using a scientific elimination method',
            'Interpret Motherboard Debug 7-Segment Hex codes and speaker beep codes',
            'Diagnose sudden thermal shutdown causes (unpeeled cooler film, failed pump)'
        ],
        keyConcepts: [
            { term: 'POST (Power-On Self Test)', def: 'Initial diagnostic routine executed by BIOS firmware on boot testing CPU, RAM, Video, and Storage.' },
            { term: 'POST Debug Codes', def: 'Hexadecimal codes (e.g. 55 = No RAM detected, 00/D0 = CPU fault, d6 = No GPU output, A2 = Drive detect) displayed on motherboard 2-digit LED.' },
            { term: 'Breadboarding (Minimal Bench Boot)', def: 'Testing only essential components (PSU, Motherboard, CPU, 1 RAM stick) outside the chassis to eliminate short-circuits.' }
        ],
        procedure: [
            '1. Check AC wall power, surge protector, and PSU rocker switch.',
            '2. Inspect Front Panel power switch connector on motherboard header pins.',
            '3. Check motherboard 4-LED debug array (CPU, DRAM, VGA, BOOT) or 7-segment hex display.',
            '4. For RAM errors (Code 55 / continuous beeps): test one RAM stick in slot A2, then test another.',
            '5. For sudden thermal shutdowns: dismount cooler and check for unpeeled plastic protective film on the copper cold plate.'
        ],
        proTips: '💡 Pro-Tip: 80% of "dead PC" reports are caused by a switched-off PSU rocker switch, loose power cords, or unseated front panel headers.'
    },
    reporting: {
        title: 'Module 12: Professional Service Repair & Maintenance Log',
        category: 'Service Audit & Reporting',
        summary: 'Accurate technical documentation ensures audit compliance, customer transparency, and consistent repair tracking in enterprise IT environments.',
        objectives: [
            'Document initial customer fault symptoms clearly and objectively',
            'Detail step-by-step diagnostic procedures, findings, and root causes',
            'Itemize replaced components and verify safety compliance before sign-off'
        ],
        keyConcepts: [
            { term: 'Service Audit Log', def: 'Formal record capturing device serial, symptoms reported, technician diagnostics, corrective actions, and parts used.' },
            { term: 'Root Cause Analysis', def: 'Identifying the underlying failure mechanism rather than just fixing superficial symptoms.' }
        ],
        procedure: [
            '1. Fill in Fault Reported and Observed Symptoms.',
            '2. Detail Diagnostic Steps Performed and Specific Findings.',
            '3. Record Corrective Actions, Replaced Parts, and Safety Measures.',
            '4. Provide Preventive Recommendations for the customer or system administrator.'
        ],
        proTips: '📝 Pro-Tip: Always specify safety precautions followed in your report to ensure liability protection and service quality verification.'
    }
};

export default function LabSandbox({ assignment, lab, activeAttempt, completedAttempts, isAvailable = true, isExpired = false }) {
    const componentQuestionsList = lab.component_questions || lab.componentQuestions || [];
    const hotspotQuestionsList = lab.hotspot_questions || lab.hotspotQuestions || [];
    const assemblyStepsList = lab.assembly_steps || lab.assemblySteps || [];
    const troubleshootingScenariosList = lab.troubleshooting_scenarios || lab.troubleshootingScenarios || [];

    // Active Tab in Workspace: 'simulator' or 'lesson'
    const [viewMode, setViewMode] = useState('simulator'); // 'simulator' | 'lesson'
    const [showExplainerModal, setShowExplainerModal] = useState(false);

    const startForm = useForm();
    const submitForm = useForm({
        answers: {},
        report: {
            fault_reported: '',
            symptoms_observed: '',
            diagnostic_steps: '',
            findings: '',
            corrective_action: '',
            parts_replaced: '',
            safety_precautions: '',
            recommendations: ''
        }
    });

    // Component ID / Hotspot state
    const [compAnswers, setCompAnswers] = useState({});
    const [activeHotspotId, setActiveHotspotId] = useState(null);
    const [shuffledQuestions, setShuffledQuestions] = useState([]);

    // Assembly Sequence state
    const [sortedSteps, setSortedSteps] = useState([]);
    const [placedZones, setPlacedZones] = useState({});

    // Troubleshooting state
    const [checkedSteps, setCheckedSteps] = useState([]);
    const [conclusion, setConclusion] = useState('');

    // BIOS Simulator State
    const [biosTab, setBiosTab] = useState('main'); // 'main', 'advanced', 'boot', 'monitor', 'exit'
    const [biosSettings, setBiosSettings] = useState({
        boot_priority: ['UEFI USB Flash Drive (32GB)', 'NVMe Samsung 980 PRO 1TB', 'Windows Boot Manager', 'SATA Hard Drive 2TB'],
        xmp_enabled: false,
        xmp_profile: 'Disabled',
        fan_profile: 'Standard (PWM)',
        secure_boot: true,
        cpu_temp: 38,
        cpu_voltage: '1.22V',
        dram_freq: '2133 MHz'
    });

    // Cable & Pinout Simulator State
    const [cableMappings, setCableMappings] = useState({});
    const [selectedCable, setSelectedCable] = useState(null);

    // POST Beep / Hex Diagnostics Simulator State
    const [diagnosticAnswers, setDiagnosticAnswers] = useState({
        post_code_55: '',
        post_code_00: '',
        post_code_d6: '',
        post_code_a2: '',
        beep_1long_2short: '',
        beep_continuous: ''
    });

    // Get current lab's lesson guide
    const getLabLesson = () => {
        const type = lab.type || '';
        const title = (lab.title || '').toLowerCase();

        if (type === 'bios_config' || title.includes('bios') || title.includes('uefi')) {
            return LESSON_EXPLAINERS.bios;
        }
        if (type === 'cable_pinout' || title.includes('power supply') || title.includes('pinout') || title.includes('psu')) {
            return LESSON_EXPLAINERS.cabling;
        }
        if (type === 'beep_code_diagnostic' || title.includes('beep') || title.includes('hex code')) {
            return LESSON_EXPLAINERS.troubleshooting;
        }
        if (type === 'repair_report' || title.includes('repair report') || title.includes('audit')) {
            return LESSON_EXPLAINERS.reporting;
        }
        if (type === 'preventive_maintenance' || title.includes('maintenance') || title.includes('cleaning')) {
            return LESSON_EXPLAINERS.maintenance;
        }
        if (type === 'troubleshooting' || title.includes('diagnose') || title.includes('troubleshoot')) {
            return LESSON_EXPLAINERS.troubleshooting;
        }
        if (type === 'motherboard_hotspot' || title.includes('motherboard') || title.includes('hotspot')) {
            return LESSON_EXPLAINERS.motherboard;
        }
        if (title.includes('safety') || title.includes('esd')) {
            return LESSON_EXPLAINERS.safety_esd;
        }
        if (type === 'assembly_sequence' || type === 'drag_drop_build' || title.includes('assembly') || title.includes('chassis')) {
            return LESSON_EXPLAINERS.assembly;
        }
        return LESSON_EXPLAINERS.components;
    };

    const currentLesson = getLabLesson();

    useEffect(() => {
        if (lab.type === 'motherboard_hotspot' && hotspotQuestionsList.length > 0) {
            setActiveHotspotId(hotspotQuestionsList[0].id);
        }

        if ((lab.type === 'assembly_sequence' || lab.type === 'drag_drop_build' || lab.type === 'preventive_maintenance') && assemblyStepsList.length > 0) {
            const shuffled = [...assemblyStepsList].sort(() => Math.random() - 0.5);
            setSortedSteps(shuffled);
            const initialIds = shuffled.map(s => s.id);
            submitForm.setData('answers', initialIds);
        }

        if (lab.type === 'component_id' && componentQuestionsList.length > 0) {
            const formatted = componentQuestionsList.map(q => {
                const allNames = Array.from(new Set([q.correct_name, ...(q.options || [])])).sort();
                const allFuncs = Array.from(new Set([q.correct_function, ...(q.function_options || [])])).sort();
                return {
                    ...q,
                    nameChoices: allNames,
                    funcChoices: allFuncs
                };
            });
            setShuffledQuestions(formatted);
        }
    }, [lab]);

    const handleStartLab = () => {
        startForm.post(route('trainee.labs.start', assignment.id));
    };

    const handleTraineeBoardClick = (e) => {
        if (!activeHotspotId) {
            alert('Please select a target label from the sidebar first.');
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const updated = {
            ...compAnswers,
            [activeHotspotId]: {
                x: Math.round(x * 10) / 10,
                y: Math.round(y * 10) / 10
            }
        };
        setCompAnswers(updated);
        submitForm.setData('answers', updated);

        const currentIndex = hotspotQuestionsList.findIndex(h => h.id === activeHotspotId);
        if (currentIndex !== -1 && currentIndex < hotspotQuestionsList.length - 1) {
            setActiveHotspotId(hotspotQuestionsList[currentIndex + 1].id);
        }
    };

    const handleHotspotDrop = (e) => {
        e.preventDefault();
        const hotspotIdStr = e.dataTransfer.getData('text/plain');
        if (!hotspotIdStr) return;

        const hId = parseInt(hotspotIdStr, 10);
        const hotspotObj = hotspotQuestionsList.find(h => h.id === hId);
        if (!hotspotObj) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const updated = {
            ...compAnswers,
            [hId]: {
                x: Math.round(x * 10) / 10,
                y: Math.round(y * 10) / 10
            }
        };
        setCompAnswers(updated);
        submitForm.setData('answers', updated);
        setActiveHotspotId(hId);
    };

    const handleSelectComponentName = (qId, name) => {
        const updated = {
            ...compAnswers,
            [qId]: {
                ...(compAnswers[qId] || {}),
                name: name
            }
        };
        setCompAnswers(updated);
        submitForm.setData('answers', updated);
    };

    const handleSelectComponentFunction = (qId, func) => {
        const updated = {
            ...compAnswers,
            [qId]: {
                ...(compAnswers[qId] || {}),
                function: func
            }
        };
        setCompAnswers(updated);
        submitForm.setData('answers', updated);
    };

    const handleMoveStep = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= sortedSteps.length) return;
        const updated = [...sortedSteps];
        const temp = updated[fromIndex];
        updated[fromIndex] = updated[toIndex];
        updated[toIndex] = temp;
        setSortedSteps(updated);

        const newIdsOrder = updated.map(s => s.id);
        submitForm.setData('answers', newIdsOrder);
    };

    const getComponentDetails = (instruction) => {
        const text = instruction.toLowerCase();
        if (text.includes('motherboard') || text.includes('tray')) {
            return { zone: 'Motherboard Tray', img: '/images/motherboard_layout.png', title: 'ATX Motherboard' };
        }
        if (text.includes('cpu')) {
            return { zone: 'CPU Socket', img: '/images/cpu_processor.png', title: 'Intel Core i7 CPU' };
        }
        if (text.includes('ram') || text.includes('dimm')) {
            return { zone: 'RAM Slots', img: '/images/ram_module.png', title: '8GB DDR4 RAM Stick' };
        }
        if (text.includes('psu') || text.includes('power') || text.includes('supply')) {
            return { zone: 'PSU Compartment', img: '/images/power_supply_unit.png', title: '500W Power Supply (PSU)' };
        }
        if (text.includes('hard') || text.includes('drive') || text.includes('storage') || text.includes('sata') || text.includes('hdd') || text.includes('ssd') || text.includes('cage') || text.includes('bay')) {
            return { zone: 'Storage Cage', img: '/images/hard_drive.png', title: '1TB SATA Hard Drive' };
        }
        return { zone: 'Chassis Mount', img: '', title: 'Component Part' };
    };

    const handleDropOnZone = (e, zoneName) => {
        e.preventDefault();
        const stepId = e.dataTransfer.getData('text/plain');
        const stepObj = assemblyStepsList.find(s => s.id.toString() === stepId);
        if (!stepObj) return;

        const details = getComponentDetails(stepObj.instruction);
        if (details.zone !== zoneName) {
            alert(`Incorrect slot! You cannot mount a ${details.title} into the ${zoneName}.`);
            return;
        }

        if ((zoneName === 'CPU Socket' || zoneName === 'RAM Slots') && !placedZones['Motherboard Tray']) {
            alert(`Safety protocol violation: You must mount the ATX Motherboard Tray inside the chassis first before inserting chips.`);
            return;
        }

        const updatedZones = {
            ...placedZones,
            [zoneName]: stepObj
        };
        setPlacedZones(updatedZones);

        const currentPlaced = Object.values(updatedZones);
        const remaining = assemblyStepsList.filter(s => !currentPlaced.some(p => p.id === s.id));
        const fullSequence = [...currentPlaced, ...remaining];
        
        const newIdsOrder = fullSequence.map(s => s.id);
        submitForm.setData('answers', newIdsOrder);
    };

    const handleCheckTroubleStep = (stepName) => {
        if (checkedSteps.includes(stepName)) return;
        const updated = [...checkedSteps, stepName];
        setCheckedSteps(updated);
        
        submitForm.setData('answers', {
            checked_steps: updated,
            conclusion: conclusion
        });
    };

    const handleSelectConclusion = (selectedConclusion) => {
        setConclusion(selectedConclusion);
        submitForm.setData('answers', {
            checked_steps: checkedSteps,
            conclusion: selectedConclusion
        });
    };

    const handleConnectCable = (cableKey, headerKey) => {
        const updated = { ...cableMappings, [cableKey]: headerKey };
        setCableMappings(updated);
        setSelectedCable(null);
        submitForm.setData('answers', { mappings: updated });
    };

    const handleDisconnectCable = (cableKey) => {
        const updated = { ...cableMappings };
        delete updated[cableKey];
        setCableMappings(updated);
        submitForm.setData('answers', { mappings: updated });
    };

    const handleBiosBootPriorityMove = (idx, direction) => {
        const list = [...biosSettings.boot_priority];
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= list.length) return;
        const temp = list[idx];
        list[idx] = list[targetIdx];
        list[targetIdx] = temp;
        
        const updated = { ...biosSettings, boot_priority: list };
        setBiosSettings(updated);
        submitForm.setData('answers', updated);
    };

    const handleToggleXMP = () => {
        const nextState = !biosSettings.xmp_enabled;
        const updated = {
            ...biosSettings,
            xmp_enabled: nextState,
            xmp_profile: nextState ? 'Profile 1 (DDR4-3200MHz)' : 'Disabled',
            dram_freq: nextState ? '3200 MHz' : '2133 MHz'
        };
        setBiosSettings(updated);
        submitForm.setData('answers', updated);
    };

    const handleSelectFanProfile = (profile) => {
        const updated = { ...biosSettings, fan_profile: profile };
        setBiosSettings(updated);
        submitForm.setData('answers', updated);
    };

    const handleToggleSecureBoot = () => {
        const updated = { ...biosSettings, secure_boot: !biosSettings.secure_boot };
        setBiosSettings(updated);
        submitForm.setData('answers', updated);
    };

    const handleDiagnosticChange = (key, val) => {
        const updated = { ...diagnosticAnswers, [key]: val };
        setDiagnosticAnswers(updated);
        submitForm.setData('answers', updated);
    };

    const handleSubmitLab = (e) => {
        e.preventDefault();
        
        if (lab.type === 'component_id' && Object.keys(compAnswers).length < componentQuestionsList.length) {
            if (!confirm('You have unanswered questions. Are you sure you want to submit?')) {
                return;
            }
        }

        submitForm.post(route('trainee.labs.submit', activeAttempt.id), {
            onSuccess: () => {
                alert('Lab submitted successfully!');
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex rounded bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                                {lab.type.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-slate-400">
                                {lab.module?.course?.title} &raquo; {lab.module?.title}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold leading-tight text-slate-800 dark:text-slate-100 mt-1">
                            {lab.title}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode('simulator')}
                                className={`rounded-md px-3 py-1 text-xs font-bold transition flex items-center gap-1.5 ${
                                    viewMode === 'simulator'
                                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                🔬 Workstation Simulator
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('lesson')}
                                className={`rounded-md px-3 py-1 text-xs font-bold transition flex items-center gap-1.5 ${
                                    viewMode === 'lesson'
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                📖 Lesson Guide & Theory
                            </button>
                        </div>

                        <Link
                            href={route('trainee.dashboard')}
                            className="rounded-lg bg-slate-200 dark:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Sandbox - ${lab.title}`} />

            <div className="py-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-65px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* SECTION: Lesson Explainer Tab View */}
                    {viewMode === 'lesson' && (
                        <div className="space-y-6 max-w-5xl mx-auto">
                            <div className="overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 dark:from-slate-900 dark:via-slate-850 dark:to-indigo-950/20 p-8 shadow-sm">
                                <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-4 mb-6">
                                    <div>
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">
                                            {currentLesson.category}
                                        </span>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                            {currentLesson.title}
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('simulator')}
                                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 shadow-md transition"
                                    >
                                        Return to Simulator &rarr;
                                    </button>
                                </div>

                                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium mb-8">
                                    {currentLesson.summary}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-5 border border-slate-200/60 dark:border-slate-700 shadow-sm">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
                                            <span>🎯</span> Core Learning Objectives
                                        </h4>
                                        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                                            {currentLesson.objectives.map((obj, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-indigo-500 font-bold shrink-0">✓</span>
                                                    <span>{obj}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-5 border border-slate-200/60 dark:border-slate-700 shadow-sm">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                                            <span>🛠️</span> Standard Operating Procedure
                                        </h4>
                                        <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                                            {currentLesson.procedure.map((step, i) => (
                                                <li key={i} className="leading-relaxed">
                                                    {step}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Hardware Terms & Technical Definitions
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentLesson.keyConcepts.map((item, i) => (
                                            <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
                                                <span className="font-bold text-xs text-indigo-900 dark:text-indigo-300 block mb-1">
                                                    {item.term}
                                                </span>
                                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                                                    {item.def}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 text-xs font-medium">
                                    {currentLesson.proTips}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION: Simulator Workstation */}
                    {viewMode === 'simulator' && (
                        <>
                            {!activeAttempt && (
                                <div className="max-w-2xl mx-auto space-y-6">
                                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-8 shadow-md">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Initialize Simulator Configuration
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('lesson')}
                                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                            >
                                                📖 View Lesson Notes First
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                            You are about to start the practical assessment lab. Please read all guidelines, prepare your virtual workstation, and observe appropriate safety/ESD protocols.
                                        </p>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-6 text-xs border-y border-slate-100 dark:border-slate-800 py-4 text-slate-600 dark:text-slate-400">
                                            <div>
                                                <span className="font-semibold block text-slate-400">Lab Category:</span>
                                                <span className="font-medium text-slate-800 dark:text-slate-200 uppercase tracking-wider">{lab.type.replace('_', ' ')}</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold block text-slate-400">Passing Criteria:</span>
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{lab.passing_score}% Score</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold block text-slate-400">Time Limit:</span>
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{lab.time_limit ? `${lab.time_limit} Minutes` : 'None'}</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold block text-slate-400">Attempts Made:</span>
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{completedAttempts.length} Run(s)</span>
                                            </div>
                                        </div>

                                        {!isAvailable && (
                                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-semibold space-y-1">
                                                <div className="font-bold flex items-center gap-1.5 text-sm">
                                                    <span>⚠️</span>
                                                    <span>{isExpired ? 'Simulation Lab Expired' : 'Lab Temporarily Inactive'}</span>
                                                </div>
                                                <p>
                                                    {isExpired
                                                        ? `This practical simulator closed on ${new Date(lab.expires_at).toLocaleString()} and is no longer taking new submissions.`
                                                        : 'This simulation lab is currently deactivated by the instructor.'}
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleStartLab}
                                            disabled={startForm.processing || !isAvailable}
                                            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 py-3 text-sm font-bold text-white transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {startForm.processing
                                                ? 'Booting Workstation...'
                                                : !isAvailable
                                                ? isExpired
                                                    ? 'Lab Expired - Launch Disabled'
                                                    : 'Lab Deactivated - Launch Disabled'
                                                : 'Boot Simulator Workstation'}
                                        </button>
                                    </div>

                                    {completedAttempts.length > 0 && (
                                        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
                                                Your Historical Attempts
                                            </h4>
                                            <div className="space-y-3">
                                                {completedAttempts.map((att, index) => (
                                                    <div key={att.id} className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center text-sm">
                                                        <div>
                                                            <span className="font-semibold text-slate-800 dark:text-slate-200">Attempt #{index + 1}</span>
                                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                                Completed: {new Date(att.completed_at).toLocaleDateString()} at {new Date(att.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-sm font-bold ${att.score >= lab.passing_score ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                                {Math.round(att.score)}% Score
                                                            </span>
                                                            <div className="text-[10px] text-slate-400">
                                                                {att.score >= lab.passing_score ? 'Passed' : 'Failed'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeAttempt && (
                                <div className="space-y-6">

                                    {/* Component Identification Lab Workspace */}
                                    {lab.type === 'component_id' && (
                                        <form onSubmit={handleSubmitLab} className="space-y-8">
                                            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 mb-6">
                                                    Station 1: Identify Computer Components & Functions
                                                </h3>
                                        
                                        {shuffledQuestions.length === 0 ? (
                                            <div className="text-center py-12 text-slate-400">
                                                No component identification questions configured for this lab simulator.
                                            </div>
                                        ) : (
                                            <div className="space-y-10">
                                                {shuffledQuestions.map((q, idx) => (
                                                    <div key={q.id} className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-slate-100 dark:border-slate-800/80 pb-10 last:border-b-0 last:pb-0">
                                                        {/* Left: Graphic */}
                                                        <div className="flex flex-col items-center justify-center p-6 border rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 h-64">
                                                            {q.image_path ? (
                                                                <img
                                                                    src={q.image_path}
                                                                    alt={`Component #${idx + 1}`}
                                                                    className="max-h-full max-w-full rounded shadow-sm object-contain bg-white"
                                                                />
                                                            ) : (
                                                                <div className="text-slate-400 font-mono text-xs text-center">
                                                                    [Image Unavailable]
                                                                    <br />
                                                                    Identify based on workstation blueprint.
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Right: Choices (Name and Function) */}
                                                        <div className="lg:col-span-2 space-y-6">
                                                            {/* Part A: Name */}
                                                            <div>
                                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                                                                    Part A: Identify Component Name
                                                                </span>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {q.nameChoices.map(name => (
                                                                        <button
                                                                            key={name}
                                                                            type="button"
                                                                            onClick={() => handleSelectComponentName(q.id, name)}
                                                                            className={`p-3 rounded-lg border text-left text-xs font-semibold transition ${
                                                                                compAnswers[q.id]?.name === name
                                                                                    ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500'
                                                                                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900/50'
                                                                            }`}
                                                                        >
                                                                            {name}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Part B: Function */}
                                                            <div>
                                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                                                                    Part B: Identify Component Function
                                                                </span>
                                                                <div className="space-y-3">
                                                                    {q.funcChoices.map(func => (
                                                                        <button
                                                                            key={func}
                                                                            type="button"
                                                                            onClick={() => handleSelectComponentFunction(q.id, func)}
                                                                            className={`w-full p-3 rounded-lg border text-left text-xs font-medium transition flex items-center justify-between gap-4 ${
                                                                                compAnswers[q.id]?.function === func
                                                                                    ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500'
                                                                                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900/50'
                                                                            }`}
                                                                        >
                                                                            <span>{func}</span>
                                                                            <span className="shrink-0 font-bold">
                                                                                {compAnswers[q.id]?.function === func ? '✓' : ''}
                                                                            </span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className="text-xs text-slate-400 font-semibold">
                                            Status: Active attempt in progress...
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitForm.processing}
                                            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white transition shadow-sm disabled:opacity-50"
                                        >
                                            {submitForm.processing ? 'Evaluating answers...' : 'Submit Lab Run'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Motherboard Hotspot Lab Workspace */}
                            {lab.type === 'motherboard_hotspot' && (
                                <form onSubmit={handleSubmitLab} className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Board view */}
                                        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                                Motherboard Sandbox Workspace
                                            </h3>
                                            
                                            {lab.assets && lab.assets[0] ? (
                                                <div 
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={handleHotspotDrop}
                                                    className="relative border rounded overflow-hidden cursor-crosshair bg-slate-100"
                                                >
                                                    <img
                                                        src={lab.assets[0].file_path}
                                                        alt="Motherboard Sandbox"
                                                        className="w-full h-auto select-none"
                                                        onClick={handleTraineeBoardClick}
                                                    />
                                                    {/* Render placed pins */}
                                                    {hotspotQuestionsList.map((h, i) => {
                                                        const pos = compAnswers[h.id];
                                                        if (!pos) return null;
                                                        return (
                                                            <div
                                                                key={h.id}
                                                                style={{
                                                                    left: `${pos.x}%`,
                                                                    top: `${pos.y}%`,
                                                                    transform: 'translate(-50%, -50%)'
                                                                }}
                                                                className="absolute rounded-full border-2 border-blue-600 bg-blue-500 text-white font-extrabold text-[10px] w-6 h-6 flex items-center justify-center shadow-lg"
                                                            >
                                                                {i + 1}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-12 text-center text-slate-400">
                                                    No motherboard graphic has been uploaded for this lab yet.
                                                </div>
                                            )}
                                        </div>

                                        {/* Targets list */}
                                        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                                    Target Parts Checklist
                                                </h3>
                                                <p className="text-xs text-slate-400 mb-4">
                                                    Select a part from the list below, then click on the motherboard image to place its location marker pin.
                                                </p>
                                                <div className="space-y-2">
                                                    {hotspotQuestionsList.map((h, i) => {
                                                        const isPlaced = !!compAnswers[h.id];
                                                        const isActive = activeHotspotId === h.id;
                                                        return (
                                                            <button
                                                                key={h.id}
                                                                type="button"
                                                                draggable
                                                                onDragStart={(e) => e.dataTransfer.setData('text/plain', h.id.toString())}
                                                                onClick={() => setActiveHotspotId(h.id)}
                                                                className={`w-full p-3 rounded-lg border text-left text-xs font-semibold flex justify-between items-center transition cursor-grab active:cursor-grabbing ${
                                                                    isActive
                                                                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-400'
                                                                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50'
                                                                }`}
                                                            >
                                                                <span>{i + 1}. {h.label}</span>
                                                                <span className={`text-[10px] font-bold uppercase ${
                                                                    isPlaced ? 'text-emerald-600' : 'text-slate-400'
                                                                }`}>
                                                                    {isPlaced ? 'Placed ✓' : 'Unplaced'}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={submitForm.processing}
                                                    className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white transition shadow-sm"
                                                >
                                                    Submit Lab Run
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* Assembly Sequence & Preventive Maintenance Workspace */}
                            {(lab.type === 'assembly_sequence' || lab.type === 'preventive_maintenance') && (
                                <form onSubmit={handleSubmitLab} className="space-y-8">
                                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 mb-6">
                                            Station 2: Arrange Steps in the Correct Practical Order
                                        </h3>
                                        <p className="text-xs text-slate-400 mb-6">
                                            💡 Click the Up (▲) or Down (▼) arrow buttons on each card to sort the operations. Make sure to perform safety precautions and ESD strapping before mounting internal parts!
                                        </p>

                                        <div className="space-y-3">
                                            {sortedSteps.map((step, idx) => (
                                                <div
                                                    key={step.id}
                                                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between gap-4 hover:border-blue-500 transition"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-300">
                                                            {idx + 1}
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                                {step.instruction}
                                                            </p>
                                                            {step.is_safety_critical && (
                                                                <span className="text-[10px] text-rose-500 font-bold uppercase mt-0.5 block">
                                                                    ⚠️ Safety Critical Action
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-1.5 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveStep(idx, idx - 1)}
                                                            disabled={idx === 0}
                                                            className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-30 text-xs font-bold"
                                                            title="Move Up"
                                                        >
                                                            ▲
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveStep(idx, idx + 1)}
                                                            disabled={idx === sortedSteps.length - 1}
                                                            className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-30 text-xs font-bold"
                                                            title="Move Down"
                                                        >
                                                            ▼
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className="text-xs text-slate-400 font-semibold">
                                            Status: Active attempt in progress...
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitForm.processing}
                                            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white transition shadow-sm"
                                        >
                                            Submit Assembly Run
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Drag-and-Drop Case Build Workspace */}
                            {lab.type === 'drag_drop_build' && (
                                <form onSubmit={handleSubmitLab} className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        
                                        {/* Left: Computer Case Blueprint Drop Zones */}
                                        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                                Computer Case Blueprint
                                            </h3>
                                            <p className="text-xs text-slate-400 mb-6">
                                                Drag components from the inventory dock on the right and drop them on their correct mounting areas.
                                            </p>

                                            <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-950 p-2 flex justify-center items-center h-[520px]">
                                                {/* Background empty chassis */}
                                                <img
                                                    src="/images/computer_chassis.png"
                                                    alt="Computer Chassis"
                                                    className="max-h-full max-w-full object-contain select-none opacity-20"
                                                />

                                                {/* Absolute overlaid drop zones */}
                                                {/* 1. Motherboard Tray (Main Board) */}
                                                <div
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => handleDropOnZone(e, 'Motherboard Tray')}
                                                    style={{ top: '10%', left: '15%', width: '45%', height: '55%' }}
                                                    className={`absolute border-2 rounded-lg flex flex-col items-center justify-center transition p-1 ${
                                                        placedZones['Motherboard Tray']
                                                            ? 'border-emerald-500 bg-emerald-950/20'
                                                            : 'border-dashed border-slate-600 bg-slate-950/40 hover:border-blue-500'
                                                    }`}
                                                >
                                                    {placedZones['Motherboard Tray'] ? (
                                                        <div className="relative w-full h-full">
                                                            <img
                                                                src="/images/motherboard_layout.png"
                                                                alt="Motherboard"
                                                                className="w-full h-full object-contain rounded"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = { ...placedZones };
                                                                    delete updated['Motherboard Tray'];
                                                                    delete updated['CPU Socket'];
                                                                    delete updated['RAM Slots'];
                                                                    setPlacedZones(updated);
                                                                }}
                                                                className="absolute top-1 right-1 rounded bg-rose-600 hover:bg-rose-500 px-1 py-0.5 text-[8px] font-bold text-white uppercase transition"
                                                            >
                                                                Remove
                                                            </button>

                                                            {/* Nested CPU Socket (Overlaid on top of Motherboard Tray) */}
                                                            <div
                                                                onDragOver={(e) => e.preventDefault()}
                                                                onDrop={(e) => handleDropOnZone(e, 'CPU Socket')}
                                                                style={{ top: '30%', left: '35%', width: '30%', height: '30%' }}
                                                                className={`absolute border-2 rounded flex flex-col items-center justify-center transition ${
                                                                    placedZones['CPU Socket']
                                                                        ? 'border-emerald-500 bg-emerald-950/50'
                                                                        : 'border-dashed border-slate-500 bg-slate-950/70 hover:border-blue-500'
                                                                }`}
                                                            >
                                                                {placedZones['CPU Socket'] ? (
                                                                    <div className="relative w-full h-full flex items-center justify-center p-1">
                                                                        <img src="/images/cpu_processor.png" alt="CPU" className="max-h-full max-w-full object-contain rounded" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const updated = { ...placedZones };
                                                                                delete updated['CPU Socket'];
                                                                                setPlacedZones(updated);
                                                                            }}
                                                                            className="absolute top-0.5 right-0.5 rounded bg-rose-600 hover:bg-rose-500 w-4 h-4 flex items-center justify-center text-[8px] font-bold text-white transition"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[8px] text-slate-400 font-bold text-center">CPU Socket</span>
                                                                )}
                                                            </div>

                                                            {/* Nested RAM Slots (Overlaid on top of Motherboard Tray) */}
                                                            <div
                                                                onDragOver={(e) => e.preventDefault()}
                                                                onDrop={(e) => handleDropOnZone(e, 'RAM Slots')}
                                                                style={{ top: '30%', left: '72%', width: '15%', height: '35%' }}
                                                                className={`absolute border-2 rounded flex flex-col items-center justify-center transition ${
                                                                    placedZones['RAM Slots']
                                                                        ? 'border-emerald-500 bg-emerald-950/50'
                                                                        : 'border-dashed border-slate-500 bg-slate-950/70 hover:border-blue-500'
                                                                }`}
                                                            >
                                                                {placedZones['RAM Slots'] ? (
                                                                    <div className="relative w-full h-full flex items-center justify-center p-1">
                                                                        <img src="/images/ram_module.png" alt="RAM" className="max-h-full max-w-full object-contain rounded" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const updated = { ...placedZones };
                                                                                delete updated['RAM Slots'];
                                                                                setPlacedZones(updated);
                                                                            }}
                                                                            className="absolute top-0.5 right-0.5 rounded bg-rose-600 hover:bg-rose-500 w-4 h-4 flex items-center justify-center text-[8px] font-bold text-white transition"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[8px] text-slate-400 font-bold text-center rotate-90">RAM DIMM</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider text-center">Motherboard Mount</span>
                                                    )}
                                                </div>

                                                {/* 2. PSU Compartment */}
                                                <div
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => handleDropOnZone(e, 'PSU Compartment')}
                                                    style={{ top: '70%', left: '15%', width: '35%', height: '22%' }}
                                                    className={`absolute border-2 rounded-lg flex flex-col items-center justify-center transition p-1.5 ${
                                                        placedZones['PSU Compartment']
                                                            ? 'border-emerald-500 bg-emerald-950/20'
                                                            : 'border-dashed border-slate-600 bg-slate-950/40 hover:border-blue-500'
                                                    }`}
                                                >
                                                    {placedZones['PSU Compartment'] ? (
                                                        <div className="relative w-full h-full flex items-center justify-center">
                                                            <img src="/images/power_supply_unit.png" alt="PSU" className="max-h-full max-w-full object-contain rounded" />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = { ...placedZones };
                                                                    delete updated['PSU Compartment'];
                                                                    setPlacedZones(updated);
                                                                }}
                                                                className="absolute top-1 right-1 rounded bg-rose-600 hover:bg-rose-500 px-1 py-0.5 text-[8px] font-bold text-white uppercase transition"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider text-center">PSU Chamber</span>
                                                    )}
                                                </div>

                                                {/* 3. Storage Cage */}
                                                <div
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => handleDropOnZone(e, 'Storage Cage')}
                                                    style={{ top: '70%', left: '55%', width: '30%', height: '22%' }}
                                                    className={`absolute border-2 rounded-lg flex flex-col items-center justify-center transition p-1.5 ${
                                                        placedZones['Storage Cage']
                                                            ? 'border-emerald-500 bg-emerald-950/20'
                                                            : 'border-dashed border-slate-600 bg-slate-950/40 hover:border-blue-500'
                                                    }`}
                                                >
                                                    {placedZones['Storage Cage'] ? (
                                                        <div className="relative w-full h-full flex items-center justify-center">
                                                            <img src="/images/hard_drive.png" alt="HDD" className="max-h-full max-w-full object-contain rounded" />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = { ...placedZones };
                                                                    delete updated['Storage Cage'];
                                                                    setPlacedZones(updated);
                                                                }}
                                                                className="absolute top-1 right-1 rounded bg-rose-600 hover:bg-rose-500 px-1 py-0.5 text-[8px] font-bold text-white uppercase transition"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider text-center">Drive Bays</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Parts Inventory Dock (Draggable items with thumbnails) */}
                                        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                                    Inventory Dock
                                                </h3>
                                                <p className="text-xs text-slate-400 mb-4">
                                                    Drag and drop these items on the computer tower chassis blueprint:
                                                </p>
                                                <div className="space-y-4">
                                                    {assemblyStepsList
                                                        .filter(s => !Object.values(placedZones).some(p => p.id === s.id))
                                                        .map((step) => {
                                                            const details = getComponentDetails(step.instruction);
                                                            return (
                                                                <div
                                                                    key={step.id}
                                                                    draggable
                                                                    onDragStart={(e) => e.dataTransfer.setData('text/plain', step.id.toString())}
                                                                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 cursor-grab active:cursor-grabbing hover:border-blue-500 hover:shadow transition flex gap-3 items-center"
                                                                >
                                                                    {details.img && (
                                                                        <img
                                                                            src={details.img}
                                                                            alt={details.title}
                                                                            className="h-10 w-10 object-contain rounded bg-white p-0.5 border border-slate-200"
                                                                        />
                                                                    )}
                                                                    <div>
                                                                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                                            {details.title}
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                                                            {step.instruction}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>

                                            <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={submitForm.processing}
                                                    className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white transition shadow-sm"
                                                >
                                                    Submit Build Run
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            ) /* Drag-and-drop build close */ }

                            {/* Troubleshooting Scenario Workspace */}
                            {lab.type === 'troubleshooting' && (
                                <form onSubmit={handleSubmitLab} className="space-y-8">
                                    {troubleshootingScenariosList[0] ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            
                                            {/* Left: Scenario Context & Checklist */}
                                            <div className="lg:col-span-2 space-y-6">
                                                {/* Scenario Card */}
                                                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                                        Scenario: {troubleshootingScenariosList[0].title}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                                        {troubleshootingScenariosList[0].scenario_text}
                                                    </p>

                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                                        Observed Symptoms
                                                    </span>
                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        {(troubleshootingScenariosList[0].symptoms || []).map((symptom, sIdx) => (
                                                            <span
                                                                key={sIdx}
                                                                className="rounded bg-rose-50 border border-rose-200/50 text-rose-700 px-3 py-1 text-xs font-semibold dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                                                            >
                                                                🔴 {symptom}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                                                        Interactive Diagnostic Checklist
                                                    </span>
                                                    <p className="text-xs text-slate-400 mb-4">
                                                        💡 Click on a diagnostic check below to execute it on the hardware. Verify safety measures first!
                                                    </p>

                                                    <div className="space-y-4">
                                                        {(troubleshootingScenariosList[0].steps || []).map((step, stepIdx) => {
                                                            const isChecked = checkedSteps.includes(step.name);
                                                            return (
                                                                <div
                                                                    key={stepIdx}
                                                                    onClick={() => handleCheckTroubleStep(step.name)}
                                                                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col ${
                                                                        isChecked
                                                                            ? 'border-blue-500 bg-slate-50 dark:bg-slate-900/50'
                                                                            : 'border-slate-200 hover:border-blue-500 dark:border-slate-800 dark:hover:border-slate-700/80 bg-white dark:bg-slate-800'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                                            {stepIdx + 1}. {step.name}
                                                                        </span>
                                                                        <span className={`text-[10px] font-bold uppercase rounded px-2 py-0.5 ${
                                                                            isChecked
                                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                                                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                                                                        }`}>
                                                                            {isChecked ? 'Performed ✓' : 'Click to Inspect'}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    {isChecked && (
                                                                        <div className="mt-3 p-3 rounded bg-blue-50 dark:bg-blue-950/20 border border-blue-200/20 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                                                            <span className="font-bold text-blue-500 uppercase block mb-1">Finding:</span>
                                                                            {step.finding}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Diagnosis Conclusion */}
                                            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                                        Diagnosis & Verdict
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mb-4">
                                                        Select the final conclusion choice after completing your inspections.
                                                    </p>

                                                    <div className="space-y-3">
                                                        {[
                                                            'Disconnected Power Cable',
                                                            'Faulty Power Supply Unit (PSU)',
                                                            'Incorrectly Connected Front Panel Power Switch'
                                                        ].map((opt) => (
                                                            <button
                                                                key={opt}
                                                                type="button"
                                                                onClick={() => handleSelectConclusion(opt)}
                                                                className={`w-full p-3 rounded-lg border text-left text-xs font-semibold transition ${
                                                                    conclusion === opt
                                                                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-400'
                                                                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50'
                                                                }`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={submitForm.processing}
                                                        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white transition shadow-sm"
                                                    >
                                                        Submit Diagnostic Run
                                                    </button>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-800 border rounded-xl shadow-sm">
                                            No troubleshooting scenario configurations configured for this lab yet.
                                        </div>
                                    )}
                                </form>
                            )}

                            {/* Repair Report Lab Workspace */}
                            {lab.type === 'repair_report' && (
                                <form onSubmit={handleSubmitLab} className="space-y-8">
                                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 mb-6">
                                            Repair & Maintenance Report Form
                                        </h3>
                                        <p className="text-xs text-slate-400 mb-6">
                                            📝 Complete this detailed, structured service report summarizing the diagnosis and repair. This document will be graded by your instructor.
                                        </p>

                                        <div className="space-y-6">
                                            {/* Fault Reported & Symptoms */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                        Fault Reported
                                                    </label>
                                                    <textarea
                                                        value={submitForm.data.report.fault_reported}
                                                        onChange={e => submitForm.setData('report', { ...submitForm.data.report, fault_reported: e.target.value })}
                                                        rows="3"
                                                        required
                                                        placeholder="Describe the initial fault complaint..."
                                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent p-3 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                        Symptoms Observed
                                                    </label>
                                                    <textarea
                                                        value={submitForm.data.report.symptoms_observed}
                                                        onChange={e => submitForm.setData('report', { ...submitForm.data.report, symptoms_observed: e.target.value })}
                                                        rows="3"
                                                        required
                                                        placeholder="List observed warning signals, beeps, codes, or lights..."
                                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent p-3 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                                                    />
                                                </div>
                                            </div>

                                            {/* Diagnostic Steps & Findings */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                        Diagnostic Steps Performed
                                                    </label>
                                                    <textarea
                                                        value={submitForm.data.report.diagnostic_steps}
                                                        onChange={e => submitForm.setData('report', { ...submitForm.data.report, diagnostic_steps: e.target.value })}
                                                        rows="4"
                                                        required
                                                        placeholder="Detail step-by-step inspections (voltage test, board swapping, cable checks)..."
                                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent p-3 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                        Diagnostic Findings
                                                    </label>
                                                    <textarea
                                                        value={submitForm.data.report.findings}
                                                        onChange={e => submitForm.setData('report', { ...submitForm.data.report, findings: e.target.value })}
                                                        rows="4"
                                                        required
                                                        placeholder="What were the outcomes, faulty lines, or blown components found?"
                                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent p-3 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                                                    />
                                                </div>
                                            </div>

                                            {/* Corrective Action & Parts Replaced */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                        Corrective Action Taken
                                                    </label>
                                                    <textarea
                                                        value={submitForm.data.report.corrective_action}
                                                        onChange={e => submitForm.setData('report', { ...submitForm.data.report, corrective_action: e.target.value })}
                                                        rows="3"
                                                        required
                                                        placeholder="How was the component fixed, re-seated, or configuration adjusted?"
                                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent p-3 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                        Replacement Parts / Consumables
                                                    </label>
                                                    <textarea
                                                        value={submitForm.data.report.parts_replaced || ''}
                                                        onChange={e => submitForm.setData('report', { ...submitForm.data.report, parts_replaced: e.target.value })}
                                                        rows="3"
                                                        placeholder="Itemize replaced capacitors, RAM modules, cables, thermal paste (optional)..."
                                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent p-3 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                                                    />
                                                </div>
                                            </div>

                                            {/* Safety Precautions & Recommendations */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                        Safety Precautions Followed
                                                    </label>
                                                    <textarea
                                                        value={submitForm.data.report.safety_precautions}
                                                        onChange={e => submitForm.setData('report', { ...submitForm.data.report, safety_precautions: e.target.value })}
                                                        rows="3"
                                                        required
                                                        placeholder="List ESD protection steps, main cord disconnect, protective wear..."
                                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent p-3 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                        Trainee Recommendations
                                                    </label>
                                                    <textarea
                                                        value={submitForm.data.report.recommendations || ''}
                                                        onChange={e => submitForm.setData('report', { ...submitForm.data.report, recommendations: e.target.value })}
                                                        rows="3"
                                                        placeholder="Propose preventive schedules, backup advice, airflow checks (optional)..."
                                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent p-3 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className="text-xs text-slate-400 font-semibold">
                                            Status: Report is pending submission.
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitForm.processing}
                                            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white transition shadow-sm disabled:opacity-50"
                                        >
                                            {submitForm.processing ? 'Submitting report...' : 'Submit Maintenance Report'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* 5. BIOS / UEFI Setup Simulator */}
                            {lab.type === 'bios_config' && (
                                <form onSubmit={handleSubmitLab} className="space-y-6">
                                    <div className="overflow-hidden rounded-2xl border-4 border-slate-700 bg-slate-950 text-slate-200 font-mono shadow-2xl">
                                        <div className="bg-blue-900 px-6 py-3 flex items-center justify-between text-xs font-bold text-white border-b-2 border-blue-700">
                                            <div className="flex items-center gap-3">
                                                <span className="text-amber-300">UEFI BIOS UTILITY</span>
                                                <span className="text-slate-300 text-[10px]">v2.40 (x64) - Core i7 Processor</span>
                                            </div>
                                            <div className="text-emerald-400 text-[11px]">
                                                CPU Temp: {biosSettings.cpu_temp}°C | Vcore: {biosSettings.cpu_voltage} | RAM: {biosSettings.dram_freq}
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 px-6 py-2 flex gap-4 border-b border-slate-800 text-xs">
                                            {['main', 'advanced', 'boot', 'monitor', 'exit'].map((tab) => (
                                                <button
                                                    key={tab}
                                                    type="button"
                                                    onClick={() => setBiosTab(tab)}
                                                    className={`px-3 py-1 font-bold uppercase transition rounded ${
                                                        biosTab === tab
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-slate-400 hover:text-white'
                                                    }`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="p-8 min-h-[340px] text-xs space-y-6">
                                            {biosTab === 'main' && (
                                                <div className="space-y-4 max-w-xl">
                                                    <h4 className="text-sm font-bold text-amber-400 border-b border-slate-800 pb-1">System Overview</h4>
                                                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                                                        <span className="text-slate-400">Processor:</span>
                                                        <span className="font-bold">Intel(R) Core(TM) i7-13700K CPU @ 3.40GHz</span>
                                                        <span className="text-slate-400">Total Memory:</span>
                                                        <span className="font-bold">32768 MB (DDR4 / DDR5 Dual-Channel)</span>
                                                        <span className="text-slate-400">BIOS Version:</span>
                                                        <span>3002 x64 (American Megatrends Inc.)</span>
                                                        <span className="text-slate-400">System Language:</span>
                                                        <span>English (US)</span>
                                                    </div>
                                                </div>
                                            )}

                                            {biosTab === 'advanced' && (
                                                <div className="space-y-6 max-w-xl">
                                                    <h4 className="text-sm font-bold text-amber-400 border-b border-slate-800 pb-1">AI Tweaker & Memory Profiles</h4>
                                                    <div className="p-4 rounded bg-slate-900 border border-slate-800 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="font-bold text-white block">XMP / DOCP Memory Overclocking Profile:</span>
                                                                <span className="text-[11px] text-slate-400">Enables rated high-frequency memory timings from SPD chip</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={handleToggleXMP}
                                                                className={`px-4 py-1.5 rounded font-bold transition text-xs ${
                                                                    biosSettings.xmp_enabled
                                                                        ? 'bg-emerald-600 text-white'
                                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                                }`}
                                                            >
                                                                {biosSettings.xmp_enabled ? 'Enabled (Profile 1)' : 'Disabled'}
                                                            </button>
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                                                            Active Memory Frequency: <span className="text-amber-300 font-bold">{biosSettings.dram_freq}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {biosTab === 'boot' && (
                                                <div className="space-y-6 max-w-2xl">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-amber-400 border-b border-slate-800 pb-1 mb-2">Boot Device Priority Order</h4>
                                                        <p className="text-[11px] text-slate-400 mb-4">
                                                            Arrange boot priority so the installation media (USB/NVMe) executes on power-on. Use (▲/▼) to reorder.
                                                        </p>
                                                        <div className="space-y-2">
                                                            {biosSettings.boot_priority.map((device, idx) => (
                                                                <div key={device} className="p-3 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="w-6 h-6 rounded bg-blue-950 text-blue-300 flex items-center justify-center font-bold text-xs">
                                                                            #{idx + 1}
                                                                        </span>
                                                                        <span className="font-bold text-white">{device}</span>
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleBiosBootPriorityMove(idx, -1)}
                                                                            disabled={idx === 0}
                                                                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded disabled:opacity-20 font-bold"
                                                                        >
                                                                            ▲
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleBiosBootPriorityMove(idx, 1)}
                                                                            disabled={idx === biosSettings.boot_priority.length - 1}
                                                                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded disabled:opacity-20 font-bold"
                                                                        >
                                                                            ▼
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between p-3 rounded bg-slate-900 border border-slate-800">
                                                        <div>
                                                            <span className="font-bold text-white block">Secure Boot Mode:</span>
                                                            <span className="text-[11px] text-slate-400">Requires certified UEFI boot signatures</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={handleToggleSecureBoot}
                                                            className={`px-3 py-1 rounded font-bold text-xs ${
                                                                biosSettings.secure_boot ? 'bg-emerald-600 text-white' : 'bg-rose-700 text-white'
                                                            }`}
                                                        >
                                                            {biosSettings.secure_boot ? 'Enabled' : 'Disabled'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {biosTab === 'monitor' && (
                                                <div className="space-y-6 max-w-xl">
                                                    <h4 className="text-sm font-bold text-amber-400 border-b border-slate-800 pb-1">Hardware Monitor & Thermal Fan Control</h4>
                                                    <div className="grid grid-cols-2 gap-4 text-slate-300">
                                                        <div className="p-3 rounded bg-slate-900 border border-slate-800">
                                                            <span className="text-[11px] text-slate-400 block">CPU Temperature</span>
                                                            <span className="text-xl font-bold text-emerald-400">{biosSettings.cpu_temp}°C (Normal)</span>
                                                        </div>
                                                        <div className="p-3 rounded bg-slate-900 border border-slate-800">
                                                            <span className="text-[11px] text-slate-400 block">CPU Core Voltage</span>
                                                            <span className="text-xl font-bold text-blue-400">{biosSettings.cpu_voltage}</span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-white mb-2">CPU Fan Speed Profile Curve:</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {['Standard (PWM)', 'Silent Curve', 'Turbo Performance'].map(p => (
                                                                <button
                                                                    key={p}
                                                                    type="button"
                                                                    onClick={() => handleSelectFanProfile(p)}
                                                                    className={`p-2 rounded text-center text-xs font-bold border transition ${
                                                                        biosSettings.fan_profile === p
                                                                            ? 'border-blue-500 bg-blue-900 text-white'
                                                                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                                                                    }`}
                                                                >
                                                                    {p}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {biosTab === 'exit' && (
                                                <div className="space-y-4 max-w-xl">
                                                    <h4 className="text-sm font-bold text-amber-400 border-b border-slate-800 pb-1">Save Changes & Reboot</h4>
                                                    <p className="text-xs text-slate-300">
                                                        Review your changes before committing to CMOS NVRAM memory.
                                                    </p>
                                                    <div className="p-4 rounded bg-slate-900 border border-slate-800 space-y-2 text-[11px]">
                                                        <div>• 1st Boot Device: <span className="text-amber-300 font-bold">{biosSettings.boot_priority[0]}</span></div>
                                                        <div>• XMP Profile: <span className="text-amber-300 font-bold">{biosSettings.xmp_profile}</span></div>
                                                        <div>• Fan Profile: <span className="text-amber-300 font-bold">{biosSettings.fan_profile}</span></div>
                                                        <div>• Secure Boot: <span className="text-amber-300 font-bold">{biosSettings.secure_boot ? 'Enabled' : 'Disabled'}</span></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-blue-900 px-6 py-2.5 flex items-center justify-between text-[11px] font-bold text-slate-300 border-t-2 border-blue-700">
                                            <span>[F10: Save & Exit] [F2/Del: Setup] [F7: EZ Mode] [ESC: Exit]</span>
                                            <button
                                                type="submit"
                                                disabled={submitForm.processing}
                                                className="rounded bg-emerald-600 hover:bg-emerald-500 px-5 py-1 text-xs font-bold text-white transition shadow"
                                            >
                                                Save Changes & Submit (F10)
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* 6. Power Supply & Cable Pinouts Simulator */}
                            {lab.type === 'cable_pinout' && (
                                <form onSubmit={handleSubmitLab} className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                                                PSU Modular Cable Harnesses
                                            </h3>
                                            <p className="text-xs text-slate-400 mb-4">
                                                Select a power cable, then click its corresponding destination socket on the motherboard/components panel.
                                            </p>

                                            <div className="space-y-3">
                                                {[
                                                    { key: 'atx_24pin', name: 'ATX 24-Pin Main Cable', desc: 'Supplies +3.3V, +5V, +12V main board rails' },
                                                    { key: 'eps_8pin', name: 'EPS 8-Pin (4+4) CPU 12V', desc: 'Supplies dedicated 12V current to CPU VRMs' },
                                                    { key: 'pcie_8pin', name: 'PCIe 8-Pin (6+2) GPU Cable', desc: 'Auxiliary 12V power for dedicated graphics card' },
                                                    { key: 'sata_power', name: '15-Pin SATA Power Connector', desc: 'Power cable for 2.5" SSD and SATA hard drives' },
                                                    { key: 'pwr_sw', name: 'Front Panel "POWER SW" Jumper', desc: 'Momentary 2-pin power button switch' },
                                                    { key: 'reset_sw', name: 'Front Panel "RESET SW" Jumper', desc: 'Momentary 2-pin reset button switch' },
                                                    { key: 'hdd_led', name: 'Front Panel "HDD LED" Jumper', desc: 'Storage activity diode (+/- polarity)' }
                                                ].map(cable => {
                                                    const isConnected = !!cableMappings[cable.key];
                                                    const isSelected = selectedCable === cable.key;
                                                    return (
                                                        <div
                                                            key={cable.key}
                                                            onClick={() => setSelectedCable(isSelected ? null : cable.key)}
                                                            className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                                                                isSelected
                                                                    ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500'
                                                                    : isConnected
                                                                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200'
                                                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                                                            }`}
                                                        >
                                                            <div>
                                                                <span className="font-bold block">{cable.name}</span>
                                                                <span className="text-[10px] text-slate-400">{cable.desc}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isConnected ? (
                                                                    <>
                                                                        <span className="text-emerald-600 font-bold text-[10px]">Connected ✓</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDisconnectCable(cable.key);
                                                                            }}
                                                                            className="text-xs text-rose-500 hover:underline p-1"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                                                                        {isSelected ? 'Ready to Dock' : 'Click to Pick'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                                                Hardware Sockets & Headers
                                            </h3>
                                            <p className="text-xs text-slate-400 mb-4">
                                                Click a destination socket below while holding a selected cable to lock the connection.
                                            </p>

                                            <div className="space-y-3">
                                                {[
                                                    { key: 'atx_24pin_hdr', label: 'Motherboard 24-Pin ATX Socket', desc: 'Located on right edge of motherboard PCB' },
                                                    { key: 'eps_cpu_hdr', label: 'CPU 8-Pin EPS Socket (Top Left)', desc: 'Located near CPU VRM heatsinks' },
                                                    { key: 'gpu_pcie_hdr', label: 'GPU 8-Pin PCIe Power Header', desc: 'Located on dedicated graphics card top edge' },
                                                    { key: 'sata_ssd_hdr', label: 'Storage Drive 15-Pin Power Socket', desc: 'Located on 2.5" SSD storage drive rear' },
                                                    { key: 'fp_pwr_sw', label: 'Front Panel Header: Pins 6 & 8 (PWR_BTN)', desc: 'Motherboard lower-right jumper pin cluster' },
                                                    { key: 'fp_reset_sw', label: 'Front Panel Header: Pins 5 & 7 (RESET)', desc: 'Motherboard lower-right jumper pin cluster' },
                                                    { key: 'fp_hdd_led', label: 'Front Panel Header: Pins 1 & 3 (HDD_LED)', desc: 'Motherboard lower-right jumper pin cluster' }
                                                ].map(hdr => {
                                                    const pluggedCableKey = Object.keys(cableMappings).find(k => cableMappings[k] === hdr.key);
                                                    return (
                                                        <div
                                                            key={hdr.key}
                                                            onClick={() => {
                                                                if (selectedCable) {
                                                                    handleConnectCable(selectedCable, hdr.key);
                                                                }
                                                            }}
                                                            className={`p-3.5 rounded-xl border text-xs transition flex items-center justify-between ${
                                                                pluggedCableKey
                                                                    ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300'
                                                                    : selectedCable
                                                                    ? 'border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 cursor-pointer hover:border-blue-500'
                                                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'
                                                            }`}
                                                        >
                                                            <div>
                                                                <span className="font-bold block">{hdr.label}</span>
                                                                <span className="text-[10px] text-slate-400">{hdr.desc}</span>
                                                            </div>
                                                            <div>
                                                                {pluggedCableKey ? (
                                                                    <span className="font-bold text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded">
                                                                        Plugged: {pluggedCableKey.toUpperCase()}
                                                                    </span>
                                                                ) : selectedCable ? (
                                                                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                                                        Click to Dock
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-400">Empty</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className="text-xs text-slate-400 font-semibold">
                                            Cable harnesses connected: {Object.keys(cableMappings).length} of 7.
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitForm.processing}
                                            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white transition shadow-sm"
                                        >
                                            {submitForm.processing ? 'Evaluating pinouts...' : 'Submit Cable Harness Run'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* 7. POST Hex Codes & Beep Diagnostics Simulator */}
                            {lab.type === 'beep_code_diagnostic' && (
                                <form onSubmit={handleSubmitLab} className="space-y-8">
                                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    Hardware POST Hex Code & Speaker Beep Diagnostic Station
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Interpret 7-segment motherboard debug codes and audio beep patterns to diagnose hardware root causes.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-rose-500 font-mono text-xl font-black">
                                                <span>DEBUG LED:</span>
                                                <span className="bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900 animate-pulse">55</span>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {[
                                                { key: 'post_code_55', label: 'Motherboard Debug 7-Segment Displays Code "55"', options: ['Memory (RAM) not detected or initialization error', 'CPU Overheating Shutdown', 'Faulty Power Supply +12V rail'] },
                                                { key: 'post_code_00', label: 'Motherboard Debug Displays Code "00" or "D0"', options: ['CPU Processor failure or improper seating', 'SATA Drive cable disconnected', 'CMOS Battery dead'] },
                                                { key: 'post_code_d6', label: 'Motherboard Debug Displays Code "d6"', options: ['No console output / GPU graphics card not detected', 'Keyboard not found', 'RAM Dual-Channel frequency mismatch'] },
                                                { key: 'post_code_a2', label: 'Motherboard Debug Displays Code "A2" / "IDE Detect"', options: ['SATA / IDE device detection in progress', 'CPU VRM short circuit', 'Motherboard RGB sync failure'] },
                                                { key: 'beep_1long_2short', label: 'Chassis Speaker Emits 1 Long Beep followed by 2 Short Beeps', options: ['GPU / Display Adapter Error', 'Normal POST Success', 'Case Fan RPM low'] },
                                                { key: 'beep_continuous', label: 'Chassis Speaker Emits Continuous Rapid Beeps', options: ['RAM Memory Failure or unseated DIMM', 'Operating System Loaded', 'Audio Jack plugged in'] }
                                            ].map((q, idx) => (
                                                <div key={q.key} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                            {q.label}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                        {q.options.map((opt) => (
                                                            <button
                                                                key={opt}
                                                                type="button"
                                                                onClick={() => handleDiagnosticChange(q.key, opt)}
                                                                className={`p-3 rounded-lg border text-left text-xs font-medium transition ${
                                                                    diagnosticAnswers[q.key] === opt
                                                                        ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500 font-bold'
                                                                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                                                                }`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className="text-xs text-slate-400 font-semibold">
                                            Status: Diagnostic evaluation ready.
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitForm.processing}
                                            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white transition shadow-sm"
                                        >
                                            {submitForm.processing ? 'Evaluating diagnosis...' : 'Submit POST Diagnostics'}
                                        </button>
                                    </div>
                                </form>
                            )}

                        </div>
                            )}
                        </>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
