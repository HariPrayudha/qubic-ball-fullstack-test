# Backend — Laravel 13 API

Main API for the Qubic Support Ticket System: authentication (Sanctum), tickets,
responses, and role-based authorization (Policies).

See the [root README](../README.md) for full setup, environment variables, API reference,
and architecture.

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
php artisan test           # 14 Pest tests
```
