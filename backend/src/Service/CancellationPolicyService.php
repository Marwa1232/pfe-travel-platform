<?php

namespace App\Service;

use App\Entity\CancellationPolicy;
use App\Entity\Trip;
use Doctrine\ORM\EntityManagerInterface;

class CancellationPolicyService
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    public function getPolicyRules(string $type): array
    {
        return match($type) {
            'flexible' => [
                ['days' => 1, 'refund' => 100],
                ['days' => 0, 'refund' => 0],
            ],
            'moderate' => [
                ['days' => 7, 'refund' => 100],
                ['days' => 3, 'refund' => 50],
                ['days' => 0, 'refund' => 0],
            ],
            'strict' => [
                ['days' => 7, 'refund' => 50],
                ['days' => 0, 'refund' => 0],
            ],
            default => [
                ['days' => 0, 'refund' => 0],
            ],
        };
    }

    public function createPolicy(Trip $trip, string $policyType, bool $allowVoucher, bool $allowRebooking): CancellationPolicy
    {
        $rules = $this->getPolicyRules($policyType);

        $policy = new CancellationPolicy();
        $policy->setTrip($trip);
        $policy->setRulesJson($rules);
        $policy->setAllowVoucher($allowVoucher);
        $policy->setAllowRebooking($allowRebooking);

        $this->em->persist($policy);
        $this->em->flush();

        return $policy;
    }

    public function calculateRefund(int $daysBefore, array $rules): int
    {
        foreach ($rules as $rule) {
            if ($daysBefore >= $rule['days']) {
                return $rule['refund'];
            }
        }
        return 0;
    }

    public function getCancelOptions(CancellationPolicy $policy, int $daysBefore, float $totalPrice): array
    {
        $refundPercent = $this->calculateRefund($daysBefore, $policy->getRulesJson());
        $refundAmount = $totalPrice * ($refundPercent / 100);

        $options = ['refund'];
        if ($policy->isAllowVoucher()) {
            $options[] = 'voucher';
        }
        if ($policy->isAllowRebooking()) {
            $options[] = 'rebooking';
        }

        return [
            'refundAmount' => round($refundAmount, 2),
            'refundPercent' => $refundPercent,
            'options' => $options,
        ];
    }
}
