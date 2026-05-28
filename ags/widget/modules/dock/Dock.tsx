import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import AstalHyprland from "gi://AstalHyprland"
import { createBinding, For } from "gnim"
import AstalApps from "gi://AstalApps?version=0.1"
import { activeMonitor } from "../../../app"

interface WindowInfo {
  name: string
  title: string
  className: string
  address: string
  icon: string
  focus: () => void
}

interface DockEntry {
  windows: WindowInfo[]
  current: number
}

function Tasks() {
  const hyprland = AstalHyprland.get_default()
  const apps = new AstalApps.Apps()

  const iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!)

  const getIcon = (client: AstalHyprland.Client): string => {
    const cls = client.class

    if (cls && iconTheme.has_icon(cls)) {
      return cls
    }

    const appMatch = apps.fuzzy_query(cls)?.[0]
    if (appMatch && appMatch.icon_name) {
      return appMatch.icon_name
    }

    // Fallback
    return "application-x-executable"
  }

  const entries = createBinding(hyprland, "clients").as((list) => {
    const map = new Map<string, DockEntry>()

    list
      .filter((c) => c.mapped && c.class)
      .forEach((client) => {
        const key = client.class.toLowerCase()
        const appInfo = apps.fuzzy_query(client.initialClass)?.[0]

        const windowInfo: WindowInfo = {
          name: appInfo?.name || client.class,
          title: client.title,
          className: client.class,
          address: client.address,
          icon: getIcon(client),
          focus: () => client.focus(),
        }

        if (map.has(key)) {
          map.get(key)!.windows.push(windowInfo)
        } else {
          map.set(key, {
            windows: [windowInfo],
            current: 0,
          })
        }
      })

    return Array.from(map.values())
  })

  function Indicators({ amount }: { amount: number }) {
    return (
      <box halign={Gtk.Align.CENTER} spacing={2}>
        {[...Array(Math.min(amount, 5))].map(() => (
          <image iconName="media-record-symbolic" pixelSize={5} />
        ))}
      </box>
    )
  }

  return (
    <box class="tasks" $type="center" spacing={5}>
      <For each={entries}>
        {(entry) => (
          <button
            class="dock-item"
            tooltipText={entry.windows[0].title}
            onClicked={() => {
              const win = entry.windows[entry.current % entry.windows.length]
              win.focus()
              // wrap the window index so it doesn't exceed the length
              entry.current = (entry.current + 1) % entry.windows.length
            }}
          >
            <box orientation={Gtk.Orientation.VERTICAL} spacing={5}>
              <image icon_name={entry.windows[0].icon} pixel_size={48} />
              <Indicators amount={entry.windows.length} />
            </box>
          </button>
        )}
      </For>
    </box>
  )
}

export function LauncherToggle() {
  return (
    <button
      class="launcher-toggle"
      onClicked={() => app.toggle_window("launcher")}
    >
      <image icon_name="view-app-grid-symbolic" pixelSize={48} />
    </button>
  )
}

export default function Dock() {
  const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor
  return (
    <window
      monitor={activeMonitor}
      name={"dock"}
      application={app}
      namespace="tallens-gtk-shell"
      anchor={BOTTOM | LEFT | RIGHT}
      css="background-color: transparent;"
      marginBottom={8}
    >
      <Gtk.EventControllerMotion onLeave={() => app.toggle_window("dock")} />
      <box hexpand halign={Gtk.Align.CENTER}>
        <box
          orientation={Gtk.Orientation.HORIZONTAL}
          class="dock"
          hexpand={false}
        >
          <box $type="center" halign={Gtk.Align.CENTER} spacing={5}>
            <Tasks />
            <LauncherToggle />
          </box>
        </box>
      </box>
    </window>
  )
}

export function DockTrigger(monitor: Gdk.Monitor) {
  const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor
  return (
    <window
      visible={true}
      gdkmonitor={monitor}
      layer={Astal.Layer.TOP}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={BOTTOM | LEFT | RIGHT}
      application={app}
      namespace="tallens-gtk-shell"
      class="dock-trigger"
    >
      <Gtk.EventControllerMotion onEnter={() => app.toggle_window("dock")} />
    </window>
  )
}
