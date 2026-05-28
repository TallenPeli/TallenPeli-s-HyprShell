import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import { createEffect, createState, For } from "gnim"
import { getSettings, setSettings, Settings } from "../../../settings"
import { execAsync } from "ags/process"
import { activeMonitor } from "../../../app"
import SegmentedControl, {
  SegmentedControlOption,
} from "../../common/SegmentedControl"
import GLib from "gi://GLib?version=2.0"

const WALLPAPERS_DIR = `${GLib.get_user_config_dir()}/tallens-gtk-shell/wallpapers/`
type SettingsPage =
  | "quick-settings"
  | "launcher"
  | "theme"
  | "wallpaper"
  | "clock"

export default function SettingsWindow() {
  const [currentPage, setCurrentPage] =
    createState<SettingsPage>("quick-settings")
  const [settings, updateSettings] = createState<Settings>(getSettings())

  createEffect(() => {
    print("Current page changed to:", currentPage())
  })

  const saveSettings = () => {
    setSettings(settings())
    execAsync("notify-send 'Settings' 'Settings saved successfully'")
  }

  const resetSettings = () => {
    const defaultSettings = getSettings()
    updateSettings(defaultSettings)
    execAsync("notify-send 'Settings' 'Settings reset to defaults'")
  }

  const navigationOptions: SegmentedControlOption[] = [
    {
      id: "quick-settings",
      label: "Quick Settings",
      icon: "preferences-other-symbolic",
      onClick: () => setCurrentPage("quick-settings"),
    },
    {
      id: "launcher",
      label: "Launcher",
      icon: "preferences-system-search-symbolic",
      onClick: () => setCurrentPage("launcher"),
    },
    {
      id: "wallpaper",
      label: "Wallpaper",
      icon: "preferences-desktop-wallpaper-symbolic",
      onClick: () => setCurrentPage("wallpaper"),
    },
    {
      id: "clock",
      label: "Clock",
      icon: "preferences-system-time-symbolic",
      onClick: () => setCurrentPage("clock"),
    },
  ]

  return (
    <window
      monitor={activeMonitor}
      application={app}
      name="settings-window"
      class="settings-window"
      namespace="tallens-gtk-shell"
      layer={Astal.Layer.TOP}
      keymode={Astal.Keymode.ON_DEMAND}
      marginTop={8}
      widthRequest={900}
    >
      <Gtk.EventControllerKey
        onKeyPressed={({ widget }, keyval: number) => {
          if (keyval === Gdk.KEY_Escape) {
            app.toggle_window("settings-window")
            widget.hide()
          }
        }}
      />

      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={20}
        widthRequest={800}
        heightRequest={600}
      >
        {/* Header */}
        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
          <box halign={Gtk.Align.START} spacing={10}>
            <box class="icon">
              <image iconName="preferences-system-symbolic" pixelSize={25} />
            </box>
            <label label="Settings" class="title" />
          </box>
          <box hexpand />
          <box halign={Gtk.Align.END} spacing={10}>
            <button
              class="hover-button"
              onClicked={saveSettings}
              tooltipText="Save Settings"
            >
              <box spacing={5}>
                <image iconName="document-save-symbolic" />
                <label label="Save" />
              </box>
            </button>
            <button
              class="hover-button"
              onClicked={resetSettings}
              tooltipText="Reset to Defaults"
            >
              <box spacing={5}>
                <image iconName="edit-undo-symbolic" />
                <label label="Reset" />
              </box>
            </button>
            <button
              class="hover-button"
              onClicked={() => app.toggle_window("settings-window")}
              tooltipText="Close"
            >
              <image iconName="window-close-symbolic" />
            </button>
          </box>
        </box>
        {/* Navigation */}
        <SegmentedControl options={navigationOptions} selected={currentPage} />
        {/* Content Area */}
        <Gtk.ScrolledWindow
          hscrollbarPolicy={Gtk.PolicyType.NEVER}
          vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
          vexpand
        >
          <box orientation={Gtk.Orientation.VERTICAL} spacing={15}>
            <box visible={currentPage.as((p) => p === "quick-settings")}>
              <QuickSettingsPage
                settings={settings}
                updateSettings={updateSettings}
              />
            </box>
            <box visible={currentPage.as((p) => p === "launcher")}>
              <LauncherPage
                settings={settings}
                updateSettings={updateSettings}
              />
            </box>
            <box visible={currentPage.as((p) => p === "wallpaper")}>
              <WallpaperPage
                settings={settings}
                updateSettings={updateSettings}
              />
            </box>
            <box visible={currentPage.as((p) => p === "clock")}>
              <ClockPage settings={settings} updateSettings={updateSettings} />
            </box>
          </box>
        </Gtk.ScrolledWindow>
      </box>
    </window>
  )
}

