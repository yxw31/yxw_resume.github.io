---
title: 时序模型对比：Transformer / PatchTST / DLinear / MICN
date: 2026-03-10
updated: 2026-05-28
category: deep-learning
tags: [time-series, transformer, patchtst, dlinear, micn]
summary: 在工业异常检测项目里用过的几种时序模型横向对比 —— 性能、训练成本与可解释性的取舍。
---

## 背景

中车工业研究院实习期间，我做了一个工业设备（轴承、齿轮）的异常检测项目。目标是在**多变量长时间序列**上做异常预测，要求：

- 长上下文（至少 1024 步）
- 训练数据有限（~万级样本）
- 推理速度要够快（边缘设备）

把以下几种模型做了横向对比，下面是结论与体感。

## 模型一览

### 1) Transformer (vanilla)

- **优点**：理论上能建模任意长度依赖
- **缺点**：
  - 自注意力 O(L²) 复杂度，长序列吃显存
  - **过拟合严重**（数据量不够时）
  - 通道独立性差（多变量时会乱学相关性）

### 2) PatchTST [ICLR 2023]

把时序切成 patch（类似 ViT），每个 patch 当 token：

```
[x1, x2, ..., x96]  →  patches of length 16, stride 8
                       → 11 tokens → Transformer Encoder
```

- **优点**：
  - patch 减少 token 数 → 显存友好
  - **通道独立训练**（关键）：每个变量单独跑同一份 Transformer
  - 长序列长预测都好
- **缺点**：
  - 通道独立 = 损失跨变量相关性
  - 仍然是 Transformer，推理慢

### 3) DLinear [AAAI 2023]

最简单的：**一层线性 + 趋势/季节分解**。

```python
# 全部模型代码就这几行
trend = moving_avg(x)
seasonal = x - trend
y_trend = Linear(trend)
y_seasonal = Linear(seasonal)
y = y_trend + y_seasonal
```

- **优点**：
  - **快到离谱**（推理 < 1ms）
  - 极强 baseline，在很多任务超过 Transformer
  - 可解释（线性权重直接可视化）
- **缺点**：
  - 非线性能力差
  - 真正"难"的任务上不去

### 4) MICN [ICLR 2023]

Multi-scale Isometric Convolution Network：用**多尺度因果卷积**抓不同周期。

- **优点**：
  - 局部 / 全局并行，速度比 Transformer 快
  - 多尺度对周期信号友好
- **缺点**：
  - 结构复杂，调参累
  - 长程依赖不如 PatchTST

## 我的横向对比表

在工业设备数据集（专有，1024 步上下文，预测未来 96 步）：

| 模型 | MSE ↓ | MAE ↓ | 训练时间 | 推理 (ms) |
|---|---|---|---|---|
| **Transformer** | 0.412 | 0.467 | 4.2 h | 18 |
| **PatchTST** | **0.318** | **0.394** | 2.8 h | 11 |
| **DLinear** | 0.341 | 0.412 | 0.3 h | **<1** |
| **MICN** | 0.336 | 0.408 | 1.6 h | 6 |

## 取舍心得

如果让我从头再做一遍：

1. **永远先跑 DLinear 当 baseline** —— 5 分钟搞定，省事且强
2. **数据多 + 要 SOTA**：PatchTST
3. **多变量耦合很强**：自己写 channel-mixing 版本的 PatchTST，或试 iTransformer
4. **推理预算极紧**（嵌入式）：DLinear + 调高 LR + 长训练

## 一个反直觉的发现

我把 DLinear 的两个 Linear 改成**两层 + LayerNorm**，反而效果更差。线性的"简单"本身就是优势 —— 它防止了过拟合。

> 这个 lesson 后来在 LADRC 的对比里也复现了：**简单稳定的方法 vs 复杂炫技 —— 在工业数据上多数时候简单赢**。

## 参考

- [PatchTST 原论文](https://arxiv.org/abs/2211.14730)
- [DLinear "Are Transformers Effective for TS?"](https://arxiv.org/abs/2205.13504)
- [MICN 原论文](https://openreview.net/forum?id=zt53IDUR1U)
- 我的项目记录：见首页[中车工业研究院实习经历](../../../#experience)
