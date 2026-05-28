import { readFile, writeFile } from "ags/file"

export const DefaultSettings = (): Settings => {
  return {
    quick_settings: {
      power_options: [
        {
          label: "Shutdown",
          icon: "system-shutdown-symbolic",
          command:
            "notify-send 'System' 'Shutting down...'; sleep 1; shutdown -h now",
        },
        {
          label: "Reboot",
          icon: "view-refresh-symbolic",
          command: "notify-send 'System' 'Rebooting...'; sleep 1; reboot",
        },
        {
          label: "Sleep",
          icon: "weather-clear-night-symbolic",
          command: "hyprctl dispatch exec hyprlock; systemctl suspend",
        },
        {
          label: "Hibernate",
          icon: "drive-harddisk-symbolic",
          command:
            "notify-send 'System' 'Hibernating...'; hyprctl dispatch exec hyprlock; sleep 1; systemctl hibernate",
        },
        {
          label: "Log Out",
          icon: "system-log-out-symbolic",
          command:
            "notify-send 'System' 'Logging out...'; sleep 1; hyprctl dispatch exit",
        },
      ],
      toggles: [
        "wifi",
        "bluetooth",
        "power_profiles",
        "do_not_disturb",
        "night_mode",
      ],
      header: true,
      speaker_controls: true,
      microphone_controls: true,
      quick_toggles: true,
      todo_list: true,
      media_controls: true,
    },
    launcher: {
      search_provider: "https://duckduckgo.com/?q=",
      ai_provider: "chatgpt",
      modules: ["apps", "web", "wikipedia"],
      result_limit: 10,
    },
    theme: {
      mode: "dark",
      wallpaper: "",
      color_scheme: "scheme-vibrant",
    },
    clock: {
      format: "%I:%M %p",
      font: "Adwaita",
      font_size: 150,
      font_weight: 700,
      anchor: ["bottom", "left"],
    },
  }
}

export interface PowerOption {
  label: string
  icon: string
  command: string
}

export interface LauncherSettings {
  search_provider: string
  ai_provider: string
  modules: string[]
  result_limit: number
}

export interface QuickSettings {
  power_options: PowerOption[]
  toggles: string[]
  header: boolean
  speaker_controls: boolean
  microphone_controls: boolean
  quick_toggles: boolean
  todo_list: boolean
  media_controls: boolean
}

export interface ThemeSettings {
  mode: "dark" | "light"
  wallpaper: string
  color_scheme:
    | "scheme-tonal-spot"
    | "scheme-expressive"
    | "scheme-monochrome"
    | "scheme-vibrant"
}

export interface ClockSettings {
  format: string
  font: string
  font_size: number
  font_weight: number
  anchor: string[]
}

export interface Settings {
  quick_settings: QuickSettings
  launcher: LauncherSettings
  theme: ThemeSettings
  clock: ClockSettings
}

function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target }

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = result[key]

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue) as T[Extract<
        keyof T,
        string
      >]
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>]
    }
  }

  return result
}

export const getSettings = (): Settings => {
  try {
    const settings_file = readFile(`${SRC}/settings.json`)

    if (!settings_file) {
      return DefaultSettings()
    }

    const userSettings = JSON.parse(settings_file) as Partial<Settings>
    const defaultSettings = DefaultSettings()

    return deepMerge(defaultSettings, userSettings)
  } catch (error) {
    console.error("Failed to parse settings:", error)
    return DefaultSettings()
  }
}

export const setSettings = (settings: Settings) => {
  const settings_file = writeFile(
    `${SRC}/settings.json`,
    JSON.stringify(settings, null, 2),
  )

  if (!settings_file) {
    console.error("Failed to write settings file")
  }
}
