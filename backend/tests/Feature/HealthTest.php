<?php
namespace Tests\Feature;use Tests\TestCase;class HealthTest extends TestCase{public function test_health_endpoint_works():void{$this->getJson('/api/health')->assertOk()->assertJson(['status'=>'ok','message'=>'Laravel API is working']);}}
