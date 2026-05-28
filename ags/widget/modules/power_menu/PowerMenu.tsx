import app from "ags/gtk4/app"
import { execAsync } from "ags/process"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { activeMonitor } from "../../../app"

export default function PowerMenu() {
  const closeAndRun = (cmd: string) => {
    app.toggle_window("power-menu") // Close menu first
    execAsync(["bash", "-c", cmd]).catch((err) => print(err))
  }

  return (
    <window
      monitor={activeMonitor}
      visible={false}
      application={app}
      name="power-menu"
      class="power-menu"
      namespace="tallens-gtk-shell"
      keymode={Astal.Keymode.EXCLUSIVE}
    >
      <Gtk.EventControllerKey
        onKeyPressed={({ widget }, keyval: number) => {
          if (keyval === Gdk.KEY_Escape) {
            widget.hide()
          }
        }}
      />
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
        <button
          tooltipText="Shutdown"
          onClicked={() => closeAndRun("shutdown -h now")}
        >
          <image iconName="system-shutdown-symbolic" pixelSize={25} />
        </button>

        <button tooltipText="Reboot" onClicked={() => closeAndRun("reboot")}>
          <image iconName="view-refresh-symbolic" pixelSize={25} />
        </button>

        <button
          tooltipText="Sleep"
          onClicked={() =>
            closeAndRun("hyprctl dispatch exec hyprlock && systemctl suspend")
          }
        >
          <image iconName="weather-clear-night-symbolic" pixelSize={25} />
        </button>

        <button
          tooltipText="Hibernate"
          onClicked={() =>
            closeAndRun("hyprctl dispatch exec hyprlock && systemctl hibernate")
          }
        >
          <image iconName="drive-harddisk-symbolic" pixelSize={25} />
        </button>

        <button
          tooltipText="Log Out"
          onClicked={() => closeAndRun("hyprctl dispatch exit")}
        >
          <image iconName="system-log-out-symbolic" pixelSize={25} />
        </button>
      </box>
    </window>
  )
}
