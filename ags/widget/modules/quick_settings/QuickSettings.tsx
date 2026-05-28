import { Astal, Gtk, Gdk } from "ags/gtk4"

import app from "ags/gtk4/app"
import { createBinding, createComputed, createState } from "gnim"

import Header from "./modules/Header"
import QuickToggles from "./modules/QuickToggles"
import QuickDropdown, {
  DropdownFooter,
  DropdownHeader,
  DropdownOption,
} from "./modules/QuickDropdown"
import ToDoList from "./modules/ToDoList"
import MediaControls from "./modules/MediaControls"
import { getSettings } from "../../../settings"
import { SpeakerControls } from "./modules/SpeakerControls"
import { MicrophoneControls } from "./modules/MicrophoneControls"
import { execAsync } from "ags/process"
import Adw from "gi://Adw?version=1"
import { activeMonitor, mpris } from "../../../app"

export default function QuickSettings() {
  const qs_settings = getSettings().quick_settings

  const { TOP, RIGHT } = Astal.WindowAnchor
  const hasPlayers = createBinding(mpris, "players").as((p) => p.length > 0)

  const [isVisible, setVisible] = createState(false)
  const [pinnedMonitor, setPinnedMonitor] = createState(activeMonitor())
  const effectiveMonitor = createComputed(() =>
    isVisible() ? pinnedMonitor() : activeMonitor(),
  )

  const [activeId, setActiveId] = createState<string | null>(null)
  const [menuItems, setMenuItems] = createState<DropdownOption[]>([])
  const [header, setHeader] = createState<DropdownHeader>({
    icon: "open-menu-symbolic",
    title: "Menu",
  })
  const [footer, setFooter] = createState<DropdownFooter>({
    label: "Settings",
    onClick() {
      execAsync("notify-send 'Desktop' 'Dropdown Settings clicked'")
    },
  })

  const openMenu = (
    header: DropdownHeader,
    footer: DropdownFooter,
    id: string,
    items: DropdownOption[],
  ) => {
    if (activeId() === id) {
      setActiveId(null)
      setMenuItems([])
      setHeader({ icon: "open-menu-symbolic", title: "Menu" })
      setFooter({
        label: "Settings",
        onClick() {
          execAsync("notify-send 'Desktop' 'Dropdown Settings clicked'")
        },
      })
    } else {
      setActiveId(id)
      setMenuItems(items)
      setHeader(header)
      setFooter(footer)
    }
  }

  const closeMenu = () => {
    setActiveId(null)
    setMenuItems([])
    setHeader({ icon: "open-menu-symbolic", title: "Menu" })
    setFooter({
      label: "Settings",
      onClick() {
        execAsync("notify-send 'Desktop' 'Dropdown Settings clicked'")
      },
    })
  }

  return (
    <window
      monitor={effectiveMonitor}
      visible={false}
      name="quick-settings"
      class="quick-settings"
      namespace="tallens-gtk-shell"
      application={app}
      anchor={TOP | RIGHT}
      marginRight={8}
      marginTop={8}
      widthRequest={400}
      valign={Gtk.Align.START}
      halign={Gtk.Align.END}
      vexpand
      keymode={Astal.Keymode.ON_DEMAND}
      onShow={() => {
        setVisible(true)
        setPinnedMonitor(activeMonitor())
      }}
      onHide={() => {
        setVisible(false)
      }}
    >
      <Gtk.EventControllerKey
        onKeyPressed={({ widget }, keyval: number) => {
          if (keyval === Gdk.KEY_Escape) {
            closeMenu()
            widget.hide()
          }
        }}
      />

      <Adw.Clamp maximumSize={500}>
        <box
          orientation={Gtk.Orientation.VERTICAL}
          spacing={15}
          valign={Gtk.Align.START}
        >
          {qs_settings.header && <Header />}
          {qs_settings.speaker_controls && <SpeakerControls />}
          {qs_settings.microphone_controls && <MicrophoneControls />}
          {qs_settings.quick_toggles && (
            <box orientation={Gtk.Orientation.VERTICAL}>
              <QuickToggles setMenu={openMenu} />
              <QuickDropdown
                header={header}
                footer={footer}
                items={menuItems}
                onClose={closeMenu}
              />
            </box>
          )}
          {qs_settings.todo_list && <ToDoList />}
          {qs_settings.media_controls && (
            <box visible={hasPlayers}>
              <MediaControls />
            </box>
          )}
        </box>
      </Adw.Clamp>
    </window>
  )
}
