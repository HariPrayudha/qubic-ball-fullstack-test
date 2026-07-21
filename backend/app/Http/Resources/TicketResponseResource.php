<?php

namespace App\Http\Resources;

use App\Models\TicketResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TicketResponse
 */
class TicketResponseResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticket_id' => $this->ticket_id,
            'message' => $this->message,
            'author' => new UserResource($this->whenLoaded('author')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
