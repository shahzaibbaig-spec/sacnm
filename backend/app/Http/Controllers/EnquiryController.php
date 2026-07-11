<?php

namespace App\Http\Controllers;

use App\Models\Enquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnquiryController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
        ]);

        $enquiry = Enquiry::create($validated);

        return response()->json([
            'message' => 'Thank you. Your enquiry has been received.',
            'data' => ['id' => $enquiry->id],
        ], 201);
    }
}