function QuickSettingsPage({
  settings,
  updateSettings,
}: {
  settings: () => Settings
  updateSettings: (s: Settings) => void
}) {
  const toggleSetting = (key: keyof Settings["quick_settings"]) => {
    const current = settings()
    updateSettings({
      ...current,
      quick_settings: {
        ...current.quick_settings,
        [key]: !current.quick_settings[key],
      },
    })
  }

  const toggleEnabled = (toggleName: string) => {
    const current = settings()
    const toggles = current.quick_settings.toggles
    const index = toggles.indexOf(toggleName)

    const newToggles =
      index >= 0
        ? toggles.filter((t) => t !== toggleName)
        : [...toggles, toggleName]

    updateSettings({
      ...current,
      quick_settings: {
        ...current.quick_settings,
        toggles: newToggles,
      },
    })
  }

  const isToggleEnabled = (toggleName: string) => {
    return settings().quick_settings.toggles.includes(toggleName)
  }

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={15}>
      <label label="Modules" class="group-title" halign={Gtk.Align.START} />
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={10}
        class="settings-group"
      >
        <SettingRow
          label="Header"
          description="Show header with quick actions"
          value={settings().quick_settings.header}
          onToggle={() => toggleSetting("header")}
        />
        <Gtk.Separator />
        <SettingRow
          label="Speaker Controls"
          description="Show volume controls for speakers"
          value={settings().quick_settings.speaker_controls}
          onToggle={() => toggleSetting("speaker_controls")}
        />
        <Gtk.Separator />
        <SettingRow
          label="Microphone Controls"
          description="Show volume controls for microphone"
          value={settings().quick_settings.microphone_controls}
          onToggle={() => toggleSetting("microphone_controls")}
        />
        <Gtk.Separator />
        <SettingRow
          label="Quick Toggles"
          description="Show WiFi, Bluetooth, etc. toggles"
          value={settings().quick_settings.quick_toggles}
          onToggle={() => toggleSetting("quick_toggles")}
        />
        <Gtk.Separator />
        <SettingRow
          label="Todo List"
          description="Show todo list widget"
          value={settings().quick_settings.todo_list}
          onToggle={() => toggleSetting("todo_list")}
        />
        <Gtk.Separator />
        <SettingRow
          label="Media Controls"
          description="Show media player controls"
          value={settings().quick_settings.media_controls}
          onToggle={() => toggleSetting("media_controls")}
        />
      </box>

      {/* Quick Toggle Options */}
      <label
        label="Quick Toggles"
        class="group-title"
        halign={Gtk.Align.START}
      />
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={10}
        class="settings-group"
      >
        <SettingRow
          label="WiFi"
          description="Show WiFi toggle in quick settings"
          value={isToggleEnabled("wifi")}
          onToggle={() => toggleEnabled("wifi")}
        />
        <Gtk.Separator />
        <SettingRow
          label="Bluetooth"
          description="Show Bluetooth toggle in quick settings"
          value={isToggleEnabled("bluetooth")}
          onToggle={() => toggleEnabled("bluetooth")}
        />
        <Gtk.Separator />
        <SettingRow
          label="Power Profiles"
          description="Show power profile toggle in quick settings"
          value={isToggleEnabled("power_profiles")}
          onToggle={() => toggleEnabled("power_profiles")}
        />
        <Gtk.Separator />
        <SettingRow
          label="Do Not Disturb"
          description="Show do not disturb toggle in quick settings"
          value={isToggleEnabled("do_not_disturb")}
          onToggle={() => toggleEnabled("do_not_disturb")}
        />
        <Gtk.Separator />
        <SettingRow
          label="Night Mode"
          description="Show night mode toggle in quick settings"
          value={isToggleEnabled("night_mode")}
          onToggle={() => toggleEnabled("night_mode")}
        />
      </box>

      {/* Power Options */}
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={10}
        class="settings-group"
      >
        <label
          label="Power Options"
          class="group-title"
          halign={Gtk.Align.START}
        />
        <label
          label="Configure power menu options (Shutdown, Reboot, etc.)"
          class="dim-text"
          halign={Gtk.Align.START}
          wrap
        />
      </box>
    </box>
  )
}

