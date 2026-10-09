---
title: C++ 定位 new：从 new (addr) 到 construct_at 的演进与安全性
date: 2026-10-09
categories: C++
tags:
  - C++
  - 内存管理
---

# C++ 定位 new：从 `new (addr)` 到 `construct_at` 的演进与安全性

> 在实现日志库时，我们常把"短日志放栈上、长日志放堆上"。要在栈上开辟一块原始字节流并在其上构造对象，就绕不开本文的主角——**定位 new（Placement New）**。

---

## 目录

- [new 的本质：三步操作](#new-的本质三步操作)
- [定位 new 与普通 new 的区别](#定位-new-与普通-new-的区别)
- [写法的变换](#写法的变换)
- [安全性解释](#安全性解释)
- [完整示例：栈上的日志对象缓冲区](#完整示例栈上的日志对象缓冲区)
- [总结](#总结)

---

## new 的本质：三步操作

很多初学者把 `new` 当成一体化的"堆上造对象"语法糖，但站在编译器的视角，`new T(args)` 实际上是三步操作：

```cpp
Foo* p = new Foo(args);
// 展开为概念上的三步：
// ① 分配原始内存：operator new(sizeof(Foo)) —— 失败时抛出 std::bad_alloc
// ② 在这块内存上调用构造函数：Foo(args)
// ③ 返回类型化指针：Foo*
```

这也解释了一个经典细节：**`malloc` 返回 `void*`，而 `new` 返回对应类型的指针**。`malloc` 只负责第 ① 步（拿到一块无类型的原始内存），后续的构造与类型解释都要你手工完成；`new` 则把三步全部包办。

而**定位 new 只做第 ② 步**——内存由外部提供，它只负责"在这块内存上把对象构造出来"：

```cpp
// 经典形式（C++98 起）
Foo* p = new (addr) Foo(args);
```

`addr` 就是外部提供的内存地址。这块内存可以来自栈、堆、静态区，甚至是共享内存——定位 new 一概不关心，它只管构造。

---

## 定位 new 与普通 new 的区别

| 维度 | `new T(args)` | `new (addr) T(args)` |
|------|---------------|----------------------|
| 内存分配 | `operator new` 分配堆内存 | **不分配**，由外部提供地址 |
| 构造对象 | 调用构造函数 | 调用构造函数 |
| 释放方式 | `delete`（析构 + 释放内存） | **只能手动调用析构函数**，内存归提供者管理 |
| 内存来源 | 堆 | 任意（栈 / 堆 / 静态区 / 共享内存） |
| 返回类型 | `T*` | `T*` |
| 对齐责任 | `operator new` 保证对齐 | **调用者必须保证地址对齐** |
| 典型场景 | 日常对象创建 | 内存池、对象池、栈上小对象优化（SBO）、`std::vector` 内部实现 |

一句话总结：**普通 new 是"包吃包住"，定位 new 是"自带床位的构造服务"**。内存的生与死都由你掌控，代价是所有责任也归你——这正是它强大又危险的地方。

事实上，你每天都在间接使用定位 new：`std::vector` 的 `reserve` + `push_back`、`std::optional` 的延迟构造、`std::function` 的小对象优化，底层全是这一套"预分配原始内存 + 定位构造"的把戏。

---

## 写法的变换

### 第一阶段：`alignas` + 字节流 + 定位 new（C++17 风格）

以日志库中的场景为例：在类内开辟一块**栈上**的原始字节流，用来存放日志行对象：

```cpp
alignas(std::max_align_t) std::byte m_implStorage[LOG_LINE_IMPL_SIZE];
```

这行代码的含义是：开辟一个长度为 `LOG_LINE_IMPL_SIZE`、**起始地址按 16 字节对齐**的原始字节流——注意它只是原始内存，还不是任何对象。

随后在其上定位构造：

```cpp
// 构造
LogLineImpl* impl = new (m_implStorage) LogLineImpl(args...);

// 使用 ...

// 手动析构（绝对不能 delete！）
impl->~LogLineImpl();
```

### 第二阶段：`std::construct_at` / `std::destroy_at`（C++20 现代写法）

C++20 把这套"指定位置构造/析构"收编为标准库函数，语义更直白：

```cpp
#include <memory>

// 构造：等价于 new (space) T(args...)，但可用于常量表达式
auto* p = std::construct_at(space, args...);

// 析构：等价于 p->~T()
std::destroy_at(p);
```

相比定位 new，`construct_at` 的优势：

1. **函数调用语义**：不必再写别扭的 `new (addr) T` 语法，读代码的人一眼看出"这是在指定位置构造"；
2. **`constexpr` 友好**：`construct_at` 是 `constexpr` 函数，编译期也能用，而定位 new 表达式做不到；
3. **与算法结合**：`std::ranges` 系列大量使用它实现未初始化内存上的构造。

### 第三阶段：`std::launder` —— 编译器的"重新解释"通行证

这里是最深的一处水区。`construct_at` 返回的指针，编译器会认定它是**唯一正确的、指向新对象的指针**；但如果你从**其他路径**（比如再次把 `storage` 强转出来）拿到地址，编译器仍然会认为那是"字节流数组"——两个视角互相矛盾。

这时需要 `std::launder` 出面，"洗"出一个合法的新视角：

```cpp
alignas(Foo) std::byte storage[sizeof(Foo)];

auto* p = std::construct_at(reinterpret_cast<Foo*>(storage), args...);
// ... 经历某些操作后，只能拿到 storage 本身时：
Foo* q = std::launder(reinterpret_cast<Foo*>(storage));  // 重新获得指向该对象的合法指针
```

`launder`（字面意思"洗钱"）的作用是：**告诉编译器"请忘掉这块内存的旧身份，承认这里现在住着一个新类型的对象"**。它不搬运任何字节，只影响编译器对指针的合法性判定。

> 实践建议：优先保存并使用 `construct_at` 的返回值，绝大多数场景根本用不到 `launder`；它是标准库实现者的工具，不是业务代码的日常。

---

## 安全性解释

定位 new 的强大伴随着四类典型风险，每一类都值得单独拿出来说。

### 1. 内存对齐：不加 `alignas` 就是未定义行为

如果不加 `alignas`，字节流会从 1 字节对齐的位置开辟。举个笔记中的具体例子：

> 假设字节流起始地址在 **147**，长度 12 字节，其中最后 8 字节想按 `double` 解释——那么这个 `double` 起始于 **151**，**不是 8 的倍数**。未对齐的浮点数访问在 x86 上轻则变慢，在 ARM 上直接触发硬件异常，标准层面则是彻头彻尾的 **UB（未定义行为）**。

规避手段：

- `alignas(T)` / `alignas(std::max_align_t)`：强制要求后续声明的存储按指定字节数对齐；
- `alignof(T)`：查询类型 `T` 的对齐字节数，用于断言与静态检查。

> 经验法则：**结构和类一般按照内部最大成员的字节数对齐**。手动管理原始内存时，永远用 `alignas` 把这块内存抬到"最大公约数"的安全线上。

### 2. 析构纪律：不能 `delete`，必须手动析构

```cpp
auto* p = new (storage) Foo(args);
delete p;          // 灾难！storage 在栈上，delete 会尝试释放栈内存
```

`delete` = 析构 + `operator delete` 释放内存。而定位 new 的内存不归它管，所以：

- **配对规则**：`new` ↔ `delete`，定位 new ↔ **显式析构调用**（`p->~T()` 或 `std::destroy_at(p)`）；
- 构造一次，析构一次。重复析构、遗漏析构都是 UB；
- RAII 思想依然适用：把"构造-使用-析构"包进一个管理类（正如日志库里 `LogLine` 全权接管 `m_implStorage` 的生死），调用方就永远接触不到裸操作。

### 3. 对象生命周期与严格别名规则

`reinterpret_cast<Foo*>(storage)` 只是**按位重新解释，字节一个不动，只换类型标签**——它本身并不会"创建"对象。在原始字节流上通过 `reinterpret_cast` 得到的指针直接解引用，踩的是"对象生命周期"（P0593 前的时代）与严格别名规则的雷区：

- 通过"洗"过身份的指针（`construct_at` 返回值或 `launder` 结果）访问，才是编译器认可的对象视角；
- 否则编译器有权假设"`storage` 里从来没有任何 `Foo`"，据此做出的优化可能让程序行为完全出乎意料。

### 4. 四种 cast 的职责边界（复习）

手动内存布局离不开类型转换，务必各司其职：

| 转换 | 用途 | 检查时机 |
|------|------|---------|
| `static_cast` | 一定检查的常规转换（数值转换、上行转换等） | 编译期 |
| `dynamic_cast` | 多态类型的安全下行转换 | **运行时检查** |
| `const_cast` | 只增删 `const` / `volatile` | 编译期 |
| `reinterpret_cast` | 按位重新解释，字节一个不动，只换类型 tag | 无检查，责任全在你 |

在定位 new 的场景里出现的几乎都是 `reinterpret_cast`——它是唯一能把"字节流"视作"对象指针"的通道，也因此是四种 cast 中最危险的。

### 5. 异常安全

若定位构造时构造函数抛出异常：

- 对象未构造成功，**不要**再对它调用析构；
- 内存本身不受影响（它不是定位 new 分配的），按你原有的内存管理策略处理即可；
- 库代码中通常以 `noexcept` 包裹析构路径（析构函数天生 `noexcept`），保证销毁阶段不放大异常。

> 顺带一提 `noexcept` 的正确心态：它不是"请求编译器帮我保证不抛"，而是"**我用人格担保不抛，否则程序直接处决**"。所以它只该用在真正确定的地方，比如只含内建类型操作的函数、移动构造等。

---

## 完整示例：栈上的日志对象缓冲区

把上面的要点串成一段完整可编译的代码（C++20）：

```cpp
#include <cstddef>
#include <new>
#include <memory>
#include <cassert>

class LogLineImpl {
public:
    explicit LogLineImpl(int level) : m_level{level} {}
    ~LogLineImpl() { /* flush 等收尾 */ }
    int level() const noexcept { return m_level; }
private:
    int    m_level;
    double m_metric;   // 8 字节成员，撑起对齐要求
};

class LogLine {
public:
    LogLine(int level) {
        static_assert(sizeof(LogLineImpl) <= sizeof(m_storage));
        // ① 在对齐过的栈上字节流中构造对象
        m_impl = std::construct_at(
            std::launder(reinterpret_cast<LogLineImpl*>(m_storage)), level);
    }
    ~LogLine() {
        // ② 手动析构——内存随 LogLine 一起生灭，无需释放
        if (m_impl) std::destroy_at(m_impl);
    }

    LogLine(const LogLine&)            = delete;   // 管理原始内存的类应禁用四件套
    LogLine& operator=(const LogLine&) = delete;
    LogLine(LogLine&&)                 = delete;
    LogLine& operator=(LogLine&&)      = delete;

    LogLineImpl* operator->() noexcept { return m_impl; }

private:
    // ③ alignas 保证字节流起始地址满足最严格的对齐要求（这里是 8）
    alignas(LogLineImpl) std::byte m_storage[sizeof(LogLineImpl)];
    LogLineImpl* m_impl = nullptr;
};

int main() {
    LogLine line{3};
    assert(line->level() == 3);
}   // 栈帧回收，对象在 ~LogLine 中被正确析构
```

要点回顾：`alignas` 抬高对齐线 → `construct_at`（或定位 new）构造 → 类的生命周期托管析构 → 四件套删除防止内存被意外复制。这就是日志库"短日志放栈上"的完整闭环。

---

## 总结

| 阶段 | 写法 | 关键配套 |
|------|------|---------|
| 传统 | `new (addr) T(args)` + `p->~T()` | `alignas` 保证对齐、`<new>` 头文件 |
| 现代 | `std::construct_at` + `std::destroy_at` | `constexpr`、语义清晰 |
| 库级 | + `std::launder` | 处理"多路径访问同一对象"的编译器视角问题 |

三条安全红线：

1. **对齐**：原始内存必须 `alignas`，未对齐访问即 UB；
2. **配对**：定位 new 的对象只能显式析构，绝不能 `delete`；
3. **视角**：通过 `construct_at` 返回值或 `launder` 访问对象，别拿裸 `reinterpret_cast` 的结果招摇撞骗。

定位 new 是 C++ "手动挡"操作的代表：它把内存分配与对象构造解耦，换来了内存池、SBO 等极致优化的空间，也把对齐、生命周期、别名规则的责任全部交还给你。理解它，不仅是理解一招语法，更是理解 `new` 的三步本质与"对象生命周期"这门 C++ 最深的必修课。
