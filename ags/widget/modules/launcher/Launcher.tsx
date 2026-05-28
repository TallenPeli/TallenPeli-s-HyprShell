import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import { execAsync } from "ags/process"
import Adw from "gi://Adw?version=1"
import AstalApps from "gi://AstalApps?version=0.1"
import Pango from "gi://Pango?version=1.0"
import { Accessor, createState, For } from "gnim"
import { getSettings } from "../../../settings"
import { activeMonitor } from "../../../app"

const WIKIPEDIA_SEARCH = "https://en.wikipedia.org/wiki/Special:Search?search="

enum SearchEngineUrl {
  DuckDuckGo = "https://duckduckgo.com/?q=",
  Google = "https://www.google.com/search?q=",
  Startpage = "https://startpage.com/do/search?q=",
  Reddit = "https://www.reddit.com/search?q=",
  Wikipedia = "https://en.wikipedia.org/wiki/Special:Search?search=",
  YouTube = "https://www.youtube.com/results?search_query=",
  Bing = "https://www.bing.com/search?q=",
  Yahoo = "https://search.yahoo.com/search?p=",
  Baidu = "https://www.baidu.com/s?wd=",
  Ecosia = "https://www.ecosia.org/search?q=",
}

enum AIProviderUrl {
  ChatGPT = "https://chatgpt.com/?q=",
  Claude = "https://claude.ai/new?q=",
  Google = "https://www.google.com/search?udm=50&source=searchlabs&q=",
  DuckDuckGo = "https://duckduckgo.com/?ia=chat&t=h_&duckai=1&home=1&q=",
  Perplexity = "https://www.perplexity.ai/search?q=",
}

