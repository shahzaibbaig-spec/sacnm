<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnquiryTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_enquiry_can_be_submitted(): void
    {
        $response = $this->postJson('/api/enquiries', [
            'full_name' => 'Test Applicant',
            'email' => 'applicant@example.com',
            'phone' => '+92 300 0000000',
            'message' => 'Please share more information about admissions.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Thank you. Your enquiry has been received.');

        $this->assertDatabaseHas('enquiries', [
            'email' => 'applicant@example.com',
            'status' => 'new',
        ]);
    }

    public function test_an_enquiry_requires_valid_details(): void
    {
        $this->postJson('/api/enquiries', [
            'full_name' => '',
            'email' => 'not-an-email',
            'message' => 'short',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['full_name', 'email', 'message']);
    }
}
