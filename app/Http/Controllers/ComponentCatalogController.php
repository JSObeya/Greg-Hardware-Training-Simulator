<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ComponentCatalogController extends Controller
{
    /**
     * Display the Centralized Hardware Component Inventory & Spec Catalog.
     */
    public function index(Request $request)
    {
        $category = $request->query('category', 'all');
        $search = $request->query('search', '');
        $socket = $request->query('socket', 'all');
        $brand = $request->query('brand', 'all');

        $components = $this->getHardwareCatalog();

        // Apply filters
        if ($category !== 'all') {
            $components = array_filter($components, fn($c) => $c['category'] === $category);
        }

        if ($socket !== 'all') {
            $components = array_filter($components, fn($c) => isset($c['socket']) && strtolower($c['socket']) === strtolower($socket));
        }

        if ($brand !== 'all') {
            $components = array_filter($components, fn($c) => isset($c['brand']) && strtolower($c['brand']) === strtolower($brand));
        }

        if (!empty($search)) {
            $q = strtolower($search);
            $components = array_filter($components, function($c) use ($q) {
                return str_contains(strtolower($c['name']), $q) ||
                       str_contains(strtolower($c['brand']), $q) ||
                       str_contains(strtolower($c['category']), $q) ||
                       str_contains(strtolower($c['short_desc'] ?? ''), $q) ||
                       str_contains(strtolower($c['socket'] ?? ''), $q);
            });
        }

        // Re-index array values for JSON serialization
        $components = array_values($components);

        // Stats summary
        $catalog = $this->getHardwareCatalog();
        $categoriesCount = [];
        foreach ($catalog as $item) {
            $cat = $item['category'];
            $categoriesCount[$cat] = ($categoriesCount[$cat] ?? 0) + 1;
        }

        return Inertia::render('Components/Index', [
            'components' => $components,
            'filters' => [
                'category' => $category,
                'search' => $search,
                'socket' => $socket,
                'brand' => $brand,
            ],
            'categoriesCount' => $categoriesCount,
            'totalCount' => count($catalog),
        ]);
    }

    /**
     * Curated Hardware Spec Catalog Database.
     */
    private function getHardwareCatalog(): array
    {
        return [
            // ================== PROCESSORS (CPUS) ==================
            [
                'id' => 'cpu-14900k',
                'category' => 'cpu',
                'brand' => 'Intel',
                'name' => 'Intel Core i9-14900K',
                'short_desc' => 'Flagship 24-core unlocked desktop processor with thermal velocity boost up to 6.0 GHz.',
                'socket' => 'LGA1700',
                'specs' => [
                    'Total Cores' => '24 (8 P-Cores + 16 E-Cores)',
                    'Total Threads' => '32 Threads',
                    'Base Clock' => '3.2 GHz (P-Core) / 2.4 GHz (E-Core)',
                    'Max Boost Clock' => '6.0 GHz (Thermal Velocity Boost)',
                    'Base TDP' => '125 Watts',
                    'Max Turbo Power (PL2)' => '253 Watts (Unlimited in Extreme profile)',
                    'L3 Cache' => '36 MB Intel Smart Cache',
                    'Memory Support' => 'DDR5-5600 MT/s & DDR4-3200 MT/s (Max 192GB)',
                    'PCIe Lanes' => '20 Lanes (16x PCIe 5.0 + 4x PCIe 4.0)',
                    'Integrated GPU' => 'Intel UHD Graphics 770 (32 EUs)',
                    'Lithography' => 'Intel 7 (10nm Enhanced SuperFin)',
                ],
                'diagnostic_telemetry' => [
                    'multimeter_vcore' => '1.20V - 1.45V DC (depending on load line calibration)',
                    'safe_temp_idle' => '35°C - 45°C',
                    'safe_temp_load' => '75°C - 90°C (Throttle at 100°C TjMax)',
                    'post_code_fail' => 'Code 00 (CPU not detected/seated) or 55 (Memory controller)',
                ],
                'common_failures' => [
                    'Thermal throttling and sudden downclocking if cooler is under 280mm AIO.',
                    'Vmin voltage degradation on high load without updated Intel 0x129 microcode BIOS.',
                    'LGA1700 socket pin bend causing memory channels A or B to vanish.',
                ],
                'maintenance_tips' => 'Replace thermal paste (TIM) every 18-24 months. Ensure cooler mount screws are tightened in diagonal X-pattern.',
            ],
            [
                'id' => 'cpu-7800x3d',
                'category' => 'cpu',
                'brand' => 'AMD',
                'name' => 'AMD Ryzen 7 7800X3D',
                'short_desc' => 'Premier 8-core gaming processor featuring 96MB 3D V-Cache architecture.',
                'socket' => 'AM5',
                'specs' => [
                    'Total Cores' => '8 Cores / 16 Threads',
                    'Base Clock' => '4.2 GHz',
                    'Max Boost Clock' => '5.0 GHz',
                    'Base TDP' => '120 Watts',
                    'Package Power Tracking (PPT)' => '162 Watts',
                    'L3 Cache' => '96 MB 3D V-Cache (104 MB total cache)',
                    'Memory Support' => 'DDR5-5200 MT/s (Sweet spot: DDR5-6000 CL30 EXPO)',
                    'PCIe Lanes' => '28 Lanes (24 usable PCIe 5.0 lanes)',
                    'Integrated GPU' => 'AMD Radeon Graphics (2 CUs RDNA2)',
                    'Lithography' => 'TSMC 5nm FinFET (CCD) + 6nm (IOD)',
                ],
                'diagnostic_telemetry' => [
                    'multimeter_vcore' => '1.05V - 1.25V DC (VSOC cap at 1.30V)',
                    'safe_temp_idle' => '40°C - 48°C',
                    'safe_temp_load' => '70°C - 85°C (TjMax 89°C)',
                    'post_code_fail' => 'Code 00 / Yellow Motherboard Debug LED',
                ],
                'common_failures' => [
                    'Excessive SOC voltage over 1.30V causing package bulges on older BIOS versions.',
                    'Bent pins in AM5 LGA socket during careless CPU drop-in alignment.',
                    'Memory training delay (first boot up to 3 minutes without error).',
                ],
                'maintenance_tips' => 'Keep BIOS updated for AGESA stability fixes. Enable AMD EXPO for optimal 6000MHz memory synchronization.',
            ],
            [
                'id' => 'cpu-13600k',
                'category' => 'cpu',
                'brand' => 'Intel',
                'name' => 'Intel Core i5-13600K',
                'short_desc' => 'High-performance 14-core mid-range gaming and workstation CPU.',
                'socket' => 'LGA1700',
                'specs' => [
                    'Total Cores' => '14 (6 P-Cores + 8 E-Cores)',
                    'Total Threads' => '20 Threads',
                    'Base Clock' => '3.5 GHz (P-Core) / 2.6 GHz (E-Core)',
                    'Max Boost Clock' => '5.1 GHz',
                    'Base TDP' => '125 Watts',
                    'Max Turbo Power (PL2)' => '181 Watts',
                    'L3 Cache' => '24 MB Intel Smart Cache',
                    'Memory Support' => 'DDR5-5600 & DDR4-3200 (Max 128GB)',
                    'PCIe Lanes' => '20 Lanes (PCIe 5.0/4.0)',
                    'Integrated GPU' => 'Intel UHD Graphics 770',
                    'Lithography' => 'Intel 7',
                ],
                'diagnostic_telemetry' => [
                    'multimeter_vcore' => '1.15V - 1.32V DC',
                    'safe_temp_idle' => '32°C - 40°C',
                    'safe_temp_load' => '68°C - 82°C',
                    'post_code_fail' => 'Red CPU Debug LED',
                ],
                'common_failures' => [
                    'Thermal throttling with basic stock single-tower coolers.',
                    'Failure to boot if mounted without 8-Pin EPS CPU 12V auxiliary power cable.',
                ],
                'maintenance_tips' => 'Pair with a dual-tower air cooler (e.g. Peerless Assassin 120) or 240mm AIO for sustained boost frequencies.',
            ],
            [
                'id' => 'cpu-7600x',
                'category' => 'cpu',
                'brand' => 'AMD',
                'name' => 'AMD Ryzen 5 7600X',
                'short_desc' => 'High-efficiency 6-core AM5 processor for mainstream competitive esports rigs.',
                'socket' => 'AM5',
                'specs' => [
                    'Total Cores' => '6 Cores / 12 Threads',
                    'Base Clock' => '4.7 GHz',
                    'Max Boost Clock' => '5.3 GHz',
                    'Base TDP' => '105 Watts',
                    'Package Power Tracking (PPT)' => '142 Watts',
                    'L3 Cache' => '32 MB',
                    'Memory Support' => 'DDR5 Only (Max 128GB)',
                    'PCIe Lanes' => '28 Lanes PCIe 5.0',
                    'Integrated GPU' => 'AMD Radeon Graphics (2 CUs)',
                    'Lithography' => 'TSMC 5nm FinFET',
                ],
                'diagnostic_telemetry' => [
                    'multimeter_vcore' => '1.10V - 1.35V DC',
                    'safe_temp_idle' => '38°C - 46°C',
                    'safe_temp_load' => '75°C - 90°C (Designed to boost up to 95°C target)',
                    'post_code_fail' => 'Code 00 / Amber DRAM LED if training',
                ],
                'common_failures' => [
                    'Misinterpreting 95°C boost curve as cooler failure (Zen 4 opportunistic boost design).',
                ],
                'maintenance_tips' => 'Enabling Eco Mode (65W TDP) drops temperatures by 20°C with less than 3% gaming loss.',
            ],

            // ================== MOTHERBOARDS ==================
            [
                'id' => 'mb-z790-hero',
                'category' => 'motherboard',
                'brand' => 'ASUS',
                'name' => 'ASUS ROG Maximus Z790 Hero',
                'short_desc' => 'Enthusiast E-ATX motherboard with 20+1 power stages, PCIe 5.0, and dual Thunderbolt 4.',
                'socket' => 'LGA1700',
                'form_factor' => 'ATX',
                'specs' => [
                    'Chipset' => 'Intel Z790 Express',
                    'VRM Phases' => '20+1 Teamed Power Stages (90A rating)',
                    'Memory Slots' => '4x DDR5 DIMM (Up to 192GB, 7800+ MHz OC)',
                    'PCIe Slots' => '2x PCIe 5.0 x16 (x16 or x8/x8), 1x PCIe 4.0 x16',
                    'M.2 Slots' => '5x M.2 (1x PCIe 5.0 x4 via ROG Hyper card, 4x PCIe 4.0 x4)',
                    'SATA Ports' => '6x SATA 6Gb/s',
                    'Ethernet / WiFi' => 'Intel 2.5GbE + Intel Wi-Fi 6E (802.11ax)',
                    'Audio Codec' => 'ROG SupremeFX ALC4082 + ESS ES9218 QUAD DAC',
                    'Rear I/O' => '2x Thunderbolt 4 Type-C (40Gbps), 6x USB 3.2 Gen 2, HDMI 2.1',
                    'Diagnostic Tools' => 'Q-Code 7-Segment LED, Q-LED (CPU, DRAM, VGA, BOOT), BIOS FlashBack button',
                ],
                'diagnostic_telemetry' => [
                    'multimeter_atx' => '+12V (Pin 10,11), +5V (Pin 4,6,19,20), +3.3V (Pin 1,2,12,13)',
                    'standby_rail' => '+5VSB (Pin 9 Purple Wire) constant 5.0V even when PC is OFF',
                    'cmos_battery' => 'CR2032 3.0V DC (replace if under 2.75V)',
                ],
                'common_failures' => [
                    'Code 55 / Orange DRAM LED: Memory not detected or unseated in channels A2/B2.',
                    'Code d6 / White VGA LED: Graphics card missing PCIe power or unseated latch.',
                    'Code A2 / Green BOOT LED: No bootable EFI partition located on NVMe or SATA.',
                ],
                'maintenance_tips' => 'Clean dust from VRM fin stacks using compressed air. Always seat RAM in slots 2 & 4 (A2/B2) for dual-channel signaling integrity.',
            ],
            [
                'id' => 'mb-b650-tomahawk',
                'category' => 'motherboard',
                'brand' => 'MSI',
                'name' => 'MSI MAG B650 Tomahawk WiFi',
                'short_desc' => 'Workhorse AM5 motherboard with 14+2+1 Duet Rail power system and extended heatsink.',
                'socket' => 'AM5',
                'form_factor' => 'ATX',
                'specs' => [
                    'Chipset' => 'AMD B650',
                    'VRM Phases' => '14+2+1 Phases (80A Smart Power Stage)',
                    'Memory Slots' => '4x DDR5 DIMM (Up to 192GB, 6600+ MHz OC)',
                    'PCIe Slots' => '1x PCIe 4.0 x16 (Steel Armor), 1x PCIe 4.0 x4, 1x PCIe 3.0 x1',
                    'M.2 Slots' => '3x M.2 (2x PCIe 4.0 x4 from CPU, 1x PCIe 4.0 x4 from Chipset)',
                    'SATA Ports' => '6x SATA 6Gb/s',
                    'Networking' => 'Realtek 2.5GbE LAN + AMD Wi-Fi 6E',
                    'Audio Codec' => 'Realtek ALC4080 7.1 HD Audio',
                    'Diagnostic Tools' => 'EZ Debug LED (CPU, DRAM, VGA, BOOT), Flash BIOS Button',
                ],
                'diagnostic_telemetry' => [
                    'multimeter_vcore' => 'VRM Output Inductors: 1.10V - 1.30V DC',
                    'power_headers' => 'Dual 8-Pin EPS CPU 12V connectors required for heavy loads',
                ],
                'common_failures' => [
                    'EZ Debug DRAM LED solid on first build (DDR5 memory training duration).',
                    'Front audio ground buzz if chassis front audio wire routes over GPU VRMs.',
                ],
                'maintenance_tips' => 'Ensure thermal pads on M.2 Shield Frozr heatsinks make direct contact with SSD NAND flash and controller.',
            ],

            // ================== GRAPHICS CARDS (GPUS) ==================
            [
                'id' => 'gpu-rtx4090',
                'category' => 'gpu',
                'brand' => 'NVIDIA',
                'name' => 'NVIDIA GeForce RTX 4090 24GB',
                'short_desc' => 'The ultimate Ada Lovelace GPU with 16,384 CUDA cores, 24GB GDDR6X, and DLSS 3.',
                'specs' => [
                    'Architecture' => 'Ada Lovelace (AD102-300)',
                    'CUDA Cores' => '16,384 Cores',
                    'Tensor Cores' => '512 (4th Gen AI)',
                    'RT Cores' => '128 (3rd Gen Ray Tracing)',
                    'VRAM' => '24 GB GDDR6X (Micron)',
                    'Memory Bus' => '384-bit',
                    'Memory Bandwidth' => '1,008 GB/s (21 Gbps)',
                    'Total Graphics Power (TGP)' => '450 Watts (Up to 600W with OC BIOS)',
                    'Power Connectors' => '1x 16-Pin 12VHPWR (or 4x 8-Pin PCIe adapter)',
                    'Recommended PSU' => '850W Minimum (1000W Recommended)',
                    'Outputs' => '3x DisplayPort 1.4a, 1x HDMI 2.1a',
                    'Physical Length' => '304mm - 357mm (Triple to Quad-Slot 3.5 Slot)',
                ],
                'diagnostic_telemetry' => [
                    'multimeter_12vhpwr' => '12.0V - 12.2V DC across all six top 12V terminals',
                    'safe_temp_core' => '65°C - 75°C',
                    'safe_temp_hotspot' => '80°C - 88°C (Throttle at 105°C)',
                    'safe_temp_vram' => '70°C - 85°C GDDR6X junction',
                ],
                'common_failures' => [
                    '12VHPWR connector melting if seated with less than 35mm cable bend clearance.',
                    'Black screen and fan spinning at 100% due to loose sense pins (Sense0/Sense1).',
                    'Heavy GPU sag bending motherboard PCIe x16 slot over time without support bracket.',
                ],
                'maintenance_tips' => 'Always use an anti-sag GPU support pillar. Verify 12VHPWR connector is inserted until the plastic retaining latch audibly clicks with zero gap.',
            ],
            [
                'id' => 'gpu-rtx4070ti-super',
                'category' => 'gpu',
                'brand' => 'NVIDIA',
                'name' => 'NVIDIA GeForce RTX 4070 Ti Super 16GB',
                'short_desc' => 'Enthusiast 1440p / 4K gaming card featuring 16GB VRAM on a 256-bit bus.',
                'specs' => [
                    'Architecture' => 'Ada Lovelace (AD103-275)',
                    'CUDA Cores' => '8,448 Cores',
                    'VRAM' => '16 GB GDDR6X',
                    'Memory Bus' => '256-bit',
                    'Memory Bandwidth' => '672 GB/s',
                    'Total Graphics Power (TGP)' => '285 Watts',
                    'Power Connectors' => '1x 16-Pin 12VHPWR (or 2x 8-Pin PCIe adapter)',
                    'Recommended PSU' => '700W - 750W',
                    'Outputs' => '3x DisplayPort 1.4a, 1x HDMI 2.1a',
                ],
                'diagnostic_telemetry' => [
                    'multimeter_pcie' => '12.0V DC across 8-Pin PCIe headers (Pins 1,2,3)',
                    'safe_temp_core' => '60°C - 70°C under FurMark stress',
                ],
                'common_failures' => [
                    'Using daisy-chained PCIe pigtail cable instead of two dedicated cables causes power cut-outs.',
                ],
                'maintenance_tips' => 'Always run independent, separate 8-pin cables from modular PSU to GPU adapter.',
            ],
            [
                'id' => 'gpu-rx7800xt',
                'category' => 'gpu',
                'brand' => 'AMD',
                'name' => 'AMD Radeon RX 7800 XT 16GB',
                'short_desc' => 'High-value RDNA 3 graphics card with 16GB VRAM, DisplayPort 2.1, and AV1 encode.',
                'specs' => [
                    'Architecture' => 'RDNA 3 (Navi 32 XT)',
                    'Compute Units' => '60 CUs (3,840 Stream Processors)',
                    'VRAM' => '16 GB GDDR6',
                    'Memory Bus' => '256-bit',
                    'Infinity Cache' => '64 MB 2nd Gen',
                    'Total Board Power (TBP)' => '263 Watts',
                    'Power Connectors' => '2x 8-Pin PCIe',
                    'Recommended PSU' => '700 Watts',
                    'Outputs' => '3x DisplayPort 2.1 (UHBR13.5), 1x HDMI 2.1',
                ],
                'diagnostic_telemetry' => [
                    'multimeter_pcie' => '12.0V DC (Pins 1,2,3 are +12V; Pins 4,5,6,7,8 are Ground)',
                    'safe_temp_core' => '55°C - 68°C',
                    'safe_temp_hotspot' => '78°C - 88°C',
                ],
                'common_failures' => [
                    'Driver timeouts if Windows Update overwrites AMD Adrenalin drivers with generic WHQL.',
                ],
                'maintenance_tips' => 'Disable Windows Automatic Driver Updates for display adapters to prevent driver regression.',
            ],

            // ================== POWER SUPPLIES (PSUS) ==================
            [
                'id' => 'psu-rm1000x',
                'category' => 'psu',
                'brand' => 'Corsair',
                'name' => 'Corsair RM1000x 1000W Fully Modular',
                'short_desc' => 'Tier A gold-rated power supply with 100% Japanese 105°C capacitors and Zero RPM mode.',
                'specs' => [
                    'Total Continuous Output' => '1000 Watts',
                    'Efficiency Rating' => '80 PLUS Gold (90% at 50% load)',
                    'Modularity' => 'Fully Modular Type-4 Cable System',
                    '+12V Single Rail Amperage' => '83.3 Amperes (999.6 Watts total)',
                    '+5V & +3.3V Combined Rails' => '150 Watts (25A on +5V, 25A on +3.3V)',
                    '+5VSB Standby Rail' => '3.0 Amperes (15 Watts)',
                    'Cooling Fan' => '135mm Magnetic Levitation (Zero RPM fan curve below 400W)',
                    'Protection Circuits' => 'OVP, UVP, SCP, OTP, OPP, OCP',
                    'Cable Package' => '1x ATX 24P, 3x EPS 8P (4+4), 6x PCIe 8P (6+2), 14x SATA, 4x Molex',
                    'Warranty' => '10 Years',
                ],
                'diagnostic_telemetry' => [
                    'multimeter_paperclip_test' => 'Short Green wire (PS_ON# Pin 16) to any Black wire (Ground) to trigger fan spin-up',
                    'multimeter_pg_signal' => 'Grey wire (PWR_OK Pin 8) must read +5.0V within 100-500ms after power on',
                    '+12v_tolerance' => '+11.40V to +12.60V (ATX Spec ±5%)',
                ],
                'common_failures' => [
                    'Mixing modular cables from different PSU brands (pinouts on PSU end are NOT standardized and will burn drives!).',
                    'Surge shutdown if loaded above 1250W sustained spikes without ATX 3.0 excursion headroom.',
                    'Clicking internal relay without power on when a dead short-circuit exists on a SATA drive.',
                ],
                'maintenance_tips' => 'NEVER reuse modular cables from an old power supply. Vacuum dust filter on the bottom of the chassis intake quarterly.',
            ],
            [
                'id' => 'psu-focus-850',
                'category' => 'psu',
                'brand' => 'Seasonic',
                'name' => 'Seasonic Focus GX-850 850W ATX 3.0',
                'short_desc' => 'High-reliability ATX 3.0 / PCIe 5.0 native power supply with 12V-2x6 cable.',
                'specs' => [
                    'Total Output' => '850 Watts',
                    'Efficiency' => '80 PLUS Gold & Cybenetics Platinum',
                    'Modularity' => 'Fully Modular',
                    '+12V Rail' => '70 Amperes (840 Watts)',
                    'ATX 3.0 Native' => 'Includes 1x 16-Pin 12V-2x6 (450W rated)',
                    'Protection' => 'OPP, OVP, UVP, OCP, OTP, SCP',
                    'Warranty' => '10 Years',
                ],
                'diagnostic_telemetry' => [
                    '12v_load_regulation' => 'Micro Tolerance Load Regulation (<0.5% deviation under fluctuating current)',
                ],
                'common_failures' => [
                    'Hybrid fan switch left off in upside-down PSU mounts causing thermal build-up before fan engages.',
                ],
                'maintenance_tips' => 'In standard cases with bottom air vents, orient PSU fan facing DOWN to draw cold air from underneath the chassis.',
            ],

            // ================== MEMORY (RAM) ==================
            [
                'id' => 'ram-trident-z5-32',
                'category' => 'ram',
                'brand' => 'G.Skill',
                'name' => 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000 CL30',
                'short_desc' => 'Low-latency high-speed memory kit tailored for AMD EXPO and Intel XMP 3.0 profiles.',
                'specs' => [
                    'Memory Type' => 'DDR5 288-Pin Unbuffered DIMM',
                    'Kit Capacity' => '32 GB (2x 16GB Modules)',
                    'Tested Frequency' => '6000 MT/s (PC5-48000)',
                    'Primary Timings' => 'CL30-38-38-96',
                    'Tested Voltage' => '1.35 Volts (VDD/VDDQ)',
                    'SPD Speed (JEDEC)' => '4800 MT/s at 1.10 Volts',
                    'Overclocking Profiles' => 'AMD EXPO & Intel XMP 3.0',
                    'Power Management' => 'On-Die ECC + On-Module PMIC (Power Management IC)',
                ],
                'diagnostic_telemetry' => [
                    'post_code_mem' => 'Code 55 / Orange DRAM LED indicates unseated module or unsupported sub-timings',
                    'multimeter_vref' => 'VDD/VDDQ pins read 1.35V with EXPO active, 1.10V at stock JEDEC',
                ],
                'common_failures' => [
                    'System fails to boot if memory is inserted in DIMM slots 1 & 3 instead of 2 & 4 (A2/B2).',
                    'Running 4 sticks of high-speed DDR5 causes memory controller to downclock to 4000-4400 MT/s.',
                    'BSOD "MEMORY_MANAGEMENT" or "PAGE_FAULT_IN_NONPAGED_AREA" indicating defective cell or insufficient voltage.',
                ],
                'maintenance_tips' => 'Run MemTest86 for 4 passes upon new system build to certify zero bit-flip errors before OS installation.',
            ],
            [
                'id' => 'ram-corsair-ddr4-16',
                'category' => 'ram',
                'brand' => 'Corsair',
                'name' => 'Corsair Vengeance LPX 16GB (2x8GB) DDR4-3200 CL16',
                'short_desc' => 'Low-profile DDR4 memory for legacy socket AM4 and LGA1200/LGA1700 DDR4 platforms.',
                'specs' => [
                    'Memory Type' => 'DDR4 288-Pin DIMM',
                    'Kit Capacity' => '16 GB (2x 8GB Modules)',
                    'Tested Speed' => '3200 MHz',
                    'Timings' => 'CL16-20-20-38',
                    'Voltage' => '1.35 Volts',
                    'Height' => '31mm (Ultra low-profile fits under massive air coolers)',
                ],
                'diagnostic_telemetry' => [
                    'safe_temp' => 'DDR4 operates safely up to 60°C without active airflow',
                ],
                'common_failures' => [
                    'Trainee forgetting to enable XMP in BIOS, leaving RAM running at baseline 2133 MHz.',
                ],
                'maintenance_tips' => 'Ensure retention clips on both ends of the DIMM slot snap completely locked with zero gap.',
            ],

            // ================== STORAGE (SSDS & HDDS) ==================
            [
                'id' => 'ssd-990-pro-2tb',
                'category' => 'storage',
                'brand' => 'Samsung',
                'name' => 'Samsung 990 PRO 2TB NVMe PCIe 4.0 M.2',
                'short_desc' => 'Top-tier PCIe 4.0 SSD delivering up to 7,450 MB/s sequential read performance.',
                'specs' => [
                    'Form Factor' => 'M.2 2280 (22mm wide, 80mm long)',
                    'Interface' => 'PCIe Gen 4.0 x4, NVMe 2.0',
                    'Sequential Read' => 'Up to 7,450 MB/s',
                    'Sequential Write' => 'Up to 6,900 MB/s',
                    'Random Read / Write' => '1,400,000 / 1,550,000 IOPS (4KB, QD32)',
                    'NAND Flash' => 'Samsung V-NAND 3-bit TLC (176 Layers)',
                    'DRAM Cache' => '2GB LPDDR4',
                    'Endurance (TBW)' => '1,200 Terabytes Written',
                    'Power Consumption' => 'Average: 5.5W, Maximum: 8.5W (Burst)',
                ],
                'diagnostic_telemetry' => [
                    'multimeter_m2' => '+3.3V DC power rail across M.2 pin connectors',
                    'safe_temp_nand' => '35°C - 65°C (NAND operates best warm)',
                    'safe_temp_controller' => '50°C - 75°C (Controller throttles at 82°C)',
                ],
                'common_failures' => [
                    'Removing plastic protective peel film from motherboard M.2 heatsink pad was forgotten (causes severe thermal throttling!).',
                    'Inserting into an M.2 slot that shares lanes with disabled SATA ports.',
                    'POST code A2: Drive has corrupted bootloader EFI partition.',
                ],
                'maintenance_tips' => 'ALWAYS peel the blue/clear plastic film off the motherboard M.2 heatsink before fastening the thermal plate over the SSD.',
            ],
            [
                'id' => 'hdd-barracuda-2tb',
                'category' => 'storage',
                'brand' => 'Seagate',
                'name' => 'Seagate BarraCuda 2TB 7200RPM 3.5" HDD',
                'short_desc' => 'High-capacity mechanical hard disk for secondary file storage, backups, and game libraries.',
                'specs' => [
                    'Form Factor' => '3.5-inch Desktop HDD',
                    'Interface' => 'SATA 6Gb/s (SATA III)',
                    'Rotational Speed' => '7200 RPM',
                    'Cache' => '256 MB Multi-Tier Caching (MTC)',
                    'Max Sustained Transfer' => '220 MB/s',
                    'Operating Shock' => 'Max 80 Gs (Never move or jar when platters are spinning!)',
                ],
                'diagnostic_telemetry' => [
                    'multimeter_sata_pwr' => 'Pin 1-3: +3.3V (Orange), Pin 4-6: Ground, Pin 7-9: +5V (Red), Pin 13-15: +12V (Yellow for motor spindle)',
                ],
                'common_failures' => [
                    'Repetitive rhythmic clicking sound (Click of Death) indicating read/write head assembly mechanical collision.',
                    'Moving PC chassis while drive is powered on causing head crash scratches on magnetic platters.',
                ],
                'maintenance_tips' => 'Fasten all 4 chassis drive cage screws with rubber anti-vibration grommets to reduce acoustic resonance.',
            ],

            // ================== COOLING SOLUTIONS ==================
            [
                'id' => 'cooler-nh-d15',
                'category' => 'cooling',
                'brand' => 'Noctua',
                'name' => 'Noctua NH-D15 chromax.black Dual-Tower',
                'short_desc' => 'Legendary 140mm dual-tower air cooler competing with high-end 280mm liquid coolers.',
                'specs' => [
                    'Cooler Type' => 'Dual-Tower Heatpipe Air Cooler',
                    'Heatpipes' => '6x 6mm Copper Sintered Heatpipes',
                    'Fans Included' => '2x NF-A15 HS-PWM 140mm chromax Fans',
                    'Rotational Speed' => '300 - 1500 RPM (PWM Controlled)',
                    'Max Airflow' => '140.2 m³/h (82.5 CFM per fan)',
                    'Acoustical Noise' => '19.2 - 24.6 dBA',
                    'Max TDP Dissipation' => '220+ Watts',
                    'Height with Fans' => '165 mm (Requires case with ≥165mm CPU clearance)',
                    'Weight' => '1,320 grams (with both fans mounted)',
                ],
                'diagnostic_telemetry' => [
                    'multimeter_fan_hdr' => 'Pin 1: Ground (Black), Pin 2: +12V (Yellow), Pin 3: Tachometer RPM Sensor (Green), Pin 4: PWM Speed Control (Blue)',
                ],
                'common_failures' => [
                    'Connecting CPU cooler fan into chassis SYS_FAN header instead of CPU_FAN, triggering "CPU Fan Error" alert in BIOS.',
                    'RAM clearance collision: Front 140mm fan hitting tall RGB RAM heatsinks, requiring fan to be raised or swapped.',
                ],
                'maintenance_tips' => 'Clean dust from heatpipe fins using canned air every 6 months. Apply pea-sized or 5-dot pattern of thermal paste.',
            ],
            [
                'id' => 'cooler-freezer-360',
                'category' => 'cooling',
                'brand' => 'Arctic',
                'name' => 'Arctic Liquid Freezer III 360 AIO Liquid Cooler',
                'short_desc' => 'High-performance 360mm closed-loop liquid cooler with VRM cooling fan and thick 38mm radiator.',
                'specs' => [
                    'Cooler Type' => 'All-in-One (AIO) Closed-Loop Liquid Cooler',
                    'Radiator Size' => '360mm (398 x 120 x 38mm thick)',
                    'Cold Plate' => 'Micro-skived Copper Fin Baseplate',
                    'Water Pump' => '800 - 2800 RPM (PWM controlled)',
                    'VRM Fan' => 'Built-in 60mm PWM Fan (Cooler block VRM airflow)',
                    'Radiator Fans' => '3x P12 PWM PST 120mm Pressure-Optimized Fans',
                    'Max TDP Dissipation' => '300+ Watts (Handles i9-14900K and 7950X easily)',
                ],
                'diagnostic_telemetry' => [
                    'pump_rpm' => 'Pump tachometer should read 2000-2800 RPM in BIOS H/W Monitor. 0 RPM means pump failure!',
                ],
                'common_failures' => [
                    'Mounting radiator at the bottom of the case with pump at top (traps air bubbles in pump, burning the motor).',
                    'Forgetting to peel the transparent warning sticker off the copper cold plate.',
                ],
                'maintenance_tips' => 'Always mount radiator on the top of the chassis (exhaust) or front with tube hoses entering from the bottom.',
            ],

            // ================== CHASSIS / CASES ==================
            [
                'id' => 'case-o11-evo',
                'category' => 'chassis',
                'brand' => 'Lian Li',
                'name' => 'Lian Li O11 Dynamic EVO Mid-Tower',
                'short_desc' => 'Showcase dual-chamber chassis with panoramic tempered glass and reversible layout.',
                'specs' => [
                    'Chassis Form Factor' => 'ATX Mid-Tower (Dual-Chamber Design)',
                    'Motherboard Compatibility' => 'E-ATX (under 280mm), ATX, Micro-ATX, Mini-ITX',
                    'Dimensions' => '465mm (D) x 285mm (W) x 459mm (H)',
                    'Max GPU Length Clearance' => '426 mm',
                    'Max CPU Cooler Clearance' => '167 mm',
                    'Max PSU Length' => '220 mm (Dual PSU support in rear chamber)',
                    'Radiator Clearance' => 'Top: 360mm, Side: 360mm, Bottom: 360mm',
                    'Fan Capacity' => 'Up to 10x 120mm fans or 6x 140mm fans',
                    'Front Panel I/O' => '1x USB 3.2 Gen 2 Type-C, 2x USB 3.0 Type-A, HD Audio Jack',
                    'Drive Storage' => 'Up to 6x 2.5" SSDs or 3x 3.5" HDDs',
                ],
                'diagnostic_telemetry' => [
                    'front_panel_jumpers' => 'Power SW (Pins 6,8), Reset SW (Pins 5,7), HDD LED (Pins 1,3), Power LED (Pins 2,4)',
                ],
                'common_failures' => [
                    'Standoff omission: Screwing motherboard directly to steel tray without brass risers causes catastrophic dead shorts.',
                    'Negative pressure dust accumulation when all 9 fans are oriented as exhaust without intake filters.',
                ],
                'maintenance_tips' => 'Aim for positive air pressure (more intake CFM than exhaust CFM) to keep dust from being sucked into seams.',
            ],
            [
                'id' => 'case-4000d-airflow',
                'category' => 'chassis',
                'brand' => 'Corsair',
                'name' => 'Corsair 4000D Airflow Tempered Glass',
                'short_desc' => 'High-airflow ATX case with rapid-route cable management channels and steel mesh front.',
                'specs' => [
                    'Form Factor' => 'ATX Mid-Tower',
                    'Motherboard Support' => 'ATX, Micro-ATX, Mini-ITX',
                    'Dimensions' => '453mm x 230mm x 466mm',
                    'Max GPU Length' => '360 mm',
                    'Max Cooler Height' => '170 mm',
                    'Front I/O' => '1x USB 3.1 Type-C, 1x USB 3.0 Type-A, Audio Combo',
                    'Cable Management' => 'Corsair RapidRoute system with 25mm clearance behind tray',
                ],
                'diagnostic_telemetry' => [
                    'front_panel' => 'Single unified F_PANEL connector block replaces loose jumper pins',
                ],
                'common_failures' => [
                    'Front mesh filter clogged with pet hair or dust restricting intake CFM by 60%.',
                ],
                'maintenance_tips' => 'Wash the magnetic top dust filter and pull-out bottom PSU filter in warm water every 3 months; dry thoroughly before reinstalling.',
            ],
        ];
    }
}
