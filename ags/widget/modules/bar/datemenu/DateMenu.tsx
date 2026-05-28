import { Astal, Gdk, Gtk } from "ags/gtk4"
import Adw from "gi://Adw?version=1"
import AstalNotifd from "gi://AstalNotifd?version=0.1"
import MediaControls from "../../quick_settings/modules/MediaControls"
import { createBinding, createState, For } from "gnim"
import GLib from "gi://GLib"
import app from "ags/gtk4/app"
import Pango from "gi://Pango"
import { activeMonitor } from "../../../../app"

function Calendar() {
  const [monthName, setMonthName] = createState(
    GLib.DateTime.new_now_local().format("%B")!,
  )
  let calendar: Gtk.Calendar
  const moveMonth = (step: number) => {
    const currentDate = calendar.get_date()
    const newDate = currentDate.add_months(step)
    calendar.set_date(newDate!)
    setMonthName(newDate!.format("%B")!)
  }
  return (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      class="calendar-container"
      spacing={15}
    >
      <box class="calendar-header">
        <button onClicked={() => moveMonth(-1)} iconName="pan-start-symbolic" />
        <label hexpand class="month-label" label={monthName.as(String)} />
        <button onClicked={() => moveMonth(1)} iconName="pan-end-symbolic" />
      </box>
      <Gtk.Calendar
        $={(self) => (calendar = self)}
        class="calendar"
        showHeading={false}
        showDayNames={true}
        onDaySelected={(self) => {
          const date = self.get_date()
          setMonthName(date.format("%B")!)
          print(date.format("%Y-%m-%d"))
        }}
      />
    </box>
  )
}

function NotificationItem({
  notification,
}: {
  notification: AstalNotifd.Notification
}) {
  const appName = createBinding(notification, "appName")
  const summary = createBinding(notification, "summary")
  const body = createBinding(notification, "body")
  const appIcon = createBinding(notification, "appIcon")
  const time = createBinding(notification, "time")

  return (
    <box
      class="notification-item"
      orientation={Gtk.Orientation.VERTICAL}
      spacing={8}
    >
      <box spacing={10}>
        <image
          iconName={appIcon.as((icon) => icon || "dialog-information-symbolic")}
          pixelSize={24}
        />
        <box orientation={Gtk.Orientation.VERTICAL} hexpand>
          <box>
            <label
              class="notification-app-name"
              label={appName}
              halign={Gtk.Align.START}
              ellipsize={Pango.EllipsizeMode.END}
              maxWidthChars={30}
            />
            <label
              class="notification-time dim-text"
              hexpand
              halign={Gtk.Align.END}
              label={time.as((t) => {
                const now = GLib.DateTime.new_now_local().to_unix()
                const diff = now - t
                if (diff < 60) return "now"
                if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
                if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
                return `${Math.floor(diff / 86400)}d ago`
              })}
            />
          </box>
          <label
            class="notification-summary"
            label={summary}
            halign={Gtk.Align.START}
            ellipsize={Pango.EllipsizeMode.END}
            maxWidthChars={35}
            wrap={true}
            wrapMode={Pango.WrapMode.WORD_CHAR}
            lines={2}
          />
        </box>
        <button
          class="notification-close"
          iconName="window-close-symbolic"
          onClicked={() => notification.dismiss()}
        />
      </box>
      <Gtk.Separator />
    </box>
  )
}

function Notifications() {
  const notifd = AstalNotifd.get_default()
  const notifications = createBinding(notifd, "notifications")
  const dnd = createBinding(notifd, "dontDisturb")

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
      <box class="notifications-header">
        <label
          label="Notifications"
          class="dim-text"
          hexpand
          halign={Gtk.Align.START}
        />
        <button
          class="dnd-toggle"
          iconName={dnd.as((d) =>
            d
              ? "notifications-disabled-symbolic"
              : "preferences-system-notifications-symbolic",
          )}
          tooltipText={dnd.as((d) =>
            d ? "Enable notifications" : "Do Not Disturb",
          )}
          onClicked={() => {
            notifd.dontDisturb = !notifd.dontDisturb
          }}
        />
        <button
          iconName="edit-clear-all-symbolic"
          tooltipText="Clear all notifications"
          visible={notifications.as((n) => n.length > 0)}
          onClicked={() => {
            const notifs = notifications.get()
            notifs.forEach((n) => n.dismiss())
          }}
        />
      </box>

      <Gtk.ScrolledWindow
        minContentHeight={0}
        maxContentHeight={400}
        propagateNaturalHeight={true}
        vexpand={true}
      >
        <box orientation={Gtk.Orientation.VERTICAL}>
          <For each={notifications}>
            {(notification) => <NotificationItem notification={notification} />}
          </For>
          <box
            vexpand
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
            orientation={Gtk.Orientation.VERTICAL}
            visible={notifications.as((n) => n.length < 1)}
            spacing={10}
          >
            <image
              iconName="notifications-disabled-symbolic"
              pixelSize={48}
              opacity={0.3}
            />
            <label label="No notifications" class="dim-text" />
          </box>
        </box>
      </Gtk.ScrolledWindow>
    </box>
  )
}

export default function DateMenu() {
  const { TOP } = Astal.WindowAnchor

  let win: Astal.Window

  function onKey(_e: Gtk.EventControllerKey, keyval: number) {
    if (keyval === Gdk.KEY_Escape) {
      win.visible = false
      return
    }
  }

  return (
    <window
      monitor={activeMonitor}
      anchor={TOP}
      marginTop={8}
      namespace={"tallens-gtk-shell"}
      name="datemenu"
      application={app}
      class="datemenu"
      keymode={Astal.Keymode.EXCLUSIVE}
      $={(ref) => (win = ref)}
    >
      <Gtk.EventControllerKey onKeyPressed={onKey} />
      <Adw.Clamp maximumSize={800}>
        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={15}>
          <box widthRequest={400} class="notification-column">
            <box
              vexpand
              valign={Gtk.Align.START}
              orientation={Gtk.Orientation.VERTICAL}
              spacing={15}
            >
              <Notifications />
            </box>
          </box>
          <Gtk.Separator />
          <box
            heightRequest={500}
            valign={Gtk.Align.START}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}
          >
            <label
              halign={Gtk.Align.START}
              class="day-label dim-text"
              label={GLib.DateTime.new_now_local().format("%A")?.toString()}
            />
            <label
              halign={Gtk.Align.START}
              class="date-label dim-text"
              label={GLib.DateTime.new_now_local()
                .format("%B %-e %Y")
                ?.toString()}
            />
            <Calendar />
          </box>
        </box>
      </Adw.Clamp>
    </window>
  )
}