function LauncherPage({
  settings,
  updateSettings,
}: {
  settings: () => Settings
  updateSettings: (s: Settings) => void
}) {
  const updateLauncherSetting = <K extends keyof Settings["launcher"]>(
    key: K,
    value: Settings["launcher"][K],
  ) => {
    const current = settings()
    updateSettings({
      ...current,
      launcher: {
        ...current.launcher,
        [key]: value,
      },
    })
  }

  const searchProviderOptions = [
    { id: "https://duckduckgo.com/?q=", label: "DuckDuckGo" },
    { id: "https://www.google.com/search?q=", label: "Google" },
    { id: "https://startpage.com/do/search?q=", label: "Startpage" },
    { id: "https://www.reddit.com/search?q=", label: "Reddit" },
    {
      id: "https://en.wikipedia.org/wiki/Special:Search?search=",
      label: "Wikipedia",
    },
    { id: "https://www.youtube.com/results?search_query=", label: "YouTube" },
    { id: "https://www.bing.com/search?q=", label: "Bing" },
    { id: "https://search.yahoo.com/search?p=", label: "Yahoo" },
    { id: "https://www.baidu.com/s?wd=", label: "Baidu" },
    { id: "https://www.ecosia.org/search?q=", label: "Ecosia" },
  ]

  const aiProviderOptions = [
    { id: "https://chatgpt.com/?q=", label: "ChatGPT" },
    { id: "https://claude.ai/new?q=", label: "Claude" },
    {
      id: "https://www.google.com/search?udm=50&source=searchlabs&q=",
      label: "Google AI",
    },
    {
      id: "https://duckduckgo.com/?ia=chat&t=h_&duckai=1&home=1&q=",
      label: "DuckDuckGo AI",
    },
    { id: "https://www.perplexity.ai/search?q=", label: "Perplexity" },
  ]

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={15}>
      <label
        label="Launcher Configuration"
        class="section-title"
        halign={Gtk.Align.START}
      />

      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={10}
        class="settings-group"
      >
        <SettingDropdown
          label="Search Provider"
          description="Default search engine for web searches"
          value={settings().launcher.search_provider}
          options={searchProviderOptions}
          onChange={(value) => updateLauncherSetting("search_provider", value)}
        />
        <Gtk.Separator />
        <SettingDropdown
          label="AI Provider"
          description="Default AI assistant"
          value={settings().launcher.ai_provider}
          options={aiProviderOptions}
          onChange={(value) => updateLauncherSetting("ai_provider", value)}
        />
        <Gtk.Separator />
        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={5}>
          <box orientation={Gtk.Orientation.VERTICAL} spacing={5}>
            <label
              label="Result Limit"
              halign={Gtk.Align.START}
              css="font-weight: bold;"
            />
            <label
              label="Maximum number of search results to display"
              class="dim-text"
              halign={Gtk.Align.START}
              wrap
            />
          </box>
          <box hexpand></box>
          <Gtk.SpinButton
            value={settings().launcher.result_limit}
            adjustment={Gtk.Adjustment.new(10, 1, 100, 1, 10, 0)}
            onNotifyValue={({ value }) =>
              updateLauncherSetting("result_limit", Math.floor(value))
            }
          />
        </box>
      </box>
    </box>
  )
}

