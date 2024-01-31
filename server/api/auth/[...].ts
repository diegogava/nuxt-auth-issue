import CredentialsProvider from "@auth/core/providers/credentials"
import GoogleProvider from "@auth/core/providers/google"
import FacebookProvider from "@auth/core/providers/facebook"

import type { AuthConfig } from "@auth/core/types"

import { NuxtAuthHandler } from "#auth"

// The #auth virtual import comes from this module. You can use it on the client
// and server side, however not every export is universal. For example do not
// use sign-in and sign-out on the server side.

const runtimeConfig = useRuntimeConfig()

const BACKEND_COMPLETE_URL = `${runtimeConfig.public.BACKEND_URL}:${runtimeConfig.public.BACKEND_PORT}/${runtimeConfig.public.BACKEND_VERSION}`

const printLog = true

/**
 *
 * @param credentials
 * @returns
 */
async function login(credentials: any) {
    const payload = {
        emailOrUsername: credentials.emailOrUsername,
        password: credentials.password,
    }
    const userTokens = await fetch(
        `${BACKEND_COMPLETE_URL}/auth/login`,
        {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
                "token": `${runtimeConfig.SECRET_TOKEN}`,
            },
        }
    );

    const accessToken = userTokens.headers.get("Authorization")
    const userTokensResponseJson = await userTokens.json()
    const refreshToken = userTokensResponseJson && userTokensResponseJson.data ?
        userTokensResponseJson.data.refresh_token : null
    return { accessToken, userTokens, refreshToken }
}

/**
 *
 * @param accessToken
 * @param refreshToken
 *
 * @returns
 */
async function fetchUser(
    accessToken: string,
    refreshToken: string,
) {
    if (printLog) {
        console.log('next-auth-debug: ------------------- FETCHING USER -----------------------------')
    }
    const userDetails = await $fetch<{
        data: {
            // address: object;
            // address_id: number;
            avatar_color: string;
            avatar_img: string;
            bio: string;
            cover_img: string;
            // created_at: string;
            // date_of_birth: string;
            email_check: boolean;
            email: string;
            first_name: string;
            // gender: string;
            id: string;
            last_name: string;
            level: object;
            level_id: number;
            // social: object;
            // updated_at: string;
            // totals: object;
            username: string;
            use_avatar_img: boolean;
        };
    } | null>(
        `${BACKEND_COMPLETE_URL}/users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "token": `${runtimeConfig.SECRET_TOKEN}`,
            Authorization: `Bearer ${accessToken}`,
        },
    })
    if (!accessToken || !userDetails || !userDetails.data) {
        return false
    }

    const user = {
        // accessToken: accessToken,
        // accessTokenExpires: Date.now() + parseInt(runtimeConfig.public.LOGIN_ACCESS_TOKEN_MAX_AGE) * 1000,
        // refreshToken: refreshToken,
        email: userDetails.data.email,
        id: userDetails.data.id,
        // address: userDetails.data.address,
        avatarColor: userDetails.data.avatar_color,
        avatarImg: userDetails.data.avatar_img,
        bio: userDetails.data.bio,
        coverImg: userDetails.data.cover_img,
        // createdAt: userDetails.data.created_at,
        // dateOfBirth: userDetails.data.date_of_birth,
        emailCheck: userDetails.data.email_check,
        firstName: userDetails.data.first_name,
        // gender: userDetails.data.gender,
        lastName: userDetails.data.last_name,
        level: userDetails.data.level,
        levelId: userDetails.data.level_id,
        // social: userDetails.data.social,
        // totals: userDetails.data.totals,
        username: userDetails.data.username,
        useAvatarImg: userDetails.data.use_avatar_img,
    }
    if (printLog) {
        console.log('next-auth-debug: ------------------- END FETCHING USER -----------------------------')
    }
    // return user
    return {
        ...user,
        accessToken,
        refreshToken
    }
}


/**
 *
 * @param accessToken
 * @returns
 */
async function checkGoogleToken(
    accessToken: string,
) {
    const googleCheckTokenRequest = await fetch(
        `${BACKEND_COMPLETE_URL}/auth/google/check-token/${accessToken}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "token": `${runtimeConfig.SECRET_TOKEN}`,
        },
    })
    const googleCheckTokenRequestJson = await googleCheckTokenRequest.json()
    // console.log('googleCheckTokenRequest: ', googleCheckTokenRequest)
    if (!googleCheckTokenRequest) {
        throw createError({
            statusCode: 500,
            message: "Erro no login (google)",
        })
    }
    const newAccessToken = googleCheckTokenRequest.headers.get("Authorization")
    const newRefreshToken = googleCheckTokenRequestJson && googleCheckTokenRequestJson.data ?
        googleCheckTokenRequestJson.data.refresh_token : null
    return {newAccessToken, newRefreshToken}
}


