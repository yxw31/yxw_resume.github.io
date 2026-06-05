---
title: FOC 矢量控制基础笔记
date: 2026-05-20
updated: 2026-05-30
category: motor-control
tags: [foc, motor, basics, control]
summary: 从 Clarke / Park 变换到电流环 PI，一篇笔记说清 FOC 的核心思路与最常见的工程坑点。
---

## 为什么需要 FOC

对永磁同步电机（PMSM）来说，**直接控制三相电流相位**几乎不可能。三相电流是耦合的、随转子位置而变化的正弦量，转动时电流环带宽根本跟不上。

FOC（Field-Oriented Control）的核心想法是：

> 把三相 abc 坐标系的电流变换到与**转子磁场同向的 dq 坐标系**，让电流变成直流量，电流环就可以用 PI 控制。

## 三步走

```
abc  ─Clarke─►  αβ  ─Park─►  dq   ◄── 控制 (id, iq)
                                  │
abc  ◄Inv.Clarke──  αβ  ◄Inv.Park─┘
```

### 1) Clarke 变换：abc → αβ

$$
\begin{bmatrix} i_\alpha \\ i_\beta \end{bmatrix}
= \frac{2}{3}
\begin{bmatrix} 1 & -1/2 & -1/2 \\ 0 & \sqrt{3}/2 & -\sqrt{3}/2 \end{bmatrix}
\begin{bmatrix} i_a \\ i_b \\ i_c \end{bmatrix}
$$

### 2) Park 变换：αβ → dq

$$
\begin{bmatrix} i_d \\ i_q \end{bmatrix}
= \begin{bmatrix} \cos\theta & \sin\theta \\ -\sin\theta & \cos\theta \end{bmatrix}
\begin{bmatrix} i_\alpha \\ i_\beta \end{bmatrix}
$$

其中 θ 是转子电角度，必须**实时来自编码器或观测器**。

### 3) 电流环 PI

```matlab
% d-axis PI
err_d = id_ref - id;
ud = Kp_d * err_d + Ki_d * integ_d;
integ_d = integ_d + err_d * Ts;

% q-axis PI（带前馈解耦）
err_q = iq_ref - iq;
uq = Kp_q * err_q + Ki_q * integ_q + we * Ld * id;
```

## 五个常见坑

1. **编码器零位没对准** —— Park 变换里的 θ 错了一个常数偏置，整个控制就完全跑偏。**调试前必须找零**。
2. **PWM 死区时间** —— 上下管都关闭的那一小段会让实际电压低于参考值，低速大电流时尤其明显。**用 SVPWM 时记得做死区补偿**。
3. **采样时机不对** —— 三相电流必须在 PWM 中点采样（中心对齐 PWM），不然采到开关纹波。
4. **dq 解耦项忘加** —— `ωₑ·L·i` 这两项不补会导致动态响应慢且耦合。
5. **过调制问题** —— 输出电压超过六边形边界，应做圆形限幅或六边形优先保留 d/q 分量。

## 我用过的工具链

| 阶段 | 工具 |
|---|---|
| 算法建模 | MATLAB / Simulink |
| 代码生成 | Embedded Coder (auto-gen) |
| 硬件平台 | Infineon AURIX TC387 |
| 上位机标定 | 基于 CAN 自研工具 |
| 验证 | dSPACE HiL + 测功机台架 |

## 参考

- TI InstaSPIN 文档（Park / Clarke 实现参考）
- 袁登科《永磁同步电动机变频调速系统》
- 我自己的项目笔记：[LADRC 在 ISG 电机上的调参记录](?id=motor-control%2Fladrc-cheatsheet)
