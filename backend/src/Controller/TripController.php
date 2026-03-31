<?php

namespace App\Controller;

use App\Entity\Trip;
use App\Entity\User;
use App\Entity\TripSession;
use App\Entity\Destination;
use App\Entity\Category;
use App\Entity\TripImage;
use App\Entity\TripProgram;
use App\Repository\TripRepository;
use App\Service\JwtService;
use App\Service\ImageStorageService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpKernel\Attribute\MapAttribute\File;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/trips')]
class TripController extends AbstractController
{
    public function __construct(
        private TripRepository $tripRepo,
        private EntityManagerInterface $em,
        private JwtService $jwtService,
        private ImageStorageService $imageStorage
    ) {}

    private function getCurrentUser(Request $request): ?User
    {
        $authHeader = $request->headers->get('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) return null;

        $token = substr($authHeader, 7);
        $payload = $this->jwtService->decodeToken($token);

        if (!$payload || !isset($payload['id'])) return null;

        return $this->em->getRepository(User::class)->find($payload['id']);
    }

    #[Route('', name: 'api_trips_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->query->get('search'),
            'destination' => $request->query->get('destination'),
            'category' => $request->query->get('category'),
            'country' => $request->query->get('country'),
            'min_price' => $request->query->get('min_price'),
            'max_price' => $request->query->get('max_price'),
            'start_date' => $request->query->get('start_date'),
            'duration' => $request->query->get('duration'),
            'difficulty' => $request->query->get('difficulty'),
            'ids' => $request->query->get('ids'),
            'page' => $request->query->getInt('page', 1),
            'limit' => $request->query->getInt('limit', 12),
        ];

        $user = $this->getCurrentUser($request);
        if ($user && in_array('ROLE_ORGANIZER', $user->getRoles())) {
            $organizer = $user->getOrganizerProfile();
            if ($organizer && $organizer->getId()) $filters['organizer_id'] = $organizer->getId();
        }

        $trips = $this->tripRepo->search($filters);

        // Debug: log what we're returning
        error_log('[TripController] Returning ' . count($trips) . ' trips');
        
