<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Greg & Co. Service Report #{{ $attempt->id }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            font-size: 12px;
            line-height: 1.5;
            margin: 20px;
        }
        .header {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .header h1 {
            color: #1e3a8a;
            font-size: 20px;
            margin: 0 0 5px 0;
            text-transform: uppercase;
        }
        .header p {
            margin: 0;
            color: #666666;
            font-size: 10px;
        }
        .section-title {
            background-color: #f3f4f6;
            border-left: 4px solid #2563eb;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        .meta-grid {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .meta-grid td {
            padding: 4px 0;
            vertical-align: top;
        }
        .meta-label {
            font-weight: bold;
            color: #4b5563;
            width: 30%;
        }
        .meta-value {
            color: #1f2937;
        }
        .field-box {
            padding: 8px 0;
            margin-bottom: 10px;
        }
        .field-label {
            font-weight: bold;
            color: #4b5563;
            margin-bottom: 3px;
        }
        .field-content {
            color: #111827;
            white-space: pre-wrap;
            background-color: #fafafa;
            border: 1px solid #e5e7eb;
            padding: 8px;
            border-radius: 4px;
        }
        .footer {
            margin-top: 50px;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>Greg & Co. Computer Hardware Training</h1>
        <p>Offline Workspace Training Simulator - Maintenance & Repair Report Export</p>
    </div>

    <table class="meta-grid">
        <tr>
            <td class="meta-label">Trainee Name:</td>
            <td class="meta-value">{{ $attempt->trainee->name }}</td>
            <td class="meta-label">Attempt Status:</td>
            <td class="meta-value" style="font-weight: bold;">{{ strtoupper($attempt->status) }}</td>
        </tr>
        <tr>
            <td class="meta-label">Trainee Email:</td>
            <td class="meta-value">{{ $attempt->trainee->email }}</td>
            <td class="meta-label">Assigned Lab:</td>
            <td class="meta-value">{{ $attempt->assignment->lab->title }}</td>
        </tr>
        <tr>
            <td class="meta-label">Completed Date:</td>
            <td class="meta-value">{{ $attempt->completed_at ? \Carbon\Carbon::parse($attempt->completed_at)->format('Y-m-d H:i') : 'N/A' }}</td>
            <td class="meta-label">Assigned Score:</td>
            <td class="meta-value" style="color: #2563eb; font-weight: bold; font-size: 14px;">{{ $attempt->score !== null ? round($attempt->score, 1) . '%' : 'PENDING REVIEW' }}</td>
        </tr>
    </table>

    @if($attempt->repairReport)
        <div class="section-title">Service Report Entries</div>

        <div class="field-box">
            <div class="field-label">Fault Reported</div>
            <div class="field-content">{{ $attempt->repairReport->fault_reported }}</div>
        </div>

        <div class="field-box">
            <div class="field-label">Symptoms Observed</div>
            <div class="field-content">{{ $attempt->repairReport->symptoms_observed }}</div>
        </div>

        <div class="field-box">
            <div class="field-label">Diagnostic Steps Performed</div>
            <div class="field-content">{{ $attempt->repairReport->diagnostic_steps }}</div>
        </div>

        <div class="field-box">
            <div class="field-label">Diagnostic Findings</div>
            <div class="field-content">{{ $attempt->repairReport->findings }}</div>
        </div>

        <div class="field-box">
            <div class="field-label">Corrective Action Taken</div>
            <div class="field-content">{{ $attempt->repairReport->corrective_action }}</div>
        </div>

        @if($attempt->repairReport->parts_replaced)
            <div class="field-box">
                <div class="field-label">Replacement Parts / Consumables Used</div>
                <div class="field-content">{{ $attempt->repairReport->parts_replaced }}</div>
            </div>
        @endif

        <div class="field-box">
            <div class="field-label">Safety Precautions Followed</div>
            <div class="field-content">{{ $attempt->repairReport->safety_precautions }}</div>
        </div>

        @if($attempt->repairReport->recommendations)
            <div class="field-box">
                <div class="field-label">Recommendations</div>
                <div class="field-content">{{ $attempt->repairReport->recommendations }}</div>
            </div>
        @endif
    @else
        <div class="section-title">Lab Assessment Performance</div>
        <p>No written repair report was required for this lab. This assessment was evaluated automatically by the hardware training simulator engine.</p>
    @endif

    <div class="section-title">Instructor Assessment & Feedback</div>
    @php
        $feedback = $attempt->feedbacks->first();
    @endphp
    @if($feedback)
        <div class="field-box">
            <div class="field-label">Instructor Feedback Comments</div>
            <div class="field-content">{{ $feedback->comments ?: 'No written feedback provided.' }}</div>
        </div>
        <p style="font-size: 10px; color: #6b7280; text-align: right;">Reviewed by Instructor on {{ \Carbon\Carbon::parse($feedback->graded_at)->format('Y-m-d H:i') }}</p>
    @else
        <p>No feedback has been recorded for this attempt yet.</p>
    @endif

    <div class="footer">
        &copy; {{ date('Y') }} Greg & Co. Hardware Simulator. Printed from local workstation deployment.
    </div>

</body>
</html>
