import type { AuthenticationEnvironment } from "@/auth/environment";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import type { ReconciliationResult } from "@/financial-assurance/types";
import { getPrismaClient } from "@/persistence/prisma";
import { effect } from "@/transactions/domain";

export class FinancialAssuranceReadError extends Error {
  constructor(
    public readonly code: "NOT_FOUND",
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "FinancialAssuranceReadError";
  }
}

export function reconciliationResult(input: {
  student: ReconciliationResult["student"];
  persistedBalance: bigint;
  calculatedBalance: bigint;
  activeTransactionCount: number;
  financialVersion: number;
  checkedAt: Date;
}): ReconciliationResult {
  const difference = input.persistedBalance - input.calculatedBalance;

  return {
    student: input.student,
    persistedBalance: input.persistedBalance.toString(),
    calculatedBalance: input.calculatedBalance.toString(),
    difference: difference.toString(),
    activeTransactionCount: input.activeTransactionCount,
    financialVersion: input.financialVersion,
    checkedAt: input.checkedAt.toISOString(),
    integrityStatus: difference === BigInt(0) ? "MATCHED" : "MISMATCHED"
  };
}

export function financialAssuranceReadService(
  environment: AuthenticationEnvironment = loadAuthenticationEnvironment(),
  now: () => Date = () => new Date()
) {
  const prisma = getPrismaClient(environment);

  return {
    async reconcile(operatorId: string, studentId: string): Promise<ReconciliationResult> {
      return prisma.$transaction(async (transaction) => {
        const student = await transaction.student.findFirst({
          where: { id: studentId, operatorId },
          select: {
            id: true,
            name: true,
            status: true,
            balance: true,
            financialVersion: true
          }
        });

        if (!student) {
          throw new FinancialAssuranceReadError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
        }

        const groups = await transaction.transaction.groupBy({
          by: ["type", "correctionDirection"],
          where: { studentId: student.id, deletedAt: null },
          _sum: { amount: true },
          _count: { _all: true }
        });

        let calculatedBalance = BigInt(0);
        let activeTransactionCount = 0;

        for (const group of groups) {
          calculatedBalance += effect({
            type: group.type,
            amount: group._sum.amount ?? BigInt(0),
            correctionDirection: group.correctionDirection
          });
          activeTransactionCount += group._count._all;
        }

        return reconciliationResult({
          student: {
            id: student.id,
            name: student.name,
            status: student.status
          },
          persistedBalance: student.balance,
          calculatedBalance,
          activeTransactionCount,
          financialVersion: student.financialVersion,
          checkedAt: now()
        });
      });
    }
  };
}
