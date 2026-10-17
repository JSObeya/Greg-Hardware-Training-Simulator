/**
 * Hardware Training Simulator - Real-Time Circuit & POST Simulation Engine
 * Computes electrical continuity, rail voltages, POST diagnostic LED sequence,
 * thermal gradient telemetry, and diagnostic checklists.
 */

import { VALID_CONNECTIONS } from './hardwareWiringRules';

export const PIN_VOLTAGE_LOOKUP = {
    // PSU Out / Motherboard In ATX 24-Pin
    'psu_out_atx24': { rail: '+12V / +5V / +3.3V', voltage: 12.0, spec: 'ATX 2.4 Multi-Rail (Nominal 12.0V, 5.0V, 3.3V, +5VSB)', tolerance: '±5%' },
    'mb_in_atx24': { rail: '+12V / +5V / +3.3V', voltage: 12.0, spec: 'ATX Main Connector Input Bus', tolerance: '±5%' },

    // EPS 8-Pin CPU
    'psu_out_eps8': { rail: '+12V CPU', voltage: 12.18, spec: 'Yellow/Black 12V Dedicated CPU VRM Line (Up to 336W)', tolerance: '11.4V - 12.6V' },
    'mb_in_eps8': { rail: '+12V CPU Input', voltage: 12.18, spec: 'Motherboard 8-Pin EPS 12V High-Amperage Socket', tolerance: '11.4V - 12.6V' },

    // PCIe 8-Pin GPU
    'psu_out_pcie8': { rail: '+12V PCIe Aux', voltage: 12.12, spec: 'PCIe Graphics Card Power (150W auxiliary branch)', tolerance: '11.4V - 12.6V' },
    'gpu_in_pcie8': { rail: '+12V PCIe Input', voltage: 12.12, spec: 'Discrete GPU 8-Pin Socket (Sense 0 / Sense 1 grounded)', tolerance: '11.4V - 12.6V' },

    // SATA Power & Data
    'psu_out_sata': { rail: '+12V / +5V / +3.3V', voltage: 5.04, spec: '15-Pin SATA Power Bus', tolerance: '±5%' },
    'ssd_in_power': { rail: '+5V SATA Logic', voltage: 5.04, spec: 'SSD 5V Logic Rail', tolerance: '4.75V - 5.25V' },
    'mb_out_sata_data': { rail: 'SATA 6Gb/s Serial', voltage: 0.5, spec: 'Differential LVDS data line (500mV peak-to-peak)', tolerance: 'High Frequency' },
    'ssd_in_data': { rail: 'SATA 6Gb/s Input', voltage: 0.5, spec: 'Differential Receiver Port', tolerance: 'High Frequency' },

    // Front Panel Jumpers
    'fp_pwr_sw_out': { rail: 'PWR_ON Signal', voltage: 3.3, spec: 'Pull-up 3.3V logic line pulled to 0V (GND) when pressed', tolerance: 'Logic High/Low' },
    'mb_fpanel_pwr_sw': { rail: 'PWR_BTN Header', voltage: 3.3, spec: 'Motherboard Super I/O Power Sense Pins 6 & 8', tolerance: 'Logic 3.3V' },
    'fp_reset_sw_out': { rail: 'RST Signal', voltage: 3.3, spec: 'Reset logic circuit connected to chipset reset line', tolerance: 'Logic 3.3V' },
    'mb_fpanel_reset_sw': { rail: 'RST Header', voltage: 3.3, spec: 'Pins 5 & 7 reset pulse input', tolerance: 'Logic 3.3V' },
    'fp_hdd_led_out': { rail: 'LED +5V Anode', voltage: 2.1, spec: 'Storage activity diode with series current-limiting resistor', tolerance: 'Diode forward 2.1V' },
    'mb_fpanel_hdd_led': { rail: 'LED Cathode Drain', voltage: 2.1, spec: 'Pins 1 & 3 activity indicator', tolerance: 'Forward 2.1V' },
    'fp_pwr_led_out': { rail: 'Power LED +3.3V', voltage: 2.4, spec: 'Chassis standby/active indicator diode', tolerance: 'Forward 2.4V' },
    'mb_fpanel_pwr_led': { rail: 'Power LED Header', voltage: 2.4, spec: 'Pins 2 & 4 S0/S3 power indicator', tolerance: 'Forward 2.4V' },

    // Fan PWM
    'fan_pwm_out': { rail: '+12V Fan / PWM', voltage: 12.0, spec: 'Tachometer pulse + 25kHz PWM duty cycle signal', tolerance: '12V Rail' },
    'mb_cpu_fan_hdr': { rail: 'CPU_FAN Header', voltage: 12.0, spec: 'Motherboard PWM Fan Speed Controller Port', tolerance: '12V Rail' }
};

