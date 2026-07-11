<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;

Artisan::command('admin:create {email} {password} {--name=Admissions Administrator}', function () {
    $user = User::updateOrCreate(
        ['email' => strtolower($this->argument('email'))],
        ['name' => $this->option('name'), 'password' => $this->argument('password'), 'is_admin' => true]
    );
    $this->info("Administrator ready: {$user->email}");
})->purpose('Create or reset an admissions administrator account');
