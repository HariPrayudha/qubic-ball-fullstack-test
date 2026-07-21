<?php

namespace App\Http\Controllers\Api;

use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Http\Requests\Ticket\UpdateTicketStatusRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rules\Enum;
use Symfony\Component\HttpFoundation\Response;

class TicketController extends Controller
{
    public function __construct(private readonly TicketService $tickets) {}

    /**
     * List tickets. Regular users see only their own; admins see all.
     * Optional `?status=` filter (open|in_progress|resolved).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Ticket::class);

        $validated = $request->validate([
            'status' => ['sometimes', new Enum(TicketStatus::class)],
        ]);

        $user = $request->user();
        $status = isset($validated['status']) ? TicketStatus::from($validated['status']) : null;

        $tickets = Ticket::query()
            ->status($status)
            ->when(! $user->isAdmin(), fn ($q) => $q->where('user_id', $user->id))
            ->with('user')
            ->withCount('responses')
            ->latest()
            ->get();

        return TicketResource::collection($tickets);
    }

    /**
     * Create a ticket owned by the authenticated user.
     */
    public function store(StoreTicketRequest $request): JsonResponse
    {
        $this->authorize('create', Ticket::class);

        $ticket = $this->tickets->create($request->user(), $request->validated());

        return TicketResource::make($ticket->load('user'))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Show a single ticket with its responses.
     */
    public function show(Ticket $ticket): TicketResource
    {
        $this->authorize('view', $ticket);

        $ticket->load(['user', 'responses.author']);

        return new TicketResource($ticket);
    }

    /**
     * Update a ticket's status (admin only).
     */
    public function updateStatus(UpdateTicketStatusRequest $request, Ticket $ticket): TicketResource
    {
        $this->authorize('updateStatus', $ticket);

        $ticket = $this->tickets->updateStatus($ticket, $request->status());

        return new TicketResource($ticket->load('user'));
    }
}