        return $this->json($trips, Response::HTTP_OK, [], ['groups' => ['trip:list', 'trip:read']]);
    }

    #[Route('/{id}', name: 'api_trips_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $trip = $this->tripRepo->find($id);

        if (!$trip || !$trip->isActive()) {
            return $this->json(['error' => 'Trip not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($trip, Response::HTTP_OK, [], ['groups' => 'trip:read']);
    }

    #[Route('', name: 'api_trips_create', methods: ['POST'])]
    #[IsGranted('ROLE_ORGANIZER')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Debug: Log received data
        error_log('Trip create received: ' . json_encode($data));

        // Validation simple
        if (empty($data['title'])) return $this->json(['error' => 'Title required'], 400);
        if (isset($data['base_price']) && $data['base_price'] < 0) return $this->json(['error' => 'Price must be positive'], 400);

        $trip = new Trip();
        $trip->setTitle($data['title']);
        $trip->setShortDescription($data['short_description'] ?? null);
        $trip->setLongDescription($data['long_description'] ?? null);
        $trip->setBasePrice($data['base_price'] ?? '0');
        $trip->setCurrency($data['currency'] ?? 'TND');
        $trip->setDurationDays($data['duration_days'] ?? 1);
        $trip->setDifficultyLevel($data['difficulty_level'] ?? 'medium');
        $trip->setSlug($this->slugify($trip->getTitle()));
        $trip->setStatus($data['status'] ?? 'PUBLISHED');
        $trip->setUpdatedAt(new \DateTimeImmutable());
        
        // Set JSON fields
        if (isset($data['tags'])) $trip->setTags($data['tags']);
        if (isset($data['inclusions'])) $trip->setInclusions($data['inclusions']);
        if (isset($data['exclusions'])) $trip->setExclusions($data['exclusions']);
        if (isset($data['meeting_point'])) $trip->setMeetingPoint($data['meeting_point']);
        if (isset($data['meeting_address'])) $trip->setMeetingAddress($data['meeting_address']);

        $user = $this->getUser();
        
        // Debug: Check user
        if (!$user) {
            error_log('No user found - authentication issue');
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        
        $organizer = $user->getOrganizerProfile();
        
        // Debug: Check organizer
        if (!$organizer) {
            error_log('No organizer profile for user: ' . $user->getId());
            return $this->json(['error' => 'No organizer profile found. Please create an organizer profile first.'], Response::HTTP_FORBIDDEN);
        }
        
        if ($organizer->getStatus() !== 'APPROVED') {
            error_log('Organizer status: ' . $organizer->getStatus());
            return $this->json(['error' => 'Organizer profile not approved. Current status: ' . $organizer->getStatus()], Response::HTTP_FORBIDDEN);
        }
        
        $trip->setOrganizer($organizer);

        // Ajouter session si start_date et end_date sont présents
        if(isset($data['start_date']) && isset($data['end_date'])){
            $session = new TripSession();
            $session->setStartDate(new \DateTime($data['start_date']));
            $session->setEndDate(new \DateTime($data['end_date']));
            $session->setMaxCapacity($data['max_places'] ?? $data['capacity'] ?? 10);
            $session->setStatus('OPEN');
            $trip->addSession($session);
        }

        // Ajouter destinations
        if(isset($data['destinations']) && is_array($data['destinations'])){
            foreach($data['destinations'] as $destId){
                $destination = $this->em->getRepository(Destination::class)->find($destId);
                if($destination) $trip->addDestination($destination);
            }
        }
        // Handle single destination ID
        if(isset($data['destination']) && is_numeric($data['destination'])){
            $destination = $this->em->getRepository(Destination::class)->find($data['destination']);
            if($destination) $trip->addDestination($destination);
        }

        // Ajouter category (frontend sends 'category' as a single value)
        if(isset($data['category'])){
            $category = $this->em->getRepository(Category::class)->find($data['category']);
            if($category) $trip->addCategory($category);
        }
        // Handle categories array as well
        if(isset($data['categories']) && is_array($data['categories'])){
            foreach($data['categories'] as $catId){
                $category = $this->em->getRepository(Category::class)->find($catId);
                if($category) $trip->addCategory($category);
            }
        }

        // Ajouter images (cover_image URL)
        error_log('Cover image data: ' . json_encode($data['cover_image'] ?? null));
        if(isset($data['cover_image']) && is_string($data['cover_image'])){
            $image = new TripImage();
            $image->setUrl($data['cover_image']);
            $image->setIsCover(true);
            $image->setTrip($trip);
            $trip->addImage($image);
        }
        
        // Ajouter gallery images array
        error_log('Gallery data: ' . json_encode($data['gallery'] ?? null));
        if(isset($data['gallery']) && is_array($data['gallery'])){
            foreach($data['gallery'] as $imgUrl){
                if(is_string($imgUrl)){
                    $image = new TripImage();
                    $image->setUrl($imgUrl);
                    $image->setIsCover(false);
                    $image->setTrip($trip);
                    $trip->addImage($image);
                }
            }
        }

        // Ajouter program (trip program days)
        error_log('Program data received: ' . json_encode($data['program'] ?? null));
        if(isset($data['program']) && is_array($data['program'])){
            foreach($data['program'] as $programData){
                error_log('Processing program item: ' . json_encode($programData));
                if(isset($programData['day']) || isset($programData['title'])){
                    $program = new TripProgram();
                    $program->setDayNumber($programData['day'] ?? 1);
                    $program->setTitle($programData['title'] ?? '');
                    $program->setDescription($programData['description'] ?? null);
                    $program->setTrip($trip);
                    $trip->addProgram($program);
                    error_log('Added program: ' . ($programData['title'] ?? 'untitled'));
                }
            }
        } else {
            error_log('No program data found in request');
        }

        $this->em->persist($trip);
        try {
            $this->em->flush();
        } catch(\Exception $e) {
            error_log('Error saving trip: ' . $e->getMessage());
            error_log('Trace: ' . $e->getTraceAsString());
            return $this->json(['error' => 'Failed to save trip: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json($trip, Response::HTTP_CREATED, [], ['groups' => 'trip:read']);
    }

    #[Route('/upload-image', name: 'api_trips_upload_image', methods: ['POST'])]
    #[IsGranted('ROLE_ORGANIZER')]
    public function uploadImage(Request $request): JsonResponse
    {
        try {
            // Get PHP config for debugging
            error_log('=== UPLOAD IMAGE ENDPOINT START ===');
            error_log('PHP max_file_uploads: ' . ini_get('max_file_uploads'));
            error_log('PHP upload_max_filesize: ' . ini_get('upload_max_filesize'));
            error_log('PHP post_max_size: ' . ini_get('post_max_size'));
            error_log('Request method: ' . $request->getMethod());
            error_log('Content-Type: ' . $request->headers->get('Content-Type'));
            
            $projectDir = $this->getParameter('kernel.project_dir');
            $uploadDir = $projectDir . '/public/uploads/trips';
            
            // Create directory if needed
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // Check what's in files
            $allFiles = $request->files->all();
            error_log('All files keys: ' . implode(', ', array_keys($allFiles)));
            error_log('All files count: ' . count($allFiles));
            
            // Try both 'images' and 'images[]' keys
            $images = $request->files->get('images');
            if (!$images) {
                $images = $request->files->get('images[]');
            }
            error_log('Images value: ' . gettype($images));
            if ($images) {
                if (is_array($images)) {
                    error_log('Images is array with count: ' . count($images));
                    // Log each file
                    foreach ($images as $key => $img) {
                        if ($img instanceof UploadedFile) {
                            error_log("File[$key]: " . $img->getClientOriginalName() . " size: " . $img->getSize());
                        }
                    }
                } elseif ($images instanceof UploadedFile) {
                    error_log('Images is single UploadedFile: ' . $images->getClientOriginalName());
                }
            }
            
            // Also check request parameters
            error_log('is_cover param: ' . $request->request->get('is_cover'));
            error_log('trip_id param: ' . $request->request->get('trip_id'));
            
            if (!$images) {
                error_log('ERROR: No image uploaded - returning 400');
                return $this->json(['error' => 'No image uploaded', 'debug' => 'files is null'], Response::HTTP_BAD_REQUEST);
            }
            
            // Normalize to array
            $fileArray = [];
            if ($images instanceof UploadedFile) {
                $fileArray = [$images];
                error_log('Single file normalized to array');
            } elseif (is_array($images)) {
                $fileArray = $images;
                error_log('Images already array with ' . count($images) . ' items');
                // Debug each item
                foreach ($images as $k => $v) {
                    error_log("  Array[$k] type: " . gettype($v));
                }
            } else {
                error_log('WARNING: images is neither UploadedFile nor array, type: ' . gettype($images));
            }
            
            error_log('Final fileArray count: ' . count($fileArray));
            
            $uploadedUrls = [];
            foreach ($fileArray as $file) {
                if ($file instanceof UploadedFile && $file->isValid()) {
                    $extension = $file->guessExtension() ?: 'jpg';
                    $filename = time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
                    $file->move($uploadDir, $filename);
                    $uploadedUrls[] = '/uploads/trips/' . $filename;
                    error_log('Saved file: ' . $filename);
                } else {
                    error_log('Skipped invalid file');
                }
            }
            
            error_log('Upload complete, total URLs: ' . count($uploadedUrls));
            error_log('Upload complete, URLs: ' . json_encode($uploadedUrls));
            return $this->json(['urls' => $uploadedUrls], Response::HTTP_OK);
            
        } catch (\Throwable $e) {
            error_log('ERROR in uploadImage: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            return $this->json(['error' => 'Upload failed: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'api_trips_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ORGANIZER')]
    public function update(int $id, Request $request): JsonResponse
    {
        $trip = $this->tripRepo->find($id);
        if (!$trip) return $this->json(['error' => 'Trip not found'], Response::HTTP_NOT_FOUND);

        $user = $this->getUser();
        if ($trip->getOrganizer()->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        // Basic fields
        if (isset($data['title'])) $trip->setTitle($data['title']);
        if (isset($data['short_description'])) $trip->setShortDescription($data['short_description']);
        if (isset($data['long_description'])) $trip->setLongDescription($data['long_description']);
        if (isset($data['base_price'])) $trip->setBasePrice($data['base_price']);
        if (isset($data['duration_days'])) $trip->setDurationDays($data['duration_days']);
        if (isset($data['currency'])) $trip->setCurrency($data['currency']);
        if (isset($data['difficulty_level'])) $trip->setDifficultyLevel($data['difficulty_level']);
        if (isset($data['status'])) $trip->setStatus($data['status']);
        
        // JSON fields
        if (isset($data['tags'])) $trip->setTags($data['tags']);
        if (isset($data['inclusions'])) $trip->setInclusions($data['inclusions']);
        if (isset($data['exclusions'])) $trip->setExclusions($data['exclusions']);
        if (isset($data['meeting_point'])) $trip->setMeetingPoint($data['meeting_point']);
        if (isset($data['meeting_address'])) $trip->setMeetingAddress($data['meeting_address']);

        // Update session if dates provided
        if(isset($data['start_date']) && isset($data['end_date'])){
            // Remove existing sessions and create new one
            foreach($trip->getSessions() as $existingSession){
                $this->em->remove($existingSession);
            }
            
            $session = new TripSession();
            $session->setStartDate(new \DateTime($data['start_date']));
            $session->setEndDate(new \DateTime($data['end_date']));
            $session->setMaxCapacity($data['max_places'] ?? $data['capacity'] ?? 10);
            $session->setStatus('OPEN');
            $trip->addSession($session);
        }

        // Update destinations
        if(isset($data['destinations']) && is_array($data['destinations'])){
            // Clear existing destinations
            foreach($trip->getDestinations() as $dest){
                $trip->removeDestination($dest);
            }
            foreach($data['destinations'] as $destId){
                $destination = $this->em->getRepository(Destination::class)->find($destId);
                if($destination) $trip->addDestination($destination);
            }
        }
        // Handle single destination ID
        if(isset($data['destination']) && is_numeric($data['destination'])){
            foreach($trip->getDestinations() as $dest){
                $trip->removeDestination($dest);
            }
            $destination = $this->em->getRepository(Destination::class)->find($data['destination']);
            if($destination) $trip->addDestination($destination);
        }

        // Update category
        if(isset($data['category'])){
            foreach($trip->getCategories() as $cat){
                $trip->removeCategory($cat);
            }
            $category = $this->em->getRepository(Category::class)->find($data['category']);
            if($category) $trip->addCategory($category);
        }

        // Update programs
        if(isset($data['program']) && is_array($data['program'])){
            foreach($trip->getPrograms() as $prog){
                $this->em->remove($prog);
            }
            foreach($data['program'] as $programData){
                if(isset($programData['day']) || isset($programData['title'])){
                    $program = new TripProgram();
                    $program->setDayNumber($programData['day'] ?? 1);
                    $program->setTitle($programData['title'] ?? '');
                    $program->setDescription($programData['description'] ?? null);
                    $program->setTrip($trip);
                    $trip->addProgram($program);
                }
            }
        }

        $trip->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json($trip, Response::HTTP_OK, [], ['groups' => 'trip:read']);
    }

    #[Route('/{id}', name: 'api_trips_delete', methods: ['DELETE'])]
    public function delete(int $id, Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);

        $trip = $this->tripRepo->find($id);
        if (!$trip) return $this->json(['error' => 'Trip not found'], Response::HTTP_NOT_FOUND);

        if (!$trip->getOrganizer() || !$trip->getOrganizer()->getUser()) {
            return $this->json(['error' => 'Trip organizer invalid'], Response::HTTP_FORBIDDEN);
        }

        if ($trip->getOrganizer()->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $this->em->remove($trip);
        $this->em->flush();

        return $this->json(['message' => 'Trip deleted'], Response::HTTP_OK);
    }

    // Helper pour générer slug
    private function slugify(string $text): string
    {
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        return strtolower($text);
    }
}