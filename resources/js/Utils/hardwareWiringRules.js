/**
 * Hardware Training Simulator - Wiring & Connection Rules Engine
 * Defines hardware terminals, cable types, electrical pinouts, and connection validation.
 */

export const CABLE_TYPES = {
    ATX_24PIN: {
        id: 'atx_24pin',
        name: 'ATX 24-Pin Main Power Harness',
        color: '#38bdf8', // Sky blue with braided multi-color core
        strokeWidth: 4,
        description: 'Main motherboard umbilical carrying +3.3V, +5V, +12V, -12V, +5VSB, GND, and PWR_OK.'
    },
    EPS_8PIN: {
        id: 'eps_8pin',
        name: 'EPS 8-Pin (4+4) CPU 12V Power',
        color: '#fbbf24', // Amber / Gold high current 12V
        strokeWidth: 3,
        description: 'Dedicated 12V high-amperage power rail for CPU Voltage Regulator Modules (VRMs).'
    },
    PCIE_8PIN: {
        id: 'pcie_8pin',
        name: 'PCIe 8-Pin (6+2) GPU Power',
        color: '#f97316', // Orange high power
        strokeWidth: 3,
        description: 'Auxiliary 12V power delivering up to 150W per cable for dedicated graphics cards.'
    },
    SATA_POWER: {
        id: 'sata_power',
        name: '15-Pin SATA Power Cable',
        color: '#94a3b8', // Slate grey flat ribbon
        strokeWidth: 2.5,
        description: 'Flat ribbon cable delivering +3.3V, +5V, and +12V DC power to SATA storage drives.'
    },
    SATA_DATA: {
        id: 'sata_data',
        name: 'SATA 6Gb/s Serial Data Cable',
        color: '#ef4444', // Red high-speed serial
        strokeWidth: 2,
        description: '7-Pin differential high-speed data bus connecting SATA drive to motherboard chipset.'
    },
    FP_PWR_SW: {
        id: 'fp_pwr_sw',
        name: 'Front Panel "POWER SW" Jumper',
        color: '#10b981', // Emerald green
        strokeWidth: 2,
        description: '2-Pin momentary switch header that shorts pin 6 & 8 to pull PWR_ON line to GND and trigger boot.'
    },
    FP_RESET_SW: {
        id: 'fp_reset_sw',
        name: 'Front Panel "RESET SW" Jumper',
        color: '#06b6d4', // Cyan
        strokeWidth: 2,
        description: '2-Pin momentary switch header that grounds the hardware reset line to restart system without power cycling.'
    },
    FP_HDD_LED: {
        id: 'fp_hdd_led',
        name: 'Front Panel "HDD LED" Jumper',
        color: '#eab308', // Yellow
        strokeWidth: 2,
        description: '2-Pin storage activity LED header requiring correct (+) anode and (-) cathode orientation.'
    },
    FP_PWR_LED: {
        id: 'fp_pwr_led',
        name: 'Front Panel "POWER LED" Jumper',
        color: '#22c55e', // Green
        strokeWidth: 2,
        description: '2-Pin power state LED header indicating system ACPI state (S0 active vs S3 sleep).'
    },
    FAN_PWM_4P: {
        id: 'fan_pwm_4p',
        name: '4-Pin PWM CPU Cooler Cable',
        color: '#a855f7', // Purple
        strokeWidth: 2,
        description: 'GND, +12V, Tachometer RPM sensor, and Pulse-Width Modulation speed control line.'
    }
};

/**
 * Valid terminal-to-terminal compatible pairs.
 * Maps: Source Terminal ID -> Target Terminal ID (bidirectional matching supported)
 */
