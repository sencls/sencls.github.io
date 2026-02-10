---
title: STL 容器详解
date: 2026-02-10
updated: 2026-02-10
categories: C++
tags:
  - STL
  - 容器
  - 数据结构
---

> 本文件整理了 `STL.cpp` 中的注释内容

## 目录

- [list（双端链表）](#list双端链表)
- [deque（双端队列）](#deque双端队列)
- [map（关联容器）](#map关联容器)
- [unordered_map（无序映射）](#unordered_map无序映射)

---

## list（双端链表）

### 基本操作

```cpp
List<int> l;

// 添加元素
l.push_back(22);         // 尾部添加
l.push_front(11);        // 前向添加
l.insert(--l.end(), 12); // 在迭代器前面添加，返回值是添加元素所在的迭代器

// 删除元素
l.remove(2);             // 遍历全部，删除所有等值元素
l.erase(--l.end());      // 删除迭代器所指位置，并返回删除后迭代器所指
l.pop_back();            // 删除尾部
l.pop_front();           // 删除头部

// 访问元素
int a = l.front();       // 取头部元素
int b = l.back();        // 取尾部元素
```

### 时间复杂度

| 操作 | 时间复杂度 |
|:---|:---|
| 插入/删除（首尾） | O(1) |
| 随机访问 | O(n) |

---

## deque（双端队列）

支持前端后端以 **Θ(1)** 进行插入与删除，访问常数时间，但中间插入是 **Θ(n)**

### 内部原理

由大小固定的数组块组成，这些块通过一个中央映射数组管理。

```
┌─────────────────────────────────────────┐
│           Central Map (map)             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ ptr │ │ ptr │ │ ptr │ │ ptr │ ...  │
│  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘      │
│     │      │      │      │            │
│  ┌──▼──┐ ┌▼───┐ ┌▼───┐ ┌▼───┐        │
│  │chunk│ │chunk│ │chunk│ │chunk│ ...  │
│  └─────┘ └────┘ └────┘ └────┘        │
└─────────────────────────────────────────┘
```

1. **中央映射数组 (map)**：指针数组，指向各数组块，本身也是动态分配，可以在两端添加新的数据块
2. **数据块 (chunk)**：本身是固定大小连续的内存区域，大小通常与平台和编译器有关
3. **起始与结束指针**：维护指向 map 的第一个有效数据块与第一个无效数据块，以此来达到双端的增减

### 基本操作

```cpp
#include <deque>

std::deque<std::string> dq;

// 添加元素
dq.push_back("hello");  // 后插
dq.push_back("back");
dq.push_front("c++");   // 前插
dq.push_front("Java");

// 删除元素
dq.pop_front();         // 前删
dq.pop_back();          // 后删

// 访问元素
std::string a = dq.front();
std::string b = dq.back();
```

---

## map（关联容器）

存储键值对，**键是唯一的**，并按特定顺序（通常是升序）自动排序，常基于**红黑树**实现。

### 特点

| 特点 | 说明 |
|:---|:---|
| **内容有序** | 自动按键排序 |
| **键唯一** | 重复插入不会操作 |
| **高效查询** | 通过键查询 O(log n) |
| **动态操作** | 支持动态插入和删除 |

### 基本操作

```cpp
#include <map>
#include <string>

// 初始化
std::map<int, std::string> mymap = {{1, "www"}, {3, "qqqq"}, {2, "eeee"}};

// 插入元素
mymap.insert(std::pair<int, std::string>(12, "hello"));
mymap.insert(std::make_pair(5, "for"));
mymap.insert({23, "alal"});
mymap.insert({23, "al"});  // 重复插入，不会复写，不会报错，但不操作

// 修改/添加元素
mymap[12] = "aaaa";   // 可以修改已存在的键
mymap[24] = "qwe";    // 没有对应的键就添加

// 访问元素
auto f = mymap[12];   // 不存在的话，会默认生成一个 null 值的键对
// auto r = mymap.at(11);  // 安全访问，没有会抛出异常

// 查找元素
auto t = mymap.find(3);  // 利用键搜索，返回迭代器
if (t != mymap.end())
    std::cout << t->second << std::endl;

// 删除元素
mymap.erase(mymap.begin(), mymap.find(12));  // 可以传迭代器或者键值，两个参数(迭代器)时删除符合参数范围左闭右开区间

// 其他操作
std::cout << mymap.size() << std::endl;
mymap.count(1);                   // 返回当前键值的出现次数；
auto p = mymap.lower_bound(12);   // 返回第一个不小于该键值的迭代器
auto s = mymap.upper_bound(24);   // 返回第一个大于的迭代器
```

### 遍历方式

#### 范围 for 循环

```cpp
for (const auto &t : mymap) {
    std::cout << t.first << ' ' << t.second << std::endl;
}
```

#### 泛型函数（for_each）

```cpp
for_each(p, s, [](auto pair) -> void {
    std::cout << pair.first << " " << pair.second << ' ';
});
```

#### transform

```cpp
std::map<int, std::string> test;
std::transform(p, s, std::inserter(test, test.end()), [](auto &pair) -> auto {
    auto new_p = pair.second;
    std::transform(new_p.begin(), new_p.end(), new_p.begin(), ::toupper);
    return std::make_pair(pair.first, new_p);
});

for (const auto &t : test) {
    std::cout << t.first << ' ' << t.second << std::endl;
}
```

### 自定义键类型

当键是自定义类型时，需要提供比较函数。

#### 方式1：类重载 <

```cpp
class M {
    bool operator<(const M& other) const {
        return this->__ > other.__;
    }
};

std::map<M, std::string> mymap;
```

#### 方式2：提供可调用对象

```cpp
struct comp {
    bool operator()(const type& a, const type& b) const {
        return a.__ > b.__;
    }
};

std::map<type, type, comp> mymap;
```

#### 方式3：使用 function

```cpp
std::function<bool(type a, type b)> comp = [](type a, type b) -> bool {
    return a < b;
};

std::map<type, other_type, std::function<bool(type a, type b)>> a(comp);

// 或使用 decltype
// e.g. std::map<Person, std::string, decltype(comp)> qw(comp);
```

---

## unordered_map（无序映射）

无序列表，**常数时间**的查找、插入、删除，但不保证顺序。

### 基本模板定义

```cpp
#include <unordered_map>

std::unordered_map<
    KeyType,                    // 键类型
    ValueType,                  // 值类型
    Hash = std::hash<KeyType>,  // 哈希函数
    KeyEqual = std::equal_to<KeyType>,  // 键值相等判断
    Allocator = std::allocator<std::pair<const KeyType, ValueType>>  // 内存分配器
>
```

| 参数 | 说明 |
|:---|:---|
| **Hash** | 哈希函数 |
| **KeyEqual** | 键值相等时 |
| **Allocator** | 内存分配器 |

### 基本操作

```cpp
// 通过 [] 访问 map 中，没有的对象自动构建对象，然后给默认值
// insert() 插入函数 insert({}), emplace(key, value)
// erase()，根据参数内容返回对象，迭代器->删除后所指的迭代器，键->值
// bucket_count() 返回桶数量
// rehash() 调整桶数量
```

### 自定义键类型

使用自定义类型作为键时，需要定义：

1. **比较函数**
2. **哈希函数**

---

## 容器对比

| 容器 | 查找 | 插入/删除 | 随机访问 | 是否有序 |
|:---|:---:|:---:|:---:|:---:|
| **list** | O(n) | O(1) 首尾 | O(n) | ❌ |
| **deque** | O(n) | O(1) 首尾 | O(1) | ❌ |
| **map** | O(log n) | O(log n) | O(log n) | ✅ 升序 |
| **unordered_map** | O(1) 平均 | O(1) 平均 | O(1) 平均 | ❌ |
