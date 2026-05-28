import { Astal, Gtk } from "ags/gtk4"
import AstalNotifd from "gi://AstalNotifd"
import Notification from "./Notification"
import { For, createState, onCleanup } from "ags"
import app from "ags/gtk4/app"
import { activeMonitor } from "../../../app"

export class StoredNotification {
  appName: string
  appIcon: string
  id: number
  image: string
  summary: string
  body: string
  urgency: number
  time: number
  muted: boolean
  actions: Array<{ id: string; label: string }>
  hints: Record<string, any>
  dismissedAt: number | null
  dismissReason: "timeout" | "action" | "muted" | null

  constructor(
    notification: AstalNotifd.Notification,
    dismissedReason: "timeout" | "action" | "muted" | null = null,
  ) {
    this.appName = notification.appName
    this.appIcon = notification.appIcon
    this.id = notification.id
    this.image = notification.image
    this.summary = notification.summary
    this.body = notification.body
    this.urgency = notification.urgency
    this.time = notification.time
    this.dismissedAt = dismissedReason ? Date.now() : null
    this.dismissReason = dismissedReason
    this.muted = muted_apps.includes(notification.appName)
    this.actions = notification.actions
    this.hints = notification.hints
  }

  isUrgent(): boolean {
    return this.urgency === AstalNotifd.Urgency.CRITICAL
  }

  getFormattedTime(): string {
    return new Date(this.time).toLocaleTimeString()
  }

  wasTimedOut(): boolean {
    return this.dismissReason === "timeout"
  }

  getAge(): number {
    return Date.now() - this.time
  }
}

let muted_apps: string[] = []
export const [storedNotifications, setStoredNotifications] = createState<
  StoredNotification[]
>([])

export function MuteApp(notification: AstalNotifd.Notification) {
  const name = notification.appName

  if (muted_apps.includes(name)) {
    print("Name already in list")
  } else {
    muted_apps.push(name)
    StoreNotification(notification, "muted")
  }
}

export function StoreNotification(
  notification: AstalNotifd.Notification,
  dismissedReason: "timeout" | "action" | "muted" | null = null,
) {
  const stored = new StoredNotification(notification, dismissedReason)

  setStoredNotifications((prev) => {
    const updated = [stored, ...prev]
    // limit to 100
    return updated.length > 100 ? updated.slice(0, 100) : updated
  })
}

export function GetStoredNotifications(): StoredNotification[] {
  return storedNotifications.peek()
}

export default function NotificationPopups() {
  const notifd = AstalNotifd.get_default()

  const [notifications, setNotifications] = createState(
    new Array<AstalNotifd.Notification>(),
  )

  const notifiedHandler = notifd.connect("notified", (_, id, replaced) => {
    const notification = notifd.get_notification(id)
    if (!notification) {
      return
    }

    if (muted_apps.includes(notification.appName!)) {
      return
    }

    if (replaced && notifications.peek().some((n) => n.id === id)) {
      setNotifications((ns) => ns.map((n) => (n.id === id ? notification : n)))
    } else {
      setNotifications((ns) => [notification, ...ns])
    }
  })

  const resolvedHandler = notifd.connect("resolved", (_, id, reason) => {
    const notification = notifications.peek().find((n) => n.id === id)

    // AstalNotifd reason codes: 1=expired, 2=dismissed by user, 3=closed by action
    if (reason !== 2 && notification) {
      let dismissReason: "timeout" | "action" | null

      if (reason === 1) {
        dismissReason = "timeout"
      } else {
        dismissReason = "action"
      }

      StoreNotification(notification, dismissReason)
    }

    setNotifications((ns) => ns.filter((n) => n.id !== id))
  })

  onCleanup(() => {
    notifd.disconnect(notifiedHandler)
    notifd.disconnect(resolvedHandler)
  })

  return (
    <window
      monitor={activeMonitor}
      $={(self) => onCleanup(() => self.destroy())}
      class="NotificationPopups"
      name="notification-popups"
      namespace="tallens-gtk-shell"
      application={app}
      visible={notifications((ns) => ns.length > 0)}
      anchor={Astal.WindowAnchor.TOP}
      margin={8}
    >
      <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
        <For each={notifications}>
          {(notification) => <Notification notification={notification} />}
        </For>
      </box>
    </window>
  )
}
