<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\StoreTicketResponseRequest;
use App\Http\Resources\TicketResponseResource;
use App\Models\Ticket;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class TicketResponseController extends Controller
{
    public function __construct(private readonly TicketService $tickets) {}

    /**
     * Add a response to a ticket (admin only).
     */
    public function store(StoreTicketResponseRequest $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('respond', $ticket);

        $response = $this->tickets->addResponse(
            $ticket,
            $request->user(),
            (string) $request->string('message'),
        );

        return TicketResponseResource::make($response->load('author'))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
