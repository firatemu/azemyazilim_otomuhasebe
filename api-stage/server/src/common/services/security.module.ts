import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CipherService } from './cipher.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [CipherService],
    exports: [CipherService],
})
export class SecurityModule { }
