<?php

namespace App\Http\Requests\Ticket;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketResponseRequest extends FormRequest
{
    /**
     * Route-level authorization (admin only) is enforced by the controller
     * via the TicketPolicy; this request validates the payload.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'min:1', 'max:5000'],
        ];
    }
}
