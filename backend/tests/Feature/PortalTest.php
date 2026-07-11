<?php

namespace Tests\Feature;

use App\Models\Admission;
use App\Models\AuthToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_create_an_account_and_open_dashboard(): void
    {
        $signup = $this->postJson('/api/auth/signup', [
            'name' => 'Student User', 'email' => 'student@example.com', 'phone' => '03000000000',
            'password' => 'Password123', 'password_confirmation' => 'Password123',
        ])->assertOk()->assertJsonPath('data.is_admin', false);

        $this->withToken($signup->json('token'))->getJson('/api/student/dashboard')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_student_cannot_open_admin_dashboard(): void
    {
        [$user, $raw] = $this->authenticatedUser(false);
        $this->withToken($raw)->getJson('/api/admin/applications')->assertForbidden();
    }

    public function test_admin_can_update_status_send_message_and_download_pdf(): void
    {
        [$student] = $this->authenticatedUser(false);
        [, $adminToken] = $this->authenticatedUser(true, 'admin@example.com');
        $application = Admission::create([
            'user_id' => $student->id, 'full_name' => 'Student User', 'guardian_name' => 'Guardian',
            'cnic_bform' => '12345-1234567-1', 'date_of_birth' => '2000-01-01', 'gender' => 'female',
            'phone' => '03000000000', 'email' => 'student@example.com', 'address' => 'Mirpur, AJK',
            'program' => 'BS Nursing', 'previous_qualification' => 'FSc', 'marks_obtained' => 800,
            'total_marks' => 1100, 'percentage' => 72.73, 'cnic_document_path' => 'test/cnic.pdf',
            'educational_documents_path' => 'test/education.pdf', 'photo_path' => 'test/photo.jpg',
        ]);

        $this->withToken($adminToken)->patchJson("/api/admin/applications/{$application->id}/status", ['status' => 'test_scheduled'])->assertOk();
        $this->withToken($adminToken)->postJson("/api/admin/applications/{$application->id}/messages", ['message' => 'Your entry test is scheduled for Monday.'])->assertCreated();
        $this->withToken($adminToken)->get("/api/admin/applications/{$application->id}/pdf")->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertDatabaseHas('admissions', ['id' => $application->id, 'status' => 'test_scheduled']);
        $this->assertDatabaseHas('admission_messages', ['admission_id' => $application->id]);
    }

    private function authenticatedUser(bool $admin, string $email = 'student@example.com'): array
    {
        $user = User::create(['name' => $admin ? 'Administrator' : 'Student', 'email' => $email, 'password' => 'Password123', 'is_admin' => $admin]);
        $raw = bin2hex(random_bytes(32));
        AuthToken::create(['user_id' => $user->id, 'token_hash' => hash('sha256', $raw), 'expires_at' => now()->addHour()]);
        return [$user, $raw];
    }
}
