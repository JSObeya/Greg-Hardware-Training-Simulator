<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use App\Models\Lab;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function dashboard()
    {
        $coursesCount = Course::count();
        $labsCount = Lab::count();
        
        $traineesCount = User::whereHas('role', function ($q) {
            $q->where('name', 'trainee');
        })->count();

        $trainees = User::whereHas('role', function ($q) {
            $q->where('name', 'trainee');
        })->get();

        return Inertia::render('Instructor/Dashboard', [
            'coursesCount' => $coursesCount,
            'labsCount' => $labsCount,
            'traineesCount' => $traineesCount,
            'trainees' => $trainees,
        ]);
    }

    public function index()
    {
        $courses = Course::with('modules.labs')->get();
        return Inertia::render('Instructor/Courses', [
            'courses' => $courses
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Course::create($request->only('title', 'description'));

        return redirect()->route('instructor.courses.index')->with('success', 'Course created successfully!');
    }

    public function update(Request $request, Course $course)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $course->update($request->only('title', 'description'));

        return redirect()->route('instructor.courses.index')->with('success', 'Course updated successfully!');
    }

    public function destroy(Course $course)
    {
        $course->delete();
        return redirect()->route('instructor.courses.index')->with('success', 'Course deleted successfully!');
    }

    public function storeModule(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order_index' => 'integer',
        ]);

        Module::create($request->only('course_id', 'title', 'description', 'order_index'));

        return redirect()->route('instructor.courses.index')->with('success', 'Module added successfully!');
    }

    public function destroyModule(Module $module)
    {
        $module->delete();
        return redirect()->route('instructor.courses.index')->with('success', 'Module deleted successfully!');
    }
}
