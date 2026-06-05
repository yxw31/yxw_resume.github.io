---
title: AURIX TC387 上手避坑
date: 2026-04-15
updated: 2026-05-28
category: domain-control
tags: [aurix, tc387, autosar, mbd, infineon]
summary: 第一次拿到英飞凌 AURIX TC387 板子时遇到的几个典型问题与解决方案：HSM、Lockstep、Multi-Core 启动顺序、DTS 加载。
---

## 这块板子是干嘛的

英飞凌 AURIX TC387 是当下做**车规级动力域控制器 / VCU / BMS** 用得最多的 MCU 之一：

- **4 核 TriCore** (200 MHz)，其中 2 核可配 Lockstep（功能安全）
- **HSM** 硬件安全模块（信息安全）
- **AURIX iLLD** 底层驱动 + AUTOSAR Classic 完整支持
- 丰富的外设：CAN-FD、Ethernet、GTM（电机控制专用定时器）

## 我踩过的坑

### 1) 多核启动顺序

TC387 上电后只有 **CPU0 自动启动**，其他核需要在 CPU0 里手动启：

```c
// 在 CPU0 的初始化中
IfxCpu_startCore(&MODULE_CPU1, (uint32)&_START_C1);
IfxCpu_startCore(&MODULE_CPU2, (uint32)&_START_C2);
IfxCpu_startCore(&MODULE_CPU3, (uint32)&_START_C3);
```

> **坑**：如果忘了，CPU1~3 永远不工作，而且 debug 没明显报错。表现是某个 task 怎么调度都不进。

### 2) Lockstep 核别想自由用

CPU1 默认配置成 CPU0 的 Lockstep 镜像 —— 它**没法独立运行任意代码**。

要把 CPU1 解锁成普通核，需要改 UCB（User Configuration Block）里的 `BMHD` 配置，**这个改动要烧 OTP，慎重**。

我后来直接选了 CPU0、CPU2、CPU3 做三核分工，CPU1 作为安全核保持 Lockstep。

### 3) HSM 默认是 enabled，但无固件

HSM 模块上电默认 enabled，但里面**没固件**。如果你的应用试图调用 HSM 服务（比如 SHE 接口），会卡死。

两条路：
- 用英飞凌的 HSM Firmware（要授权）
- 在 BMHD 里把 HSM 设为 disabled（开发期可以这样）

### 4) GTM 是个独立的微处理器

GTM（Generic Timer Module）是 TC387 上的"二级处理器"，专门做高精度定时与 PWM。

它有自己的指令集（MCS / ATOM / TOM），不能用普通 C 写 —— 要用 ATL 或者通过 iLLD 配置。

```c
// 用 iLLD 配 ATOM 通道生成中心对齐 PWM
IfxGtm_Atom_PwmHl_Config pwmCfg;
IfxGtm_Atom_PwmHl_initConfig(&pwmCfg, &MODULE_GTM);
pwmCfg.base.frequency = 10000;   // 10 kHz
pwmCfg.base.outputMode = IfxPort_OutputMode_pushPull;
// ...
IfxGtm_Atom_PwmHl_init(&pwmHl, &pwmCfg);
```

### 5) Cache 一致性

TC387 是 Harvard 架构，**指令 cache 与数据 cache 是独立的**。多核共享数据时一定要：

- 共享变量放进 `__attribute__((section(".bss.cpu_shared")))`
- 写完后调用 `Ifx_DCacheClean()` 或 `Ifx_DCacheFlush()`
- 关键数据用 mailbox / spin-lock 同步

## 我的推荐工具链

| 用途 | 工具 |
|---|---|
| IDE | AURIX Development Studio（免费）|
| 烧录 | MemTool + miniWiggler |
| 调试 | Lauterbach TRACE32（贵但好用） |
| 总线 | Vector CANoe / CANalyzer |
| MBD | Simulink + Embedded Coder + TC2xx TLC |

## 参考

- AURIX TC3xx User Manual 第 2-4 章（CPU、Boot、Lockstep）
- Infineon AppNote AP32xxx 系列（很多踩坑解决方案就在里面）
- 我的项目记录：[混合动力域控制策略研究](../../../projects/project.html?id=hybrid-domain-control)
