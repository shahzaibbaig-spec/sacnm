<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\AdmissionMessage;
use App\Services\AdmissionPdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminPortalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Admission::with('user:id,name,email')->withCount('messages')->latest();
        if ($request->filled('status')) $query->where('status', $request->string('status'));
        if ($request->filled('search')) {
            $search = '%'.$request->string('search').'%';
            $query->where(fn ($q) => $q->where('full_name', 'like', $search)->orWhere('cnic_bform', 'like', $search)->orWhere('email', 'like', $search));
        }
        return response()->json(['data' => $query->get()]);
    }

    public function show(Admission $admission): JsonResponse
    {
        return response()->json(['data' => $admission->load(['user:id,name,email,phone', 'messages.sender:id,name'])]);
    }

    public function status(Request $request, Admission $admission): JsonResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(['pending', 'under_review', 'documents_required', 'test_scheduled', 'accepted', 'rejected'])]]);
        $admission->update($data);
        return response()->json(['message' => 'Application status updated.', 'data' => $admission]);
    }

    public function message(Request $request, Admission $admission): JsonResponse
    {
        $data = $request->validate(['message' => ['required', 'string', 'min:3', 'max:3000']]);
        $message = AdmissionMessage::create(['admission_id' => $admission->id, 'sender_id' => $request->user()->id, 'message' => $data['message']]);
        return response()->json(['message' => 'Message sent to the student.', 'data' => $message], 201);
    }

    public function pdf(Admission $admission, AdmissionPdf $pdf): Response
    {
        return response($pdf->render($admission), 200, ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'attachment; filename="application-'.$admission->id.'.pdf"']);
    }

    public function document(Admission $admission, string $type): StreamedResponse
    {
        $field = ['cnic' => 'cnic_document_path', 'education' => 'educational_documents_path', 'photo' => 'photo_path'][$type] ?? abort(404);
        return Storage::disk('public')->download($admission->{$field});
    }
}
