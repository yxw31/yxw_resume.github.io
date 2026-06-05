---
title: 车载 GPS 欺骗攻击入门
date: 2026-05-10
updated: 2026-05-28
category: automotive-security
tags: [gps, spoofing, hackrf, sdr, security]
summary: 从中汽中心汽车漏洞挖掘比赛的实践出发，简述 GPS 欺骗的原理、所需设备与防御思路。
---

## 写在前面

> ⚠️ 本笔记仅讨论**授权范围内**的安全研究。在不属于自己的设备 / 公共区域发射 GPS 信号属于违法行为。

## GPS 为什么能被欺骗

民用 GPS L1 频段（1575.42 MHz）的信号**完全公开、无加密、功率极弱**（到地面 -130 dBm 以下）。任何能产生这个频段的设备只要功率稍大一点，就能**压过真实卫星信号**，让接收机锁定假信号。

军用 GPS 用了加密码（P(Y) 码），所以不容易欺骗。

## 攻防设备清单

| 设备 | 价位 | 用途 |
|---|---|---|
| **HackRF One** | ~2000￥ | 通用 SDR，1 MHz–6 GHz，半双工 |
| **bladeRF** | ~5000￥ | 性能更好的 SDR，全双工 |
| **USRP B210** | ~10000￥ | 专业级 SDR |
| GPS 信号生成工具 | 免费开源 | `gps-sdr-sim`、`bladeGPS` |
| 一段同轴线 + 天线 | 几十￥ | 测试时**不要**接天线（避免无意发射） |

## gps-sdr-sim 工作流

1. **下载星历**（描述卫星轨道的数据）

   ```bash
   wget ftp://cddis.nasa.gov/gnss/data/daily/2026/brdc/brdc1500.26n.Z
   ```

2. **生成 IQ 信号文件**

   ```bash
   gps-sdr-sim -e brdc1500.26n -l 39.9042,116.4074,30 -s 2600000 -b 8
   # -l 经度,纬度,海拔（这里假装是北京天安门）
   # -s 采样率，-b 量化位数
   ```

3. **用 HackRF 发射**

   ```bash
   hackrf_transfer -t gpssim.bin -f 1575420000 -s 2600000 -x 0
   ```

整个过程不到 10 分钟。在屏蔽房里测试时，目标手机 / 车机的 GPS 会"瞬移"到你指定的坐标。

## 我在实车测试里看到的

中汽中心比赛上对几款主流车型测试：

- 多数车机的导航**完全被欺骗** —— 显示位置漂到目标坐标
- 部分车机有"GPS 信号弱"提示，但仍接受假信号
- 一些 ADAS 功能（高精度地图依赖 GPS）会**触发降级**或失效

## 防御思路

### 1) 多传感器融合

GPS 配合 **IMU + 轮速 + 视觉 / LiDAR 里程计**，做卡尔曼滤波。突变的 GPS 坐标可以被惯导否决。

### 2) 信号特征检测

真实卫星信号 vs 欺骗信号的特征不一样：

- C/N0（载噪比）异常稳定（真实信号会随仰角变化）
- 多颗卫星的 doppler 频率高度相关（spoof 通常每颗都是同一个发射源）
- 接收功率突然增大很多 dB

业界产品（如 u-blox F9）已经在做这种检测。

### 3) 抗欺骗天线

CRPA（Controlled Reception Pattern Antenna）阵列，可以**空间过滤**只接受高仰角信号。贵但是有效。

### 4) GPS + GLONASS + Galileo + BeiDou

四套独立系统同时校验，欺骗一套很容易，欺骗四套难得多。

## 我的项目记录

参考：[汽车漏洞挖掘比赛](../../../projects/project.html?id=gps-spoofing-ctf)

## 参考

- [gps-sdr-sim](https://github.com/osqzss/gps-sdr-sim)
- TextOfCar：UNIT 1 GPS Security
- u-blox AppNote：GNSS spoofing detection
