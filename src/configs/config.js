const GAME_DATA = {
    // 地图格子的宽高
    TILE_WIDTH: 180,
    TILE_HEIGHT: 132,

    // 关卡状态
    LEVEL_STATUS_PASSED: 0,
    LEVEL_STATUS_FAILED_NOTMOVE: -1,
    LEVEL_STATUS_FAILED_ENERGY_NOTENOUGH: -2,

    // 方向
    DIRECTION_EAST: "east",
    DIRECTION_SOUTH: "south",
    DIRECTION_WEST: "west",
    DIRECTION_NORTH: "north",

    // 动画键值
    ANIM_KEY_STEP_EAST: "step_east",
    ANIM_KEY_STEP_SOUTH: "step_south",
    ANIM_KEY_STEP_WEST: "step_west",
    ANIM_KEY_STEP_NORTH: "step_north",
    ANIM_KEY_TURN_EAST_SOUTH: "turn_east_to_south",
    ANIM_KEY_TURN_EAST_NORTH: "turn_east_to_north",
    ANIM_KEY_TURN_SOUTH_EAST: "turn_south_to_east",
    ANIM_KEY_TURN_SOUTH_WEST: "turn_south_to_west",
    ANIM_KEY_TURN_WEST_SOUTH: "turn_west_to_south",
    ANIM_KEY_TURN_WEST_NORTH: "turn_west_to_north",
    ANIM_KEY_TURN_NORTH_WEST: "turn_north_to_west",
    ANIM_KEY_TURN_NORTH_EAST: "turn_north_to_east",
    ANIM_KEY_IDLE_EAST: "idle_east",
    ANIM_KEY_IDLE_SOUTH: "idle_south",
    ANIM_KEY_IDLE_WEST: "idle_west",
    ANIM_KEY_IDLE_NORTH: "idle_north",
    ANIM_KEY_IDLE: "idle"
};

export { GAME_DATA };