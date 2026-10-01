<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use App\Models\Module;
use App\Models\ComponentQuestion;
use App\Models\HotspotQuestion;
use App\Models\AssemblyStep;
use App\Models\TroubleshootingScenario;
use App\Models\LabAsset;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LabController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->query('tab', 'active'); // 'active' or 'trash'
        $search = $request->query('search');

        $query = Lab::with('module.course')->withCount('assignments');

        if ($tab === 'trash') {
            $query->onlyTrashed();
        } else {
            $query->withoutTrashed();
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        $labs = $query->orderBy('id')->get();
        $modules = Module::with('course')->get();

        $activeCount = Lab::withoutTrashed()->count();
        $trashedCount = Lab::onlyTrashed()->count();

        return Inertia::render('Instructor/Labs', [
            'labs' => $labs,
            'modules' => $modules,
            'tab' => $tab,
            'search' => $search,
            'counts' => [
                'active' => $activeCount,
                'trash' => $trashedCount,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'module_id' => 'required|exists:modules,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string',
            'passing_score' => 'integer|min:0|max:100',
            'time_limit' => 'nullable|integer',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
        ]);

        $lab = Lab::create([
            'module_id' => $request->module_id,
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'passing_score' => $request->input('passing_score', 70),
            'time_limit' => $request->time_limit,
            'is_active' => $request->input('is_active', true),
            'expires_at' => $request->expires_at,
            'activated_at' => $request->input('is_active', true) ? now() : null,
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'LAB_CREATE',
            'details' => "Created simulation lab: {$lab->title} [Type: {$lab->type}]",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->route('instructor.labs.index')->with('success', 'Lab created successfully!');
    }

    public function edit(Lab $lab)
    {
        $lab->load([
            'module.course',
            'assets',
            'componentQuestions',
            'hotspotQuestions',
            'assemblySteps',
            'troubleshootingScenarios',
        ]);

        return Inertia::render('Instructor/LabConfig', [
            'lab' => $lab
        ]);
    }

    public function update(Request $request, Lab $lab)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'passing_score' => 'integer|min:0|max:100',
            'time_limit' => 'nullable|integer',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
        ]);

        $lab->update([
            'title' => $request->title,
            'description' => $request->description,
            'passing_score' => $request->passing_score,
            'time_limit' => $request->time_limit,
            'is_active' => $request->input('is_active', true),
            'expires_at' => $request->expires_at,
            'activated_at' => $request->input('is_active', true) && !$lab->activated_at ? now() : $lab->activated_at,
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'LAB_UPDATE',
            'details' => "Updated lab settings: {$lab->title}",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->route('instructor.labs.edit', $lab->id)->with('success', 'Lab updated successfully!');
    }

    public function toggleStatus(Request $request, Lab $lab)
    {
        $lab->is_active = !$lab->is_active;
        if ($lab->is_active && !$lab->activated_at) {
            $lab->activated_at = now();
        }
        $lab->save();

        $statusText = $lab->is_active ? 'Activated' : 'Deactivated';

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => $lab->is_active ? 'LAB_ACTIVATE' : 'LAB_DEACTIVATE',
            'details' => "{$statusText} simulation lab: {$lab->title}",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Lab '{$lab->title}' {$statusText} successfully.");
    }

    public function setExpiration(Request $request, Lab $lab)
    {
        $request->validate([
            'expires_at' => 'nullable|date',
            'days_duration' => 'nullable|integer|min:1',
        ]);

        if ($request->filled('days_duration')) {
            $lab->expires_at = now()->addDays($request->days_duration);
            $lab->is_active = true;
            $lab->activated_at = now();
        } else {
            $lab->expires_at = $request->expires_at;
        }

        $lab->save();

        $expiryString = $lab->expires_at ? $lab->expires_at->format('M d, Y H:i') : 'Never (Perpetual)';

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'LAB_EXPIRE_SET',
            'details' => "Set expiration for lab '{$lab->title}': {$expiryString}",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Lab expiration set to: {$expiryString}");
    }

    public function destroy(Lab $lab)
    {
        $title = $lab->title;
        $lab->delete(); // Soft delete

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'LAB_SOFT_DELETE',
            'details' => "Moved lab to Trash: {$title}",
            'ip_address' => request()->ip(),
        ]);

        return redirect()->route('instructor.labs.index')->with('success', 'Lab moved to Trash.');
    }

    public function restore(int $id)
    {
        $lab = Lab::onlyTrashed()->findOrFail($id);
        $lab->restore();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'LAB_RESTORE',
            'details' => "Restored lab from Trash: {$lab->title}",
            'ip_address' => request()->ip(),
        ]);

        return redirect()->back()->with('success', "Lab '{$lab->title}' restored successfully.");
    }

    public function forceDelete(int $id)
    {
        $lab = Lab::onlyTrashed()->findOrFail($id);
        $title = $lab->title;
        $lab->forceDelete();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'LAB_FORCE_DELETE',
            'details' => "Permanently destroyed lab: {$title}",
            'ip_address' => request()->ip(),
        ]);

        return redirect()->back()->with('success', "Lab '{$title}' permanently deleted.");
    }

    public function uploadAsset(Request $request, Lab $lab)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
            'asset_type' => 'required|string', // background, component
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('labs/assets', 'public');
            $assetUrl = '/storage/' . $path;

            $asset = LabAsset::create([
                'lab_id' => $lab->id,
                'file_path' => $assetUrl,
                'asset_type' => $request->asset_type,
            ]);

            return response()->json([
                'success' => true,
                'asset' => $asset
            ]);
        }

        return response()->json(['success' => false, 'message' => 'No file uploaded'], 400);
    }

    public function saveConfig(Request $request, Lab $lab)
    {
        if ($lab->type === 'component_id') {
            $request->validate([
                'questions' => 'required|array',
                'questions.*.correct_name' => 'required|string',
                'questions.*.correct_function' => 'required|string',
                'questions.*.options' => 'required|array',
                'questions.*.function_options' => 'required|array',
                'questions.*.image_path' => 'nullable|string',
            ]);

            $lab->componentQuestions()->delete();
            foreach ($request->questions as $q) {
                ComponentQuestion::create([
                    'lab_id' => $lab->id,
                    'image_path' => $q['image_path'] ?? null,
                    'correct_name' => $q['correct_name'],
                    'correct_function' => $q['correct_function'],
                    'options' => $q['options'],
                    'function_options' => $q['function_options'],
                ]);
            }
        } elseif ($lab->type === 'motherboard_hotspot') {
            $request->validate([
                'hotspots' => 'required|array',
                'hotspots.*.label' => 'required|string',
                'hotspots.*.x_coord' => 'required|numeric',
                'hotspots.*.y_coord' => 'required|numeric',
                'hotspots.*.radius' => 'required|numeric',
            ]);

            $lab->hotspotQuestions()->delete();
            foreach ($request->hotspots as $h) {
                HotspotQuestion::create([
                    'lab_id' => $lab->id,
                    'label' => $h['label'],
                    'x_coord' => $h['x_coord'],
                    'y_coord' => $h['y_coord'],
                    'radius' => $h['radius'],
                ]);
            }
        } elseif ($lab->type === 'assembly_sequence' || $lab->type === 'drag_drop_build' || $lab->type === 'preventive_maintenance') {
            $request->validate([
                'steps' => 'required|array',
                'steps.*.step_number' => 'required|integer',
                'steps.*.instruction' => 'required|string',
                'steps.*.hint' => 'nullable|string',
                'steps.*.is_safety_critical' => 'boolean',
            ]);

            $lab->assemblySteps()->delete();
            foreach ($request->steps as $s) {
                AssemblyStep::create([
                    'lab_id' => $lab->id,
                    'step_number' => $s['step_number'],
                    'instruction' => $s['instruction'],
                    'hint' => $s['hint'] ?? null,
                    'is_safety_critical' => $s['is_safety_critical'] ?? false,
                ]);
            }
        } elseif ($lab->type === 'troubleshooting') {
            $request->validate([
                'scenarios' => 'required|array',
                'scenarios.*.title' => 'required|string',
                'scenarios.*.scenario_text' => 'required|string',
                'scenarios.*.symptoms' => 'required|array',
                'scenarios.*.steps' => 'required|array',
                'scenarios.*.correct_conclusion' => 'required|string',
                'scenarios.*.variants' => 'nullable|array',
            ]);

            $lab->troubleshootingScenarios()->delete();
            foreach ($request->scenarios as $sc) {
                TroubleshootingScenario::create([
                    'lab_id' => $lab->id,
                    'title' => $sc['title'],
                    'scenario_text' => $sc['scenario_text'],
                    'symptoms' => $sc['symptoms'],
                    'steps' => $sc['steps'],
                    'correct_conclusion' => $sc['correct_conclusion'],
                    'variants' => $sc['variants'] ?? null,
                ]);
            }
        }

        return redirect()->route('instructor.labs.edit', $lab->id)->with('success', 'Lab configuration saved successfully!');
    }
}
