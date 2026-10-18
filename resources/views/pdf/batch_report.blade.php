<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 11px;
            line-height: 1.4;
            margin: 20px 25px;
        }
        .header {
            border-bottom: 2.5px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 15px;
            display: table;
            width: 100%;
        }
        .header-left {
            display: table-cell;
            vertical-align: middle;
        }
        .header-right {
            display: table-cell;
            text-align: right;
            vertical-align: middle;
        }
        .header h1 {
            color: #1e3a8a;
            font-size: 18px;
            margin: 0 0 4px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header h2 {
            color: #2563eb;
            font-size: 13px;
            margin: 0;
            font-weight: 600;
        }
        .meta-text {
            color: #64748b;
            font-size: 9px;
            margin-top: 3px;
        }
        .kpi-container {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .kpi-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
            text-align: center;
        }
        .kpi-label {
            font-size: 8px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .kpi-val {
            font-size: 16px;
            font-weight: bold;
            margin-top: 2px;
        }
        .kpi-val-blue { color: #2563eb; }
        .kpi-val-green { color: #059669; }
        .group-header {
            background-color: #f1f5f9;
            border-left: 4px solid #2563eb;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 15px;
            margin-bottom: 8px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 10px;
        }
        table.data-table th {
            background-color: #1e293b;
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8px;
            letter-spacing: 0.5px;
            padding: 6px 8px;
            text-align: left;
        }
        table.data-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        table.data-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-passed {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        .badge-failed {
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }
        .badge-submitted {
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }
        .footer {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            display: table;
            width: 100%;
            page-break-inside: avoid;
        }
        .sig-block {
            display: table-cell;
            width: 50%;
            text-align: center;
            padding: 20px 30px 0;
        }
        .sig-line {
            border-top: 1px solid #94a3b8;
            margin-top: 35px;
            padding-top: 4px;
            font-size: 9px;
            font-weight: bold;
            color: #475569;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="header-left">
            <h1>Greg &amp; Co. Hardware Training Simulator</h1>
            <h2>{{ $title }}</h2>
            <div class="meta-text">
                Grouped By: <strong>{{ ucwords($groupBy) }}</strong> | Generated: {{ $generatedAt }}
            </div>
        </div>
        <div class="header-right">
            <div style="font-size: 14px; font-weight: bold; color: #1e3a8a;">OFFICIAL TRANSCRIPT</div>
            <div class="meta-text">Verification ID: GC-TR-{{ date('Ymd') }}</div>
        </div>
    </div>

    <!-- Summary KPI Box -->
    <table class="kpi-container">
        <tr>
            <td style="width: 25%; padding-right: 6px;">
                <div class="kpi-box">
                    <div class="kpi-label">Total Submissions</div>
                    <div class="kpi-val">{{ $kpis['total_attempts'] }}</div>
                </div>
            </td>
            <td style="width: 25%; padding: 0 3px;">
                <div class="kpi-box">
                    <div class="kpi-label">Average Score</div>
                    <div class="kpi-val kpi-val-blue">{{ $kpis['avg_score'] }}%</div>
                </div>
            </td>
            <td style="width: 25%; padding: 0 3px;">
                <div class="kpi-box">
                    <div class="kpi-label">Pass Ratio</div>
                    <div class="kpi-val kpi-val-green">{{ $kpis['pass_rate'] }}%</div>
                </div>
            </td>
            <td style="width: 25%; padding-left: 6px;">
                <div class="kpi-box">
                    <div class="kpi-label">Passed Candidates</div>
                    <div class="kpi-val kpi-val-green">{{ $kpis['passed_count'] }}</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Grouped Sections -->
    @foreach($groupedData as $group)
        <div class="group-header">
            📁 {{ $group['group_title'] }} ({{ count($group['attempts']) }} records)
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 24%;">Trainee &amp; Cohort</th>
                    <th style="width: 32%;">Lab Station</th>
                    <th style="width: 11%; text-align: center;">Score</th>
                    <th style="width: 11%; text-align: center;">Safety</th>
                    <th style="width: 11%; text-align: center;">Outcome</th>
                    <th style="width: 11%; text-align: right;">Date</th>
                </tr>
            </thead>
            <tbody>
                @foreach($group['attempts'] as $att)
                    <tr>
                        <td>
                            <strong>{{ $att['trainee_name'] }}</strong><br>
                            <span style="color: #64748b; font-size: 8px;">{{ $att['cohort'] }}</span>
                        </td>
                        <td>
                            <strong>{{ $att['lab_title'] }}</strong><br>
                            <span style="color: #64748b; font-size: 8px;">{{ $att['lab_type'] }}</span>
                        </td>
                        <td style="text-align: center; font-weight: bold; font-size: 11px;">
                            {{ $att['score'] !== null ? $att['score'] . '%' : 'Pending' }}
                        </td>
                        <td style="text-align: center; font-weight: bold; color: #0284c7;">
                            {{ $att['safety_score'] }}%
                        </td>
                        <td style="text-align: center;">
                            @if($att['is_passed'])
                                <span class="badge badge-passed">PASSED</span>
                            @elseif($att['score'] !== null)
                                <span class="badge badge-failed">FAILED</span>
                            @else
                                <span class="badge badge-submitted">SUBMITTED</span>
                            @endif
                        </td>
                        <td style="text-align: right; color: #64748b; font-size: 9px;">
                            {{ $att['completed_at'] }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endforeach

    <!-- Sign-off Block -->
    <div class="footer">
        <div class="sig-block">
            <div class="sig-line">Chief Technical Instructor<br><span style="font-weight: normal; font-size: 8px; color: #64748b;">Greg ICT Hub Laboratory Division</span></div>
        </div>
        <div class="sig-block">
            <div class="sig-line">Director of Academic Training<br><span style="font-weight: normal; font-size: 8px; color: #64748b;">Hardware Systems Certification Board</span></div>
        </div>
    </div>

</body>
</html>