/**
 * Main simulation evaluator.
 * Takes current nodes, edges, AC switch state, and chassis power button state.
 */
export function evaluateHardwareSimulation(nodes = [], edges = [], options = {}) {
    const {
        isAcPlugged = true,
        isPsuSwitchOn = true,
        isChassisPwrPressed = false,
        isPpeEquipped = false,
        isEsdGroundVerified = false
    } = options;

    // Helper: test if two terminals are connected via any edge
    const isConnected = (sourceHandleId, targetHandleId) => {
        return edges.some(edge => 
            (edge.sourceHandle === sourceHandleId && edge.targetHandle === targetHandleId) ||
            (edge.sourceHandle === targetHandleId && edge.targetHandle === sourceHandleId)
        );
    };

    // 1. Evaluate Cable Connections
    const hasAtx24 = isConnected('psu_out_atx24', 'mb_in_atx24');
    const hasEps8 = isConnected('psu_out_eps8', 'mb_in_eps8');
    const hasPcie8 = isConnected('psu_out_pcie8', 'gpu_in_pcie8');
    const hasSataPower = isConnected('psu_out_sata', 'ssd_in_power');
    const hasSataData = isConnected('mb_out_sata_data', 'ssd_in_data');
    const hasPwrSw = isConnected('fp_pwr_sw_out', 'mb_fpanel_pwr_sw');
    const hasResetSw = isConnected('fp_reset_sw_out', 'mb_fpanel_reset_sw');
    const hasHddLed = isConnected('fp_hdd_led_out', 'mb_fpanel_hdd_led');
    const hasPwrLed = isConnected('fp_pwr_led_out', 'mb_fpanel_pwr_led');
    const hasCpuFan = isConnected('fan_pwm_out', 'mb_cpu_fan_hdr');

    // 2. Determine Power States
    const isPsuEnergized = isAcPlugged && isPsuSwitchOn;
    const isStandbyActive = isPsuEnergized && hasAtx24; // +5VSB active on motherboard
    const isSystemRunning = isStandbyActive && hasPwrSw && isChassisPwrPressed;

    // 3. POST Diagnostic Sequence & Hex Code Determination
    let postStatus = 'OFF'; // 'OFF' | 'STANDBY' | 'CPU_CHECK' | 'DRAM_CHECK' | 'VGA_CHECK' | 'BOOT_CHECK' | 'SUCCESS' | 'FAILED'
    let postHexCode = '00';
    let postLedArray = { cpu: 'off', dram: 'off', vga: 'off', boot: 'off' };
    let postMessage = 'System is powered off. Connect AC mains and PSU harness.';

    if (!isPsuEnergized) {
        postStatus = 'OFF';
        postHexCode = '--';
        postMessage = 'No AC power supplied to PSU. Switch PSU rocker to "I" (ON).';
    } else if (!hasAtx24) {
        postStatus = 'STANDBY_MISSING';
        postHexCode = '--';
        postMessage = 'PSU energized, but main ATX 24-Pin umbilical is disconnected. Motherboard has 0V.';
    } else if (!isChassisPwrPressed) {
        postStatus = 'STANDBY';
        postHexCode = 'S5';
        postMessage = 'Motherboard in ACPI S5 Standby (+5VSB live, Power LED Amber). Press Chassis Power Button.';
    } else if (!hasPwrSw) {
        postStatus = 'STANDBY_NO_SWITCH';
        postHexCode = 'S5';
        postMessage = 'Front Panel "POWER SW" jumper is not connected to Motherboard pins 6 & 8. Cannot trigger PWR_ON.';
    } else {
        // Power button triggered! Run through POST stages
        if (!hasEps8) {
            postStatus = 'FAILED';
            postHexCode = '00';
            postLedArray = { cpu: 'red', dram: 'off', vga: 'off', boot: 'off' };
            postMessage = 'POST FAILED [Code 00 / Solid RED CPU LED]: CPU VRM voltage absent. Connect the 8-Pin (4+4) EPS 12V cable!';
        } else if (!hasCpuFan) {
            postStatus = 'WARNING_THROTTLING';
            postHexCode = 'A1';
            postLedArray = { cpu: 'amber', dram: 'off', vga: 'off', boot: 'off' };
            postMessage = 'POST WARNING [Code A1 / Amber CPU Fan]: No CPU_FAN tachometer signal detected! CPU will rapidly overheat and thermal throttle.';
        } else if (!hasPcie8) {
            postStatus = 'FAILED';
            postHexCode = 'd6';
            postLedArray = { cpu: 'green', dram: 'green', vga: 'red', boot: 'off' };
            postMessage = 'POST FAILED [Code d6 / Solid RED VGA LED]: No console output. Discrete GPU lacks auxiliary PCIe 8-pin power.';
        } else if (!hasSataPower || !hasSataData) {
            postStatus = 'FAILED';
            postHexCode = 'A2';
            postLedArray = { cpu: 'green', dram: 'green', vga: 'green', boot: 'amber' };
            postMessage = 'POST HALT [Code A2 / Amber BOOT LED]: SATA Storage device not detected. Check both SATA 15-pin power and 7-pin data cables.';
        } else {
            postStatus = 'SUCCESS';
            postHexCode = 'AA';
            postLedArray = { cpu: 'off', dram: 'off', vga: 'off', boot: 'green' };
            postMessage = 'POST SUCCESSFUL [Code AA / Green BOOT LED]: All electrical rails, CPU VRMs, GPU PCIe, and boot storage verified. System booted to UEFI OS.';
        }
    }

    // 4. Real-Time Thermal Telemetry (°C)
    let thermals = {
        psu: isPsuEnergized ? (isSystemRunning ? 38 : 28) : 22,
        cpu: isSystemRunning ? (hasCpuFan ? 42 : 98) : (isStandbyActive ? 29 : 22),
        vrm: isSystemRunning ? (hasEps8 ? 48 : 26) : (isStandbyActive ? 30 : 22),
        gpu: isSystemRunning ? (hasPcie8 ? 45 : 32) : 22,
        ssd: isSystemRunning ? (hasSataPower ? 35 : 24) : 22
    };

    // 5. Build Diagnostic Checklist
    const checklist = [
        {
            id: 'chk_atx24',
            label: 'ATX 24-Pin Main Umbilical',
            status: hasAtx24 ? 'pass' : 'fail',
            details: hasAtx24 ? 'Connected (+3.3V, +5V, +12V rails seated)' : 'Disconnected (Motherboard unpowered)'
        },
        {
            id: 'chk_eps8',
            label: 'EPS 8-Pin CPU 12V Dedicated Power',
            status: hasEps8 ? 'pass' : 'fail',
            details: hasEps8 ? 'Connected (+12V CPU VRM supply verified)' : 'Disconnected (CPU cannot initialize)'
        },
        {
            id: 'chk_pcie8',
            label: 'PCIe 8-Pin GPU Auxiliary Power',
            status: hasPcie8 ? 'pass' : 'fail',
            details: hasPcie8 ? 'Connected (150W graphics auxiliary supply active)' : 'Disconnected (GPU under-volt fault)'
        },
        {
            id: 'chk_sata_pwr',
            label: 'SATA 15-Pin Storage Power',
            status: hasSataPower ? 'pass' : 'fail',
            details: hasSataPower ? 'Connected (5V/12V storage logic active)' : 'Disconnected (SSD has no power)'
        },
        {
            id: 'chk_sata_data',
            label: 'SATA 6Gb/s Serial Data Cable',
            status: hasSataData ? 'pass' : 'fail',
            details: hasSataData ? 'Connected (Differential bus linked to chipset)' : 'Disconnected (No storage device detected)'
        },
        {
            id: 'chk_fpanel_pwr',
            label: 'Front Panel "POWER SW" Jumper',
            status: hasPwrSw ? 'pass' : 'fail',
            details: hasPwrSw ? 'Connected to pins 6 & 8 (Momentary switch circuit active)' : 'Disconnected (Chassis power button unresponsive)'
        },
        {
            id: 'chk_cpu_fan',
            label: 'CPU Cooler 4-Pin PWM Fan',
            status: hasCpuFan ? 'pass' : 'warn',
            details: hasCpuFan ? 'Connected to CPU_FAN (Active tachometer cooling RPM)' : 'Disconnected (Severe thermal throttle risk)'
        },
        {
            id: 'chk_safety_esd',
            label: 'ESD Anti-Static Grounding Protocol',
            status: isEsdGroundVerified ? 'pass' : 'warn',
            details: isEsdGroundVerified ? 'Verified: Anti-static wrist strap clipped to bare chassis metal' : 'Warning: Unverified ESD grounding strap'
        }
    ];

    // 6. Calculate Auto-Graded Score (0 - 100)
    let score = 0;
    if (hasAtx24) score += 20;
    if (hasEps8) score += 20;
    if (hasPcie8) score += 15;
    if (hasSataPower && hasSataData) score += 15;
    if (hasPwrSw) score += 10;
    if (hasCpuFan) score += 10;
    if (isEsdGroundVerified) score += 10;
    score = Math.min(100, Math.max(0, score));

    return {
        isPsuEnergized,
        isStandbyActive,
        isSystemRunning,
        postStatus,
        postHexCode,
        postLedArray,
        postMessage,
        thermals,
        checklist,
        score,
        fanRpm: isSystemRunning && hasCpuFan ? 1450 : 0
    };
}
