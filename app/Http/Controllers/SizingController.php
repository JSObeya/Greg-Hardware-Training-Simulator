<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class SizingController extends Controller
{
    /**
     * Render the PC Power Supply (PSU) & Component Bottleneck Sizing Calculator.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Sizing/Index');
    }
}