/**
 *
 * @param accessToken
 * @returns
 */
async function checkFacebookToken(
    accessToken: string,
) {
    const facebookCheckTokenRequest = await fetch(
        `${BACKEND_COMPLETE_URL}/auth/facebook/check-token/${accessToken}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "token": `${runtimeConfig.SECRET_TOKEN}`,
        },
    })
    const facebookCheckTokenRequestJson = await facebookCheckTokenRequest.json()
    // console.log('facebookCheckTokenRequest: ', facebookCheckTokenRequest)
    if (!facebookCheckTokenRequest) {
        throw createError({
            statusCode: 500,
            message: "Erro no login (facebook)",
        })
    }
    const newAccessToken = facebookCheckTokenRequest.headers.get("Authorization")
    const newRefreshToken = facebookCheckTokenRequestJson && facebookCheckTokenRequestJson.data ?
        facebookCheckTokenRequestJson.data.refresh_token : null
    return {newAccessToken, newRefreshToken}
}


/**
 *
 * @param accessToken
 * @param refreshToken
 * @returns
 */
async function logout(
    token: any
) {

    if (token.accessToken && token.refreshToken) {
        const payload = {
            refresh_token: token.refreshToken
        }
        const requestLogout = await fetch(
            `${BACKEND_COMPLETE_URL}/auth/logout`,
            {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                    "token": `${runtimeConfig.SECRET_TOKEN}`,
                    Authorization: `Bearer ${token.accessToken}`,
                },
            }
        )
        if (requestLogout.status === parseInt(`${runtimeConfig.public.HTTP_STATUS_CODE_NO_CONTENT}`)) {
            return null
        }
        const body = await requestLogout.json()
        if (body && body.data && body.data.message) {
            // token.exp = Math.floor(Date.now() / 1000)
            throw Error('Logout error', { cause: body.data.message })
        }
    }
    // token.exp = Math.floor(Date.now() / 1000)
    // token.exp = Date.now()
    // const date = new Date(token.exp)
    // throw Error('Logout error')
}


/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(
    token: any
) {
    try {
        if (printLog) {
            console.log('next-auth-debug: ---------------------------- START REFRESHING TOKEN ------------------------')
            console.log('next-auth-debug: ---------------------------- token: ', token)
        }
        const oldRefreshToken = token.refreshToken ? token.refreshToken :
            token.user && token.user.refreshToken ? token.user.refreshToken : null
        // const oldRefreshToken = token.refreshToken ? token.refreshToken : null
        if (printLog) {
            console.log('next-auth-debug: ---------------------------- old refreshToken: ', oldRefreshToken)
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
            console.log('next-auth-debug: ---------------------------- new accessToken: ', newAccessToken)
            console.log('next-auth-debug: ---------------------------- new refreshToken: ', newRefreshToken)
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
        console.warn('next-auth-debug: ---------------------------- Error refreshing token: ', error)
        return {
            ...token,
            error: "RefreshAccessTokenError",
        }
    } finally {
        if (printLog) {
            console.log('next-auth-debug: ---------------------------- END REFRESHING TOKEN ----------------------------')
        }
    }
}

/**
 *
 * @param timestamp
 */
function formatTimestampToDatetime(timestamp: number): string {

    if (timestamp != null && timestamp.toString().length <= 10) {
        timestamp = timestamp * 1000
    }
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds
    const date = new Date(timestamp)

    // Hours part from the timestamp
    const hours = date.getHours()

    // Minutes part from the timestamp
    const minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()

    // Seconds part from the timestamp
    const seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()

    const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
    const month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
    const year = date.getFullYear()

    // Will display time in 10:30:23 format
    return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds

}

// Refer to Auth.js docs for more details

export const authOptions: AuthConfig = {
    secret: runtimeConfig.NUXT_AUTH_SECRET,
    pages: {
        signIn: '/',
        signOut: '/',
        // error: '/auth/login', // Error code passed in query string as ?error=
        // verifyRequest: '/auth/verify-request', // (used for check email message)
        // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
    },
    providers: [
        // GoogleProvider({
        //    clientId: `${runtimeConfig.LOGIN_GOOGLE_CLIENT_ID}`,
        //    clientSecret: `${runtimeConfig.LOGIN_GOOGLE_CLIENT_SECRET}`,
        // }),
        // FacebookProvider({
        //    clientId: `${runtimeConfig.LOGIN_FACEBOOK_CLIENT_ID}`,
        //    clientSecret: `${runtimeConfig.LOGIN_FACEBOOK_CLIENT_SECRET}`,
        // }),
        CredentialsProvider({
          credentials: {
            emailOrUsername: { label: "Email/Username", type: "text" },
            password: { label: "Password", type: "password" }
          },
          async authorize(credentials: any) {
            try {
                const { accessToken, userTokens, refreshToken } =
                    await login(credentials)
                if (!accessToken) {
                    throw createError({
                        statusCode: userTokens.status,
                        message: "Erro no login",
                    });
                }
                const user = await fetchUser(accessToken, refreshToken)
                return user
            } catch (error) {
                return null
            }
          }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: parseInt(runtimeConfig.public.LOGIN_REFRESH_TOKEN_MAX_AGE),
    },
    callbacks: {
        async jwt(
            { token, trigger, user, session, account }
        ) {
            if (printLog) {
                console.log('next-auth-debug: ---------------------------- CALLBACK JWT -----------------------------')
                // console.log('next-auth-debug: max age -------------------- ', parseInt(runtimeConfig.public.LOGIN_ACCESS_TOKEN_MAX_AGE) * 1000)
                console.log('next-auth-debug: trigger -------------------- ', trigger)
                console.log('next-auth-debug: user ----------------------- ', user)
                console.log('next-auth-debug: token ---------------------- ', token)
                console.log('next-auth-debug: session -------------------- ', session)
                console.log('next-auth-debug: account -------------------- ', account)
                console.log('next-auth-debug: Date.now() ----------------- ', formatTimestampToDatetime(Date.now()))
                if (token) {
                    console.log('next-auth-debug: token.accessTokenExpires --- ', formatTimestampToDatetime(token.accessTokenExpires))
                    console.log('next-auth-debug: token.refreshTokenExpires -- ', formatTimestampToDatetime(token.refreshTokenExpires))
                    console.log('next-auth-debug: token.exp ------------------ ', formatTimestampToDatetime(token.exp))
                    if (Date.now() < token.accessTokenExpires) {
                        console.log('next-auth-debug: ---------------------------- ACCESS TOKEN NOT EXPIRED!')
                    } else {
                        console.log('next-auth-debug: ---------------------------- ACCESS TOKEN EXPIRED!')
                    }
                }
            }
            // console.log('(token.refreshToken !== undefined): ', (token.refreshToken !== undefined))
            // Callback running for the first time
            if (account && user) {
                if (printLog) {
                    console.log('next-auth-debug: ------------------- FIRST TIIIIIIME -----------------------------')
                    console.log('next-auth-debug: ------------------- FIRST TIIIIIIME -----------------------------')
                    console.log('next-auth-debug: ------------------- FIRST TIIIIIIME -----------------------------')
                }
                // If user is logged in with a provider, then get the access and refresh tokens from backend
                if (!token.accessToken &&
                    (account.provider === 'google' || account.provider === 'facebook')) {
                    if (printLog) {
                        console.log('next-auth-debug: ---------------------------- CHECK GOOGLE/FACEBOOK TOKEN')
                    }
                    const { newAccessToken, newRefreshToken } =
                        account.provider === 'facebook' ? await checkFacebookToken(account.access_token) :
                            await checkGoogleToken(account.access_token)
                    const userData = await fetchUser(newAccessToken!, newRefreshToken)
                    return {
                        user: userData,
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                        accessTokenExpires: token.exp ? token.exp : Date.now() + parseInt(runtimeConfig.public.LOGIN_ACCESS_TOKEN_MAX_AGE) * 1000,
                        refreshTokenExpires: Date.now() + parseInt(runtimeConfig.public.LOGIN_REFRESH_TOKEN_MAX_AGE) * 1000,
                    }
                }
                if (printLog) {
                    console.log('next-auth-debug: ------------------- END CALLBACK JWT 1 -----------------------------')
                }
                return {
                    accessToken: token.accessToken,
                    accessTokenExpires: Date.now() + parseInt(runtimeConfig.public.LOGIN_ACCESS_TOKEN_MAX_AGE) * 1000,
                    refreshToken: token.refreshToken,
                    refreshTokenExpires: Date.now() + parseInt(runtimeConfig.public.LOGIN_REFRESH_TOKEN_MAX_AGE) * 1000,
                    user,
                }
            }
            if (Date.now() < token.accessTokenExpires) {
                if (printLog) {
                    console.log('next-auth-debug: ---------------------------- END CALLBACK JWT 2 -----------------------------')
                }
                return token
            }
            // token.user = await fetchUser(token.accessToken, token.refreshToken)
            if (printLog) {
                console.log('next-auth-debug: ---------------------------- END CALLBACK JWT 3 -----------------------------')
            }
            // return refreshAccessToken(token)
            // const refresh = await refreshAccessToken(token)
            // return {
            //     ...refresh,
            //     accessToken: refresh.accessToken,
            //     refreshToken: refresh.refreshToken,
            //     accessTokenExpires: refresh.accessTokenExpires,
            // }
            return token
        },
        async session({ session, token, trigger }) {
            if (printLog) {
                console.log('next-auth-debug: ---------------------------- CALLBACK SESSION ---------------------------')
                console.log('next-auth-debug: session -------------------- ', session)
                console.log('next-auth-debug: token ---------------------- ', token)
                console.log('next-auth-debug: trigger -------------------- ', trigger)
            }
            if (token) {
                session.user = token.user
                // session.user = await fetchUser(token.accessToken, token.refreshToken)
                session.accessToken = token.accessToken
                session.refreshToken = token.refreshToken
                session.error = token.error
                if (printLog) {
                    console.log('next-auth-debug: Date.now() ----------------- ', formatTimestampToDatetime(Date.now()))
                    console.log('next-auth-debug: token.accessTokenExpires --- ', formatTimestampToDatetime(token.accessTokenExpires))
                    console.log('next-auth-debug: token.refreshTokenExpires -- ', formatTimestampToDatetime(token.refreshTokenExpires))
                    console.log('next-auth-debug: token.exp (formatted) ------ ', formatTimestampToDatetime(token.exp))
                }
            }
            if (trigger === "update" && session?.name) {
                // Note, that `session` can be any arbitrary object, remember to validate it!
                token.name = session.name
            }
            // console.log('session: ', session)
            if (printLog) {
                console.log('next-auth-debug: ---------------------------- END CALLBACK SESSION ------------------------')
            }
            return session
        },
    }
}

export default NuxtAuthHandler(authOptions, runtimeConfig)
// If you don't want to pass the full runtime config,
//  you can pass something like this: { public: { authJs: { baseUrl: "" } } }
