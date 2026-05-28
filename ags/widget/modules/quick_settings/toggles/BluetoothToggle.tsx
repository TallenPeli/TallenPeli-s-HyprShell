import { Gtk } from "ags/gtk4"
import Pango from "gi://Pango?version=1.0"
import { createBinding, createComputed } from "ags"
import {
  DropdownOption,
  DropdownHeader,
  DropdownFooter,
} from "../modules/QuickDropdown"
import { execAsync } from "ags/process"
import { bluetooth } from "../../../../app"

const MENU_FOOTER: DropdownFooter = {
  label: "Bluetooth Settings",
  onClick() {
    execAsync("blueman-manager")
  },
}

export default function BluetoothToggle({
  setMenu,
}: {
  setMenu: (
    header: DropdownHeader,
    footer: DropdownFooter,
    id: string,
    items: DropdownOption[],
  ) => void
}) {
  const adapter = bluetooth.adapter
  const is_powered = createBinding(bluetooth, "is_powered")
  const devices = createBinding(bluetooth, "devices")

  const icon = createComputed(() => {
    return is_powered()
      ? "bluetooth-active-symbolic"
      : "bluetooth-disabled-symbolic"
  })

  const sub_text_label = createComputed(() => {
    const powered = is_powered()

    if (!powered) return "Off"

    const devs = devices()
    const connected = devs.filter((dev) => createBinding(dev, "connected")())

    if (connected.length === 1) {
      const dev = connected[0]
      const name = dev.alias || dev.name || "Unknown"
      const battery = createBinding(dev, "battery_percentage")()

      return battery > 0 ? `${name} (${Math.floor(battery * 100)}%)` : name
    }

    if (connected.length > 1) {
      return `${connected.length} Connected`
    }

    if (adapter) {
      return createBinding(adapter, "alias")() || adapter.name || "On"
    }

    return "On"
  })

  const getBluetoothOptions = (): DropdownOption[] => {
    const knownDevices = devices().filter((d) => d.paired)

    knownDevices.sort((a, b) => {
      if (a.connected !== b.connected) {
        return a.connected ? -1 : 1
      }
      return (a.alias || "").localeCompare(b.alias || "")
    })

    return knownDevices.map((dev) => {
      const name = dev.alias || dev.name || "Unknown Device"

      return {
        label: name,
        icon: dev.icon ? `${dev.icon}-symbolic` : "bluetooth-symbolic",
        selected: dev.connected,
        onClick: () => {
          if (dev.connected) {
            dev.disconnect_device(null)
          } else {
            dev.connect_device(null)
          }
        },
      }
    })
  }

  return (
    <box
      hexpand={true}
      spacing={10}
      orientation={Gtk.Orientation.HORIZONTAL}
      class={is_powered.as((on) =>
        on ? "quick-toggle enabled" : "quick-toggle disabled",
      )}
    >
      <button
        class="toggle"
        onClicked={() => {
          if (adapter) adapter.powered = !adapter.powered
        }}
      >
        <image iconName={icon} pixelSize={25} />
      </button>
      <button
        halign={Gtk.Align.FILL}
        hexpand={true}
        class="dropdown-button"
        onClicked={() =>
          setMenu(
            { icon: icon(), title: "Bluetooth Devices" },
            MENU_FOOTER,
            "bluetooth",
            getBluetoothOptions(),
          )
        }
      >
        <box
          orientation={Gtk.Orientation.VERTICAL}
          valign={Gtk.Align.CENTER}
          hexpand={true}
        >
          <label
            halign={Gtk.Align.START}
            label="Bluetooth"
            css="font-weight: bold;"
          />
          <label
            class="sub-text"
            halign={Gtk.Align.START}
            label={sub_text_label}
            ellipsize={Pango.EllipsizeMode.END}
            lines={1}
            maxWidthChars={15}
          />
        </box>
      </button>
    </box>
  )
}
