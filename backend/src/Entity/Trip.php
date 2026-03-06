<?php

namespace App\Entity;

use App\Repository\TripRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: TripRepository::class)]
#[ORM\Table(name: 'trips')]
class Trip
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['trip:read', 'trip:list', 'booking:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'trips')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['trip:read'])]
    private ?OrganizerProfile $organizer = null;

    #[ORM\Column(length: 200)]
    #[Groups(['trip:read', 'trip:list', 'booking:read'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['trip:read', 'trip:list'])]
    private ?string $short_description = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['trip:read'])]
    private ?string $long_description = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['trip:read', 'trip:list', 'booking:read'])]
    private ?string $base_price = null;

    #[ORM\Column(length: 5, options: ['default' => 'TND'])]
    #[Groups(['trip:read', 'trip:list'])]
    private ?string $currency = 'TND';

    #[ORM\Column]
    #[Groups(['trip:read', 'trip:list'])]
    private ?int $duration_days = null;

    #[ORM\Column(length: 20, options: ['default' => 'medium'])]
    #[Groups(['trip:read', 'trip:list'])]
    private ?string $difficulty_level = 'medium';

    #[ORM\Column]
    #[Groups(['trip:read'])]
    private ?bool $is_active = true;

    #[ORM\Column(length: 200, unique: true, nullable: true)]
    private ?string $slug = null;

    #[ORM\Column(length: 20, options: ['default' => 'draft'])]
    #[Groups(['trip:read', 'trip:list'])]
    private ?string $status = 'draft';

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['trip:read'])]
    private ?int $visibility_score = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['trip:read'])]
    private ?array $tags = [];

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['trip:read'])]
    private ?array $inclusions = [];

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['trip:read'])]
    private ?array $exclusions = [];

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['trip:read'])]
    private ?string $meeting_point = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['trip:read'])]
    private ?string $meeting_address = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['trip:read'])]
    private ?string $meeting_latitude = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['trip:read'])]
    private ?string $meeting_longitude = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\ManyToMany(targetEntity: Destination::class, inversedBy: 'trips')]
    #[ORM\JoinTable(name: 'trip_destinations')]
    #[Groups(['trip:read'])]
    private Collection $destinations;

    #[ORM\ManyToMany(targetEntity: Category::class, inversedBy: 'trips')]
    #[ORM\JoinTable(name: 'trip_categories')]
    #[Groups(['trip:read', 'trip:list'])]
    private Collection $categories;

    #[ORM\OneToMany(mappedBy: 'trip', targetEntity: TripSession::class, cascade: ['persist', 'remove'])]
    #[Groups(['trip:read'])]
    private Collection $sessions;

    #[ORM\OneToMany(mappedBy: 'trip', targetEntity: TripImage::class, cascade: ['persist', 'remove'])]
    #[Groups(['trip:read', 'trip:list'])]
    private Collection $images;

    #[ORM\OneToMany(mappedBy: 'trip', targetEntity: TripProgram::class, cascade: ['persist', 'remove'])]
    #[Groups(['trip:read'])]
    private Collection $programs;

    #[ORM\OneToMany(mappedBy: 'trip', targetEntity: Booking::class)]
    private Collection $bookings;

    public function __construct()
    {
        $this->destinations = new ArrayCollection();
        $this->categories = new ArrayCollection();
        $this->sessions = new ArrayCollection();
        $this->images = new ArrayCollection();
        $this->programs = new ArrayCollection();
        $this->bookings = new ArrayCollection();
        $this->created_at = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getOrganizer(): ?OrganizerProfile
    {
        return $this->organizer;
    }

    public function setOrganizer(?OrganizerProfile $organizer): static
    {
        $this->organizer = $organizer;
        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;
        return $this;
    }

    public function getShortDescription(): ?string
    {
        return $this->short_description;
    }

    public function setShortDescription(?string $short_description): static
    {
        $this->short_description = $short_description;
        return $this;
    }

    public function getLongDescription(): ?string
    {
        return $this->long_description;
    }

    public function setLongDescription(?string $long_description): static
    {
        $this->long_description = $long_description;
        return $this;
    }

    public function getBasePrice(): ?string
    {
        return $this->base_price;
    }

    public function setBasePrice(string $base_price): static
    {
        $this->base_price = $base_price;
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

    public function getDurationDays(): ?int
    {
        return $this->duration_days;
    }

    public function setDurationDays(int $duration_days): static
    {
        $this->duration_days = $duration_days;
        return $this;
    }

    public function getDifficultyLevel(): ?string
    {
        return $this->difficulty_level;
    }

    public function setDifficultyLevel(string $difficulty_level): static
    {
        $this->difficulty_level = $difficulty_level;
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

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(?string $slug): static
    {
        $this->slug = $slug;
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

    public function getVisibilityScore(): ?int
    {
        return $this->visibility_score;
    }

    public function setVisibilityScore(?int $visibility_score): static
    {
        $this->visibility_score = $visibility_score;
        return $this;
    }

    public function getTags(): ?array
    {
        return $this->tags;
    }

    public function setTags(?array $tags): static
    {
        $this->tags = $tags;
        return $this;
    }

    public function getInclusions(): ?array
    {
        return $this->inclusions;
    }

    public function setInclusions(?array $inclusions): static
    {
        $this->inclusions = $inclusions;
        return $this;
    }

    public function getExclusions(): ?array
    {
        return $this->exclusions;
    }

    public function setExclusions(?array $exclusions): static
    {
        $this->exclusions = $exclusions;
        return $this;
    }

    public function getMeetingPoint(): ?string
    {
        return $this->meeting_point;
    }

    public function setMeetingPoint(?string $meeting_point): static
    {
        $this->meeting_point = $meeting_point;
        return $this;
    }

    public function getMeetingAddress(): ?string
    {
        return $this->meeting_address;
    }

    public function setMeetingAddress(?string $meeting_address): static
    {
        $this->meeting_address = $meeting_address;
        return $this;
    }

    public function getMeetingLatitude(): ?string
    {
        return $this->meeting_latitude;
    }

    public function setMeetingLatitude(?string $meeting_latitude): static
    {
        $this->meeting_latitude = $meeting_latitude;
        return $this;
    }

    public function getMeetingLongitude(): ?string
    {
        return $this->meeting_longitude;
    }

    public function setMeetingLongitude(?string $meeting_longitude): static
    {
        $this->meeting_longitude = $meeting_longitude;
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

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updated_at): static
    {
        $this->updated_at = $updated_at;
        return $this;
    }

    /**
     * @return Collection<int, Destination>
     */
    public function getDestinations(): Collection
    {
        return $this->destinations;
    }

    public function addDestination(Destination $destination): static
    {
        if (!$this->destinations->contains($destination)) {
            $this->destinations->add($destination);
        }
        return $this;
    }

    public function removeDestination(Destination $destination): static
    {
        $this->destinations->removeElement($destination);
        return $this;
    }

    /**
     * @return Collection<int, Category>
     */
    public function getCategories(): Collection
    {
        return $this->categories;
    }

    public function addCategory(Category $category): static
    {
        if (!$this->categories->contains($category)) {
            $this->categories->add($category);
        }
        return $this;
    }

    public function removeCategory(Category $category): static
    {
        $this->categories->removeElement($category);
        return $this;
    }

    /**
     * @return Collection<int, TripSession>
     */
    public function getSessions(): Collection
    {
        return $this->sessions;
    }

    public function addSession(TripSession $session): static
    {
        if (!$this->sessions->contains($session)) {
            $this->sessions->add($session);
            $session->setTrip($this);
        }
        return $this;
    }

    public function removeSession(TripSession $session): static
    {
        if ($this->sessions->removeElement($session)) {
            if ($session->getTrip() === $this) {
                $session->setTrip(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, TripImage>
     */
    public function getImages(): Collection
    {
        return $this->images;
    }

    public function addImage(TripImage $image): static
    {
        if (!$this->images->contains($image)) {
            $this->images->add($image);
            $image->setTrip($this);
        }
        return $this;
    }

    public function removeImage(TripImage $image): static
    {
        if ($this->images->removeElement($image)) {
            if ($image->getTrip() === $this) {
                $image->setTrip(null);
            }
        }
        return $this;
    }

    public function getCoverImage(): ?TripImage
    {
        foreach ($this->images as $image) {
            if ($image->isCover()) {
                return $image;
            }
        }
        return $this->images->first() ?: null;
    }

    /**
     * @return Collection<int, TripProgram>
     */
    public function getPrograms(): Collection
    {
        return $this->programs;
    }

    public function addProgram(TripProgram $program): static
    {
        if (!$this->programs->contains($program)) {
            $this->programs->add($program);
            $program->setTrip($this);
        }
        return $this;
    }

    public function removeProgram(TripProgram $program): static
    {
        if ($this->programs->removeElement($program)) {
            if ($program->getTrip() === $this) {
                $program->setTrip(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Booking>
     */
    public function getBookings(): Collection
    {
        return $this->bookings;
    }

    public function addBooking(Booking $booking): static
    {
        if (!$this->bookings->contains($booking)) {
            $this->bookings->add($booking);
            $booking->setTrip($this);
        }
        return $this;
    }

    public function removeBooking(Booking $booking): static
    {
        if ($this->bookings->removeElement($booking)) {
            if ($booking->getTrip() === $this) {
                $booking->setTrip(null);
            }
        }
        return $this;
    }
}