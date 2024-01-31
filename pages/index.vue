<script setup lang="ts">

    // Auth
    const { signIn, signOut, status, session, cookies } = useAuth()

    // Env
    const runtimeConfig = useRuntimeConfig()

    const { data: userLoggedData, error } = await useAsyncData(
       'userLogged',
        async () => await fetchUserLoggedDataBackend(),
    )

    if (error.value) {
        console.error('error.value: ', error.value)
        throw createError({
            statusCode: 500,
            message: error.value.message ?? 'Error',
            fatal: true
        })
    }

    // User data
    let user: any = reactive({})

    async function loginCredentials() {
      try {
        await signIn("credentials", {
          redirect: false,
          emailOrUsername: "teste",
          password: "Teste@123"
        })
        // eslint-disable-next-line no-console
        console.log("SignIn", session.value?.user)
      }
      catch (error) {
        // eslint-disable-next-line no-console
        console.log(`Error SignIn: ${error}`)
      }
    }

    async function loginGoogle() {
      try {
        await signIn('google',
            { redirect: false },
        )
        // eslint-disable-next-line no-console
        console.log("SignIn", session.value?.user)
      }
      catch (error) {
        // eslint-disable-next-line no-console
        console.log(`Error SignIn: ${error}`)
      }
    }

    async function loginFacebook() {
      try {
        await signIn('facebook',
            { redirect: false },
        )
        // eslint-disable-next-line no-console
        console.log("SignIn", session.value?.user)
      }
      catch (error) {
        // eslint-disable-next-line no-console
        console.log(`Error SignIn: ${error}`)
      }
    }

    async function fetchUserLoggedDataClient() {
        try {
            console.log('fetchUserLoggedDataClient - session.value?.user?.accessToken: ', session.value?.user?.accessToken)
            console.log('fetchUserLoggedDataClient - session.value?.user?.refreshToken: ', session.value?.user?.refreshToken)
            if (session.value?.user?.accessToken) {
                // console.log('runtimeConfig.public.SECRET_TOKEN: ', runtimeConfig.public.SECRET_TOKEN)
                const response = await fetch(
                    `${runtimeConfig.public.BACKEND_COMPLETE_URL}/users`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "token": `${runtimeConfig.public.SECRET_TOKEN}`,
                            'Authorization': 'Bearer ' + session.value?.user?.accessToken
                        },
                    }
                )
                if (response.status === parseInt(runtimeConfig.public.HTTP_STATUS_CODE_OK)) {
                    const responseJson = await response.json()
                    user.value = responseJson.data
                } else {
                    const responseJson = await response.json()
                    throw responseJson
                }

            }

        } catch (error: any) {
            // eslint-disable-next-line no-console
            console.warn(`Error fetch user client: ${JSON.stringify(error)}`)

            if (error.message_code === parseInt(runtimeConfig.public.MESSAGE_CODE_USER_ACCESS_TOKEN_EXPIRED) ||
                error.message_code === parseInt(runtimeConfig.public.MESSAGE_CODE_USER_ACCESS_TOKEN_INVALID) ||
                error.message_code === parseInt(runtimeConfig.public.MESSAGE_CODE_USER_ACCESS_TOKEN_IN_BLOCKLIST) ||
                error.message_code === parseInt(runtimeConfig.public.MESSAGE_CODE_USER_ACCESS_TOKEN_MISSING)) {
                await performLogout()
            }

            if (error.message) {
                alert(error.message.toString())

            }
        }
    }

    async function fetchUserLoggedDataBackend() {
        try {
            console.log('fetchUserLoggedDataBackend - session.value?.user?.accessToken: ', session.value?.user?.accessToken)
            console.log('fetchUserLoggedDataBackend - session.value?.user?.refreshToken: ', session.value?.user?.refreshToken)
            if (session.value?.user?.accessToken) {
                // console.log('runtimeConfig.public.SECRET_TOKEN: ', runtimeConfig.public.SECRET_TOKEN)
                const response = await fetch(
                    `${runtimeConfig.public.BACKEND_COMPLETE_URL}/users`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "token": `${runtimeConfig.public.SECRET_TOKEN}`,
                            'Authorization': 'Bearer ' + session.value?.user?.accessToken
                        },
                    }
                )
                if (response.status === parseInt(runtimeConfig.public.HTTP_STATUS_CODE_OK)) {
                    const responseJson = await response.json()
                    user.value = responseJson.data
                } else {
                    const responseJson = await response.json()
                    throw responseJson
                }

            }

        } catch (error: any) {
            // eslint-disable-next-line no-console
            console.warn(`Error fetch user backend: ${JSON.stringify(error)}`)

            // if (error.message_code === parseInt(runtimeConfig.public.MESSAGE_CODE_USER_ACCESS_TOKEN_EXPIRED) ||
            //     error.message_code === parseInt(runtimeConfig.public.MESSAGE_CODE_USER_ACCESS_TOKEN_INVALID) ||
            //     error.message_code === parseInt(runtimeConfig.public.MESSAGE_CODE_USER_ACCESS_TOKEN_IN_BLOCKLIST) ||
            //     error.message_code === parseInt(runtimeConfig.public.MESSAGE_CODE_USER_ACCESS_TOKEN_MISSING)) {
            //     await performLogout()
            // }

            // if (error.message) {
            //     alert(error.message.toString())

            // }
        }
    }

    async function performLogout() {
        try {
            user.value = null
            await signOut()
        } catch (error: any) {
            console.log('Error (landing page): ', error)
            throw createError({
                statusCode: 500,
                message: 'Logout Error',
                fatal: true
            })
        }
    }

    onMounted(async () => {
    //   fillData()
        // await fetchUserLoggedData()
    })

</script>

<template>
  <div>
    <div>
      <a href="/api/auth/signin" class="buttonPrimary">Native Link Sign in</a>
      <button @click="loginCredentials()">
        Credentials Sign In
      </button>
      <button @click="loginGoogle()">
        Google Login
      </button>
      <button @click="loginFacebook()">
        Facebook Login
      </button>
      <button @click="performLogout()">
        Sign Out
      </button>
    </div>
    <div>
      <span> Status: </span>
      <pre>{{ status }}</pre>
      <span> Session: </span>
      <pre>{{ session?.user }}</pre>
      <span> Cookies: </span>
      <pre>{{ cookies }}</pre>
      <!-- <button @click="updateTheSession()">
        Update session
      </button> -->
    </div>
    <div>
    <button @click="fetchUserLoggedDataClient()">
        Fetch user logged data!
      </button>

      <div>
        <pre>{{ user.value }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
