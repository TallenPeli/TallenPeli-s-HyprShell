import { Gdk, Gtk } from "ags/gtk4"
import Apps from "gi://AstalApps?version=0.1"
import Mpris from "gi://AstalMpris"
import GLib from "gi://GLib?version=2.0"
import Pango from "gi://Pango?version=1.0"
import { createBinding, For } from "gnim"

// The squiggly line for the progress indicator, like the one that android has
function WaveformSlider({
  player,
  position,
  length,
}: {
  player: Mpris.Player
  position: any
  length: any
}) {
  const canSeek = createBinding(player, "canSeek")
  const playbackStatus = createBinding(player, "playbackStatus")
  let time = 0
  const drawingArea = (
    <drawingarea
      hexpand
      heightRequest={30}
      class="waveform-slider"
      $={(self: Gtk.DrawingArea) => {
        const gesture = new Gtk.GestureClick()
        gesture.connect("pressed", (gesture, n_press, x, y) => {
          if (!canSeek.peek()) return

          const width = self.get_allocated_width()
          const totalLength = length.get()

          if (width > 0 && totalLength > 0) {
            const percentage = Math.max(0, Math.min(1, x / width))
            player.position = percentage * totalLength
          }
        })

        self.add_controller(gesture)

        self.set_draw_func((area, cr, width, height) => {
          // Constants here for the sin wave
          const centerY = height / 2
          const amplitude = height * 0.07
          const wavelength = 30
          const speed = 0.3

          // styling
          const styleContext = self.get_style_context()
          const primaryColor = styleContext.lookup_color("primary")
          const backgroundColor = styleContext.lookup_color(
            "surface_container_high",
          )

          let primaryR = 0.4,
            primaryG = 0.7,
            primaryB = 1.0
          let bgR = 0.5,
            bgG = 0.5,
            bgB = 0.5

          if (primaryColor[0]) {
            primaryR = primaryColor[1].red
            primaryG = primaryColor[1].green
            primaryB = primaryColor[1].blue
          }

          if (backgroundColor[0]) {
            bgR = backgroundColor[1].red
            bgG = backgroundColor[1].green
            bgB = backgroundColor[1].blue
          }

          const progress = position.get() / length.get()
          const progressX = progress * width

          const isPlaying =
            playbackStatus.peek() === Mpris.PlaybackStatus.PLAYING

          cr.setLineWidth(3)
          cr.setLineCap(1) // Round

          if (isPlaying) {
            // Move to the start without drawing to make sure that it doesn't create a line at the start of the wave.
            cr.setSourceRGBA(0, 0, 0, 0)
            cr.moveTo(0, centerY)
            cr.stroke()

            // Animated wave (passed portion)
            cr.setSourceRGBA(primaryR, primaryG, primaryB, 1.0)
            for (let x = 0; x <= progressX; x += 1) {
              // this is just a simple sin wave, you can copy this if you want and add it to your shell
              const phase = ((x + time * speed) / wavelength) * Math.PI * 2
              const y = centerY + Math.sin(phase) * amplitude
              cr.lineTo(x, y)
            }
            cr.stroke()

            // Remaining portion
            cr.setSourceRGBA(bgR, bgG, bgB, 0.4)
            cr.moveTo(progressX, centerY)
            cr.lineTo(width, centerY)
            cr.stroke()

            // Draw indicator line
            cr.setSourceRGBA(primaryR, primaryG, primaryB, 1.0)
            cr.setLineWidth(5)
            cr.moveTo(progressX, centerY + 7)
            cr.lineTo(progressX, centerY - 7)
            cr.stroke()
          } else {
            // Passed portion
            cr.setSourceRGBA(primaryR, primaryG, primaryB, 1.0)
            cr.moveTo(0, centerY)
            cr.lineTo(progressX, centerY)
            cr.stroke()

            // Remaining portion
            cr.setSourceRGBA(bgR, bgG, bgB, 0.4)
            cr.moveTo(progressX, centerY)
            cr.lineTo(width, centerY)
            cr.stroke()

            // Indicator line
            cr.setSourceRGBA(primaryR, primaryG, primaryB, 1.0)
            cr.setLineWidth(5)
            cr.moveTo(progressX, centerY + 7)
            cr.lineTo(progressX, centerY - 7)
            cr.stroke()
          }

          if (isPlaying) {
            // reset so it doesn't go up forever. Not sure if that would impact performance or cause an overflow, but I would rather just do this than look it up
            if (time === wavelength / speed) time = 0
            else time++
          }
        })

        const animate = () => {
          self.queue_draw()
          return true
        }

        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 16, animate)
        position.subscribe(() => self.queue_draw())
      }}
    />
  )
  return drawingArea
}

