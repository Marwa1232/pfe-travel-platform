<?php

namespace App\Entity;

use App\Entity\Trip;
use App\Repository\DestinationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: DestinationRepository::class)]
#[ORM\Table(name: 'destinations')]
class Destination
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['destination:read', 'trip:read', 'trip:list', 'booking:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 200)]
    #[Groups(['destination:read', 'trip:read', 'trip:list', 'booking:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 50)]
    #[Groups(['destination:read', 'trip:read'])]
    private ?string $country = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['destination:read'])]
    private ?string $region = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['destination:read'])]
    private ?string $image = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $thumbnail = null;

    // Not persisted, computed on the fly
    private ?int $tripsCount = null;
    private ?float $minPrice = null;

    #[ORM\Column]
    #[Groups(['destination:read'])]
    private ?bool $is_active = true;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\ManyToMany(targetEntity: Trip::class, mappedBy: 'destinations')]
    private Collection $trips;

    public function __construct()
    {
        $this->trips = new ArrayCollection();
        $this->created_at = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(string $country): static
    {
        $this->country = $country;
        return $this;
    }

    public function getRegion(): ?string
    {
        return $this->region;
    }

    public function setRegion(?string $region): static
    {
        $this->region = $region;
        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->is_active;
    }

    public function setIsActive(bool $is_active): static
    {
        $this->is_active = $is_active;
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

    /**
     * @return Collection<int, Trip>
     */
    public function getTrips(): Collection
    {
        return $this->trips;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): static
    {
        $this->image = $image;
        return $this;
    }

    public function getThumbnail(): ?string
    {
        return $this->thumbnail;
    }

    public function setThumbnail(?string $thumbnail): static
    {
        $this->thumbnail = $thumbnail;
        return $this;
    }

    /**
     * Get the number of active trips for this destination
     */
    public function getTripsCount(): int
    {
        return $this->trips->filter(fn(Trip $trip) => $trip->getStatus() === 'published')->count();
    }

    /**
     * Get the minimum price among all trips for this destination
     */
    public function getMinPrice(): ?float
    {
        $publishedTrips = $this->trips->filter(fn(Trip $trip) => $trip->getStatus() === 'published');
        if ($publishedTrips->isEmpty()) {
            return null;
        }
        $prices = $publishedTrips->map(fn(Trip $trip) => (float) $trip->getBasePrice())->toArray();
        return min($prices);
    }
}