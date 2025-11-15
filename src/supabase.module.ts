import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService): SupabaseClient => {
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const supabaseServiceKey = configService.get<string>('SUPABASE_SERVICE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
          throw new Error(
            'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in your .env file.',
          );
        }

        return createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
      },
    },
  ],
  exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule {}
