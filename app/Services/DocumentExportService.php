<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

class DocumentExportService
{
    /**
     * Export grouped labs report to PDF.
     */
    public function exportPdf(string $title, Collection $attempts, string $groupBy = 'trainee', array $meta = [])
    {
        $groupedData = $this->groupAttempts($attempts, $groupBy);
        $kpis = $this->calculateKpis($attempts);

        $pdf = Pdf::loadView('pdf.batch_report', [
            'title' => $title,
            'groupedData' => $groupedData,
            'groupBy' => $groupBy,
            'kpis' => $kpis,
            'meta' => $meta,
            'generatedAt' => Carbon::now()->format('Y-m-d H:i:s'),
        ]);

        $pdf->setPaper('a4', 'portrait');

        $filename = 'GregCo_Hardware_Labs_Report_' . Carbon::now()->format('Ymd_His') . '.pdf';
        return $pdf->download($filename);
    }

    /**
     * Export grouped labs report to Microsoft Word (.docx).
     */
    public function exportDocx(string $title, Collection $attempts, string $groupBy = 'trainee', array $meta = [])
    {
        $groupedData = $this->groupAttempts($attempts, $groupBy);
        $kpis = $this->calculateKpis($attempts);

        $docxContent = $this->buildDocxXml($title, $groupedData, $groupBy, $kpis, $meta);

        $filename = 'GregCo_Hardware_Labs_Report_' . Carbon::now()->format('Ymd_His') . '.docx';

        return response()->streamDownload(function () use ($docxContent) {
            echo $docxContent;
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Group attempts according to selected grouping key.
     */
    protected function groupAttempts(Collection $attempts, string $groupBy): array
    {
        $grouped = [];

        foreach ($attempts as $attempt) {
            $key = 'General';
            $groupTitle = 'All Labs';

            if ($groupBy === 'trainee') {
                $key = $attempt->trainee_id ?? 'unknown';
                $groupTitle = ($attempt->trainee->name ?? 'Unknown Trainee') . ' (' . ($attempt->trainee->cohort ?? 'Standard Cohort') . ')';
            } elseif ($groupBy === 'lab') {
                $key = $attempt->assignment?->lab_id ?? 'unknown';
                $groupTitle = $attempt->assignment?->lab?->display_title ?? $attempt->assignment?->lab?->title ?? 'Lab Station';
            } elseif ($groupBy === 'cohort') {
                $key = $attempt->trainee->cohort ?? 'Standard Cohort';
                $groupTitle = 'Cohort Batch: ' . $key;
            } elseif ($groupBy === 'module') {
                $mod = $attempt->assignment?->lab?->module;
                $key = $mod?->id ?? 'unknown';
                $groupTitle = ($mod?->course?->title ?? 'Course') . ' » ' . ($mod?->title ?? 'Module');
            }

            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'group_title' => $groupTitle,
                    'attempts' => [],
                ];
            }

            $score = $attempt->score !== null ? (double)$attempt->score : null;
            $passingScore = $attempt->assignment?->lab?->passing_score ?? 70;
            $isPassed = $score !== null && $score >= $passingScore;

            $grouped[$key]['attempts'][] = [
                'id' => $attempt->id,
                'trainee_name' => $attempt->trainee->name ?? 'N/A',
                'trainee_email' => $attempt->trainee->email ?? 'N/A',
                'cohort' => $attempt->trainee->cohort ?? 'N/A',
                'lab_title' => $attempt->assignment?->lab?->display_title ?? $attempt->assignment?->lab?->title ?? 'Lab Station',
                'lab_type' => ucwords(str_replace('_', ' ', $attempt->assignment?->lab?->type ?? 'Lab')),
                'is_practice' => (bool) ($attempt->assignment?->lab?->is_practice ?? false),
                'score' => $score,
                'passing_score' => $passingScore,
                'safety_score' => $attempt->scoreRecord->safety_score ?? 100,
                'status' => $attempt->status,
                'is_passed' => $isPassed,
                'completed_at' => $attempt->completed_at ? Carbon::parse($attempt->completed_at)->format('Y-m-d H:i') : 'In Progress',
            ];
        }

        return array_values($grouped);
    }

    /**
     * Compute summary KPIs for the collection.
     */
    protected function calculateKpis(Collection $attempts): array
    {
        $total = $attempts->count();
        $completed = $attempts->filter(fn($a) => in_array($a->status, ['submitted', 'graded']))->count();
        $graded = $attempts->filter(fn($a) => $a->status === 'graded' && $a->score !== null);
        $avgScore = $graded->count() > 0 ? round($graded->avg('score'), 1) : 0;
        $passedCount = $graded->filter(fn($a) => $a->score >= ($a->assignment?->lab?->passing_score ?? 70))->count();
        $passRate = $graded->count() > 0 ? round(($passedCount / $graded->count()) * 100, 1) : 0;

        return [
            'total_attempts' => $total,
            'completed' => $completed,
            'avg_score' => $avgScore,
            'pass_rate' => $passRate,
            'passed_count' => $passedCount,
        ];
    }

    /**
     * Generate in-memory OpenXML .docx zip file.
     */
    protected function buildDocxXml(string $title, array $groupedData, string $groupBy, array $kpis, array $meta): string
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'docx_');
        $zip = new ZipArchive();
        $zip->open($tempFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        // 1. [Content_Types].xml
        $contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>';
        $zip->addFromString('[Content_Types].xml', $contentTypes);

        // 2. _rels/.rels
        $rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>';
        $zip->addFromString('_rels/.rels', $rels);

        // 3. word/_rels/document.xml.rels
        $docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>';
        $zip->addFromString('word/_rels/document.xml.rels', $docRels);

        // 4. word/styles.xml
        $styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:docDefaults>
        <w:rPrDefault>
            <w:rPr>
                <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                <w:sz w:val="22"/>
                <w:color w:val="333333"/>
            </w:rPr>
        </w:rPrDefault>
    </w:docDefaults>
</w:styles>';
        $zip->addFromString('word/styles.xml', $styles);

        // 5. word/document.xml
        $docXml = $this->generateDocumentXmlBody($title, $groupedData, $groupBy, $kpis, $meta);
        $zip->addFromString('word/document.xml', $docXml);

        $zip->close();

        $content = file_get_contents($tempFile);
        @unlink($tempFile);

        return $content;
    }

