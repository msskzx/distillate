import type { DistillateApi } from '../../shared/bridge'

declare global {
  interface Window {
    distillate: DistillateApi
  }
}

export {}
