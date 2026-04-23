use Dotenv\Dotenv;
use Stripe\StripeClient;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/payments')]
class PaymentController extends AbstractController
{
    private StripeClient $stripe;

    public function __construct(
        private EntityManagerInterface $em,
        private BookingRepository $bookingRepo,
        private PaymentRepository $paymentRepo,
        private CancellationPolicyService $policyService,
        private NotificationService $notificationService,
        private JwtService $jwtService,
        private string $stripeSecretKey,
        private string $stripeWebhookSecret,
    ) {
        // Configure Stripe client with explicit SSL CA bundle for environments with outdated bundles
        $caBundlePath = __DIR__ . '/../../../../ssl/cacert.pem';
        $stripeConfig = [
            'stripe_account' => null,
            'stripe_version' => null,
            'http_client' => \Symfony\Component\HttpClient\HttpClient::create([
                'verify_peer' => true,
                'verify_host' => 2,
                'ssl' => [
                    'cafile' => file_exists($caBundlePath) ? $caBundlePath : null,
                ],
            ]),
        ];
        $this->stripe = new StripeClient($this->stripeSecretKey, $stripeConfig);
    }