export default function Launcher() {
  const launcher_settings = getSettings().launcher

  const { TOP } = Astal.WindowAnchor
  let win: Astal.Window

  const apps = new AstalApps.Apps({
    nameMultiplier: 2,
    entryMultiplier: 2,
    executableMultiplier: 2,
  })

  const [list, setList] = createState(new Array<AstalApps.Application>())
  const [entry, setEntry] = createState("")

  let entryRef: Gtk.Entry | undefined

  let searchId = 0
  async function search(text: string) {
    const currentSearchId = ++searchId

    if (text === "") {
      setList([])
      return
    }

    setTimeout(() => {
      if (currentSearchId !== searchId) return
      setList(
        apps.fuzzy_query(text).slice(0, launcher_settings.result_limit || 10),
      )
    }, 0)
  }

  function launch(app?: AstalApps.Application) {
    if (app) {
      win.hide()
      app.launch()
      setEntry("")
    }
  }

  function webSearch(query: string) {
    if (!query.trim()) return

    const trimmedQuery = query.trim()
    let url: string

    const isDomain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(
      trimmedQuery,
    )
    const isIP = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/.*)?$/.test(trimmedQuery)

    const isValidIP =
      isIP &&
      trimmedQuery
        .split(/[:/]/)
        .slice(0, 4)
        .every((octet) => {
          const num = parseInt(octet)
          return num >= 0 && num <= 255
        })

    if (isDomain) {
      url = `https://${trimmedQuery}`
    } else if (isValidIP) {
      url = `http://${trimmedQuery}`
    } else {
      const encodedQuery = encodeURIComponent(trimmedQuery)
      print(launcher_settings.search_provider)
      switch (launcher_settings.search_provider) {
        case "duckduckgo":
          url = `${SearchEngineUrl.DuckDuckGo}${encodedQuery}`
          break
        case "google":
          url = `${SearchEngineUrl.Google}${encodedQuery}`
          break
        case "startpage":
          url = `${SearchEngineUrl.Startpage}${encodedQuery}`
          break
        case "reddit":
          url = `${SearchEngineUrl.Reddit}${encodedQuery}`
          break
        case "wikipedia":
          url = `${SearchEngineUrl.Wikipedia}${encodedQuery}`
          break
        case "youtube":
          url = `${SearchEngineUrl.YouTube}${encodedQuery}`
          break
        case "bing":
          url = `${SearchEngineUrl.Bing}${encodedQuery}`
          break
        case "yahoo":
          url = `${SearchEngineUrl.Yahoo}${encodedQuery}`
          break
        case "baidu":
          url = `${SearchEngineUrl.Baidu}${encodedQuery}`
          break
        case "ecosia":
          url = `${SearchEngineUrl.Ecosia}${encodedQuery}`
          break
        default:
          url = `${SearchEngineUrl.DuckDuckGo}${encodedQuery}`
          break
      }
    }

    execAsync(`xdg-open "${url}"`)

    win.hide()
    setEntry("")
  }

  function wikipediaSearch(query: string) {
    if (!query.trim()) return

    const encodedQuery = encodeURIComponent(query.trim())
    const url = `${WIKIPEDIA_SEARCH}${encodedQuery}`

    execAsync(`xdg-open "${url}"`)

    win.hide()
    setEntry("")
  }

  function askAI(query: string) {
    if (!query.trim()) return
    let url: string

    const encodedQuery = encodeURIComponent(query.trim())

    switch (launcher_settings.ai_provider) {
      case "chatgpt":
        url = `${AIProviderUrl.ChatGPT}${encodedQuery}`
        break
      case "claude":
        url = `${AIProviderUrl.Claude}${encodedQuery}`
        break
      case "google":
        url = `${AIProviderUrl.Google}${encodedQuery}`
        break
      case "duckduckgo":
        url = `${AIProviderUrl.DuckDuckGo}${encodedQuery}`
        break
      case "perplexity":
        url = `${AIProviderUrl.Perplexity}${encodedQuery}`
        break
      default:
        url = `${AIProviderUrl.ChatGPT}${encodedQuery}`
        break
    }

    execAsync(`xdg-open "${url}"`)

    win.hide()
    setEntry("")
  }

  function onKey(
    _e: Gtk.EventControllerKey,
    keyval: number,
    _: number,
    mod: number,
  ) {
    const isFocusedOnEntry = entryRef?.is_focus()

    if (keyval === Gdk.KEY_Escape) {
      win.visible = false
      return
    }

    if (!isFocusedOnEntry) {
      if (keyval === Gdk.KEY_question || keyval === Gdk.KEY_slash) {
        entryRef?.grab_focus()
      }
    }

    if (mod === Gdk.ModifierType.CONTROL_MASK) {
      for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
        if (keyval === Gdk[`KEY_${i}`]) {
          return launch(list.peek()[i - 1])
        }
      }
    }
  }

  return (
    <window
      monitor={activeMonitor}
      namespace="tallens-gtk-shell"
      name="launcher"
      class="launcher"
      layer={Astal.Layer.OVERLAY}
      application={app}
      keymode={Astal.Keymode.EXCLUSIVE}
      resizable={false}
      anchor={TOP}
      marginTop={8}
      onShow={() => {
        entryRef?.grab_focus()
      }}
      $={(ref) => (win = ref)}
    >
      <Gtk.EventControllerKey onKeyPressed={onKey} />

      <Adw.Clamp maximumSize={600}>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={15}>
          <box spacing={10} widthRequest={600}>
            <entry
              placeholderText="Search Applications"
              text={entry}
              hexpand={true}
              primaryIconName="system-search-symbolic"
              onNotifyText={(self) => {
                search(self.text)
                setEntry(self.text)
              }}
              onActivate={() => {
                launch(list()[0])
              }}
              $={(self) => (entryRef = self)}
            />
          </box>

          {/* Web Search and Wikipedia Buttons */}
          <box spacing={10}>
            <button
              class="external-search"
              visible={launcher_settings.modules.includes("web")}
              onClicked={() => webSearch(entry())}
            >
              <box spacing={8} halign={Gtk.Align.CENTER}>
                <image iconName="web-browser-symbolic" pixelSize={16} />
                <label label="Web Search" />
              </box>
            </button>
            <button
              class="external-search"
              visible={launcher_settings.modules.includes("wikipedia")}
              onClicked={() => wikipediaSearch(entry())}
            >
              <box spacing={8} halign={Gtk.Align.CENTER}>
                <image
                  iconName="accessories-dictionary-symbolic"
                  pixelSize={16}
                />
                <label label="Wikipedia" />
              </box>
            </button>
            <button
              class="external-search"
              visible={launcher_settings.modules.includes("ai")}
              onClicked={() => askAI(entry())}
            >
              <box spacing={8} halign={Gtk.Align.CENTER}>
                <image iconName="user-available-symbolic" pixelSize={16} />
                <label label="Ask AI" />
              </box>
            </button>
          </box>

          {/* App list */}
          <Gtk.ScrolledWindow
            minContentHeight={0}
            maxContentHeight={570}
            propagateNaturalHeight={true}
            visible={list((l) => l.length > 0)}
          >
            <box orientation={Gtk.Orientation.VERTICAL} spacing={5}>
              <For each={list}>
                {(app, index) => {
                  return (
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={5}>
                      <button onClicked={() => launch(app)}>
                        <box spacing={15}>
                          <image iconName="window-new-symbolic" />
                          <image iconName={app.iconName} pixelSize={48} />
                          <box
                            orientation={Gtk.Orientation.VERTICAL}
                            valign={Gtk.Align.CENTER}
                          >
                            <label label={app.name} halign={Gtk.Align.START} />
                            <label
                              class="dim-text sub-text"
                              ellipsize={Pango.EllipsizeMode.END}
                              maxWidthChars={60}
                              label={
                                app.get_description() ||
                                app.get_key("GenericName") ||
                                app.name
                              }
                              halign={Gtk.Align.START}
                            />
                          </box>
                          <label
                            hexpand
                            class="dim-text"
                            halign={Gtk.Align.END}
                            label={index((i) =>
                              i < 9 ? `Ctrl + ${i + 1}` : "",
                            )}
                          />
                        </box>
                      </button>
                      <Gtk.Separator />
                    </box>
                  )
                }}
              </For>
            </box>
          </Gtk.ScrolledWindow>
        </box>
      </Adw.Clamp>
    </window>
  )
}
