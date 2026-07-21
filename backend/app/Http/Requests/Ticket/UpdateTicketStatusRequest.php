<?php

namespace App\Http\Requests\Ticket;

use App\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateTicketStatusRequest extends FormRequest
{
    /**
     * Route-level authorization is handled by the controller policy check;
     * this request only validates the payload.
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
            'status' => ['required', new Enum(TicketStatus::class)],
        ];
    }

    public function status(): TicketStatus
    {
        return TicketStatus::from($this->string('status')->value());
    }
}
