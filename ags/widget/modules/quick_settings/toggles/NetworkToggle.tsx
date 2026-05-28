import { Astal, Gdk, Gtk } from "ags/gtk4"
import { createBinding, createComputed, createState } from "ags"
import Network from "gi://AstalNetwork"
import Pango from "gi://Pango?version=1.0"
import {
  DropdownFooter,
  DropdownHeader,
  DropdownOption,
} from "../modules/QuickDropdown"
import { execAsync } from "ags/process"
import app from "ags/gtk4/app"
import { activeMonitor } from "../../../../app"

export const NetworkType = {
  UNKNOWN: 0,
  WIRED: 1,
  WIRELESS: 2,
}

export const [authSSID, setAuthSSID] = createState<string | null>(null)

export function WifiPasswordPrompt() {
  const [password, setPassword] = createState("")

  const submit = () => {
    const ssid = authSSID()
    const pass = password()

    if (!ssid) return

    execAsync(`notify-send "WiFi" "Connecting to ${ssid}..."`)

    const connectCmd = pass
      ? `nmcli device wifi connect "${ssid}" password "${pass}"`
      : `nmcli device wifi connect "${ssid}"`

    const fullCmd = `bash -c 'nmcli connection delete "${ssid}" 2> /dev/null || true; ${connectCmd}'`

    execAsync(fullCmd)
      .then(() => {
        execAsync(`notify-send "WiFi" "Connected to ${ssid}"`)
        setAuthSSID(null)
        setPassword("")
      })
      .catch((err) => {
        execAsync(`notify-send "WiFi" "Failed to connect: ${err}"`)
      })

    app.toggle_window("wifi-password")
  }

  return (
    <window
      monitor={activeMonitor}
      name="wifi-password"
      application={app}
      class="wifi-prompt"
      namespace="tallens-gtk-shell"
      visible={authSSID.as((s) => s !== null)}
      keymode={Astal.Keymode.ON_DEMAND}
    >
      <Gtk.EventControllerKey
        onKeyPressed={({ widget }, keyval: number) => {
          if (keyval === Gdk.KEY_Escape) {
            widget.hide()
          }
        }}
      />
      <box
        class="password-prompt-window"
        orientation={Gtk.Orientation.VERTICAL}
        spacing={20}
        vexpand={true}
      >
        <label
          class="title"
          label={authSSID.as((s) => `Enter password for "${s}"`)}
        />
        <label
          class="description"
          label="This network requires a password to connect"
          vexpand={true}
        />
        <entry
          placeholder_text="Password"
          visibility={false}
          text={password()}
          onNotifyText={({ text }) => setPassword(text || "")}
          onActivate={submit}
        />
        <box spacing={10} hexpand={true} vexpand={true}>
          <button
            class="cancel-btn"
            label="Cancel"
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.END}
            onClicked={() => app.toggle_window("wifi-password")}
            hexpand={true}
          />
          <button
            class="connect-btn"
            label="Connect"
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.END}
            onClicked={submit}
            hexpand={true}
          />
        </box>
      </box>
    </window>
  )
}

export function WifiToggle({
  setMenu,
  wifi,
}: {
  setMenu: (
    header: DropdownHeader,
    footer: DropdownFooter,
    id: string,
    items: DropdownOption[],
  ) => void
  wifi: Network.Wifi
}) {
  const [ssid, setSsid] = createState("Offline")
  const is_connected = createBinding(wifi, "enabled")

  const MENU_HEADER: DropdownHeader = {
    icon: "network-wireless-symbolic",
    title: "Networks",
  }

  const MENU_FOOTER: DropdownFooter = {
    label: "Wifi Settings",
    onClick() {
      execAsync("ghostty -e nmtui")
    },
  }

  const [networks, setNetworks] = createState<DropdownOption[]>([
    {
      icon: "network-wireless-offline-symbolic",
      label: "No networks found",
      selected: false,
    },
  ])

  const icon = createComputed(() => {
    return is_connected()
      ? "network-wireless-symbolic"
      : "network-offline-symbolic"
  })

  const updateLabel = () => {
    if (!wifi.enabled) {
      setSsid("Disabled")
    } else {
      setSsid(wifi.ssid || "Disconnected")
    }
  }

  const getIcon = (ap: Network.AccessPoint): string => {
    const isOpen = ap.wpaFlags === 0 && ap.rsnFlags === 0
    return isOpen ? ap.iconName : "network-wireless-encrypted-symbolic"
  }

  const getWifiOptions = (): DropdownOption[] => {
    if (!wifi) return []

    const safePoints = wifi.accessPoints.map((ap) => {
      try {
        return {
          ssid: ap.ssid,
          strength: ap.strength,
          iconName: getIcon(ap),
        }
      } catch (e) {
        return null
      }
    })

    const sorted = safePoints
      .filter((ap): ap is NonNullable<typeof ap> => ap !== null && !!ap.ssid)
      .sort((a, b) => {
        if (a.ssid === wifi.ssid) return -1
        if (b.ssid === wifi.ssid) return 1
        return b.strength - a.strength
      })

    const uniquePoints = sorted
      .filter(
        (ap, index, self) =>
          index === self.findIndex((t) => t.ssid === ap.ssid),
      )
      .slice(0, 10)

    if (uniquePoints.length === 0) {
      return [
        {
          icon: "network-wireless-offline-symbolic",
          label: "No networks found",
          selected: false,
        },
      ]
    }

    return uniquePoints.map((ap) => ({
      label: ap.ssid || "Unknown",
      icon: ap.iconName,
      selected: ap.ssid === wifi.ssid,
      onClick: () => {
        execAsync(`nmcli device wifi connect "${ap.ssid}"`)
          .then(() => {
            execAsync(`notify-send "WiFi" "Connected to ${ap.ssid}"`)
          })
          .catch((err) => {
            const errorString = typeof err === "string" ? err : String(err)
            if (
              errorString.includes("Secrets were required") ||
              errorString.includes("7")
            ) {
              setAuthSSID(ap.ssid)
            } else {
              execAsync(`notify-send "WiFi Error" "${errorString}"`)
            }
          })
      },
    }))
  }

  wifi.connect("notify::access-points", () => {
    setNetworks(getWifiOptions())
  })

  wifi.connect("notify", updateLabel)

  updateLabel()
  setNetworks(getWifiOptions())

  return (
    <box
      hexpand={true}
      spacing={10}
      orientation={Gtk.Orientation.HORIZONTAL}
      class={is_connected?.as((on) =>
        on ? "quick-toggle enabled" : "quick-toggle disabled",
      )}
    >
      <button
        class="toggle"
        onClicked={() => {
          wifi.enabled = !wifi.enabled
        }}
      >
        <image iconName={icon} pixelSize={25} />
      </button>
      <button
        halign={Gtk.Align.FILL}
        hexpand={true}
        class="dropdown-button"
        onClicked={() => {
          setMenu(MENU_HEADER, MENU_FOOTER, "wifi", networks())
        }}
      >
        <box
          orientation={Gtk.Orientation.VERTICAL}
          valign={Gtk.Align.CENTER}
          hexpand={true}
        >
          <label
            halign={Gtk.Align.START}
            label="WiFi"
            css="font-weight: bold;"
          />
          <label
            class="sub-text"
            halign={Gtk.Align.START}
            label={ssid}
            ellipsize={Pango.EllipsizeMode.END}
            lines={1}
            maxWidthChars={15}
          />
        </box>
      </button>
    </box>
  )
}
