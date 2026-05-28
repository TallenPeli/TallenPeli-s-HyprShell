import { Gtk } from "ags/gtk4"
import Pango from "gi://Pango?version=1.0"
import PowerProfiles from "gi://AstalPowerProfiles?version=0.1"
import { createBinding } from "ags"
import { DropdownHeader, DropdownOption } from "../modules/QuickDropdown"
import { DropdownFooter } from "../modules/QuickDropdown"
import { execAsync } from "ags/process"

const MENU_FOOTER: DropdownFooter = {
  label: "Power Settings",
  onClick() {
    execAsync("ghostty -e btop")
  },
}

export default function PowerProfilesToggle({
  setMenu,
}: {
  setMenu: (
    header: DropdownHeader,
    footer: DropdownFooter,
    id: string,
    items: DropdownOption[],
  ) => void
}) {
  const power_profiles = PowerProfiles.get_default()

  const activeProfile = createBinding(power_profiles, "active_profile")
  const icon = createBinding(power_profiles, "icon_name")

  const getPowerOptions = (): DropdownOption[] => {
    const profiles = power_profiles.get_profiles()
    if (!profiles) return []

    return profiles.map((p) => ({
      label: p.profile.charAt(0).toUpperCase() + p.profile.slice(1),
      icon: `power-profile-${p.profile}-symbolic`,
      selected: power_profiles.active_profile === p.profile,
      onClick: () => {
        power_profiles.active_profile = p.profile
      },
    }))
  }

  return (
    <box
      hexpand={true}
      spacing={10}
      orientation={Gtk.Orientation.HORIZONTAL}
      class="quick-toggle enabled"
    >
      <button
        class="toggle"
        onClicked={() => {
          const profiles = power_profiles.get_profiles()
          const current = power_profiles.active_profile
          const idx = profiles.findIndex((p) => p.profile === current)
          const next = profiles[(idx + 1) % profiles.length]
          if (next) power_profiles.active_profile = next.profile
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
            { icon: icon(), title: "Power Profiles" },
            MENU_FOOTER,
            "power",
            getPowerOptions(),
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
            label="Power"
            css="font-weight: bold;"
          />
          <label
            class="sub-text"
            halign={Gtk.Align.START}
            label={activeProfile}
            ellipsize={Pango.EllipsizeMode.END}
            lines={1}
            maxWidthChars={15}
          />
        </box>
      </button>
    </box>
  )
}
