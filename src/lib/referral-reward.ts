import { db } from '@/lib/db'

// Credits the referrer ONCE when their referee's order is genuinely fulfilled
// (payment captured or delivered). Atomic + idempotent: the pending→completed
// transition is gated inside a transaction with a status guard, so concurrent
// orders / status updates cannot double-credit.
export async function completeReferralReward(userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, referredById: true } })
  if (!user?.referredById) return

  const ref = await db.referral.findFirst({
    where: { referrerId: user.referredById, refereeEmail: user.email, status: 'pending' },
  })
  if (!ref) return

  await db.$transaction(async (tx) => {
    // Guarded update — only succeeds if still pending (idempotency lock)
    const updated = await tx.referral.updateMany({
      where: { id: ref.id, status: 'pending' },
      data: { status: 'completed' },
    })
    if (updated.count === 0) return // already completed by a concurrent call
    await tx.user.update({
      where: { id: user.referredById! },
      data: { referralCredits: { increment: ref.rewardAmount } },
    })
  })
}
