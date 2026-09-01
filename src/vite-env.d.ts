/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADSENSE_CLIENT?: string
  readonly VITE_GA_MEASUREMENT_ID?: string
  readonly VITE_CLARITY_ID?: string
  readonly VITE_APP_URL?: string
  readonly APP_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
