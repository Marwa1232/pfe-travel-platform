<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'loyalty_points')]
class LoyaltyPoints
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $totalPoints = 0;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $usedPoints = 0;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): ?User { return $this->user; }
    public function setUser(User $user): static { $this->user = $user; return $this; }
    public function getTotalPoints(): int { return $this->totalPoints; }
    public function setTotalPoints(int $v): static { $this->totalPoints = $v; return $this; }
    public function getUsedPoints(): int { return $this->usedPoints; }
    public function setUsedPoints(int $v): static { $this->usedPoints = $v; return $this; }
    public function getAvailablePoints(): int { return $this->totalPoints - $this->usedPoints; }
    public function setUpdatedAt(\DateTimeImmutable $v): static { $this->updatedAt = $v; return $this; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }
}
