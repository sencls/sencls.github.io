---
title: C++ 单例模式与 static 的线程安全
date: 2026-10-25
categories: C++
tags:
  - C++
  - 设计模式
  - 单例
  - 多线程
  - 线程安全
---

# 单例模式与 static 的线程安全

> 本文整理自 C++ 学习笔记中「单例模式」与「static 线程安全」两节，梳理指针版单例从"不安全"到"工业级"的演进过程，并深入剖析局部 static 变量线程安全背后的守卫变量机制。

---

## Meyers 单例：最简单的起点

```cpp
class Singleton
{
public:
    Singleton(const Singleton &) = delete;
    Singleton(Singleton &&) = delete;
    Singleton &operator=(const Singleton &) = delete;
    Singleton &operator=(Singleton &&) = delete;

    static Singleton &Instance()
    {
        static Singleton instance; // 线程安全（C++11 起），懒汉式
        return instance;
    }

    void log(const std::string &msg)
    {
        std::cout << "[LOG]: " << msg << std::endl;
    }

private:
    Singleton() = default;
    ~Singleton() = default;
};
```

这是最简单的实现，要点：

- 构造、析构函数私有，拷贝/移动全部 `= delete`，堵死一切创建第二个实例的途径；
- 函数局部 `static` 变量的实际构造会**延迟到首次使用时**——天然的懒汉式；
- C++11 起标准保证局部 static 变量的初始化是线程安全的（原理见本文最后一节）。

## 变式1：模板单例类（Manager 模式）

把"单例管理"这件事抽成一个模板类，让业务类保持纯粹：

```cpp
template <typename T>
class Singleton
{
public:
    static inline T &Instance()
    {
        static T instance;
        return instance;
    }
    Singleton(const Singleton &) = delete;
    Singleton(Singleton &&) = delete;
    Singleton &operator=(const Singleton &) = delete;
    Singleton &operator=(Singleton &&) = delete;

private:
    Singleton() = delete;
};

class A
{
public:
    void log(const std::string &msg)
    {
        std::cout << "[LOG]: " << msg << std::endl;
    }
    A(const A &) = delete;
    A(A &&) = delete;
    A &operator=(const A &) = delete;
    A &operator=(A &&) = delete;

private:
    A() = default;
    ~A() = default;

    friend class Singleton<A>;
};
```

**关键点：必须声明友元。** 这里 `Singleton` 是访问单例的 manager，而 `A` 才是实际的单例——`A` 的构造/析构函数必须私有，只有友元 `Singleton<A>` 才能在 `Instance()` 中调用私有的 `A()` 构造出对象。

## 变式2：CRTP 继承单例模板

**CRTP**（Curiously Recurring Template Pattern，奇异递归模板）：将派生类自身作为模板参数传给基类。

```cpp
template <typename T>
class Singleton
{
public:
    static T &Instance()
    {
        static T instance;
        return instance;
    }
    Singleton(const Singleton &) = delete;
    Singleton(Singleton &&) = delete;
    Singleton &operator=(const Singleton &) = delete;
    Singleton &operator=(Singleton &&) = delete;

protected:
    Singleton() = default;
    ~Singleton() = default;
};

class A : public Singleton<A>
{
    friend class Singleton<A>;

public:
    void log(const std::string &msg)
    {
        std::cout << "[LOG]: " << msg << std::endl;
        std::cout << "data: " << m_data << std::endl;
    }

private:
    A()
    {
        std::puts("A: A() -- only once");
        m_data++;
    }
    ~A()
    {
        std::puts("A::~A() -- only once");
    }

private:
    int m_data{0};
};
```

与变式1的区别：`A` 主动继承 `Singleton<A>`，基类构造函数为 `protected`（只允许派生类调用），同样需要友元让基类访问派生类的私有构造。

---

## 指针版单例的演进之路

引用版（Meyers）虽然简单，但有些场景需要**指针**——比如需要控制析构时机、显式销毁重建。指针版一路走来踩满了线程安全的坑，每一步演进都值得细看。

### 版本1：裸指针——非线程安全

```cpp
static Singleton *Instance()
{
    if (m_instance == nullptr)
    {
        m_instance = new Singleton();
    }
    return m_instance;
}
inline static Singleton *m_instance = nullptr;
```

**为什么不安全？** `new` 在底层是三个步骤：

