extends Node3D


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	await get_tree().physics_frame;
	if OS.has_feature("web"):
		JavaScriptBridge.eval('window.parent.postMessage("is_loaded", "*");', true)
