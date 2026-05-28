import { Gtk } from "ags/gtk4"
import { createBinding, createState } from "ags"
import Wp from "gi://AstalWp"
import QuickDropdown, {
  DropdownFooter,
  DropdownHeader,
  DropdownOption,
} from "./QuickDropdown"
import { execAsync } from "ags/process"

export function SpeakerControls() {
  const wp = Wp.get_default()
  const audio = wp.audio

  const default_speaker = audio.default_speaker
  const speakers = createBinding(audio, "speakers")
  const speaker_muted = createBinding(default_speaker, "mute")

  const [header, setHeader] = createState<DropdownHeader>({
    icon: "audio-volume-high-symbolic",
    title: "Default Speaker",
  })
  const [footer, setFooter] = createState<DropdownFooter>({
    label: "Speaker Settings",
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
    if (n.includes("headphone")) return "audio-headphones-symbolic"

    if (n.includes("microphone") || n.includes("input-microphone"))
      return "audio-input-microphone-symbolic"

    if (n.includes("hdmi") || n.includes("displayport"))
      return "video-display-symbolic"
    if (n.includes("bluetooth")) return "bluetooth-active-symbolic"

    if (n.includes("speaker") || n.includes("analog"))
      return "audio-speakers-symbolic"

    if (n.includes("card") || n.includes("pci") || n.includes("usb"))
      return "audio-card-symbolic"

    return "audio-x-generic-symbolic"
  }

  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={0}>
        <button
          tooltipText="Mute"
          class="slider-button"
          onClicked={() => (default_speaker.mute = !default_speaker.mute)}
        >
          <image
            iconName={speaker_muted.as((m) =>
              m ? "audio-volume-muted-symbolic" : "audio-volume-high-symbolic",
            )}
          />
        </button>
        <slider
          value={createBinding(default_speaker, "volume")}
          min={0.0}
          max={1.0}
          hexpand={true}
          onChangeValue={({ value }) => default_speaker.set_volume(value)}
        />
        <button
          class="slider-button"
          visible={speakers.as((s) => s.length > 1)}
          onClicked={() => {
            const options: DropdownOption[] = speakers().map((speaker) => ({
              label: speaker.description,
              icon: getIconName(speaker.icon),
              selected: speaker.id === audio.default_speaker.id,
              onClick: () => speaker.set_is_default(true),
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
