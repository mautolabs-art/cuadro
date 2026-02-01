// Notification utilities for Cuadro PWA

const NOTIFICATION_KEY = 'cuadro_notifications_enabled'
const LAST_NOTIFICATION_KEY = 'cuadro_last_notification_date'

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator
}

// Get current notification permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

// Check if user has enabled notifications in our app
export function areNotificationsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(NOTIFICATION_KEY) === 'true'
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false

  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      localStorage.setItem(NOTIFICATION_KEY, 'true')
      scheduleNotification()
      return true
    }
    return false
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return false
  }
}

// Disable notifications
export function disableNotifications(): void {
  localStorage.setItem(NOTIFICATION_KEY, 'false')
}

// Enable notifications (if already granted)
export function enableNotifications(): void {
  if (Notification.permission === 'granted') {
    localStorage.setItem(NOTIFICATION_KEY, 'true')
    scheduleNotification()
  }
}

// Schedule notification for 9pm
export function scheduleNotification(): void {
  if (!areNotificationsEnabled() || Notification.permission !== 'granted') return

  const now = new Date()
  const target = new Date()
  target.setHours(21, 0, 0, 0) // 9pm

  // If it's already past 9pm, schedule for tomorrow
  if (now >= target) {
    target.setDate(target.getDate() + 1)
  }

  const msUntilTarget = target.getTime() - now.getTime()

  // Schedule the notification
  setTimeout(() => {
    showReminderNotification()
    // Schedule next day's notification
    scheduleNotification()
  }, msUntilTarget)
}

// Show the reminder notification
export async function showReminderNotification(): Promise<void> {
  if (!areNotificationsEnabled() || Notification.permission !== 'granted') return

  // Check if we already showed a notification today
  const today = new Date().toDateString()
  const lastNotification = localStorage.getItem(LAST_NOTIFICATION_KEY)

  if (lastNotification === today) return // Already showed today

  try {
    const registration = await navigator.serviceWorker.ready

    await registration.showNotification('Cuadro - Recordatorio', {
      body: '¿En qué gastaste hoy? Registra tus gastos para no perder el control 💰',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'cuadro-daily-reminder',
      requireInteraction: true
    } as NotificationOptions)

    // Mark as shown today
    localStorage.setItem(LAST_NOTIFICATION_KEY, today)
  } catch (error) {
    console.error('Error showing notification:', error)
  }
}

// Initialize notifications on app load
export function initializeNotifications(): void {
  if (!isNotificationSupported()) return

  // If user has enabled notifications and permission is granted, schedule
  if (areNotificationsEnabled() && Notification.permission === 'granted') {
    scheduleNotification()

    // Try to register for periodic background sync (Chrome only)
    registerPeriodicSync()
  }
}

// Register for periodic background sync (for browsers that support it)
async function registerPeriodicSync(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready

    // Check if periodicSync is available
    if ('periodicSync' in registration) {
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync' as PermissionName
      })

      if (status.state === 'granted') {
        await (registration as any).periodicSync.register('daily-reminder', {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        })
      }
    }
  } catch (error) {
    // Periodic sync not supported, fall back to setTimeout approach
    console.log('Periodic sync not available, using setTimeout fallback')
  }
}
