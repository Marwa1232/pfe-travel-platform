<?php

namespace App\Entity;

use App\Repository\PaymentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PaymentRepository::class)]
#[ORM\Table(name: 'payments')]
class Payment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['booking:read'])]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'payment')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Booking $booking = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['booking:read'])]
    private ?string $amount = null;

    #[ORM\Column(length: 5)]
    #[Groups(['booking:read'])]
    private ?string $currency = 'EUR';

    #[ORM\Column(length: 20)]
    #[Groups(['booking:read'])]
    private ?string $method = 'CASH';

    #[ORM\Column(length: 20)]
    #[Groups(['booking:read'])]
    private ?string $status = 'PENDING';

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $transaction_ref = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $paid_at = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    // ── Nouveaux champs Stripe ──────────────────────
    // Identifiant PaymentIntent Stripe (pi_xxxxx)
    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['booking:read'])]
    private ?string $stripe_payment_intent_id = null;

    // Identifiant Refund Stripe (re_xxxxx)
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $refund_id = null;

    // Montant remboursé
    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['booking:read'])]
    private ?string $refund_amount = null;

    // Identifiant Dispute/Chargeback (dp_xxxxx)
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $dispute_id = null;

    // needs_response | under_review | won | lost | closed_won | closed_lost
    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['booking:read'])]
    private ?string $dispute_status = null;

    // ── Multi-Currency (Stripe presentment) ────────────
    // Montant réellement débité sur la carte du voyageur (ex: 114.17 GBP)
    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['booking:read'])]
    private ?string $presentment_amount = null;

    // Devise du voyageur (GBP, USD, TND…) — ce qu'il a vu sur sa carte
    #[ORM\Column(length: 10, nullable: true)]
    #[Groups(['booking:read'])]
    private ?string $presentment_currency = null;

    // ── Commission plateforme (persistée, immuable après paiement) ──
    // Toujours calculée sur $amount (EUR), jamais recalculée rétroactivement
    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['booking:read'])]
    private ?string $platform_fee = null;

    public function __construct()
    {
        $this->created_at = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBooking(): ?Booking
    {
        return $this->booking;
    }

    public function setBooking(Booking $booking): static
    {
        $this->booking = $booking;
        return $this;
    }

    public function getAmount(): ?string
    {
        return $this->amount;
    }

    public function setAmount(string $amount): static
    {
        $this->amount = $amount;
        return $this;
    }

    public function getCurrency(): ?string
    {
        return $this->currency;
    }

    public function setCurrency(string $currency): static
    {
        $this->currency = $currency;
        return $this;
    }

    public function getMethod(): ?string
    {
        return $this->method;
    }

    public function setMethod(string $method): static
    {
        $this->method = $method;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getTransactionRef(): ?string
    {
        return $this->transaction_ref;
    }

    public function setTransactionRef(?string $transaction_ref): static
    {
        $this->transaction_ref = $transaction_ref;
        return $this;
    }

    public function getPaidAt(): ?\DateTimeInterface
    {
        return $this->paid_at;
    }

    public function setPaidAt(?\DateTimeInterface $paid_at): static
    {
        $this->paid_at = $paid_at;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;
        return $this;
    }

    // ── Nouveaux getters/setters Stripe ─────────────

    public function getStripePaymentIntentId(): ?string { return $this->stripe_payment_intent_id; }
    public function setStripePaymentIntentId(?string $v): static { $this->stripe_payment_intent_id = $v; return $this; }

    public function getRefundId(): ?string { return $this->refund_id; }
    public function setRefundId(?string $v): static { $this->refund_id = $v; return $this; }

    public function getRefundAmount(): ?string { return $this->refund_amount; }
    public function setRefundAmount(?string $v): static { $this->refund_amount = $v; return $this; }

    public function getDisputeId(): ?string { return $this->dispute_id; }
    public function setDisputeId(?string $v): static { $this->dispute_id = $v; return $this; }

    public function getDisputeStatus(): ?string { return $this->dispute_status; }
    public function setDisputeStatus(?string $v): static { $this->dispute_status = $v; return $this; }

    // ── Presentment ──
    public function getPresentmentAmount(): ?string { return $this->presentment_amount; }
    public function setPresentmentAmount(?string $v): static { $this->presentment_amount = $v; return $this; }

    public function getPresentmentCurrency(): ?string { return $this->presentment_currency; }
    public function setPresentmentCurrency(?string $v): static { $this->presentment_currency = $v; return $this; }

    // ── Platform fee ──
    public function getPlatformFee(): ?string { return $this->platform_fee; }
    public function setPlatformFee(?string $v): static { $this->platform_fee = $v; return $this; }

    /** Montant net revenant à l'organisateur (amount - platform_fee), en EUR */
    public function getOrganizerPayout(): ?float
    {
        if ($this->amount === null || $this->platform_fee === null) return null;
        return round((float) $this->amount - (float) $this->platform_fee, 2);
    }
}