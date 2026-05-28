import { Gtk } from "ags/gtk4"
import Battery from "gi://AstalBattery"
import { execAsync } from "ags/process"
import app from "ags/gtk4/app"
import QuickDropdown, {
  DropdownFooter,
  DropdownHeader,
  DropdownOption,
} from "./QuickDropdown"
import { createState } from "gnim"
import { getSettings } from "../../../../settings"

function HeaderMobile({ battery_percentage }: { battery_percentage: number }) {
  return (
    <box class="header" hexpand={true} halign={Gtk.Align.END} spacing={15}>
      <box class="battery-indicator">{battery_percentage}%</box>
      <button
        class="hover-button"
        onClicked={() =>
          execAsync("hyprshot -m region output --clipboard-only")
        }
      >
        <image iconName="camera-photo-symbolic" pixelSize={20} />
      </button>
      <button class="hover-button">
        <image iconName="applications-system-symbolic" pixelSize={20} />
      </button>
      <button class="hover-button">
        <image iconName="system-lock-screen-symbolic" pixelSize={20} />
      </button>
      <button class="hover-button">
        <image iconName="system-shutdown-symbolic" pixelSize={20} />
      </button>
      <button class="hover-button">
        <image file="/home/tallen/.face" />
      </button>
    </box>
  )
}

function closeAndRun(cmd: string) {
  app.toggle_window("quick-settings")
  execAsync(cmd)
}

function HeaderDesktop({
  toggleMenu,
}: {
  toggleMenu: (items: DropdownOption[]) => void
}) {
  const settings = getSettings()

  const rawOptions = settings.quick_settings?.power_options
  const safeOptions = Array.isArray(rawOptions) ? rawOptions : []
  const powerMenuItems: DropdownOption[] = safeOptions.map((opt) => ({
    label: opt.label,
    icon: opt.icon,
    selected: false,
    onClick: () => closeAndRun(opt.command),
  }))

  return (
    <box class="header" hexpand={true}>
      <box halign={Gtk.Align.START} spacing={10}>
        <button
          class="hover-button"
          onClicked={() =>
            execAsync("hyprshot -m region output --clipboard-only")
          }
          tooltipText="Screenshot"
        >
          <image iconName="camera-photo-symbolic" pixelSize={20} />
        </button>
        <button
          class="hover-button"
          onClicked={() => {
            execAsync("hyprpicker -f hex")
          }}
          tooltipText={"Select Color"}
        >
          <image iconName="color-select-symbolic" pixelSize={20} />
        </button>
      </box>
      <box hexpand={true}></box>
      <box halign={Gtk.Align.END} spacing={10}>
        <button
          class="hover-button"
          tooltipText="Shell settings"
          onClicked={() => app.toggle_window("settings-window")}
        >
          <image iconName="applications-system-symbolic" pixelSize={20} />
        </button>
        <button
          class="hover-button"
          onClicked={() => {
            closeAndRun("hyprlock")
          }}
          tooltipText="Lock Screen"
        >
          <image iconName="system-lock-screen-symbolic" pixelSize={20} />
        </button>
        <button
          class="hover-button"
          onClicked={() => {
            toggleMenu(powerMenuItems)
          }}
          tooltipText="Power Options"
        >
          <image iconName="system-shutdown-symbolic" pixelSize={20} />
        </button>
      </box>
    </box>
  )
}

export default function Header() {
  const [header, setHeader] = createState<DropdownHeader>({
    icon: "system-shutdown-symbolic",
    title: "Power Options",
  })
  const [footer, setFooter] = createState<DropdownFooter>({
    label: "Power Settings",
    onClick() {
      execAsync("notify-send 'Desktop' 'Power settings clicked'")
    },
  })
  const [menuItems, setMenuItems] = createState<DropdownOption[]>([])

  const toggleMenu = (items: DropdownOption[]) => {
    if (menuItems().length < 1) {
      setMenuItems(items)
    } else {
      setMenuItems([])
    }
  }

  const closeMenu = () => {
    setMenuItems([])
  }

  const battery = Battery.get_default()
  if (battery.percentage)
    return <HeaderMobile battery_percentage={battery.percentage} />
  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <HeaderDesktop toggleMenu={toggleMenu} />
      <QuickDropdown
        header={header}
        footer={footer}
        items={menuItems}
        onClose={closeMenu}
      />
    </box>
  )
}
