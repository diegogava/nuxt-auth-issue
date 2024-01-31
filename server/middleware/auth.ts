import { encode, decode, type JWT } from '@auth/core/jwt'
import { authOptions } from '../api/auth/[...]'
import { getServerSession, getServerToken } from '#auth'


const runtimeConfig = useRuntimeConfig()

const BACKEND_COMPLETE_URL = `${runtimeConfig.public.BACKEND_URL}:${runtimeConfig.public.BACKEND_PORT}/${runtimeConfig.public.BACKEND_VERSION}`


const printLog = true

let isRefreshing = false

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(
    token: any
) {

    if (isRefreshing) {
		return token;
	}

	// const timeInSeconds = Math.floor(Date.now() / 1000);
	isRefreshing = true

    try {
        if (printLog) {
            console.log('auth-middleware-debug: ---------------------------- START REFRESHING TOKEN ------------------------')
            // console.log('auth-middleware-debug: ---------------------------- token: ', token)
        }
        const oldRefreshToken = token.refreshToken ? token.refreshToken :
            token.user && token.user.refreshToken ? token.user.refreshToken : null
        // const oldRefreshToken = token.refreshToken ? token.refreshToken : null
        if (printLog) {
            console.log('auth-middleware-debug: ---------------------------- old refreshToken: ', oldRefreshToken)
        }
        const refreshTokenRequest = await fetch(
            `${BACKEND_COMPLETE_URL}/auth/refresh-access-token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "token": `${runtimeConfig.SECRET_TOKEN}`,
              },
              body: JSON.stringify({refresh_token: oldRefreshToken}),
            }
        );
        const requestJson = await refreshTokenRequest.json()
        const newAccessToken = refreshTokenRequest.headers.get("Authorization")
        const newRefreshToken = requestJson && requestJson.data ? requestJson.data.refresh_token : null
        if (printLog) {
            // console.log('auth-middleware-debug: ---------------------------- new accessToken: ', newAccessToken)
            console.log('auth-middleware-debug: ---------------------------- new refreshToken: ', newRefreshToken)
        }
        if (!newAccessToken || !newRefreshToken) {
          if (requestJson && requestJson.message) {
            // throw new Error(requestJson.message)
          }
          throw requestJson
        }
        token.user.accessToken  = newAccessToken
        token.user.refreshToken = newRefreshToken
        return {
            ...token,
          accessTokenExpires: Date.now() + parseInt(runtimeConfig.public.LOGIN_ACCESS_TOKEN_MAX_AGE) * 1000,
          refreshTokenExpires: Date.now() + parseInt(runtimeConfig.public.LOGIN_REFRESH_TOKEN_MAX_AGE) * 1000,
        }
    } catch (error) {
        if (printLog) {
            console.warn('auth-middleware-debug: ---------------------------- Error refreshing token: ', error)
        }
        return {
          ...token,
          error: "RefreshAccessTokenError",
        }
    } finally {
        isRefreshing = false
        if (printLog) {
            console.log('auth-middleware-debug: ---------------------------- END REFRESHING TOKEN ----------------------------')
        }
    }
}

function shouldUpdateToken(token: any): boolean {
	return !(Date.now() < token.accessTokenExpires)
}

async function signOut(event: any) {
    deleteCookie(event, 'next-auth.session-token')
    if (printLog) {
        console.log('auth-middleware-debug: ---------------------------- LOGOUT!! ----------------------------- ')
        // const sessionCookie = getCookie(event, 'next-auth.session-token')
        // console.log('auth-middleware-debug: LOGOUT - session cookie: ', sessionCookie)
    }
}

/**
 *
 */
async function refreshAndSaveCookie(token: JWT, event: any) {

    try {
        const refresh = await refreshAccessToken(token)
        if (printLog) {
            console.log('auth-middleware-debug: refresh: ', refresh)
        }
        // if (refresh.error && refresh.error === 'RefreshAccessTokenError') {
        //     return await signOut(event)
        // }
        const newSessionToken = await encode({
            secret: runtimeConfig.NUXT_AUTH_SECRET,
            token: {
                ...refresh,
                accessToken: refresh.accessToken,
                refreshToken: refresh.refreshToken,
                accessTokenExpires: refresh.accessTokenExpires,
            },
            maxAge: 30 * 24 * 60 * 60, // 30 days, or get the previous token's exp
        })
        // console.log('auth-middleware-debug: new session token: ', newSessionToken)
        setCookie(event, 'next-auth.session-token', newSessionToken)
    } catch (err) {
        if (printLog) {
            console.warn('auth-middleware-debug: Error: ', err)
        }
    }
}

export default defineEventHandler(async (event) => {

    if (printLog) {
        console.log('auth-middleware-debug: ---------------------------- START AUTH MIDDLEWARE -----------------------------')
        console.log('auth-middleware-debug: (event req original url): ', event.node.req.originalUrl)
        console.log('auth-middleware-debug: (event context): ', event.context)
    }
    const session = await getServerSession(event, authOptions)
    const token = await getServerToken(event, authOptions)
    // const sessionCookieBefore = getCookie(event, 'next-auth.session-token')
    // const cookieDelete = deleteCookie(event, 'next-auth.session-token')
    // const sessionCookie = getCookie(event, 'next-auth.session-token')

    if (printLog) {
        // console.log('auth-middleware-debug: session: ', session)
        console.log('auth-middleware-debug: token: ', token)
        // console.log('auth-middleware-debug: session token before: ', sessionCookieBefore)
        // console.log('auth-middleware-debug: cookieDelete: ', cookieDelete)
        // console.log('auth-middleware-debug: session token: ', sessionCookie)
    }

    // if (sessionCookie) {
    //     const decodedJWT = await decode({token: sessionCookie, secret: runtimeConfig.NUXT_AUTH_SECRET})
    //     if (printLog) {
    //         console.log('auth-middleware-debug: decoded token: ', decodedJWT)
    //     }
    // }

    if (session && token) {
        if (printLog) {
            console.log('auth-middleware-debug: shouldUpdateToken(token): ', shouldUpdateToken(token))
        }
        if (shouldUpdateToken(token)) {
            await refreshAndSaveCookie(token, event)
        }
    }
    if (printLog) {
        console.log('auth-middleware-debug: ---------------------------- END AUTH MIDDLEWARE -----------------------------')
    }
})