    /**
     * Build the OpenXML Word Body.
     */
    protected function generateDocumentXmlBody(string $title, array $groupedData, string $groupBy, array $kpis, array $meta): string
    {
        $dateStr = Carbon::now()->format('F d, Y h:i A');
        $groupLabel = ucwords($groupBy);

        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>

    <!-- Header Title -->
    <w:p>
        <w:pPr><w:jc w:val="center"/><w:spacing w:after="100"/></w:pPr>
        <w:r>
            <w:rPr><w:b/><w:color w:val="1E3A8A"/><w:sz w:val="36"/></w:rPr>
            <w:t>GREG &amp; CO. COMPUTER HARDWARE TRAINING</w:t>
        </w:r>
    </w:p>

    <!-- Subtitle -->
    <w:p>
        <w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr>
        <w:r>
            <w:rPr><w:b/><w:color w:val="2563EB"/><w:sz w:val="26"/></w:rPr>
            <w:t>' . htmlspecialchars($title) . '</w:t>
        </w:r>
    </w:p>

    <!-- Meta Information -->
    <w:p>
        <w:pPr><w:jc w:val="center"/><w:spacing w:after="300"/></w:pPr>
        <w:r>
            <w:rPr><w:i/><w:color w:val="666666"/><w:sz w:val="18"/></w:rPr>
            <w:t>Generated on ' . $dateStr . ' | Grouped By: ' . $groupLabel . ' | Official Institutional Records</w:t>
        </w:r>
    </w:p>

    <!-- KPI Summary Table -->
    <w:tbl>
        <w:tblPr>
            <w:tblW w:w="9600" w:type="dxa"/>
            <w:jc w:val="center"/>
            <w:tblBorders>
                <w:top w:val="single" w:sz="6" w:space="0" w:color="2563EB"/>
                <w:left w:val="single" w:sz="6" w:space="0" w:color="2563EB"/>
                <w:bottom w:val="single" w:sz="6" w:space="0" w:color="2563EB"/>
                <w:right w:val="single" w:sz="6" w:space="0" w:color="2563EB"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
            </w:tblBorders>
        </w:tblPr>
        <w:tr>
            <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>TOTAL SUBMISSIONS</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>AVERAGE SCORE</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>PASSING RATIO</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>PASSED CANDIDATES</w:t></w:r></w:p></w:tc>
        </w:tr>
        <w:tr>
            <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="1E293B"/><w:sz w:val="26"/></w:rPr><w:t>' . $kpis['total_attempts'] . '</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="2563EB"/><w:sz w:val="26"/></w:rPr><w:t>' . $kpis['avg_score'] . '%</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="059669"/><w:sz w:val="26"/></w:rPr><w:t>' . $kpis['pass_rate'] . '%</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="059669"/><w:sz w:val="26"/></w:rPr><w:t>' . $kpis['passed_count'] . '</w:t></w:r></w:p></w:tc>
        </w:tr>
    </w:tbl>

    <w:p><w:pPr><w:spacing w:after="300"/></w:pPr></w:p>
';

        // Add each Group Section
        foreach ($groupedData as $group) {
            $xml .= '
    <!-- Group Heading -->
    <w:p>
        <w:pPr><w:spacing w:before="240" w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="12" w:space="4" w:color="2563EB"/></w:pBdr></w:pPr>
        <w:r>
            <w:rPr><w:b/><w:color w:val="1E3A8A"/><w:sz w:val="24"/></w:rPr>
            <w:t>📁 ' . htmlspecialchars($group['group_title']) . ' (' . count($group['attempts']) . ' records)</w:t>
        </w:r>
    </w:p>

    <!-- Group Table -->
    <w:tbl>
        <w:tblPr>
            <w:tblW w:w="9600" w:type="dxa"/>
            <w:jc w:val="center"/>
            <w:tblBorders>
                <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
            </w:tblBorders>
        </w:tblPr>
        <w:tr>
            <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:tcW w:w="2400" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Trainee / Candidate</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:tcW w:w="2800" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Lab Station</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:tcW w:w="1200" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Score</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:tcW w:w="1200" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Safety</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:tcW w:w="1000" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Outcome</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:tcW w:w="1000" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Date</w:t></w:r></w:p></w:tc>
        </w:tr>
';

            foreach ($group['attempts'] as $att) {
                $scoreStr = $att['score'] !== null ? $att['score'] . '%' : 'Pending';
                $outcomeText = $att['is_passed'] ? 'PASSED' : ($att['score'] !== null ? 'FAILED' : 'SUBMITTED');
                $outcomeColor = $att['is_passed'] ? '059669' : ($att['score'] !== null ? 'DC2626' : 'D97706');

                $xml .= '
        <w:tr>
            <w:tc><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>' . htmlspecialchars($att['trainee_name']) . '</w:t></w:r><w:r><w:rPr><w:color w:val="666666"/><w:sz w:val="16"/></w:rPr><w:t> (' . htmlspecialchars($att['cohort']) . ')</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>' . htmlspecialchars($att['lab_title']) . '</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="' . $outcomeColor . '"/><w:sz w:val="18"/></w:rPr><w:t>' . $scoreStr . '</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>' . $att['safety_score'] . '%</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="' . $outcomeColor . '"/><w:sz w:val="18"/></w:rPr><w:t>' . $outcomeText . '</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:color w:val="666666"/><w:sz w:val="16"/></w:rPr><w:t>' . htmlspecialchars($att['completed_at']) . '</w:t></w:r></w:p></w:tc>
        </w:tr>';
            }

            $xml .= '
    </w:tbl>
    <w:p><w:pPr><w:spacing w:after="240"/></w:pPr></w:p>';
        }

        $xml .= '
    <!-- Institutional Sign-off -->
    <w:p><w:pPr><w:spacing w:before="400" w:after="100"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="1E3A8A"/></w:rPr><w:t>Institutional Certification &amp; Validation</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:color w:val="666666"/><w:sz w:val="18"/></w:rPr><w:t>This consolidated laboratory transcript verifies that the candidates listed above completed the prescribed computer hardware simulation modules and adhered to standard electrostatic discharge (ESD) workshop protocols.</w:t></w:r></w:p>

    <w:p><w:pPr><w:spacing w:before="500"/></w:pPr></w:p>
    <w:tbl>
        <w:tblPr><w:tblW w:w="9600" w:type="dxa"/><w:jc w:val="center"/></w:tblPr>
        <w:tr>
            <w:tc><w:tcW w:w="4800" w:type="dxa"/><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>____________________________</w:t></w:r></w:p><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>Chief Technical Instructor</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcW w:w="4800" w:type="dxa"/><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>____________________________</w:t></w:r></w:p><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>Director of Academic Training</w:t></w:r></w:p></w:tc>
        </w:tr>
    </w:tbl>

</w:body>
</w:document>';

        return $xml;
    }
}
