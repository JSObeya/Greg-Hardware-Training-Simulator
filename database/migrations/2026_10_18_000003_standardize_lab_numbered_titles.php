<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $orderedTitles = [
            1 => [
                'prefix' => 'Lab 1',
                'title' => 'Lab 1: Safety & Anti-Static ESD Protocols Workshop',
                'keywords' => ['safety', 'esd', 'anti-static'],
                'type' => 'assembly_sequence',
            ],
            2 => [
                'prefix' => 'Lab 2',
                'title' => 'Lab 2: Desktop Components Identification Workshop',
                'keywords' => ['component', 'identification'],
                'type' => 'component_id',
            ],
            3 => [
                'prefix' => 'Lab 3',
                'title' => 'Lab 3: Motherboard Hotspot & Architecture Lab',
                'keywords' => ['hotspot', 'motherboard'],
                'type' => 'motherboard_hotspot',
            ],
            4 => [
                'prefix' => 'Lab 4',
                'title' => 'Lab 4: Storage Drive Mounting & Configuration Lab',
                'keywords' => ['storage', 'drive'],
                'type' => 'assembly_sequence',
            ],
            5 => [
                'prefix' => 'Lab 5',
                'title' => 'Lab 5: Modular PSU Cable Routing & Visual Wiring Canvas',
                'keywords' => ['cable', 'wiring', 'psu'],
                'type' => 'cable_pinout',
            ],
            6 => [
                'prefix' => 'Lab 6',
                'title' => 'Lab 6: CPU Alignment & Dual-Channel RAM Installation',
                'keywords' => ['alignment', 'dual-channel', 'cpu'],
                'type' => 'assembly_sequence',
            ],
            7 => [
                'prefix' => 'Lab 7',
                'title' => 'Lab 7: Desktop Case Assembly Sequence Simulation',
                'keywords' => ['case assembly', 'desktop case'],
                'type' => 'assembly_sequence',
            ],
            8 => [
                'prefix' => 'Lab 8',
                'title' => 'Lab 8: Chassis Drag-and-Drop Components Mount Simulator',
                'keywords' => ['drag', 'chassis'],
                'type' => 'drag_drop_build',
            ],
            9 => [
                'prefix' => 'Lab 9',
                'title' => 'Lab 9: BIOS / UEFI Setup & Boot Priority Configuration',
                'keywords' => ['bios', 'uefi'],
                'type' => 'bios_config',
            ],
            10 => [
                'prefix' => 'Lab 10',
                'title' => 'Lab 10: Preventive Maintenance & Deep Cleaning Lab',
                'keywords' => ['preventive', 'maintenance', 'cleaning'],
                'type' => 'preventive_maintenance',
            ],
            11 => [
                'prefix' => 'Lab 11',
                'title' => 'Lab 11: Hardware POST Hex Code & Beep Diagnostics',
                'keywords' => ['beep', 'post', 'hex'],
                'type' => 'beep_code_diagnostic',
            ],
            12 => [
                'prefix' => 'Lab 12',
                'title' => 'Lab 12: Diagnose a Desktop That Will Not Power On',
                'keywords' => ['power on', 'will not power'],
                'type' => 'troubleshooting',
            ],
            13 => [
                'prefix' => 'Lab 13',
                'title' => 'Lab 13: Diagnose Sudden Thermal Shutdown & Overheating',
                'keywords' => ['thermal', 'shutdown', 'overheating'],
                'type' => 'troubleshooting',
            ],
            14 => [
                'prefix' => 'Lab 14',
                'title' => 'Lab 14: Service Audit Repair Report Worksheet',
                'keywords' => ['repair', 'service audit', 'report'],
                'type' => 'repair_report',
            ],
            15 => [
                'prefix' => 'Lab 15',
                'title' => 'Lab 15: Final Capstone Practical Build & Verification',
                'keywords' => ['capstone', 'final practical'],
                'type' => 'assembly_sequence',
            ],
        ];

        // 1. Direct update by ID if exists
        foreach ($orderedTitles as $id => $meta) {
            DB::table('labs')->where('id', $id)->update(['title' => $meta['title']]);
        }

        // 2. Keyword fallback for any records with matching keywords
        foreach ($orderedTitles as $id => $meta) {
            foreach ($meta['keywords'] as $kw) {
                DB::table('labs')
                    ->where('title', 'like', "%{$kw}%")
                    ->where('title', 'not like', "Lab {$id}:%")
                    ->update(['title' => $meta['title']]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse needed as titles are canonical
    }
};