1. 分配内存空间；
2. 在该空间上调用构造函数；
3. 返回对象指针。

多线程下，线程 A 刚分配完空间（步骤1），指针还没来得及构造，线程 B 就可能拿到这个**未构造完的对象**并使用——直接未定义行为。

### 版本2：互斥锁——安全但有开销

```cpp
static Singleton *Instance()
{
    std::lock_guard<std::mutex> lock(m_mutex);
    if (m_instance == nullptr)
    {
        m_instance = new Singleton();
    }
    return m_instance;
}
inline static Singleton *m_instance = nullptr;
inline static std::mutex m_mutex;
```

安全了，但**每一次**访问 `Instance()` 都要加锁解锁。实例明明只创建一次，之后的成千上万次调用全是无意义的锁竞争——开销太大。

### 版本3：双重检查锁（DCLP）——重排陷阱

```cpp
static Singleton *Instance()
{
    if (m_instance == nullptr)                  // 第一次检查：不加锁
    {
        std::lock_guard<std::mutex> lock(m_mutex);
        if (m_instance == nullptr)              // 第二次检查：持锁后
        {
            m_instance = new Singleton();
        }
    }
    return m_instance;
}
```

思路很美：绝大多数调用在第一次检查就返回，无锁开销；只有首次创建时才进锁。

**但依然不安全。** 问题出在编译器的**指令重排**：`new` 的三步骤中，步骤2（构造）和步骤3（返回指针赋值）可能被重排。线程 A 可能先把**未构造**的指针发布给了 `m_instance`，线程 B 第一次检查发现非空，欢天喜地拿走了一个半成品。

### 版本4：原子变量——acquire/release 语义

用 `std::atomic<Singleton*>` 替代裸指针，用内存序约束禁止重排：

```cpp
static Singleton *Instance()
{
    Singleton *temp = m_instance.load(std::memory_order_acquire);   // 读：acquire
    if (temp == nullptr)
    {
        std::lock_guard<std::mutex> lock(m_mutex);
        temp = m_instance.load(std::memory_order_relaxed);
        if (temp == nullptr)
        {
            temp = new Singleton();
            m_instance.store(temp, std::memory_order_release);      // 写：release
        }
    }
    return temp;
}
inline static std::atomic<Singleton *> m_instance{};
inline static std::mutex m_mutex;
```

内存序的配合：

- **release 写**：`store` 之前的所有写操作（包括构造函数）不允许被重排到 `store` 之后；
- **acquire 读**：`load` 之后的所有读操作不允许被重排到 `load` 之前。

两者配对，线程 B 通过 acquire 读到指针时，必定能看到完整的构造结果。

**遗留问题：缺少释放器。** 裸 `new` 出来的指针没有人负责 `delete`，内存泄漏。

### 版本5：最终版——CRTP + RAII 清理器

增加辅助类管理指针生命周期，利用 RAII 机制在程序退出时自动回收资源：

```cpp
template <typename T>
class Singleton
{
public:
    static T *Instance()
    {
        T *temp = m_instance.load(std::memory_order_acquire);
        if (temp == nullptr)
        {
            std::lock_guard<std::mutex> lock(m_mutex);
            temp = m_instance.load(std::memory_order_relaxed);
            if (temp == nullptr)
            {
                temp = new T();
                // 只有成功创建实例后才注册退出清理器，并且必须在发布指针前完成。
                RegisterCleanup();
                m_instance.store(temp, std::memory_order_release);
            }
        }
        return temp;
    }

    static void Destroy() noexcept
    {
        // 先撤回已发布的指针，再销毁对象，避免留下悬空的原子指针。
        T *instance = m_instance.exchange(nullptr, std::memory_order_acq_rel);
        delete instance;
    }

private:
    class Cleanup
    {
    public:
        Cleanup() = default;
        Cleanup(const Cleanup &) = delete;
        Cleanup &operator=(const Cleanup &) = delete;

        ~Cleanup()
        {
            Singleton<T>::Destroy();
        }
    };

    static void RegisterCleanup()
    {
        // 函数局部静态对象只初始化一次，并在程序正常退出时自动析构。
        static Cleanup cleanup;
        (void)cleanup;
    }

    inline static std::atomic<T *> m_instance{};
    inline static std::mutex m_mutex;
};
```

精妙之处有三：

