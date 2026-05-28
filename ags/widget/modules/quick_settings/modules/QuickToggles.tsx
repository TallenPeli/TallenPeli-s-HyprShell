import { Gtk } from "ags/gtk4"

import { WifiToggle } from "../toggles/NetworkToggle"

import BluetoothToggle from "../toggles/BluetoothToggle"
import DoNotDisturbToggle from "../toggles/DoNotDisturbToggle"
import NightLightToggle from "../toggles/NightLightToggle"
import PowerProfilesToggle from "../toggles/PowerProfilesToggle"

import Bluetooth from "gi://AstalBluetooth?version=0.1"
import Notifd from "gi://AstalNotifd"
import PowerProfiles from "gi://AstalPowerProfiles?version=0.1"

import { DropdownFooter, DropdownHeader, DropdownOption } from "./QuickDropdown"
import { getSettings, QuickSettings } from "../../../../settings"
import Network from "gi://AstalNetwork?version=0.1"

export default function QuickToggles({
  setMenu,
}: {
  setMenu: (
    header: DropdownHeader,
    footer: DropdownFooter,
    id: string,
    items: DropdownOption[],
  ) => void
}) {
  const settings: QuickSettings = getSettings().quick_settings
  const bluetooth = Bluetooth.get_default()
  const notifd = Notifd.get_default()
  const power_profiles = PowerProfiles.get_default()
  const has_profiles = power_profiles?.get_profiles()?.length > 0
  const network = Network.get_default()

  const renderToggle = (name: string) => {
    switch (name) {
      case "wifi":
        if (network.wifi) {
          return <WifiToggle setMenu={setMenu} wifi={network.wifi} />
        }
        break

      case "bluetooth":
        if (bluetooth.adapter) {
          return <BluetoothToggle setMenu={setMenu} />
        }
        break

      case "power_profiles":
        return has_profiles ? <PowerProfilesToggle setMenu={setMenu} /> : <></>

      case "do_not_disturb":
        return notifd ? <DoNotDisturbToggle /> : <></>

      case "night_mode":
        return <NightLightToggle />

      default:
        return
    }
  }

  return (
    <box orientation={Gtk.Orientation.VERTICAL} hexpand={false} spacing={10}>
      <Gtk.FlowBox
        valign={Gtk.Align.START}
        halign={Gtk.Align.START}
        rowSpacing={10}
        columnSpacing={10}
        maxChildrenPerLine={2}
        minChildrenPerLine={1}
      >
        {settings.toggles.map((toggleName) => renderToggle(toggleName))}
      </Gtk.FlowBox>
    </box>
  )
}
