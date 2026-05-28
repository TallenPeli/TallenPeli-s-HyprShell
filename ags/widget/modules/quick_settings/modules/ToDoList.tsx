import { Gtk } from "ags/gtk4"
import Pango from "gi://Pango?version=1.0"
import { Accessor, createState, For } from "gnim"
import { monitorFile, readFile, writeFileAsync } from "ags/file"
import GLib from "gi://GLib?version=2.0"

export interface Item {
  id: string
  label: string
  completed: boolean
}

export default function ToDoList() {
  const todoFilePath = `${GLib.get_user_config_dir()}/ags/qs-todolist.json`
  function getItems() {
    try {
      const content = readFile(todoFilePath)
      if (!content) return []
      try {
        const parsed = JSON.parse(content)
        setItems(parsed)
        updateStatus()
      } catch {
        print("Todo list items json is improperly formatted.")
        setItems([])
      }
    } catch (error) {
      setItems([])
    }
  }

  monitorFile(todoFilePath, getItems)

  const [items, setItems] = createState<Item[]>([])
  const [remaining, setRemaining] = createState(0)
  const [completed, setCompleted] = createState(0)

  const [isEntryVisible, setEntryVisible] = createState(false)

  const [pendingText, setPendingText] = createState("")

  const saveItems = (currentItems: Item[]) => {
    const sorted = currentItems.sort(
      (a, b) => Number(a.completed) - Number(b.completed),
    )

    writeFileAsync(todoFilePath, JSON.stringify(sorted)).catch((err) =>
      print(`Failed to save todo list: ${err}`),
    )
  }

  function getCompleted() {
    setCompleted(items().filter((item) => item.completed).length)
  }

  function getRemaining() {
    setRemaining(items().filter((item) => !item.completed).length)
  }

  function updateStatus() {
    getCompleted()
    getRemaining()
  }

  const addItem = (label: string) => {
    if (!label || label.trim() === "") return

    const newItem: Item = {
      id: Date.now().toString(),
      label: label.trim(),
      completed: false,
    }

    const newList = [...items(), newItem]
    setItems(newList)
    updateStatus()
    saveItems(newList)
  }

  const removeItem = (id: string) => {
    const newList = items().filter((item) => item.id !== id)
    setItems(newList)
    updateStatus()
    saveItems(newList)
  }

  const onConfirmAdd = () => {
    addItem(pendingText())
    setEntryVisible(false)
  }

  const toggleCompleted = (id: string) => {
    const newList = items().map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    )
    setItems(newList)
    updateStatus()
    saveItems(newList)
  }

  getItems()
  updateStatus()

  return (
    <box orientation={Gtk.Orientation.VERTICAL} class="todo" spacing={5}>
      <box orientation={Gtk.Orientation.HORIZONTAL} hexpand={true} spacing={15}>
        <box class="todo-icon">
          <image iconName="selection-mode-symbolic" pixelSize={25} />
        </box>
        <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
          <label
            label="Todo list"
            halign={Gtk.Align.START}
            valign={Gtk.Align.CENTER}
            hexpand={true}
            css={"font-size: 16px; font-weight: bold; margin-bottom: 0px;"}
          />
          <label
            label={remaining.as(
              (r) => `Remaining: ${r} • Completed: ${completed()}`,
            )}
            halign={Gtk.Align.START}
            valign={Gtk.Align.CENTER}
            hexpand={true}
            class="sub-text dim-text"
          />
        </box>
        <button
          class="hover-button"
          halign={Gtk.Align.END}
          onClicked={() => setEntryVisible(!isEntryVisible())}
        >
          <image
            iconName={isEntryVisible.as((v) =>
              v ? "pan-up-symbolic" : "list-add-symbolic",
            )}
          />
        </button>
      </box>
      <revealer
        revealChild={isEntryVisible}
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      >
        <box spacing={10} css="margin-bottom: 10px;">
          <entry
            placeholderText="Enter new task..."
            hexpand={true}
            onNotifyText={(self) => setPendingText(self.text)}
            onActivate={() => {
              onConfirmAdd()
            }}
          />
          <button class="hover-button" onClicked={onConfirmAdd}>
            <image iconName="list-add-symbolic" />
          </button>
        </box>
      </revealer>
      <label
        label="No Pending Tasks"
        css="color: gray; margin: 10px;"
        visible={items.as((list) => list.length === 0)}
      />
      <Gtk.ScrolledWindow
        minContentHeight={0}
        maxContentHeight={190}
        propagateNaturalHeight={true}
        vexpand={true}
      >
        <box orientation={Gtk.Orientation.VERTICAL} spacing={5}>
          <For each={items}>
            {(item: Item) => (
              <box orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
                <Gtk.CheckButton
                  active={item.completed}
                  onToggled={() => toggleCompleted(item.id)}
                />
                <label
                  label={item.completed ? `<s>${item.label}</s>` : item.label}
                  class={item.completed ? "dim-text" : ""}
                  useMarkup={true}
                  hexpand={true}
                  halign={Gtk.Align.FILL}
                  wrap={true}
                  wrapMode={Pango.WrapMode.WORD_CHAR}
                  maxWidthChars={32}
                  xalign={0}
                />
                <button
                  onClicked={() => removeItem(item.id)}
                  class="remove-button"
                  tooltipText="Remove item"
                >
                  <image iconName="list-remove-symbolic" />
                </button>
              </box>
            )}
          </For>
        </box>
      </Gtk.ScrolledWindow>
    </box>
  )
}
