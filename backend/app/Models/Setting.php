<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Throwable;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        try {
            if (!Schema::hasTable('settings')) {
                return $default;
            }
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        } catch (Throwable) {
            return $default;
        }
    }

    public static function set(string $key, mixed $value): void
    {
        try {
            $formattedValue = is_bool($value) ? ($value ? '1' : '0') : (string) $value;
            static::updateOrCreate(
                ['key' => $key],
                ['value' => $formattedValue]
            );
        } catch (Throwable) {
            // Log or fallback
        }
    }

    public static function isAdmissionsOpen(): bool
    {
        $val = static::get('admissions_open', '1');
        return $val === '1' || $val === 'true' || $val === true || $val === 1;
    }

    public static function shouldHideAdmissionsTab(): bool
    {
        $val = static::get('hide_admissions_tab', '0');
        return $val === '1' || $val === 'true' || $val === true || $val === 1;
    }

    public static function allSettings(): array
    {
        return [
            'admissions_open' => static::isAdmissionsOpen(),
            'hide_admissions_tab' => static::shouldHideAdmissionsTab(),
        ];
    }
}