function WallpaperPage({
  settings,
  updateSettings,
}: {
  settings: () => Settings
  updateSettings: (s: Settings) => void
}) {
  const [wallpapers, setWallpapers] = createState<string[]>([])
  const [wallpaper, setWallpaper] = createState(settings().theme.wallpaper)
  const [scheme, setScheme] = createState(settings().theme.color_scheme)
  const [mode, setMode] = createState<"dark" | "light">(settings().theme.mode)
  const [isLoading, setIsLoading] = createState(true)

  async function getWallpapers() {
    setIsLoading(true)
    try {
      const res = await execAsync(`ls ${WALLPAPERS_DIR}`)
      let wallpaperList = res
        .toString()
        .split("\n")
        .filter((line) => line.trim() !== "")

      setWallpapers(wallpaperList)
    } catch (e) {
      print("Failed to get wallpapers", e)
      setWallpapers([])
    } finally {
      setIsLoading(false)
    }
  }

  createEffect(() => {
    print("Setting wallpaper")
    execAsync(
      `matugen image ${WALLPAPERS_DIR}${wallpaper()} --type ${scheme()} --mode ${mode()}`,
    ).then(() => {
      print("Wallpaper changed. Applying settings...")

      const current = settings()
      updateSettings({
        ...current,
        theme: {
          ...current.theme,
          mode: mode(),
          wallpaper: wallpaper(),
          color_scheme: scheme(),
        },
      })

      print("Settings applied.")
    })
  })

  const schemeOptions: SegmentedControlOption[] = [
    {
      id: "scheme-tonal-spot",
      icon: "preferences-color-symbolic",
      label: "Tonal Spot",
      onClick: () => setScheme("scheme-tonal-spot"),
    },
    {
      id: "scheme-expressive",
      icon: "applications-graphics-symbolic",
      label: "Expressive",
      onClick: () => setScheme("scheme-expressive"),
    },
    {
      id: "scheme-monochrome",
      icon: "semi-starred-symbolic",
      label: "Monochrome",
      onClick: () => setScheme("scheme-monochrome"),
    },
    {
      id: "scheme-vibrant",
      icon: "display-brightness-symbolic",
      label: "Vibrant",
      onClick: () => setScheme("scheme-vibrant"),
    },
  ]

  const modeOptions: SegmentedControlOption[] = [
    {
      id: "dark",
      label: "Dark",
      icon: "weather-clear-night-symbolic",
      onClick: () => setMode("dark"),
    },
    {
      id: "light",
      label: "Light",
      icon: "weather-clear-symbolic",
      onClick: () => setMode("light"),
    },
  ]

  function setRandomWallpaper() {
    const currentWallpapers = wallpapers.peek()

    if (currentWallpapers.length === 0) return

    const randomIndex = Math.floor(Math.random() * currentWallpapers.length)
    const wp = currentWallpapers[randomIndex]

    setWallpaper(wp)
  }

  getWallpapers()

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={15} vexpand>
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={10}
        class="settings-group"
      >
        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
          <label label="Mode" class="group-title" halign={Gtk.Align.START} />
          <box hexpand />
          <SegmentedControl
            options={modeOptions}
            selected={mode}
            class="segmented-control"
          />
        </box>
        <Gtk.Separator />
        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
          <label
            label="Color Scheme"
            class="group-title"
            halign={Gtk.Align.START}
          />
          <box hexpand />
          <SegmentedControl
            options={schemeOptions}
            selected={scheme}
            class="segmented-control"
          />
        </box>
        <Gtk.Separator />
        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
          <label
            label="Wallpaper Directory"
            class="group-title"
            halign={Gtk.Align.START}
          />
          <box hexpand />
          <button
            class="hover-button"
            onClicked={() => setRandomWallpaper()}
            tooltipText="Random Wallpaper"
          >
            <image iconName="media-playlist-shuffle-symbolic" />
          </button>
          <button
            class="hover-button"
            onClicked={() => getWallpapers()}
            tooltipText="Refresh files"
          >
            <image iconName="view-refresh-symbolic" />
          </button>
        </box>
        <label
          selectable
          label={WALLPAPERS_DIR}
          class="dim-text"
          halign={Gtk.Align.START}
        />
      </box>

      <box
        visible={isLoading}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        vexpand
      >
        <Gtk.Spinner spinning={isLoading} />
      </box>

      <Gtk.FlowBox
        visible={isLoading.as((loading) => !loading)}
        valign={Gtk.Align.START}
        halign={Gtk.Align.START}
        rowSpacing={10}
        columnSpacing={10}
        maxChildrenPerLine={3}
        minChildrenPerLine={3}
        onChildActivated={(_, child) => {
          const wp = wallpapers.peek()[child.get_index()]
          setWallpaper(wp)
        }}
      >
        <For each={wallpapers}>
          {(wp) => (
            <box
              orientation={Gtk.Orientation.VERTICAL}
              spacing={10}
              class="option-container"
            >
              <button
                name={wp}
                onClicked={() => setWallpaper(wp)}
                class="option"
                css={
                  wp
                    ? `background-image: url("file://${WALLPAPERS_DIR}${wp}");`
                    : ""
                }
                widthRequest={256}
                heightRequest={128}
              />
              <label label={wp} />
            </box>
          )}
        </For>
      </Gtk.FlowBox>
    </box>
  )
}

