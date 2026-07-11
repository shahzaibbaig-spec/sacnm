<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmissionMessage extends Model
{
    protected $fillable = ['admission_id', 'sender_id', 'message', 'read_at'];
    protected function casts(): array { return ['read_at' => 'datetime']; }
    public function admission(): BelongsTo { return $this->belongsTo(Admission::class); }
    public function sender(): BelongsTo { return $this->belongsTo(User::class, 'sender_id'); }
}
