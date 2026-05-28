import GLib from "gi://GLib?version=2.0"
import { Gtk, Gdk, Astal } from "ags/gtk4"
import app from "ags/gtk4/app"
import { createPoll } from "ags/time"
import { ClockSettings, getSettings } from "../../settings"

export default function Clock(monitor: Gdk.Monitor) {
  const settings: ClockSettings = getSettings().clock

  // Anchor logic from settings
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor
  let anchor: Astal.WindowAnchor | null = null
  if (settings.anchor.length > 0) {
    if (settings.anchor.includes("top")) {
      anchor = anchor ? anchor | TOP : TOP
    }
    if (settings.anchor.includes("bottom")) {
      anchor = anchor ? anchor | BOTTOM : BOTTOM
    }
    if (settings.anchor.includes("left")) {
      anchor = anchor ? anchor | LEFT : LEFT
    }
    if (settings.anchor.includes("right")) {
      anchor = anchor ? anchor | RIGHT : RIGHT
    }
    if (settings.anchor.includes("center")) {
      anchor = TOP | BOTTOM
    }
  } else {
    anchor = LEFT | BOTTOM
  }

  const time = createPoll("", 1000, () => {
    return GLib.DateTime.new_now_local().format(settings.format)
  })

  return (
    <window
      visible
      layer={Astal.Layer.BOTTOM}
      gdkmonitor={monitor}
      name="desktop-clock"
      class="desktop-clock"
      namespace="tallens-gtk-shell"
      anchor={anchor!}
      margin={30}
      application={app}
      keymode={Astal.Keymode.NONE}
      exclusivity={Astal.Exclusivity.IGNORE}
    >
      <box
        orientation={Gtk.Orientation.HORIZONTAL}
        spacing={10}
        halign={Gtk.Align.START}
        hexpand={true}
      >
        <label label={time.as((t) => t || "")} class="clock" />
      </box>
    </window>
  )
}
