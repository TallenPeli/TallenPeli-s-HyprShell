-- ========
-- Monitors
-- ========

local M = {}

function M.setup()
	hl.monitor({ output = "DP-1", mode = "2560x1440@165", position = "2560x0", scale = "1" })
	hl.monitor({ output = "DP-2", mode = "2560x1440@165", position = "0x0", scale = "1" })
end

return M
