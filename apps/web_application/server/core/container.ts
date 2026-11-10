import { redis } from "@/server/redis/redis";
import { MongooseDatabase } from "./database";
import { RedisCache } from "./cache";
import { NextAuthService } from "./auth";
import { RedisRateLimiter } from "./rate-limit";

import { MongoUrlRepository } from "@/server/modules/url/url.repository";
import { UrlService, CryptoShortCodeGenerator } from "@/server/modules/url/url.service";
import { UrlController } from "@/server/modules/url/url.controller";

import { MongoAnalyticsRepository } from "@/server/modules/analytics/analytics.repository";
import { AnalyticsService } from "@/server/modules/analytics/analytics.service";
import { AnalyticsController } from "@/server/modules/analytics/analytics.controller";
import { ClickTrackingQueue } from "@/server/modules/analytics/click-queue.service";

import { MongoDeviceClickRepository } from "@/server/modules/device/device.repository";
import { DeviceService } from "@/server/modules/device/device.service";
import { DeviceController } from "@/server/modules/device/device.controller";
import { getSharedGeoProvider } from "@/server/modules/device/geo";

import { MongoUserRepository } from "@/server/modules/user/user.repository";
import { CloudinaryImageStorage } from "@/server/modules/user/image-storage";
import { UserService } from "@/server/modules/user/user.service";
import { UserController } from "@/server/modules/user/user.controller";

import { HelloController } from "@/server/modules/hello/hello.controller";

import {
  MongoPageRepository,
  MongoPageVersionRepository,
  MongoPageViewRepository,
  MongoPageRedirectRepository,
} from "@/server/modules/pages/page.repositories";
import { PageCrudService } from "@/server/modules/pages/page-crud.service";
import { PagePublishService } from "@/server/modules/pages/page-publish.service";
import { PageTrackingService } from "@/server/modules/pages/page-tracking.service";
import { PageShortLinkService } from "@/server/modules/pages/page-shortlink.service";
import { PageService } from "@/server/modules/pages/page.service";
import { PageController } from "@/server/modules/pages/page.controller";
import { uploadPageAvatar } from "@/server/services/cloudinary";

import { MongoMailRepository } from "@/server/modules/mail/mail.repository";
import { AesGcmSecretCipher } from "@/server/modules/mail/mail-cipher";
import { NodemailerMailSender } from "@/server/modules/mail/mail-sender";
import { MailService } from "@/server/modules/mail/mail.service";
import { MailController } from "@/server/modules/mail/mail.controller";

/**
 * Composition root (DIP): builds the whole object graph once and injects
 * abstractions into every service/controller. Swap each implementation here
 * without touching domain code (OCP).
 */
class AppContainer {
  readonly db = new MongooseDatabase();
  readonly cache = new RedisCache(redis);
  readonly auth = new NextAuthService();
  readonly rateLimiter = new RedisRateLimiter(this.cache, "pages-rl");
  readonly deviceRateLimiter = new RedisRateLimiter(this.cache, "ratelimit");

  readonly urlRepository = new MongoUrlRepository(this.db, this.cache);
  readonly urlService = new UrlService(this.urlRepository, this.cache, new CryptoShortCodeGenerator());
  readonly urlController = new UrlController(this.auth, this.urlService);

  readonly analyticsRepository = new MongoAnalyticsRepository(this.db, this.cache);
  readonly analyticsService = new AnalyticsService(this.analyticsRepository);
  readonly analyticsController = new AnalyticsController(this.auth, this.analyticsService);

  readonly geo = getSharedGeoProvider(redis);
  readonly clickQueue = new ClickTrackingQueue(redis, this.db, this.geo);

  readonly deviceRepository = new MongoDeviceClickRepository(this.db);
  readonly deviceService = new DeviceService(this.deviceRepository, this.deviceRateLimiter, this.geo);
  readonly deviceController = new DeviceController(this.auth, this.deviceService);

  readonly userRepository = new MongoUserRepository(this.db);
  readonly imageStorage = new CloudinaryImageStorage();
  readonly userService = new UserService(this.userRepository, this.imageStorage);
  readonly userController = new UserController(this.auth, this.userService);

  readonly helloController = new HelloController(this.auth);

  readonly pageRepository = new MongoPageRepository(this.db);
  readonly pageVersionRepository = new MongoPageVersionRepository(this.db);
  readonly pageViewRepository = new MongoPageViewRepository(this.db);
  readonly pageRedirectRepository = new MongoPageRedirectRepository(this.db);

  readonly pageCrudService = new PageCrudService(this.pageRepository, this.pageRedirectRepository, this.db);
  readonly pagePublishService = new PagePublishService(this.pageRepository, this.pageVersionRepository);
  readonly pageTrackingService = new PageTrackingService(
    this.pageRepository,
    this.pageVersionRepository,
    this.pageViewRepository,
    this.pageRedirectRepository,
  );
  readonly pageShortLinkService = new PageShortLinkService(this.pageRepository, this.urlService, this.db);
  readonly pageService = new PageService(
    this.pageCrudService,
    this.pagePublishService,
    this.pageTrackingService,
    this.pageShortLinkService,
  );
  readonly pageController = new PageController(this.auth, this.pageService, this.rateLimiter, {
    upload: (buffer: Buffer) => uploadPageAvatar(buffer),
  });

  readonly mailRepository = new MongoMailRepository(this.db);
  readonly mailCipher = new AesGcmSecretCipher();
  readonly mailSender = new NodemailerMailSender();
  readonly mailService = new MailService(this.mailRepository, this.mailCipher, this.mailSender);
  readonly mailController = new MailController(this.auth, this.mailService);

  private workerStarted = false;

  /** Start background workers (idempotent; safe under HMR re-evaluation). */
  startWorkers(): void {
    if (this.workerStarted) return;
    this.workerStarted = true;
    this.clickQueue.startWorker();
  }
}

declare global {
  var _appContainer: AppContainer | undefined;
}

/** Process-wide singleton so Next.js/HMR re-evaluations reuse one graph. */
export const container: AppContainer = globalThis._appContainer ?? new AppContainer();
globalThis._appContainer = container;

export type { AppContainer };

