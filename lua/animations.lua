-- ==========
-- Animations
-- ==========

local M = {}

function M.setup()
	-- Animation curves
	hl.curve("easeOutQuint", { type = "bezier", points = { { 0.58, 0.51 }, { 0.3, 1 } } })
	hl.curve("linear", { type = "bezier", points = { { 0, 0 }, { 1, 1 } } })
	hl.curve("almostLinear", { type = "bezier", points = { { 0.35, 0.27 }, { 0, 0.99 } } })
	hl.curve("quick", { type = "bezier", points = { { 0.28, 0.34 }, { 0, 0.99 } } })

	-- Animations
	hl.animation({ leaf = "global", enabled = true, speed = 10, bezier = "default" })

	-- Windows
	hl.animation({ leaf = "windows", enabled = true, speed = 1.5, bezier = "almostLinear" })
	hl.animation({ leaf = "windowsIn", enabled = true, speed = 3, bezier = "almostLinear", style = "slide" })
	hl.animation({ leaf = "windowsOut", enabled = true, speed = 4, bezier = "almostLinear", style = "slide" })

	hl.animation({ leaf = "fade", enabled = true, speed = 3.03, bezier = "quick" })
	hl.animation({ leaf = "fadeIn", enabled = true, speed = 1.73, bezier = "almostLinear" })
	hl.animation({ leaf = "fadeOut", enabled = true, speed = 1.46, bezier = "almostLinear" })

	-- Workspaces
	hl.animation({ leaf = "workspaces", enabled = true, speed = 1, bezier = "almostLinear", style = "slide" })
	hl.animation({ leaf = "workspacesIn", enabled = true, speed = 2, bezier = "almostLinear", style = "slide" })
	hl.animation({ leaf = "workspacesOut", enabled = true, speed = 2, bezier = "almostLinear", style = "slide" })

	-- Layers
	hl.animation({ leaf = "layers", enabled = true, speed = 3, bezier = "almostLinear", style = "slide" })
	hl.animation({ leaf = "layersIn", enabled = true, speed = 3, bezier = "almostLinear", style = "slide" })
	hl.animation({ leaf = "layersOut", enabled = true, speed = 4, bezier = "almostLinear", style = "slide" })

	hl.animation({ leaf = "fadeLayersIn", enabled = true, speed = 1.79, bezier = "almostLinear" })
	hl.animation({ leaf = "fadeLayersOut", enabled = true, speed = 1.39, bezier = "almostLinear" })
end

return M
