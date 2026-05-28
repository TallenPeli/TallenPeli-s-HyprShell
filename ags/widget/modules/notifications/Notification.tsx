import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import Adw from "gi://Adw"
import GLib from "gi://GLib"
import AstalNotifd from "gi://AstalNotifd"
import Pango from "gi://Pango"
import { createState } from "gnim"
import { MuteApp, StoreNotification } from "./NotificationPopups"

function isIcon(icon?: string | null) {
  const iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!)
  return icon && iconTheme.has_icon(icon)
}

function fileExists(path: string) {
  return GLib.file_test(path, GLib.FileTest.EXISTS)
}

function time(time: number, format = "%H:%M") {
  return GLib.DateTime.new_from_unix_local(time).format(format)!
}

interface NotificationProps {
  notification: AstalNotifd.Notification
}

export default function Notification({ notification: n }: NotificationProps) {
  const [showActions, setShowActions] = createState(false)
  const [timoutId, setTimeoutId] = createState<number | null>(null)

  const startDismissTimer = () => {
    const id = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 5, () => {
      n.dismiss()
      return GLib.SOURCE_REMOVE
    })
    setTimeoutId(id)
  }

  const cancelDismissTimer = () => {
    const id = timoutId()
    if (id !== null) {
      GLib.source_remove(id)
      setTimeoutId(null)
    }
  }

  startDismissTimer()

  return (
    <Adw.Clamp maximumSize={500}>
      <box
        widthRequest={500}
        class="notification"
        orientation={Gtk.Orientation.VERTICAL}
        $={(self) => {
          const motion = Gtk.EventControllerMotion.new()

          motion.connect("enter", () => {
            cancelDismissTimer()
          })

          motion.connect("leave", () => {
            startDismissTimer()
          })

          self.add_controller(motion)
        }}
      >
        <box class="header" spacing={10}>
          {(n.appIcon || isIcon(n.desktopEntry)) && (
            <image
              class="app-icon"
              visible={Boolean(n.appIcon || n.desktopEntry)}
              iconName={n.appIcon || n.desktopEntry}
            />
          )}
          <label
            class="dim-text bold-text"
            halign={Gtk.Align.START}
            ellipsize={Pango.EllipsizeMode.END}
            label={n.appName || "Unknown"}
          />
          <label
            class="dim-text"
            hexpand
            halign={Gtk.Align.END}
            label={time(n.time)}
          />
          <image
            icon_name="alarm-symbolic"
            visible={n.urgency === AstalNotifd.Urgency.CRITICAL}
          />
          <button
            class="expand"
            onClicked={() => setShowActions(!showActions())}
            visible={n.actions.length > 0}
          >
            <image
              iconName={showActions.as((shown) =>
                shown ? "pan-up-symbolic" : "pan-down-symbolic",
              )}
            />
          </button>
          <button class="close" onClicked={(self) => n.dismiss()}>
            <image iconName="window-close-symbolic" />
          </button>
        </box>
        <box
          class="content"
          orientation={Gtk.Orientation.HORIZONTAL}
          spacing={15}
        >
          {n.image && fileExists(n.image) && (
            <Gtk.Frame class="image-container">
              <image
                file={n.image}
                pixelSize={60}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
              />
            </Gtk.Frame>
          )}
          {n.image && isIcon(n.image) && (
            <box valign={Gtk.Align.START} class="icon-image">
              <image
                iconName={n.image}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
              />
            </box>
          )}
          <box
            orientation={Gtk.Orientation.VERTICAL}
            valign={Gtk.Align.CENTER}
            spacing={5}
          >
            <label
              class="title"
              halign={Gtk.Align.START}
              xalign={0}
              label={n.summary}
              ellipsize={Pango.EllipsizeMode.END}
            />
            {n.body && (
              <label
                class="body"
                wrap={true}
                wrapMode={Pango.WrapMode.WORD_CHAR}
                useMarkup
                halign={Gtk.Align.START}
                justify={Gtk.Justification.FILL}
                label={n.body}
              />
            )}
          </box>
        </box>
        {n.actions.length > 0 && (
          <revealer revealChild={showActions}>
            <box class="actions" spacing={15}>
              {n.actions.map(({ label, id }) => (
                <button
                  hexpand
                  onClicked={() => {
                    n.invoke(id)
                    StoreNotification(n, "action")
                  }}
                >
                  <label label={label} halign={Gtk.Align.CENTER} hexpand />
                </button>
              ))}
              <button
                hexpand
                onClicked={() => {
                  MuteApp(n)
                  n.dismiss()
                }}
              >
                <label label="Mute App" halign={Gtk.Align.CENTER} hexpand />
              </button>
            </box>
          </revealer>
        )}
      </box>
    </Adw.Clamp>
  )
}
