import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import { createPoll } from "ags/time"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import AstalNetwork from "gi://AstalNetwork?version=0.1"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"
import AstalWp from "gi://AstalWp?version=0.1"
import AstalBattery from "gi://AstalBattery?version=0.1"
import AstalNotifd from "gi://AstalNotifd?version=0.1"
import GLib from "gi://GLib?version=2.0"
import Pango from "gi://Pango?version=1.0"
import { createBinding, For } from "gnim"

function WiredIndicator() {
  const network = AstalNetwork.get_default()
  const wired = network.wired

  if (!wired) return <box />

  const state = createBinding(wired, "state")

  return (
    <image
      visible={state.as((s) => s === AstalNetwork.DeviceState.ACTIVATED)}
      iconName="network-wired-symbolic"
      tooltipText="Wired Connected"
    />
  )
}

function WiFiIndicator() {
  const network = AstalNetwork.get_default()
  const wifi = network.wifi

  if (!wifi) return <box />

  const state = createBinding(wifi, "state")
  const ssid = createBinding(wifi, "ssid")
  const strength = createBinding(wifi, "strength")

  return (
    <image
      visible={state.as((s) => s === AstalNetwork.DeviceState.ACTIVATED)}
      iconName={state.as((s) => {
        if (s !== AstalNetwork.DeviceState.ACTIVATED) return ""

        const str = strength.peek()
        if (str >= 80) return "network-wireless-signal-excellent-symbolic"
        if (str >= 60) return "network-wireless-signal-good-symbolic"
        if (str >= 40) return "network-wireless-signal-ok-symbolic"
        if (str >= 20) return "network-wireless-signal-weak-symbolic"
        return "network-wireless-signal-none-symbolic"
      })}
      tooltipText={state.as((s) =>
        s === AstalNetwork.DeviceState.ACTIVATED
          ? `${ssid.peek()} (${strength.peek()}%)`
          : "",
      )}
    />
  )
}

function BluetoothIndicator() {
  const bluetooth = AstalBluetooth.get_default()
  const isPowered = createBinding(bluetooth, "isPowered")
  const devices = createBinding(bluetooth, "devices")

  const hasConnectedDevices = devices.as((devs) =>
    devs.some((d) => d.connected),
  )

  return (
    <image
      visible={isPowered.as((p) => p && hasConnectedDevices.peek())}
      iconName="bluetooth-active-symbolic"
      tooltipText={devices.as((devs) => {
        const connected = devs.filter((d) => d.connected)
        if (connected.length === 0) return ""
        if (connected.length === 1) return connected[0].name
        return `${connected.length} devices connected`
      })}
    />
  )
}

function VolumeIndicator() {
  const wp = AstalWp.get_default()
  if (!wp) return <box />

  const speaker = wp.audio.defaultSpeaker
  if (!speaker) return <box />

  const volume = createBinding(speaker, "volume")
  const muted = createBinding(speaker, "mute")

  return (
    <image
      iconName={volume.as((vol) => {
        const m = muted.peek()
        if (m) return "audio-volume-muted-symbolic"
        if (vol === 0) return "audio-volume-muted-symbolic"
        if (vol < 0.33) return "audio-volume-low-symbolic"
        if (vol < 0.66) return "audio-volume-medium-symbolic"
        return "audio-volume-high-symbolic"
      })}
      tooltipText={volume.as((v) => `Volume: ${Math.round(v * 100)}%`)}
    />
  )
}

function BatteryIndicator() {
  const battery = AstalBattery.get_default()
  const percentage = createBinding(battery, "percentage")
  const charging = createBinding(battery, "charging")
  const isPresent = createBinding(battery, "isPresent")

  return (
    <image
      visible={isPresent}
      iconName={charging.as((c) => {
        const pct = percentage.peek()
        if (c) {
          if (pct >= 90) return "battery-full-charging-symbolic"
          if (pct >= 60) return "battery-good-charging-symbolic"
          if (pct >= 30) return "battery-medium-charging-symbolic"
          if (pct >= 10) return "battery-low-charging-symbolic"
          return "battery-caution-charging-symbolic"
        } else {
          if (pct >= 90) return "battery-full-symbolic"
          if (pct >= 60) return "battery-good-symbolic"
          if (pct >= 30) return "battery-medium-symbolic"
          if (pct >= 10) return "battery-low-symbolic"
          return "battery-caution-symbolic"
        }
      })}
      tooltipText={percentage.as((p) => `Battery: ${Math.round(p * 100)}%`)}
    />
  )
}

