<?php

namespace App\Entity;

use App\Repository\MomentRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: MomentRepository::class)]
#[ORM\Table(name: 'moments')]
class Moment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['moment:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'moments')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['moment:read'])]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Trip::class, inversedBy: 'moments')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['moment:read'])]
    private ?Trip $trip = null;

    #[ORM\ManyToOne(targetEntity: Booking::class, inversedBy: 'moments')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['moment:read'])]
    private ?Booking $booking = null;

    #[ORM\Column(type: 'text')]
    #[Groups(['moment:read'])]
    private ?string $content = null;

    #[ORM\OneToMany(mappedBy: 'moment', targetEntity: MomentMedia::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(['moment:read'])]
    private Collection $media;

    #[ORM\Column]
    #[Groups(['moment:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->media = new ArrayCollection();
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

    public function getBooking(): ?Booking
    {
        return $this->booking;
    }

    public function setBooking(?Booking $booking): static
    {
        $this->booking = $booking;
        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;
        return $this;
    }

    public function getMedia(): Collection
    {
        return $this->media;
    }

    public function addMedia(MomentMedia $media): static
    {
        if (!$this->media->contains($media)) {
            $this->media->add($media);
            $media->setMoment($this);
        }
        return $this;
    }

    public function removeMedia(MomentMedia $media): static
    {
        if ($this->media->removeElement($media)) {
            if ($media->getMoment() === $this) {
                $media->setMoment(null);
            }
        }
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