'use client'
import localFont from 'next/font/local'
import './globals.css'
import '/public/styles/editor.css'
import '../styles/style.css'
import '../styles/users/main.css'
import '../styles/users/nav.css'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import Script from 'next/script'
import 'bootstrap-icons/font/bootstrap-icons.css'
import React from 'react'
import { useEffect, useState } from 'react'
import { ThemeProvider } from '@/context/ThemeProvider'
import { MessageStore } from '@/src/zustand/notification/Message'
import { GeneralProvider } from '@/context/GeneralContext'
import { PersonalNotificationProvider } from '@/context/HomeContext/PersonalNotificationContext'
import { usePathname } from 'next/navigation'
import CompanyStore from '@/src/zustand/app/Company'
import { getPendingMessages } from '@/lib/indexDB'
import useSocket from '@/src/useSocket'
import { SocialNotificationProvider } from '@/context/SocialNotificationContext'
import { UserProvider } from '@/context/HomeContext/UserContext'
import { UsersProvider } from '@/context/TeamContext/UsersContext'
import { ChatProvider } from '@/context/HomeContext/ChatContext'
import { TraceProvider } from '@/context/HomeContext/TraceContext'
import { PostProvider } from '@/context/HomeContext/PostContext'
import { MomentProvider } from '@/context/HomeContext/MomentContext'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isMounted, setIsMounted] = useState(false)
  const [counter, setCounter] = useState(2)
  const { setOnline, setBoxVisibility, setMessage } = MessageStore()
  const { getCompany } = CompanyStore()
  const pathname = usePathname()
  const socket = useSocket()

  useEffect(() => {
    setBoxVisibility(false)
  }, [pathname])

  const checkInternetAccess = async () => {
    try {
      await fetch('https://1.1.1.1/cdn-cgi/trace', {
        cache: 'no-store',
      })
      setOnline('', true)
      setCounter((prev) => {
        return prev + 1
      })
    } catch {
      setCounter(0)
    }
  }

  const sendPendingMessages = async () => {
    const messages = await getPendingMessages()
    if (messages.length > 0 && socket) {
      const form = {
        messages,
        to: 'pendingChat',
      }
      socket.emit('message', form)
    }
  }

  useEffect(() => {
    if (counter === 1 && socket) {
      sendPendingMessages()
      setOnline('You are back online', true)
    } else if (counter === 0) {
      setOnline("Sorry, you're now offline", false)
    }
  }, [counter, socket])

  useEffect(() => {
    if (socket) {
      sendPendingMessages()
    }
  }, [socket])

  useEffect(() => {
    setIsMounted(true)
    getCompany('/company', setMessage)
    checkInternetAccess()
    const interval = setInterval(checkInternetAccess, 1000)
    return () => clearInterval(interval)
  }, [])

  //------------INITIALIZE SOUND, GET USER IP & INTERNET CONNECTION -------------//
  return (
    <html lang="en">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var savedTheme = localStorage.getItem("theme");
                var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                var theme = savedTheme || (prefersDark ? "dark" : "light");
                document.documentElement.classList.add(theme);
              } catch (_) {}
            })();
          `}
        </Script>

        <title>Schooling Social</title>

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        <meta
          name="description"
          content="Schooling Social is the ultimate student hub — take scholarship exams, connect with peers, and grow academically and socially. Join today and unlock your potential."
        />
        <meta
          property="og:description"
          content="Ace your future with Schooling Social. Practice scholarship exams, track your progress, and compete with students nationwide — all in one place."
        />
        <meta
          property="og:image"
          content="https://schoolingsocial.com/favicon.ico"
        />
        <meta property="twitter:title" content="Schooling Social" />
        <meta
          property="twitter:description"
          content="Meet and chat with students across the globe. Schooling Social helps you grow your academic circle, join study groups, and make learning fun again."
        />
        <meta
          property="twitter:image"
          content="https://schoolingsocial.com/favicon.ico"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:100,100italic,300,300italic,regular,italic,500,500italic,700,700italic,900,900italic"
          media="all"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          href="https://fonts.gstatic.com"
          rel="preconnect"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[100vh] bg-[var(--white-gray)] text-[var(--text-main-color)]`}
      >
        <GeneralProvider>
          <ChatProvider>
            <TraceProvider>
              <MomentProvider>
                <PostProvider>
                  <PersonalNotificationProvider>
                    <UserProvider>
                      <UsersProvider>
                        <SocialNotificationProvider>
                          <ThemeProvider>{isMounted && children}</ThemeProvider>
                        </SocialNotificationProvider>
                      </UsersProvider>
                    </UserProvider>
                  </PersonalNotificationProvider>
                </PostProvider>
              </MomentProvider>
            </TraceProvider>
          </ChatProvider>
        </GeneralProvider>
      </body>
    </html>
  )
}

{
}