function DNDIndicator() {
  const notifd = AstalNotifd.get_default()
  const dnd = createBinding(notifd, "dontDisturb")

  return (
    <image
      visible={dnd}
      iconName="notifications-disabled-symbolic"
      tooltipText="Do Not Disturb"
    />
  )
}

function QuickPeek() {
  return (
    <button
      class="quick-peek"
      onClicked={() => app.toggle_window("quick-settings")}
    >
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={15}>
        <box spacing={10}>
          <WiredIndicator />
          <WiFiIndicator />
          <BluetoothIndicator />
          <VolumeIndicator />
          <DNDIndicator />
          <BatteryIndicator />
          <image iconName="system-shutdown-symbolic" />
        </box>
      </box>
    </button>
  )
}

// Stolen and modified from the example
// https://github.com/Aylur/ags/blob/main/examples/gtk4/simple-bar/Bar.tsx
function Clock({ format = "%b %_d  %_I:%M %p" }) {
  const time = createPoll("", 1000, () => {
    return GLib.DateTime.new_now_local().format(format)!
  })
  return (
    <button
      onClicked={() => {
        app.toggle_window("datemenu")
      }}
    >
      <box orientation={Gtk.Orientation.HORIZONTAL}>
        <label label={time} />
      </box>
    </button>
  )
}

function WorkspaceIndicator({
  hyprland,
}: {
  hyprland: AstalHyprland.Hyprland
}) {
  const focusedWorkspace = createBinding(hyprland, "focusedWorkspace")
  const workspaces = createBinding(hyprland, "workspaces").as((ws) =>
    ws.sort((a, b) => Number(a.name) - Number(b.name)),
  )
  return (
    <box spacing={5} class="workspaces">
      <For each={workspaces}>
        {(workspace) => (
          <button
            vexpand={false}
            onClicked={() => {
              if (workspace.name) {
                workspace.focus()
              }
            }}
          >
            <box
              valign={Gtk.Align.CENTER}
              halign={Gtk.Align.CENTER}
              class={focusedWorkspace.as((f) =>
                f.name == workspace.name
                  ? "workspace-indicator focused"
                  : "workspace-indicator",
              )}
            ></box>
          </button>
        )}
      </For>
    </box>
  )
}

function WindowInfo({ hyprland }: { hyprland: AstalHyprland.Hyprland }) {
  const activeWindow = createBinding(hyprland, "focusedClient")
  return (
    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
      <label
        label={activeWindow.as((client) =>
          client ? client.get_title() : "Hyprland",
        )}
        class="window-info"
        maxWidthChars={40}
        ellipsize={Pango.EllipsizeMode.END}
      />
    </box>
  )
}

export default function Bar(monitor: Gdk.Monitor) {
  const { LEFT, TOP, RIGHT } = Astal.WindowAnchor
  const hyprland = AstalHyprland.get_default()
  return (
    <window
      gdkmonitor={monitor}
      namespace="tallens-gtk-shell"
      visible
      anchor={LEFT | TOP | RIGHT}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      application={app}
      css={"background-color: rgba(0, 0, 0, 0.01);"}
    >
      <centerbox class="bar">
        <box $type="start">
          <WorkspaceIndicator hyprland={hyprland} />
          <WindowInfo hyprland={hyprland} />
        </box>
        <box $type="center">
          <Clock />
        </box>
        <box $type="end">
          <QuickPeek />
        </box>
      </centerbox>
    </window>
  )
}
