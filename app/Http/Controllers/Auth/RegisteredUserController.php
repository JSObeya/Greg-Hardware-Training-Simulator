<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\Lab;
use App\Models\LabAssignment;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $traineeRole = \App\Models\Role::where('name', 'trainee')->first();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $traineeRole->id,
        ]);

        // Auto-assign existing labs to this newly registered trainee
        $labs = Lab::all();
        $instructor = User::whereHas('role', function ($q) {
            $q->where('name', 'instructor');
        })->first();
        $instructorId = $instructor ? $instructor->id : 1;

        foreach ($labs as $lab) {
            LabAssignment::create([
                'lab_id' => $lab->id,
                'trainee_id' => $user->id,
                'assigned_by' => $instructorId,
                'status' => 'pending'
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