function Player({ player }: { player: Mpris.Player }) {
  const title = createBinding(player, "title").as((t) => t || "Unknown Title")
  const artist = createBinding(player, "artist").as(
    (a) => a || "Unknown Artist",
  )

  const coverUrl = createBinding(player, "coverArt").as((url) =>
    url ? `file://${url}` : "",
  )

  const playbackStatus = createBinding(player, "playbackStatus")
  const playIcon = createBinding(player, "playbackStatus").as((status) =>
    status === Mpris.PlaybackStatus.PLAYING
      ? "media-playback-pause-symbolic"
      : "media-playback-start-symbolic",
  )

  const position = createBinding(player, "position")
  const length = createBinding(player, "length").as((l) => (l > 0 ? l : 1.0))

  const canSeek = createBinding(player, "canSeek")
  const canGoNext = createBinding(player, "canGoNext")
  const canGoPrevious = createBinding(player, "canGoPrevious")
  const canControl = createBinding(player, "canControl")
  const canQuit = createBinding(player, "canQuit")
  const canRaise = createBinding(player, "canRaise")

  const apps = new Apps.Apps({
    nameMultiplier: 2,
    entryMultiplier: 0,
    executableMultiplier: 2,
  })

  const getIcon = (name: string): string => {
    const appList = apps.fuzzy_query(name)
    if (appList.length < 1) {
      return "folder-music-symbolic"
    } else {
      return appList[0].icon_name
    }
  }

  return (
    <Gtk.Frame class="media-frame">
      <box
        orientation={Gtk.Orientation.HORIZONTAL}
        class="media-player"
        overflow={Gtk.Overflow.HIDDEN}
        valign={Gtk.Align.START}
        css={coverUrl.as((url) =>
          url ? `background-image: url('${url}');` : "",
        )}
      >
        <box class="media-overlay">
          <box
            hexpand={true}
            vexpand={true}
            orientation={Gtk.Orientation.VERTICAL}
          >
            <box
              hexpand={true}
              orientation={Gtk.Orientation.HORIZONTAL}
              valign={Gtk.Align.START}
              spacing={10}
            >
              <image
                tooltipText={player.entry}
                iconName={getIcon(player.entry)}
                pixelSize={25}
                valign={Gtk.Align.START}
              />
              <box
                vexpand
                orientation={Gtk.Orientation.HORIZONTAL}
                valign={Gtk.Align.START}
              >
                <box orientation={Gtk.Orientation.VERTICAL} hexpand>
                  <label
                    class="media-title"
                    halign={Gtk.Align.START}
                    valign={Gtk.Align.CENTER}
                    label={title}
                    ellipsize={Pango.EllipsizeMode.END}
                    lines={1}
                  />
                  <label
                    class="sub-text"
                    halign={Gtk.Align.START}
                    valign={Gtk.Align.CENTER}
                    label={artist}
                    ellipsize={Pango.EllipsizeMode.END}
                    lines={1}
                  />
                </box>
                <button
                  tooltipText="Play/Pause"
                  class={"play-pause"}
                  onClicked={() => player.play_pause()}
                  valign={Gtk.Align.START}
                >
                  <image iconName={playIcon} />
                </button>
              </box>
            </box>

            <box
              hexpand={true}
              vexpand={true}
              valign={Gtk.Align.END}
              spacing={10}
              sensitive={canControl}
            >
              <button
                tooltipText="Previous"
                visible={canGoPrevious}
                class="media-control-button"
                onClicked={() => player.previous()}
              >
                <image iconName="media-skip-backward-symbolic" />
              </button>
              <button
                tooltipText="Backward 15 seconds"
                visible={canSeek}
                class="media-control-button"
                onClicked={() => (player.position = player.position - 15)}
              >
                <image iconName="object-rotate-left-symbolic" />
              </button>
              <WaveformSlider
                player={player}
                position={position}
                length={length}
              />
              <button
                tooltipText="Forward 15 seconds"
                visible={canSeek}
                class="media-control-button"
                onClicked={() => (player.position = player.position + 15)}
              >
                <image iconName="object-rotate-right-symbolic" />
              </button>
              <button
                tooltipText="Next"
                visible={canGoNext}
                class="media-control-button"
                onClicked={() => player.next()}
              >
                <image iconName="media-skip-forward-symbolic" />
              </button>
              <button
                tooltipText="Quit player"
                visible={canQuit}
                class="media-control-button"
                onClicked={() => player.quit()}
              >
                <image iconName="media-playback-stop-symbolic" />
              </button>
              <button
                tooltipText="Raise player"
                visible={canRaise}
                class="media-control-button"
                onClicked={() => player.raise()}
              >
                <image iconName="view-fullscreen-symbolic" />
              </button>
            </box>
          </box>
        </box>
      </box>
    </Gtk.Frame>
  )
}

export default function MediaControls() {
  const mpris = Mpris.get_default()
  const players = createBinding(mpris, "players")

  return (
    <box orientation={Gtk.Orientation.HORIZONTAL} valign={Gtk.Align.START}>
      <Gtk.ScrolledWindow
        hscrollbarPolicy={Gtk.PolicyType.NEVER}
        minContentHeight={0}
        maxContentHeight={150}
        propagateNaturalHeight={true}
        vexpand={true}
      >
        <box
          orientation={Gtk.Orientation.VERTICAL}
          spacing={0}
          class="media-container"
        >
          <For each={players}>
            {(player: Mpris.Player) => (
              <box widthRequest={380}>
                <Player player={player} />
              </box>
            )}
          </For>
        </box>
      </Gtk.ScrolledWindow>
    </box>
  )
}
