<?php

namespace App\Entity;

use App\Repository\MomentMediaRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: MomentMediaRepository::class)]
#[ORM\Table(name: 'moment_media')]
class MomentMedia
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['moment:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Moment::class, inversedBy: 'media')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Moment $moment = null;

    #[ORM\Column(length: 500)]
    #[Groups(['moment:read'])]
    private ?string $url = null;

    #[ORM\Column(length: 20)]
    #[Groups(['moment:read'])]
    private ?string $type = null;

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

    public function getMoment(): ?Moment
    {
        return $this->moment;
    }

    public function setMoment(?Moment $moment): static
    {
        $this->moment = $moment;
        return $this;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(string $url): static
    {
        $this->url = $url;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
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