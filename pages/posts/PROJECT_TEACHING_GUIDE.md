---
title: Hollow Katana 游戏引擎架构全解析 🎮
date: 2026-03-18
tags:
  - 游戏开发
  - C++
  - 架构设计
  - 教程
---

# 🗡️ Hollow Katana 项目技术教学指南

> 用 C++17 打造的 2D 动作游戏引擎，灵感来自《空洞骑士》

---

## ✨ 项目亮点一览

| 特性 | 说明 |
|:---:|:---|
| 🎮 **完整角色系统** | 移动、跳跃、翻滚、攻击一应俱全 |
| ⚔️ **多样战斗机制** | 飞镖追踪、丝绸抛射、剑气纵横 |
| 🤖 **智能敌人AI** | 基于状态机的行为决策系统 |
| ⏱️ **子弹时间** | 时间缩放让战斗更具策略性 |
| 🎨 **帧动画系统** | 支持图集与序列帧播放 |
| 🔲 **精确碰撞检测** | AABB算法保障判定准确性 |

---

## 🛠️ 技术栈速览

```
┌─────────────────────────────────────┐
│  C++17  +  EasyX  +  VS2022          │
│  ─────────────────────────────────   │
│  std::optional  |  状态模式         │
│  std::variant   |  工厂模式         │
│  结构化绑定     |  观察者模式       │
│  if constexpr   |  单例模式         │
└─────────────────────────────────────┘
```

---

## 🏗️ 架构设计全解析

### 核心模块关系图

```
                    ┌─────────────────┐
                    │   主循环 Main    │
                    │  Input │Update  │Render
                    └────────┬────────┘
                             │
        ┌────────────┬───────┴───────┬────────────┐
        ▼            ▼               ▼            ▼
   ┌─────────┐ ┌─────────┐   ┌─────────┐   ┌─────────┐
   │  输入   │ │  逻辑   │   │  碰撞   │   │  渲染   │
   │ Manager │ │ Manager │   │ Manager │   │ Manager │
   └─────────┘ └─────────┘   └─────────┘   └─────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
              ┌─────────────┐                     ┌─────────────┐
              │  Character  │                     │  Character  │
              │   Player    │                     │   Enemy     │
              └─────────────┘                     └─────────────┘
```

### 游戏循环伪代码

```cpp
while (game_is_running) {
    // 🎯 1. 处理输入
    process_input();

    // ⏱️ 2. 时间缩放（子弹时间）
    float scaled_delta = BulletTimeManager::update(delta);

    // 🔄 3. 更新逻辑
    CharacterManager::update(scaled_delta);

    // 💥 4. 碰撞检测
    CollisionManager::detect();

    // 🖼️ 5. 渲染画面
    BeginBatchDraw();
    render_all();
    EndBatchDraw();
}
```

---

## 🎨 设计模式实战

### 1️⃣ 单例模式 - 全局管理器

```cpp
class ResourcesManager {
private:
    static ResourcesManager* instance_;
    ResourcesManager() = default;  // 🔒 私有构造

public:
    static ResourcesManager* get() {
        if (!instance_) instance_ = new ResourcesManager();
        return instance_;
    }
};
```

**应用场景：** 资源管理、角色管理、碰撞管理、时间管理

---

### 2️⃣ 状态模式 - 行为切换

```cpp
class StateNode {
    virtual void on_enter() {}     // 进入状态
    virtual void on_update(dt) {}  // 每帧更新
    virtual void on_exit() {}      // 退出状态
};

// 玩家状态：Idle → Run → Jump → Attack → Roll
// 敌人状态：Patrol → Chase → Attack → Hurt → Die
```

**状态转换图：**
```
    [攻击键]
  Idle ──────→ Attack
   │             │
   │        [动画结束]
   │             │
   └─────────────┘
```

---

### 3️⃣ 工厂模式 - 碰撞盒创建

```cpp
// 通过工厂方法统一创建碰撞盒
auto hit_box = CollisionManager::create(
    CollisionType::Hit,    // 类型
    this,                  // 所属者
    {10, 10},              // 偏移
    {40, 60}               // 尺寸
);
```

---

### 4️⃣ 观察者模式 - 事件回调

```cpp
// 碰撞事件回调
hurt_box_->set_on_collide([](Character* owner, Character* other) {
    owner->take_damage(1);  // 💔 受伤触发
});

// 计时器回调
timer_->set_timeout([]() {
    // ⏰ 时间到触发
});
```

---

