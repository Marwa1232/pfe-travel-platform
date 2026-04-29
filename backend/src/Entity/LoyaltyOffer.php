<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'loyalty_offers')]
class LoyaltyOffer
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: OrganizerProfile::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?OrganizerProfile $organizer = null;

    #[ORM\Column(length: 255)]
    private string $title = '';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    // points_discount | percentage_discount | fixed_discount
    #[ORM\Column(length: 30)]
    private string $discountType = 'percentage_discount';

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $discountValue = '0';

    #[ORM\Column(type: 'integer')]
    private int $pointsRequired = 0;

    // null = tous les trips de l'organisateur
    #[ORM\ManyToOne(targetEntity: Trip::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?Trip $trip = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $isActive = true;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $expiresAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getOrganizer(): ?OrganizerProfile { return $this->organizer; }
    public function setOrganizer(OrganizerProfile $v): static { $this->organizer = $v; return $this; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $v): static { $this->title = $v; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $v): static { $this->description = $v; return $this; }
    public function getDiscountType(): string { return $this->discountType; }
    public function setDiscountType(string $v): static { $this->discountType = $v; return $this; }
    public function getDiscountValue(): string { return $this->discountValue; }
    public function setDiscountValue(string $v): static { $this->discountValue = $v; return $this; }
    public function getPointsRequired(): int { return $this->pointsRequired; }
    public function setPointsRequired(int $v): static { $this->pointsRequired = $v; return $this; }
    public function getTrip(): ?Trip { return $this->trip; }
    public function setTrip(?Trip $v): static { $this->trip = $v; return $this; }
    public function isActive(): bool { return $this->isActive; }
    public function setIsActive(bool $v): static { $this->isActive = $v; return $this; }
    public function getExpiresAt(): ?\DateTimeImmutable { return $this->expiresAt; }
    public function setExpiresAt(?\DateTimeImmutable $v): static { $this->expiresAt = $v; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}
