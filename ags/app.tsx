import app from "ags/gtk4/app"
import QuickSettings from "./widget/modules/quick_settings/QuickSettings"
import PowerMenu from "./widget/modules/power_menu/PowerMenu"
import { WifiPasswordPrompt } from "./widget/modules/quick_settings/toggles/NetworkToggle"
import NotificationPopups from "./widget/modules/notifications/NotificationPopups"
import Dock, { DockTrigger } from "./widget/modules/dock/Dock"
import Bar from "./widget/modules/bar/Bar"
import { monitorFile } from "ags/file"
import { exec, execAsync } from "ags/process"
import { createBinding } from "gnim"
import GLib from "gi://GLib?version=2.0"
import DateMenu from "./widget/modules/bar/datemenu/DateMenu"
import Launcher from "./widget/modules/launcher/Launcher"
import AstalNetwork from "gi://AstalNetwork?version=0.1"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"
import AstalMpris from "gi://AstalMpris?version=0.1"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import Clock from "./widget/desktop/Clock"
import SettingsWindow from "./widget/modules/settings/Settings"

/// Config files
const colors = `${GLib.get_user_config_dir()}/ags/style/colors.css`
const scss = `${GLib.get_user_config_dir()}/ags/style/main.scss`
const css = `${GLib.get_user_config_dir()}/ags/style/main.css`
const hyprpaper = `${GLib.get_user_config_dir()}/hypr/hyprpaper.conf`

/// Get the default network, bluetooth and mpris instances to share with the widgets
export const network = AstalNetwork.get_default()
export const bluetooth = AstalBluetooth.get_default()
export const mpris = AstalMpris.get_default()
export const monitors = app.get_monitors()

const hyprland = AstalHyprland.get_default()
export const activeMonitor = createBinding(hyprland, "focusedMonitor").as(
  (m) => m.id,
)

/// Recompiles the scss file into css and apply it to the shell
function reloadCss() {
  console.log("scss change detected - recompiling...")
  exec(`sass ${scss} ${css}`)
  app.apply_css(css)
}

/// Restarts hyprpaper to apply the new config
function restartHyprpaper() {
  console.log("Hyprpaper change detected - restarting...")
  execAsync("killall hyprpaper").catch(() => {
    print("Failed to kill hyprpaper.")
  })

  execAsync("hyprctl dispatch exec hyprpaper").catch(() => {
    print("Failed to restart.")
  })
}

app.start({
  css: css,
  instanceName: "tallens-gtk-shell",
  requestHandler(argv: string[], res: (response: any) => void) {
    const request = argv[0]
    switch (request) {
      case "quick-settings":
        app.toggle_window("quick-settings")
        res("Quick settings toggled")
        break
      case "power-menu":
        app.toggle_window("power-menu")
        res("Power menu toggled")
        break
      case "launcher":
        app.toggle_window("launcher")
        res("Opened launcher")
        break
      case "wallpaper-picker":
        app.toggle_window("wallpaper_picker")
        res("Opened Wallpaper picker")
        break
      default:
        res("not found")
        break
    }
  },
  main() {
    exec(`sass ${scss} ${css}`)
    monitorFile(colors, reloadCss)
    monitorFile(scss, reloadCss)
    monitorFile(hyprpaper, restartHyprpaper)

    // widgets that need to be rendered on all monitors
    for (const monitor of monitors) {
      Bar(monitor)
      DockTrigger(monitor)
      Clock(monitor)
    }

    // widgets that will be dynamically rendered on the focused monitor
    Dock()
    QuickSettings()
    Launcher()

    DateMenu()
    PowerMenu()

    NotificationPopups()

    WifiPasswordPrompt()
    SettingsWindow()
  },
})