## 📁 项目结构

```
Hollow Katana/
├── 📁 resources/          # 资源文件夹
│   ├── 📁 audio/         # 音效
│   ├── 📁 enemy/         # 敌人素材
│   └── 📁 player/        # 玩家素材
│
├── 📄 核心系统
│   ├── main.cpp          # 入口 + 主循环
│   ├── character.h/cpp   # 角色基类
│   └── *_manager.h/cpp   # 各类管理器
│
├── 🎭 状态系统
│   ├── state_machine.h   # 状态机框架
│   ├── player_state_nodes.h    # 玩家状态
│   └── enemy_state_nodes.h     # 敌人状态
│
├── ⚔️ 战斗系统
│   ├── barb.h/cpp       # 飞镖（三阶段攻击）
│   └── sword.h/cpp      # 剑气（直线飞行）
│
└── 🔧 工具类
    ├── animation.h       # 动画播放器
    ├── atlas.h          # 图集管理
    ├── collision_box.h   # 碰撞盒
    └── timer.h          # 计时器
```

---

## 🎯 核心系统详解

### Character 角色系统

所有游戏角色的基类，提供：

- 📍 位置/速度/重力等物理属性
- 🎬 动画状态机管理
- 💥 攻击盒(Hit)与受击盒(Hurt)
- ❤️ 生命值与受伤处理

```cpp
class Character {
    Vector2 position_, velocity_;    // 物理属性
    StateMachine* state_machine_;    // 状态机
    CollisionBox* hit_box_;          // 攻击盒
    CollisionBox* hurt_box_;         // 受击盒

    virtual void on_update(float delta);
    virtual void take_damage(int dmg);
};
```

### Animation 动画系统

支持帧动画与图集：

```cpp
// 从序列帧加载图集
atlas->load("player_idle", 8, 64, 64);

// 创建动画播放器
auto anim = new Animation(atlas, 12, true);  // 12FPS, 循环

// 渲染动画
anim->render(player->position);
```

### Collision 碰撞系统

AABB 碰撞检测算法：

```cpp
bool check_collision(box1, box2) {
    return !(box1.left > box2.right ||
             box1.right < box2.left ||
             box1.top > box2.bottom ||
             box1.bottom < box2.top);
}
```

---

## 🧑‍💻 学习路径推荐

### 🌱 入门阶段 (1-2周)

1. **C++ 基础** - 类、继承、多态、智能指针
2. **游戏循环** - 阅读 `main.cpp`，理解 Input-Update-Render
3. **向量数学** - 阅读 `vector2.h`，理解归一化

### 🌿 进阶阶段 (2-4周)

1. **设计模式** - 单例、状态、观察者模式实战
2. **动画系统** - 帧动画原理与图集管理
3. **碰撞检测** - AABB 算法与回调机制

### 🌳 高级阶段 (4-8周)

1. **角色系统** - 重力、状态机整合
2. **敌人AI** - 行为逻辑与攻击模式
3. **战斗系统** - 弹道设计与伤害判定

---

## 🚀 扩展项目建议

- ➕ 添加二段跳、冲刺技能
- 👹 设计近战敌人、飞行BOSS
- ⚡ 优化碰撞检测（对象池）
- 🎨 添加粒子特效系统

---

## 📚 关键概念速查

| 概念 | 代码 |
|:-----|:-----|
| 游戏循环 | `input → update → render` |
| 状态切换 | `exit → enter → update` |
| AABB检测 | `!(分离轴存在)` |
| 向量归一化 | `v / length(v)` |

---

## 💡 总结

**Hollow Katana** 展示了完整 2D 游戏引擎的核心架构：

✅ 清晰的模块划分
✅ 完善的设计模式
✅ 可扩展的状态系统
✅ 高效的碰撞检测

适合作为：
- 🎓 游戏开发入门教程
- 🏗️ 引擎架构参考案例
- 💻 C++ 面向对象设计实践

---

> 📌 **项目信息**
> - 开发语言：C++17
> - 图形库：EasyX
> - 开发环境：Visual Studio 2022
> - 项目类型：2D 动作游戏引擎
> - 灵感来源：《空洞骑士》

---

## 🏷️ 标签

`#游戏开发` `#C++` `#游戏引擎` `#架构设计` `#设计模式` `#EasyX` `#空洞骑士` `#教程` `#编程学习`

---

*💬 有问题欢迎讨论交流~*

*📅 文档版本：1.0 | 最后更新：2026-03-18*
