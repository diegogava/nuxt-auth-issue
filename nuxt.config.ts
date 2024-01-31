// https://nuxt.com/docs/api/configuration/nuxt-config
// Environment variables
require('dotenv')
    .config({ path: './env/.env' })

import { resolve } from "node:path"

export default defineNuxtConfig({
  modules: ["@hebilicious/authjs-nuxt"],
  alias: {
    cookie: resolve(__dirname, "node_modules/cookie")
  },
  authJs: {
    guestRedirectTo: "/"
  },
  components: true,
  delayHydration: {
        // enables nuxt-delay-hydration in dev mode for testing
        debug: process.env.NODE_ENV === 'development',
        mode: 'init'
    },
  ssr: true,
  nitro: {
    compressPublicAssets: true,
    routeRules: {
      "/": { ssr: true, prerender: true },
      "/private": { ssr: true, prerender: true }
    }
  },
  devtools: {
    enabled: false
  },
  experimental: {
    renderJsonPayloads: true
  },
  runtimeConfig: {
        LOGIN_FACEBOOK_CLIENT_ID: process.env.LOGIN_FACEBOOK_CLIENT_ID,
        LOGIN_FACEBOOK_USER_INFO: process.env.LOGIN_FACEBOOK_USER_INFO,
        LOGIN_FACEBOOK_CLIENT_SECRET: process.env.LOGIN_FACEBOOK_CLIENT_SECRET,
        LOGIN_GOOGLE_CLIENT_ID: process.env.LOGIN_GOOGLE_CLIENT_ID,
        LOGIN_GOOGLE_CLIENT_SECRET: process.env.LOGIN_GOOGLE_CLIENT_SECRET,
        NUXT_AUTH_SECRET: process.env.NUXT_AUTH_SECRET,
        public: {
            BACKEND_URL: process.env.BACKEND_URL,
            BACKEND_PORT: process.env.BACKEND_PORT,
            BACKEND_VERSION: process.env.BACKEND_VERSION,
            BACKEND_COMPLETE_URL: process.env.BACKEND_COMPLETE_URL,
            BASE_URL: process.env.BASE_URL,
            BRASIL_COUNTRY_CODE: process.env.BRASIL_COUNTRY_CODE,
            HOST: process.env.HOST,
            HTTP_STATUS_CODE_OK: process.env.HTTP_STATUS_CODE_OK,
            HTTP_STATUS_CODE_CREATED: process.env.HTTP_STATUS_CODE_CREATED,
            HTTP_STATUS_CODE_NO_CONTENT: process.env.HTTP_STATUS_CODE_NO_CONTENT,
            HTTP_STATUS_CODE_MOVED_PERMANENTLY: process.env.HTTP_STATUS_CODE_MOVED_PERMANENTLY,
            HTTP_STATUS_CODE_NOT_MODIFIED: process.env.HTTP_STATUS_CODE_NOT_MODIFIED,
            HTTP_STATUS_CODE_BAD_REQUEST: process.env.HTTP_STATUS_CODE_BAD_REQUEST,
            HTTP_STATUS_CODE_UNAUTHORIZED: process.env.HTTP_STATUS_CODE_UNAUTHORIZED,
            HTTP_STATUS_CODE_FORBIDDEN: process.env.HTTP_STATUS_CODE_FORBIDDEN,
            HTTP_STATUS_CODE_NOT_FOUND: process.env.HTTP_STATUS_CODE_NOT_FOUND,
            HTTP_STATUS_CODE_METHOD_NOT_ALLOWED: process.env.HTTP_STATUS_CODE_METHOD_NOT_ALLOWED,
            HTTP_STATUS_CODE_TOO_MANY_REQUESTS: process.env.HTTP_STATUS_CODE_TOO_MANY_REQUESTS,
            HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR: process.env.HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR,
            HTTP_STATUS_CODE_NOT_BAD_GATEWAY: process.env.HTTP_STATUS_CODE_NOT_BAD_GATEWAY,
            HTTP_STATUS_CODE_SERVICE_UNAVAILABLE: process.env.HTTP_STATUS_CODE_SERVICE_UNAVAILABLE,
            HTTP_STATUS_CODE_GATEWAY_TIMEOUT: process.env.HTTP_STATUS_CODE_GATEWAY_TIMEOUT,
            LOGIN_CHECK_INTERVAL: process.env.LOGIN_CHECK_INTERVAL,
            LOGIN_ACCESS_TOKEN_MAX_AGE: process.env.LOGIN_ACCESS_TOKEN_MAX_AGE,
            LOGIN_REFRESH_TOKEN_MAX_AGE: process.env.LOGIN_REFRESH_TOKEN_MAX_AGE,
            MESSAGE_CODE_USER_ACCESS_TOKEN_MISSING: process.env.MESSAGE_CODE_USER_ACCESS_TOKEN_MISSING,
            MESSAGE_CODE_USER_ACCESS_TOKEN_INVALID: process.env.MESSAGE_CODE_USER_ACCESS_TOKEN_INVALID,
            MESSAGE_CODE_USER_ACCESS_TOKEN_EXPIRED: process.env.MESSAGE_CODE_USER_ACCESS_TOKEN_EXPIRED,
            MESSAGE_CODE_USER_ACCESS_TOKEN_IN_BLOCKLIST: process.env.MESSAGE_CODE_USER_ACCESS_TOKEN_IN_BLOCKLIST,
            MESSAGE_CODE_USER_REFRESH_TOKEN_MISSING: process.env.MESSAGE_CODE_USER_REFRESH_TOKEN_MISSING,
            MESSAGE_CODE_USER_REFRESH_TOKEN_INVALID: process.env.MESSAGE_CODE_USER_REFRESH_TOKEN_INVALID,
            MESSAGE_CODE_USER_REFRESH_TOKEN_EXPIRED: process.env.MESSAGE_CODE_USER_REFRESH_TOKEN_EXPIRED,
            MESSAGE_CODE_USER_REFRESH_TOKEN_NOT_IN_ALLOWLIST: process.env.MESSAGE_CODE_USER_REFRESH_TOKEN_NOT_IN_ALLOWLIST,
            PORT: process.env.PORT,
            SECRET_TOKEN: process.env.SECRET_TOKEN,
            SITE_AUTHOR: process.env.SITE_AUTHOR,
            SITE_DESCRIPTION: process.env.SITE_DESCRIPTION,
            SITE_KEYWORDS: process.env.SITE_KEYWORDS,
            SITE_DESCRIPTION_SHORT: process.env.SITE_DESCRIPTION_SHORT,
            SITE_DESCRIPTION_ALT_1: process.env.SITE_DESCRIPTION_ALT_1,
            SITE_TITLE: process.env.SITE_TITLE,
            SITE_MAP_HOST_NAME: process.env.SITE_MAP_HOST_NAME,
            SITE_MAP_LAST_MODIFICATION: process.env.SITE_MAP_LAST_MODIFICATION,
        }
  },
  typescript: { shim: false, strict: true, },
})
