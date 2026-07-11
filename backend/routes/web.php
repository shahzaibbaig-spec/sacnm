<?php
use Illuminate\Support\Facades\Route;Route::get('/',fn()=>response()->json(['name'=>'SACNM Admissions API','health'=>'/api/health']));
