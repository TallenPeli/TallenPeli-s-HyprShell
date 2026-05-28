import { Gtk } from "ags/gtk4"
import Pango from "gi://Pango?version=1.0"
import { Accessor, For } from "gnim"

export interface DropdownOption {
  label: string
  icon: string
  selected?: boolean
  selected_icon?: string | null
  onClick?: () => void
}

export interface DropdownHeader {
  icon: string
  title: string
}

export interface DropdownFooter {
  label: string
  onClick?: () => void
}

export default function QuickDropdown({
  header,
  footer,
  items,
  onClose,
}: {
  header: Accessor<DropdownHeader>
  footer?: Accessor<DropdownFooter>
  items: Accessor<DropdownOption[]>
  onClose: () => void
}) {
  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      revealChild={items.as((list: any[]) => list.length > 0)}
    >
      <box orientation={Gtk.Orientation.VERTICAL} class="dropdown-menu">
        <box
          orientation={Gtk.Orientation.HORIZONTAL}
          spacing={15}
          class="dropdown-header"
        >
          <box class="dropdown-icon">
            <image iconName={header.as((h) => h.icon)} pixelSize={25} />
          </box>
          <label
            label={header.as((h) => h.title)}
            valign={Gtk.Align.CENTER}
            vexpand={true}
          />
        </box>
        <Gtk.ListBox class="dropdown-list">
          <For each={items}>
            {(item: DropdownOption) => (
              <Gtk.ListBoxRow>
                <button
                  class="dropdown-item"
                  onClicked={() => {
                    item.onClick?.()
                    onClose()
                  }}
                >
                  <box spacing={10}>
                    <image iconName={item.icon} />
                    <label
                      label={item.label}
                      hexpand={true}
                      halign={Gtk.Align.START}
                      ellipsize={Pango.EllipsizeMode.END}
                      lines={1}
                      maxWidthChars={30}
                    />
                    <image
                      iconName={item.selected_icon || "object-select-symbolic"}
                      visible={item.selected || false}
                    />
                  </box>
                </button>
              </Gtk.ListBoxRow>
            )}
          </For>
        </Gtk.ListBox>
        {footer && (
          <box hexpand={true}>
            <button
              class="dropdown-footer"
              hexpand={true}
              onClicked={() => footer().onClick?.()}
            >
              <label
                label={footer.as((f) => f?.label || "Settings")}
                halign={Gtk.Align.START}
              />
            </button>
          </box>
        )}
      </box>
    </revealer>
  )
}
