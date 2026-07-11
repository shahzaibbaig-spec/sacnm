<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentPortalController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $applications = $request->user()->admissions()->with(['messages.sender:id,name,is_admin'])->latest()->get()->map(fn ($item) => [
            'id' => $item->id,
            'program' => $item->program,
            'status' => $item->status,
            'submitted_at' => $item->created_at,
            'updated_at' => $item->updated_at,
            'messages' => $item->messages->map(fn ($message) => [
                'id' => $message->id,
                'message' => $message->message,
                'created_at' => $message->created_at,
                'sender' => $message->sender?->name ?? 'Admissions Office',
            ]),
        ]);
        return response()->json(['data' => $applications]);
    }
}
