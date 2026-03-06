<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read', 'booking:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Groups(['user:read'])]
    private ?string $email = null;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column]
    private ?string $password_hash = null;

    #[ORM\Column(length: 100)]
    #[Groups(['user:read', 'booking:read'])]
    private ?string $first_name = null;

    #[ORM\Column(length: 100)]
    #[Groups(['user:read', 'booking:read'])]
    private ?string $last_name = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $phone = null;

    #[ORM\Column(length: 50, options: ['default' => 'Tunisia'])]
    #[Groups(['user:read'])]
    private ?string $country = 'Tunisia';

    #[ORM\Column(length: 5, options: ['default' => 'fr'])]
    #[Groups(['user:read'])]
    private ?string $preferred_language = 'fr';

    #[ORM\Column(length: 5, options: ['default' => 'TND'])]
    #[Groups(['user:read'])]
    private ?string $preferred_currency = 'TND';

    #[ORM\Column(length: 20, options: ['default' => 'none'])]
    #[Groups(['user:read'])]
    private ?string $status_organizer = 'none';

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['user:read'])]
    private ?array $interests = [];

    #[ORM\Column]
    private ?bool $is_active = true;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\OneToOne(mappedBy: 'user', cascade: ['persist', 'remove'])]
    private ?OrganizerProfile $organizerProfile = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Booking::class)]
    private Collection $bookings;

    #[ORM\ManyToMany(targetEntity: Role::class, inversedBy: 'users')]
    #[ORM\JoinTable(name: 'user_roles')]
    private Collection $userRoles;

    public function __construct()
    {
        $this->bookings = new ArrayCollection();
        $this->userRoles = new ArrayCollection();
        $this->created_at = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getRoles(): array
    {
        $roles = $this->userRoles->map(fn($role) => $role->getName())->toArray();
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    public function getPassword(): string
    {
        return $this->password_hash;
    }

    public function setPassword(string $password): static
    {
        $this->password_hash = $password;
        return $this;
    }

    public function eraseCredentials(): void
    {
        // Nettoyer les données sensibles si nécessaire
    }

    public function getFirstName(): ?string
    {
        return $this->first_name;
    }

    public function setFirstName(string $first_name): static
    {
        $this->first_name = $first_name;
        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->last_name;
    }

    public function setLastName(string $last_name): static
    {
        $this->last_name = $last_name;
        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone;
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

    public function getPreferredLanguage(): ?string
    {
        return $this->preferred_language;
    }

    public function setPreferredLanguage(string $preferred_language): static
    {
        $this->preferred_language = $preferred_language;
        return $this;
    }

    public function getPreferredCurrency(): ?string
    {
        return $this->preferred_currency;
    }

    public function setPreferredCurrency(string $preferred_currency): static
    {
        $this->preferred_currency = $preferred_currency;
        return $this;
    }

    public function getStatusOrganizer(): ?string
    {
        return $this->status_organizer;
    }

    public function setStatusOrganizer(string $status_organizer): static
    {
        $this->status_organizer = $status_organizer;
        return $this;
    }

    public function getInterests(): ?array
    {
        return $this->interests;
    }

    public function setInterests(?array $interests): static
    {
        $this->interests = $interests;
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

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updated_at): static
    {
        $this->updated_at = $updated_at;
        return $this;
    }

    public function getOrganizerProfile(): ?OrganizerProfile
    {
        return $this->organizerProfile;
    }

    public function setOrganizerProfile(?OrganizerProfile $organizerProfile): static
    {
        $this->organizerProfile = $organizerProfile;
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
            $booking->setUser($this);
        }
        return $this;
    }

    public function removeBooking(Booking $booking): static
    {
        if ($this->bookings->removeElement($booking)) {
            if ($booking->getUser() === $this) {
                $booking->setUser(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Role>
     */
    public function getUserRoles(): Collection
    {
        return $this->userRoles;
    }

    public function addUserRole(Role $userRole): static
    {
        if (!$this->userRoles->contains($userRole)) {
            $this->userRoles->add($userRole);
        }
        return $this;
    }

    public function removeUserRole(Role $userRole): static
    {
        $this->userRoles->removeElement($userRole);
        return $this;
    }
}