1. **注册时机**：`RegisterCleanup()` 在 `store` 发布指针**之前**调用——保证任何拿到指针的线程都对应着一个已注册的清理器；
2. **静态 Cleanup 对象**：函数局部 static 的 `cleanup` 只构造一次，程序正常退出时按注册顺序（`__cxa_atexit` 机制）自动析构，析构时调用 `Destroy()`；
3. **Destroy 的顺序**：先用 `exchange` 把原子指针撤回置空，再 `delete` 对象——其他线程不会拿到悬空指针。

---

## static 线程安全的底层原理：守卫变量

回到最初的问题——为什么 C++11 之后，`static Singleton instance;` 这一行就是线程安全的？

编译器会为每个**需要动态初始化**的局部 static 变量配一个隐藏的**守卫变量（guard variable）**，并把代码改写成大致这样：

```cpp
static Singleton &Instance() {
    static Singleton instance;
    // 编译器概念上展开为：
    // ────────────────────────────────────────
    static Singleton instance;     // 仅分配内存（零初始化，加载期完成）
    static uint64_t guard = 0;     // 隐藏守卫：0 = 未初始化

    if (!__guard_ready(guard)) {                 // ① 快路径：一次原子 acquire 读
        if (__cxa_guard_acquire(&guard)) {       // ② 慢路径：CAS/加锁，仅一个线程成功
            try {
                construct(&instance);            // ③ 真正执行构造函数
                __cxa_atexit(dtor, &instance);   // ④ 注册析构（保证析构顺序）
                __cxa_guard_release(&guard);     // ⑤ 置完成标志 + release，唤醒等待线程
            } catch (...) {
                __cxa_guard_abort(&guard);       // ⑥ 构造抛异常 → 重置守卫，下次重试
                throw;
            }
        }
        // ② 返回 false 的线程在此阻塞/自旋，直到 ⑤ 完成
    }
    return instance;
}
```

### 快路径与慢路径

- **快路径（①）**：对象已构造完成时，每次访问只多一次原子的 acquire 读——开销极小；
- **慢路径（②）**：首次访问时，`__cxa_guard_acquire` 内部通过 CAS（或加锁）保证**只有一个线程**能赢得构造权；竞争失败的线程阻塞/自旋等待，直到胜者执行 `__cxa_guard_release`（⑤）唤醒它们。

### 构造失败怎么办

如果构造函数抛出异常，`__cxa_guard_abort`（⑥）会**重置守卫变量**——下次再有线程访问时，重新走一遍完整的初始化流程。也就是说：**构造失败的局部 static 允许重试**，不会永久卡死。

### 析构顺序的保证

步骤④的 `__cxa_atexit` 把析构函数注册进一个栈式队列，程序正常退出时**按构造的逆序**调用。这就是 Meyers 单例"自动销毁"的来源，也解释了版本5中 `static Cleanup cleanup` 为何能在程序退出时自动触发 `Destroy()`。

### 一句话总结

> 所谓"局部 static 线程安全"，本质是编译器免费为每个动态初始化的局部 static 变量生成了一把**守卫锁** + 一个**注册析构的钩子**——正是 DCLP 手写想要达到的效果，标准库早就替你做对了。

---

## 总结对比

| 版本 | 线程安全 | 性能 | 自动回收 | 备注 |
|:---|:---:|:---:|:---:|:---|
| Meyers（局部 static） | ✅ C++11+ | 快路径极佳 | ✅ | 首选，简单场景无敌 |
| 裸指针 | ❌ | — | ❌ | new 三步骤被并发穿插 |
| 全程互斥锁 | ✅ | 每次访问都加锁 | ❌ | 安全但慢 |
| DCLP（裸指针） | ❌ | 快 | ❌ | 指令重排发布半成品 |
| DCLP + 原子变量 | ✅ | 快 | ❌ | acquire/release 配对 |
| 原子 + CRTP + Cleanup | ✅ | 快 | ✅ | 工业级，可控制销毁时机 |

**实践建议：**

- 默认写 Meyers 单例——除非有特殊理由；
- 需要指针语义、显式销毁/重建时，使用"原子 DCLP + RAII 清理器"的最终版本；
- 理解守卫变量机制后你会发现：Meyers 单例就是编译器替你写好的、正确的 DCLP。

---

> 整理者：蕾姆 💙