function ClockPage({
  settings,
  updateSettings,
}: {
  settings: () => Settings
  updateSettings: (s: Settings) => void
}) {
  const updateClockSetting = <K extends keyof Settings["clock"]>(
    key: K,
    value: Settings["clock"][K],
  ) => {
    const current = settings()
    updateSettings({
      ...current,
      clock: {
        ...current.clock,
        [key]: value,
      },
    })
  }

  const formatOptions = [
    { id: "%I:%M %p", label: "12-hour (e.g., 02:30 PM)" },
    { id: "%H:%M", label: "24-hour (e.g., 14:30)" },
    { id: "%I:%M:%S %p", label: "12-hour with seconds" },
    { id: "%H:%M:%S", label: "24-hour with seconds" },
  ]

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={15}>
      <label
        label="Clock Configuration"
        class="section-title"
        halign={Gtk.Align.START}
      />

      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={10}
        class="settings-group"
      >
        <SettingDropdown
          label="Time Format"
          description="Choose how time is displayed"
          value={settings().clock.format}
          options={formatOptions}
          onChange={(value) => updateClockSetting("format", value)}
        />

        <box orientation={Gtk.Orientation.VERTICAL} spacing={5}>
          <label
            label="Font"
            halign={Gtk.Align.START}
            css="font-weight: bold;"
          />
          <entry
            text={settings().clock.font}
            placeholderText="Adwaita"
            onNotifyText={({ text }) => updateClockSetting("font", text || "")}
          />
        </box>

        <box orientation={Gtk.Orientation.VERTICAL} spacing={5}>
          <label
            label="Font Size"
            halign={Gtk.Align.START}
            css="font-weight: bold;"
          />
          <Gtk.SpinButton
            value={settings().clock.font_size}
            adjustment={Gtk.Adjustment.new(150, 10, 500, 1, 10, 0)}
            onNotifyValue={({ value }) =>
              updateClockSetting("font_size", Math.floor(value))
            }
          />
        </box>

        <box orientation={Gtk.Orientation.VERTICAL} spacing={5}>
          <label
            label="Font Weight"
            halign={Gtk.Align.START}
            css="font-weight: bold;"
          />
          <Gtk.SpinButton
            value={settings().clock.font_weight}
            adjustment={Gtk.Adjustment.new(700, 100, 900, 100, 100, 0)}
            onNotifyValue={({ value }) =>
              updateClockSetting("font_weight", Math.floor(value))
            }
          />
        </box>
      </box>
    </box>
  )
}

function SettingRow({
  label,
  description,
  value,
  onToggle,
}: {
  label: string
  description: string
  value: boolean
  onToggle: () => void
}) {
  return (
    <box
      orientation={Gtk.Orientation.HORIZONTAL}
      spacing={10}
      class="setting-row"
    >
      <box orientation={Gtk.Orientation.VERTICAL} spacing={5} hexpand>
        <label
          label={label}
          halign={Gtk.Align.START}
          css="font-weight: bold;"
        />
        <label
          label={description}
          class="dim-text"
          halign={Gtk.Align.START}
          wrap
        />
      </box>
      <Gtk.Switch
        active={value}
        onNotifyActive={onToggle}
        valign={Gtk.Align.CENTER}
      />
    </box>
  )
}

function SettingDropdown({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string
  description?: string
  value: string
  options: { id: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <box
      orientation={Gtk.Orientation.HORIZONTAL}
      halign={Gtk.Align.FILL}
      hexpand
    >
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={5}
        class="setting-row"
      >
        <label
          label={label}
          halign={Gtk.Align.START}
          css="font-weight: bold;"
        />
        {description && (
          <label
            label={description}
            class="dim-text"
            halign={Gtk.Align.START}
            wrap
          />
        )}
      </box>
      <box hexpand></box>
      <Gtk.DropDown
        model={Gtk.StringList.new(options.map((o) => o.label))}
        selected={options.findIndex((o) => o.id === value)}
        onNotifySelected={({ selected }) => {
          if (selected >= 0 && selected < options.length) {
            onChange(options[selected].id)
          }
        }}
      />
    </box>
  )
}
