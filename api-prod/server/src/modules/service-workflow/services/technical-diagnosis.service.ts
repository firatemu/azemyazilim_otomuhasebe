import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ServiceWorkStatus,
  WorkOrderStatus,
} from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';
import { TenantContextService } from '../../../common/services/tenant-context.service';
import { TenantResolverService } from '../../../common/services/tenant-resolver.service';
import { buildTenantWhereClause, isStagingEnvironment } from '../../../common/utils/staging.util';
import {
  CreateDiagnosticNoteDto,
  CreateTechnicalFindingDto,
  UpdateTechnicalFindingDto,
} from '../dto';

@Injectable()
export class TechnicalDiagnosisService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
    private tenantResolver: TenantResolverService,
  ) {}

  private getUserIdOrThrow(): string {
    const userId = this.tenantContext.getUserId();
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return userId;
  }

  /**
   * WorkOrder bul ve doğrula
   */
  private async findWorkOrderOrThrow(
    workOrderId: string,
    tx: Prisma.TransactionClient,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const workOrder = await tx.workOrder.findFirst({
      where: {
        id: workOrderId,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });

    if (!workOrder) {
      throw new NotFoundException('WorkOrder not found or tenant mismatch');
    }

    // CLOSED veya CANCELLED durumunda değişiklik yapılamaz
    if (
      workOrder.status === WorkOrderStatus.CLOSED ||
      workOrder.status === WorkOrderStatus.CANCELLED
    ) {
      throw new ForbiddenException(
        `WorkOrder is ${workOrder.status === WorkOrderStatus.CLOSED ? 'CLOSED' : 'CANCELLED'}. Cannot modify.`,
      );
    }

    return workOrder;
  }

  /**
   * WorkOrder durumunu TECHNICAL_DIAGNOSIS'e güncelle ve history oluştur
   */
  private async updateWorkOrderStatusToTechnicalDiagnosis(
    workOrderId: string,
    userId: string,
    tx: Prisma.TransactionClient,
  ) {
    // #region agent log
    fetch('http://localhost:7247/ingest/4fbe5973-d45f-4058-9235-4d634c6bd17e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'technical-diagnosis.service.ts:97', message: 'updateWorkOrderStatusToTechnicalDiagnosis entry', data: { workOrderId, userId }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);
    // TenantId staging'de gereksiz, workOrder'dan alınacak

    // Eğer zaten DIAGNOSIS durumundaysa, sadece history ekle
    if (workOrder.status === WorkOrderStatus.DIAGNOSIS) {
      // History kaydı oluştur (ServiceWorkStatus kullanarak)
      // TenantId staging'de gereksiz - workOrder'dan al
      const finalTenantId = workOrder.tenantId || '';
      // #region agent log
      fetch('http://localhost:7247/ingest/4fbe5973-d45f-4058-9235-4d634c6bd17e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'technical-diagnosis.service.ts:111', message: 'Before workOrderStatusHistory.create - DIAGNOSIS branch', data: { finalTenantId, workOrderId, fromStatus: 'TECHNICAL_DIAGNOSIS', toStatus: 'TECHNICAL_DIAGNOSIS' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
      await tx.workOrderStatusHistory.create({
        data: {
          tenantId: finalTenantId,
          workOrderId,
          fromStatus: ServiceWorkStatus.TECHNICAL_DIAGNOSIS,
          toStatus: ServiceWorkStatus.TECHNICAL_DIAGNOSIS,
          changedBy: userId,
          reason: 'Technical finding or diagnostic note created/updated',
        },
      });
      return;
    }

    // Durum güncelle (WorkOrderStatus.DIAGNOSIS kullan)
    await tx.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: WorkOrderStatus.DIAGNOSIS,
        diagnosisAt: workOrder.diagnosisAt || new Date(),
      },
    });

    // History kaydı oluştur (ServiceWorkStatus kullanarak)
    const fromStatus =
      workOrder.status === WorkOrderStatus.ACCEPTED
        ? ServiceWorkStatus.SERVICE_ACCEPTED
        : null; // Diğer durumlar için null

    // TenantId staging'de gereksiz - workOrder'dan al
    const finalTenantId = workOrder.tenantId || '';
    // #region agent log
    fetch('http://localhost:7247/ingest/4fbe5973-d45f-4058-9235-4d634c6bd17e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'technical-diagnosis.service.ts:142', message: 'Before workOrderStatusHistory.create - status update branch', data: { finalTenantId, workOrderId, fromStatus, toStatus: 'TECHNICAL_DIAGNOSIS' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    await tx.workOrderStatusHistory.create({
      data: {
        tenantId: finalTenantId,
        workOrderId,
        fromStatus,
        toStatus: ServiceWorkStatus.TECHNICAL_DIAGNOSIS,
        changedBy: userId,
        reason: 'Technical finding or diagnostic note created/updated',
      },
    });
  }

  /**
   * Create Technical Finding
   */
  async createFinding(
    dto: CreateTechnicalFindingDto,
    userId: string,
    tenantId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // WorkOrder doğrula
      const workOrder = await this.findWorkOrderOrThrow(dto.workOrderId, tx);

      // TenantId'yi belirle (staging'de workOrder'dan alınabilir)
      const finalTenantId = tenantId || workOrder.tenantId;

      // TechnicalFinding oluştur
      const finding = await tx.technicalFinding.create({
        data: {
          tenantId: finalTenantId,
          workOrderId: dto.workOrderId,
          title: dto.title,
          description: dto.description,
          createdBy: userId,
        },
      });

      // WorkOrder durumunu güncelle ve history oluştur
      await this.updateWorkOrderStatusToTechnicalDiagnosis(
        dto.workOrderId,
        userId,
        tx,
      );

      return finding;
    });
  }

  /**
   * Update Technical Finding
   */
  async updateFinding(
    id: string,
    dto: UpdateTechnicalFindingDto,
    userId: string,
    tenantId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const tenantIdFilter = tenantId ? { tenantId } : {};

      // Mevcut finding'i bul
      const existingFinding = await tx.technicalFinding.findFirst({
        where: {
          id,
          ...tenantIdFilter,
        },
      });

      if (!existingFinding) {
        throw new NotFoundException('Technical finding not found');
      }

      // Optimistic locking kontrolü
      if (existingFinding.version !== dto.version) {
        throw new ConflictException(
          'Version mismatch. The finding has been modified by another user.',
        );
      }

      // WorkOrder doğrula
      await this.findWorkOrderOrThrow(existingFinding.workOrderId, tx);

      // Finding güncelle
      const updatedFinding = await tx.technicalFinding.update({
        where: { id },
        data: {
          title: dto.title ?? existingFinding.title,
          description: dto.description ?? existingFinding.description,
          version: { increment: 1 },
        },
      });

      // WorkOrder durumunu güncelle ve history oluştur
      await this.updateWorkOrderStatusToTechnicalDiagnosis(
        existingFinding.workOrderId,
        userId,
        tx,
      );

      return updatedFinding;
    });
  }

  /**
   * Get Findings by WorkOrder
   */
  async getFindingsByWorkOrder(workOrderId: string, tenantId: string) {
    const tenantIdFilter = tenantId ? { tenantId } : {};

    // WorkOrder'ın var olduğunu doğrula
    const workOrderWhere: any = { id: workOrderId };
    if (tenantId) {
      workOrderWhere.tenantId = tenantId;
    }

    const workOrder = await this.prisma.workOrder.findFirst({
      where: workOrderWhere,
    });

    if (!workOrder) {
      throw new NotFoundException('WorkOrder not found or tenant mismatch');
    }

    // Findings'leri getir
    return this.prisma.technicalFinding.findMany({
      where: {
        workOrderId,
        ...tenantIdFilter,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Create Diagnostic Note
   */
  async createNote(
    dto: CreateDiagnosticNoteDto,
    userId: string,
    tenantId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // WorkOrder doğrula
      const workOrder = await this.findWorkOrderOrThrow(dto.workOrderId, tx);

      // TenantId'yi belirle - staging'de workOrder'dan al (tenantId gereksiz)
      let finalTenantId: string;

      if (isStagingEnvironment()) {
        // Staging'de tenantId gereksiz - workOrder'dan al (eğer varsa)
        finalTenantId = workOrder.tenantId || '';
      } else {
        // Production'da tenantId zorunlu
        finalTenantId = tenantId || workOrder.tenantId;
        if (!finalTenantId) {
          throw new BadRequestException('Tenant ID is required in production environment');
        }
      }

      // DiagnosticNote oluştur
      const note = await tx.diagnosticNote.create({
        data: {
          tenantId: finalTenantId,
          workOrderId: dto.workOrderId,
          note: dto.note,
          createdBy: userId,
        },
      });

      // WorkOrder durumunu güncelle ve history oluştur
      await this.updateWorkOrderStatusToTechnicalDiagnosis(
        dto.workOrderId,
        userId,
        tx,
      );

      return note;
    });
  }

  /**
   * Get Notes by WorkOrder
   */
  async getNotesByWorkOrder(workOrderId: string, tenantId: string) {
    // Staging'de tenantId opsiyonel
    const tenantIdFilter = buildTenantWhereClause(tenantId || undefined);

    // WorkOrder'ın var olduğunu doğrula - staging'de tenantId opsiyonel
    const workOrderWhere: any = { id: workOrderId };
    if (!isStagingEnvironment() && tenantId) {
      workOrderWhere.tenantId = tenantId;
    }

    const workOrder = await this.prisma.workOrder.findFirst({
      where: workOrderWhere,
    });

    if (!workOrder) {
      throw new NotFoundException('WorkOrder not found');
    }

    // Notes'ları getir - staging'de tenantId filtresi opsiyonel
    return this.prisma.diagnosticNote.findMany({
      where: {
        workOrderId,
        ...tenantIdFilter,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

