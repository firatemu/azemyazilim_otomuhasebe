---
description: Backend feature development workflow
---

# Backend Feature Development Workflow

Bu workflow, yeni bir backend feature eklerken takip edilmesi gereken adımları içerir.

## 1. Tenant Scope Kararı

**Soru**: Bu veri tenant-scoped mı yoksa global-scoped mı?

- **Tenant-scoped**: Her tenant için ayrı veri (örn: faturalar, müşteriler)
- **Global-scoped**: Tüm tenantlar için ortak (örn: ülkeler, para birimleri)

## 2. Prisma Schema Analizi

// turbo
```bash
cd /var/www/api-stage/server
```

**MCP Kullan**: `prisma-schema-mcp` ile mevcut şemayı analiz et

- İlgili modelleri kontrol et
- İlişkileri (relations) belirle
- Index ihtiyaçlarını değerlendir

## 3. Migration Oluştur

Schema değişikliği gerekiyorsa:

```bash
cd /var/www/api-stage/server
npx prisma migrate dev --name feature_name
```

## 4. DTO Oluştur

`src/modules/[module]/dto/` altında:

- `create-[entity].dto.ts`
- `update-[entity].dto.ts`
- `query-[entity].dto.ts`

**Zorunlu**: `class-validator` decorators kullan

```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEntityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

## 5. Service Oluştur

`src/modules/[module]/[module].service.ts`:

```typescript
@Injectable()
export class EntityService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.entity.findMany({
      where: { tenantId }, // ZORUNLU!
    });
  }

  async create(tenantId: string, dto: CreateEntityDto) {
    return this.prisma.entity.create({
      data: {
        ...dto,
        tenantId, // ZORUNLU!
      },
    });
  }
}
```

## 6. Controller Oluştur

`src/modules/[module]/[module].controller.ts`:

```typescript
@Controller('entity')
export class EntityController {
  constructor(private entityService: EntityService) {}

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    return this.entityService.findAll(tenantId);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateEntityDto,
  ) {
    return this.entityService.create(tenantId, dto);
  }
}
```

## 7. Cache Stratejisi (Opsiyonel)

Eğer cache gerekiyorsa:

**MCP Kullan**: `redis-cache-mcp`

Cache key formatı:
```
tenant:{tenantId}:{resource}:{id}
```

## 8. Async İşlemler (Opsiyonel)

Uzun süren işlemler için BullMQ job oluştur:

- Email gönderimi
- PDF/Excel üretimi
- Raporlama
- Dış API entegrasyonları

## 9. Guard ve RBAC

Gerekli yetkilendirmeleri ekle:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'user')
@Post()
async create(...) { ... }
```

## 10. Test

// turbo
```bash
cd /var/www/api-stage/server
npm run start:dev
```

**MCP Kullan**: `api-docs-mcp` ile endpoint'leri test et

## 11. Production Deploy

Migration'ı production'a uygula:

```bash
cd /var/www/api-prod/server
npx prisma migrate deploy
```

// turbo
```bash
docker restart compose-backend-production-1
```

## ✅ Checklist

- [ ] Tenant scope kararı verildi
- [ ] Prisma schema güncellendi
- [ ] Migration oluşturuldu
- [ ] DTO'lar oluşturuldu (validation ile)
- [ ] Service oluşturuldu (tenantId ile)
- [ ] Controller oluşturuldu (@CurrentTenant ile)
- [ ] Cache stratejisi belirlendi
- [ ] Async işlemler ayrıldı
- [ ] Guard ve RBAC eklendi
- [ ] Staging'de test edildi
- [ ] Production'a deploy edildi
