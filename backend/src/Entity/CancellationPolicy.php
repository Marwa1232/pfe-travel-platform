<?php

namespace App\Entity;

use App\Repository\CancellationPolicyRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CancellationPolicyRepository::class)]
#[ORM\Table(name: 'cancellation_policies')]
class CancellationPolicy
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['trip:read', 'booking:read'])]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: Trip::class, inversedBy: 'cancellationPolicy')]
    #[ORM\JoinColumn(nullable: false, unique: true)]
    private ?Trip $trip = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['trip:read', 'booking:read'])]
    private array $rulesJson = [];

    #[ORM\Column]
    private bool $allowVoucher = true;

    #[ORM\Column]
    private bool $allowRebooking = true;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getRulesJson(): array
    {
        return $this->rulesJson;
    }

    public function setRulesJson(array $rulesJson): static
    {
        $this->rulesJson = $rulesJson;
        return $this;
    }

    public function isAllowVoucher(): bool
    {
        return $this->allowVoucher;
    }

    public function setAllowVoucher(bool $allowVoucher): static
    {
        $this->allowVoucher = $allowVoucher;
        return $this;
    }

    public function isAllowRebooking(): bool
    {
        return $this->allowRebooking;
    }

    public function setAllowRebooking(bool $allowRebooking): static
    {
        $this->allowRebooking = $allowRebooking;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }
}
