import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { HizliService } from './hizli.service';

@Controller('hizli')
export class HizliController {
  constructor(private readonly hizliService: HizliService) {}

  @Public()
  @Get('token-status')
  async getTokenStatus() {
    return this.hizliService.getTokenStatus();
  }

  @Public()
  @Get('incoming')
  async getIncoming(
    @Query('appType') appType?: number,
    @Query('dateType') dateType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('isNew') isNew?: boolean,
    @Query('isExport') isExport?: boolean,
    @Query('isDraft') isDraft?: boolean,
    @Query('takenFromEntegrator') takenFromEntegrator?: string,
  ) {
    // DateType varsayılan olarak "CreatedDate" (C# örneğinde kullanılıyor)
    // AppType varsayılan olarak 1 (Gelen e-Fatura)
    return this.hizliService.getIncoming(
      appType ? Number(appType) : 1, // Varsayılan: Gelen e-Fatura
      dateType || 'CreatedDate', // Varsayılan: CreatedDate (C# örneğinde kullanılıyor)
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      isNew === true,
      isExport === true,
      isDraft !== undefined ? (isDraft === true) : null,
      takenFromEntegrator || 'ALL', // Varsayılan: ALL
      null,
    );
  }

  @Public()
  @Post('util-encrypt')
  async utilEncrypt(@Body() body: { username: string; password: string; secretKey: string }) {
    return this.hizliService.utilEncrypt(body.username, body.password, body.secretKey);
  }

  @Public()
  @Post('login')
  async login(@Body() body: { usernameHash: string; passwordHash: string; apiKey: string }) {
    return this.hizliService.login(body.usernameHash, body.passwordHash, body.apiKey);
  }

  @Public()
  @Get('urn-config')
  async getUrnConfig() {
    return this.hizliService.getUrnConfig();
  }

  @Public()
  @Post('auto-login')
  async autoLogin() {
    return this.hizliService.autoLogin();
  }

  @Public()
  @Post('check-and-refresh-token')
  async checkAndRefreshToken() {
    return this.hizliService.checkAndRefreshToken();
  }

  @Public()
  @Get('document-content')
  async getDocumentContent(@Query('uuid') uuid: string, @Query('type') type?: string) {
    // #region agent log
    fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hizli.controller.ts:74',message:'getDocumentContent called',data:{uuid,type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!uuid) {
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hizli.controller.ts:77',message:'UUID missing error',data:{uuid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw new Error('UUID parametresi gerekli');
    }
    // #region agent log
    fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hizli.controller.ts:81',message:'Calling service.getDocumentContent',data:{uuid,type:type || 'XML'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const result: any = await this.hizliService.getDocumentContent(uuid, type || 'XML');
    // #region agent log
    fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hizli.controller.ts:85',message:'getDocumentContent result',data:{hasContent:!!result?.content,contentLength:result?.content?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return result;
  }
}

