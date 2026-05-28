import Gtk from "gi://Gtk?version=4.0"
import Pango from "gi://Pango?version=1.0"
import { execAsync } from "ags/process"
import { createState } from "ags"

const TARGET_TEMP = 4000

export default function NightLightToggle() {
  const [active, setActive] = createState(false)

  execAsync(["sh", "-c", "pidof hyprsunset"])
    .then((pid) => {
      if (pid) setActive(true)
    })
    .catch(() => setActive(false))

  function toggle() {
    const newState = !active()

    if (newState) {
      execAsync(["hyprsunset", "-t", TARGET_TEMP.toString()])
      setActive(true)
    } else {
      execAsync("pkill hyprsunset")
      setActive(false)
    }
  }

  return (
    <box
      class={active.as((on) =>
        on ? "quick-toggle enabled" : "quick-toggle disabled",
      )}
      spacing={10}
    >
      <button class="toggle" onClicked={toggle}>
        <image
          iconName={active.as((on) =>
            // Lwk just using the weather ones because they render properly unlike the nightlight enabled/disabled ones. They also look nicer imo
            on ? "weather-clear-night-symbolic" : "weather-clear-symbolic",
          )}
          pixelSize={25}
        />
      </button>
      <box spacing={15} hexpand={true}>
        <box
          orientation={Gtk.Orientation.VERTICAL}
          hexpand={true}
          valign={Gtk.Align.CENTER}
        >
          <label halign={Gtk.Align.START} label="Night Light" />
          <label
            class="sub-text"
            label={active.as((on) => (on ? `Temp - ${TARGET_TEMP}k` : "Off"))}
            halign={Gtk.Align.START}
            ellipsize={Pango.EllipsizeMode.END}
            lines={1}
            maxWidthChars={15}
          />
        </box>
      </box>
    </box>
  )
}
