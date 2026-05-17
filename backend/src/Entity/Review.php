<?php

namespace App\Entity;

use App\Repository\ReviewRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ReviewRepository::class)]
#[ORM\Table(name: 'reviews')]
class Review
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['review:read', 'trip:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'reviews')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['review:read'])]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Trip::class, inversedBy: 'reviews')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Trip $trip = null;

    #[ORM\Column(type: 'integer')]
    #[Groups(['review:read', 'trip:read'])]
    private int $rating = 5;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['review:read', 'trip:read'])]
    private ?string $comment = null;

    #[ORM\Column(type: 'string', length: 20, options: ['default' => 'pending'])]
    #[Groups(['review:read'])]
    private string $status = 'pending';

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['review:read', 'trip:read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['review:read'])]
    private ?string $organizerResponse = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['review:read'])]
    private ?\DateTimeImmutable $responseDate = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['review:read'])]
    private bool $flagged = false;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['review:read'])]
    private ?string $flagReason = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getTrip(): ?Trip
    {
        return $this->trip;
    }

    public function setTrip(?Trip $trip): static
    {
        $this->trip = $trip;
        return $this;
    }

    public function getRating(): int
    {
        return $this->rating;
    }

    public function setRating(int $rating): static
    {
        $this->rating = max(1, min(5, $rating));
        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): static
    {
        $this->comment = $comment;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getOrganizerResponse(): ?string
    {
        return $this->organizerResponse;
    }

    public function setOrganizerResponse(?string $organizerResponse): static
    {
        $this->organizerResponse = $organizerResponse;
        return $this;
    }

    public function getResponseDate(): ?\DateTimeImmutable
    {
        return $this->responseDate;
    }

    public function setResponseDate(?\DateTimeImmutable $responseDate): static
    {
        $this->responseDate = $responseDate;
        return $this;
    }

    public function isFlagged(): bool
    {
        return $this->flagged;
    }

    public function setFlagged(bool $flagged): static
    {
        $this->flagged = $flagged;
        return $this;
    }

    public function getFlagReason(): ?string
    {
        return $this->flagReason;
    }

    public function setFlagReason(?string $flagReason): static
    {
        $this->flagReason = $flagReason;
        return $this;
    }
}