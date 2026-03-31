<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Filesystem\Filesystem;

class ImageStorageService
{
    private string $uploadDir;
    private Filesystem $filesystem;

    public function __construct(
        string $projectDir
    ) {
        $this->uploadDir = $projectDir . '/public/uploads/trips';
        $this->filesystem = new Filesystem();
        
        // Create directory if it doesn't exist
        if (!$this->filesystem->exists($this->uploadDir)) {
            $this->filesystem->mkdir($this->uploadDir, 0755);
        }
    }

    /**
     * Store an uploaded image and return the file path
     */
    public function storeTripImage(UploadedFile $file, int $tripId): array
    {
        // Create trip-specific directory
        $tripDir = $this->uploadDir . '/' . $tripId;
        if (!$this->filesystem->exists($tripDir)) {
            $this->filesystem->mkdir($tripDir, 0755);
        }

        // Generate unique filename
        $extension = $file->guessExtension() ?: 'jpg';
        $filename = sprintf('%d_%s.%s', time(), bin2hex(random_bytes(8)), $extension);
        
        // Move file to storage
        $file->move($tripDir, $filename);
        
        // Return the relative path and metadata
        return [
            'path' => '/uploads/trips/' . $tripId . '/' . $filename,
            'filename' => $filename,
            'size' => $file->getSize(),
            'mimeType' => $file->getMimeType(),
        ];
    }

    /**
     * Delete trip images from storage
     */
    public function deleteTripImages(int $tripId): bool
    {
        $tripDir = $this->uploadDir . '/' . $tripId;
        
        if ($this->filesystem->exists($tripDir)) {
            $this->filesystem->remove($tripDir);
            return true;
        }
        
        return false;
    }

    /**
     * Get the full path for an image
     */
    public function getImagePath(int $tripId, string $filename): string
    {
        return $this->uploadDir . '/' . $tripId . '/' . $filename;
    }

    /**
     * Check if an image exists
     */
    public function imageExists(int $tripId, string $filename): bool
    {
        return $this->filesystem->exists($this->getImagePath($tripId, $filename));
    }
}
