<?php

namespace App\Models;

use App\Enums\TicketStatus;
use Database\Factories\TicketFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'subject', 'description', 'status', 'resolved_at'])]
class Ticket extends Model
{
    /** @use HasFactory<TicketFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => TicketStatus::class,
            'resolved_at' => 'datetime',
        ];
    }

    /**
     * Owner of the ticket.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Responses attached to this ticket (newest first when eager loaded).
     *
     * @return HasMany<TicketResponse, $this>
     */
    public function responses(): HasMany
    {
        return $this->hasMany(TicketResponse::class);
    }

    /**
     * Scope: filter by status when a value is provided.
     *
     * @param  Builder<Ticket>  $query
     */
    public function scopeStatus(Builder $query, ?TicketStatus $status): void
    {
        $query->when($status, fn (Builder $q) => $q->where('status', $status));
    }
}
