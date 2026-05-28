import { Gtk } from "ags/gtk4"
import { Accessor } from "ags"

export interface SegmentedControlOption {
  id: string
  label?: string
  icon?: string
  onClick: () => void
}

interface SegmentedControlProps {
  options: SegmentedControlOption[]
  selected: Accessor<string>
  class?: string
}

export default function SegmentedControl({
  options,
  selected,
}: SegmentedControlProps) {
  const getSelectedClass = (id: string) => {
    if (typeof selected === "function") {
      return selected() === id ? "enabled" : ""
    }
    return selected === id ? "enabled" : ""
  }

  return (
    <Gtk.FlowBox
      orientation={Gtk.Orientation.HORIZONTAL}
      class="segmented-control"
    >
      {options.map((option) => (
        <button
          class={
            typeof selected === "function"
              ? selected.as((s) => (s === option.id ? "enabled" : ""))
              : getSelectedClass(option.id)
          }
          onClicked={option.onClick}
        >
          <box orientation={Gtk.Orientation.HORIZONTAL} spacing={5}>
            {option.icon && <image iconName={option.icon} />}
            {option.label && <label label={option.label} />}
          </box>
        </button>
      ))}
    </Gtk.FlowBox>
  )
}
