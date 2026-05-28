import { Gtk } from "ags/gtk4"
import { createBinding, createState } from "ags"
import Wp from "gi://AstalWp"
import QuickDropdown, {
  DropdownFooter,
  DropdownHeader,
  DropdownOption,
} from "./QuickDropdown"
import { execAsync } from "ags/process"

export function MicrophoneControls() {
  const wp = Wp.get_default()
  const audio = wp.audio

  const default_mic = audio.default_microphone
  const mics = createBinding(audio, "microphones")
  const mic_muted = createBinding(default_mic, "mute")

  const [header, setHeader] = createState<DropdownHeader>({
    icon: "audio-input-microphone-symbolic",
    title: "Default Microphone",
  })

  const [footer, setFooter] = createState<DropdownFooter>({
    label: "Microphone Settings",
    onClick() {
      execAsync("pavucontrol")
    },
  })

  const [menuItems, setMenuItems] = createState<DropdownOption[]>([])

  const toggleMenu = (options: DropdownOption[]) => {
    if (menuItems().length < 1) {
      setMenuItems(options)
    } else {
      closeMenu()
    }
  }

  const closeMenu = () => {
    setMenuItems([])
  }

  // workaround to get wireplumber icons working with the limited adwaita icon set
  const getIconName = (name: string): string => {
    const n = name.toLowerCase()

    if (n.includes("headset") || n.includes("handsfree"))
      return "audio-headset-symbolic"

    if (n.includes("microphone") || n.includes("input-microphone"))
      return "audio-input-microphone-symbolic"

    if (n.includes("bluetooth")) return "bluetooth-active-symbolic"

    if (n.includes("card") || n.includes("pci") || n.includes("usb"))
      return "audio-card-symbolic"

    return "audio-x-generic-symbolic"
  }

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={0}>
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={0}>
        <button
          tooltipText="Mute"
          class="slider-button"
          onClicked={() => {
            default_mic.mute = !default_mic.mute
          }}
        >
          <image
            iconName={mic_muted.as((m) =>
              m
                ? "microphone-sensitivity-muted-symbolic"
                : "audio-input-microphone-symbolic",
            )}
          />
        </button>
        <slider
          value={createBinding(default_mic, "volume")}
          min={0.0}
          max={1.0}
          hexpand={true}
          onChangeValue={({ value }) => default_mic.set_volume(value)}
        />
        <button
          class="slider-button"
          visible={mics.as((m) => m.length > 1)}
          onClicked={() => {
            const options: DropdownOption[] = mics().map((mic) => ({
              label: mic.description,
              icon: getIconName(mic.icon),
              selected: mic.id === audio.default_microphone.id,
              onClick: () => mic.set_is_default(true),
            }))

            toggleMenu(options)
          }}
        >
          <image
            iconName={menuItems.as((m) =>
              m.length > 1 ? "pan-down-symbolic" : "pan-end-symbolic",
            )}
            pixelSize={20}
          />
        </button>
      </box>
      <QuickDropdown
        header={header}
        footer={footer}
        items={menuItems}
        onClose={closeMenu}
      />
    </box>
  )
}