export const VALID_CONNECTIONS = [
    // 1. PSU to Motherboard Main ATX
    {
        source: 'psu_out_atx24',
        target: 'mb_in_atx24',
        cableType: 'ATX_24PIN',
        name: 'ATX 24-Pin Main Power',
        critical: true
    },
    // 2. PSU to Motherboard CPU 12V EPS
    {
        source: 'psu_out_eps8',
        target: 'mb_in_eps8',
        cableType: 'EPS_8PIN',
        name: 'EPS 8-Pin CPU 12V Power',
        critical: true
    },
    // 3. PSU to Graphics Card Auxiliary PCIe
    {
        source: 'psu_out_pcie8',
        target: 'gpu_in_pcie8',
        cableType: 'PCIE_8PIN',
        name: 'PCIe 8-Pin GPU Power',
        critical: true
    },
    // 4. PSU to SATA SSD Power
    {
        source: 'psu_out_sata',
        target: 'ssd_in_power',
        cableType: 'SATA_POWER',
        name: 'SATA 15-Pin Power',
        critical: true
    },
    // 5. Motherboard SATA to SSD SATA Data
    {
        source: 'mb_out_sata_data',
        target: 'ssd_in_data',
        cableType: 'SATA_DATA',
        name: 'SATA 6Gb/s Data Cable',
        critical: true
    },
    // 6. Front Panel Power Switch to Motherboard F_PANEL
    {
        source: 'fp_pwr_sw_out',
        target: 'mb_fpanel_pwr_sw',
        cableType: 'FP_PWR_SW',
        name: 'Power Switch Header (Pins 6-8)',
        critical: true
    },
    // 7. Front Panel Reset Switch to Motherboard F_PANEL
    {
        source: 'fp_reset_sw_out',
        target: 'mb_fpanel_reset_sw',
        cableType: 'FP_RESET_SW',
        name: 'Reset Switch Header (Pins 5-7)',
        critical: false
    },
    // 8. Front Panel HDD LED to Motherboard F_PANEL
    {
        source: 'fp_hdd_led_out',
        target: 'mb_fpanel_hdd_led',
        cableType: 'FP_HDD_LED',
        name: 'HDD Activity LED Header (Pins 1-3)',
        critical: false
    },
    // 9. Front Panel Power LED to Motherboard F_PANEL
    {
        source: 'fp_pwr_led_out',
        target: 'mb_fpanel_pwr_led',
        cableType: 'FP_PWR_LED',
        name: 'Power LED Header (Pins 2-4)',
        critical: false
    },
    // 10. CPU Cooler Fan to Motherboard CPU_FAN
    {
        source: 'fan_pwm_out',
        target: 'mb_cpu_fan_hdr',
        cableType: 'FAN_PWM_4P',
        name: 'CPU Cooler 4-Pin PWM Fan',
        critical: true
    }
];

/**
 * Validates whether two handles can be legitimately interconnected.
 */
export function validateHardwareConnection(sourceHandle, targetHandle, sourceNode, targetNode) {
    if (!sourceHandle || !targetHandle) {
        return {
            allowed: false,
            message: 'Invalid terminal handle selection.'
        };
    }

    // Rule 1: No connecting to the same node (short-circuit / loopback violation)
    if (sourceNode?.id === targetNode?.id) {
        return {
            allowed: false,
            message: `Short-circuit hazard! Cannot loop cable terminals back onto the same ${sourceNode?.data?.label || 'component'}.`
        };
    }

    // Rule 2: Check matching terminal pair (bidirectional)
    const match = VALID_CONNECTIONS.find(pair => 
        (pair.source === sourceHandle && pair.target === targetHandle) ||
        (pair.target === sourceHandle && pair.source === targetHandle)
    );

    if (match) {
        const cableInfo = CABLE_TYPES[match.cableType];
        return {
            allowed: true,
            cableInfo,
            connectionName: match.name,
            critical: match.critical,
            message: `Valid connection: ${match.name}. Proper keying and voltage match confirmed.`
        };
    }

    // Rule 3: Detect specific common mistakes and provide helpful educational feedback
    // Mistake A: EPS 8-pin into PCIe 8-pin (Dangerous keying violation!)
    if (
        (sourceHandle === 'psu_out_eps8' && targetHandle === 'gpu_in_pcie8') ||
        (sourceHandle === 'psu_out_pcie8' && targetHandle === 'mb_in_eps8')
    ) {
        return {
            allowed: false,
            message: 'CRITICAL PINOUT MISMATCH: Never plug EPS 12V (CPU) cables into PCIe (GPU) sockets! While both are 8-pin, the 12V and Ground pin polarities are inverted, which can cause permanent silicon burnout.'
        };
    }

    // Mistake B: Plugging SATA Data into Power or vice-versa
    if (
        (sourceHandle.includes('sata_data') && targetHandle.includes('power')) ||
        (sourceHandle.includes('sata_power') && targetHandle.includes('data'))
    ) {
        return {
            allowed: false,
            message: 'Interface mismatch: 7-pin SATA Data cables carry high-speed differential signals, while 15-pin SATA Power connectors supply DC voltages (+3.3V, +5V, +12V).'
        };
    }

    // Mistake C: Plugging fan into front panel header
    if (sourceHandle.includes('fan') && targetHandle.includes('fpanel')) {
        return {
            allowed: false,
            message: 'Header mismatch: PWM Fans must connect to the 4-Pin CPU_FAN or SYS_FAN header, not the chassis front panel cluster.'
        };
    }

    return {
        allowed: false,
        message: 'Incompatible connection: The selected connector keying, pinout geometry, or voltage rail does not match the destination port.'
    };
}
