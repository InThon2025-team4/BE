import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import * as admin from 'firebase-admin';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const APP_NAME = 'InThon-team4';
        // Prefer environment variable from `.env`, fall back to ConfigService
        const serviceAccountPathOrJson =
          process.env.FIREBASE_ADMIN_PATH ||
          configService.get<string>('FIREBASE_ADMIN_PATH') ||
          configService.get<string>('firebaseAdminPath');

        if (!serviceAccountPathOrJson) {
          throw new Error(
            'FIREBASE_ADMIN_PATH is not set. Please set it in your .env file (either path to service account JSON or the JSON content).',
          );
        }

        // Allow either a file path to the service account JSON or the JSON content itself
        let serviceAccount: admin.ServiceAccount;
        try {
          const trimmed = serviceAccountPathOrJson.trim();
          if (trimmed.startsWith('{')) {
            serviceAccount = JSON.parse(trimmed) as admin.ServiceAccount;
          } else {
            serviceAccount = JSON.parse(
              readFileSync(serviceAccountPathOrJson, 'utf8'),
            ) as admin.ServiceAccount;
          }
        } catch (err) {
          throw new Error(`Failed to load Firebase service account: ${err?.message || err}`);
        }

        if (
          !admin.apps.length ||
          !admin.apps.find((app) => app.name === APP_NAME)
        ) {
          return admin.initializeApp(
            {
              credential: admin.credential.cert(
                serviceAccount as admin.ServiceAccount,
              ),
              projectId: 'inthon-team4',
            },
            APP_NAME,
          );
        }

        return admin.app(APP_NAME);
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
