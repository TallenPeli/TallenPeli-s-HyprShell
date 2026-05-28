import { Gtk } from "ags/gtk4"
import Pango from "gi://Pango?version=1.0"
import Notifd from "gi://AstalNotifd?version=0.1"
import { createBinding } from "ags"

export default function DoNotDisturbToggle() {
  const notifd = Notifd.get_default()
  const is_dnd = createBinding(notifd, "dont_disturb")

  return (
    <box
      class={is_dnd.as((dnd) =>
        dnd ? "quick-toggle enabled" : "quick-toggle disabled",
      )}
    >
      <box spacing={10} halign={Gtk.Align.FILL} hexpand={true}>
        <button
          onClicked={() => (notifd.dont_disturb = !notifd.dont_disturb)}
          class="toggle"
        >
          <image iconName="notifications-disabled-symbolic" pixelSize={25} />
        </button>
        <box
          orientation={Gtk.Orientation.VERTICAL}
          hexpand={true}
          valign={Gtk.Align.CENTER}
        >
          <label
            halign={Gtk.Align.START}
            label={is_dnd.as((dnd) => (dnd ? "Silent" : "Notify"))}
          />
          <label
            class="sub-text"
            halign={Gtk.Align.START}
            label="Do Not Disturb"
            ellipsize={Pango.EllipsizeMode.END}
            lines={1}
            maxWidthChars={15}
          />
        </box>
      </box>
    </box>
  )
}
