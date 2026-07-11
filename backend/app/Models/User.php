<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Hash;

class User extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'password', 'is_admin'];
    protected $hidden = ['password'];
    protected function casts(): array { return ['is_admin' => 'boolean']; }
    public function admissions(): HasMany { return $this->hasMany(Admission::class); }
    public function setPasswordAttribute(string $value): void { $this->attributes['password'] = Hash::make($value); }
}
