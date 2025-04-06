import { Platform } from "../src/context/AuthContext";
import { PlatformService } from "./common";
import { ClassroomService } from "./ClassroomService";
import { CanvasService } from "./CanvasService";

export class PlatformServiceFactory {
  private static instance: PlatformServiceFactory;
  private services: Map<Platform, PlatformService>;

  private constructor() {
    this.services = new Map([
      ["classroom", new ClassroomService()],
      ["canvas", new CanvasService()],
    ]);
  }

  static getInstance(): PlatformServiceFactory {
    if (!PlatformServiceFactory.instance) {
      PlatformServiceFactory.instance = new PlatformServiceFactory();
    }
    return PlatformServiceFactory.instance;
  }

  getService(platform: Platform): PlatformService {
    const service = this.services.get(platform);
    if (!service) {
      throw new Error(`No service found for platform: ${platform}`);
    }
    return service;
  }
}
