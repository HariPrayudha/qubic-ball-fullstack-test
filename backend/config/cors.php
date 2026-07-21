<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Only the API routes are exposed cross-origin, and only to the
    | configured frontend origin(s). Adjust FRONTEND_URL in your .env.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(
        explode(',', (string) env('FRONTEND_URL', 'http://localhost:3000'))
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Bearer-token auth does not rely on cookies, so credentials are not required.
    'supports_credentials' => false,

];
