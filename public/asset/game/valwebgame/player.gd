extends CharacterBody3D

@export var speed: float = 6.0
@export var deceleration: float = 14.0   # higher = stops faster
@export var step_cooldown: float = 0.4   #seconds between steps (prevents spam)
@export var footstep_sounds: Array[AudioStream] = []

@onready var footstep_player: AudioStreamPlayer3D = $FootStepPlayer


var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")
var is_walking = false


func play_footstep():
	if footstep_sounds.is_empty():
		return

	var index := randi() % footstep_sounds.size()
	footstep_player.stream = footstep_sounds[index]
	footstep_player.play()

func _physics_process(delta: float) -> void:
	# Gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	var tapped_this_frame := false


	# Desktop mouse
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) and Input.is_action_just_pressed("click"):
		tapped_this_frame = true

	# Mobile touch
	if Input.is_action_just_pressed("click") or Input.is_action_just_pressed("ui_select"):
		tapped_this_frame = true


	if tapped_this_frame and not is_walking:
		is_walking = true
		play_footstep()
		var forward_dir := -global_transform.basis.z.normalized()   # better than .transform
		velocity.x = forward_dir.x * speed
		velocity.z = forward_dir.z * speed
		await get_tree().create_timer(0.6).timeout
		is_walking = false

	# Decelerate horizontal movement when not tapping
	else:
		velocity.x = move_toward(velocity.x, 0, deceleration * delta)
		velocity.z = move_toward(velocity.z, 0, deceleration * delta)

	move_and_slide()

	# Check slide collisions from move_and_slide()
	for i in range(get_slide_collision_count()):
		var collision := get_slide_collision(i)
		var normal := collision.get_normal()
		if normal.dot(Vector3.UP) < 0.707: 
			if OS.has_feature("web"):
				JavaScriptBridge.eval('window.parent.postMessage("switch_screen", "*");', true)
				break 
