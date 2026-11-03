---
title: Shadow-aware rooftop PV model
authors: [dong-kechuan]
date: 2025-09-01
tag: Model
summary: Spatiotemporal deep learning that predicts shading and rooftop PV potential about 158 times faster than simulation.
cover: media/members/dong-kechuan-rooftop.jpg
tags: [Model, Rooftop PV, Deep learning]
sample: true
zh:
  title: 考虑遮挡的屋顶光伏模型
  tag: 模型
  summary: 时空深度学习模型，预测遮挡与屋顶光伏潜力，速度约为模拟方法的 158 倍。
  tags:
    - 模型
    - 屋顶光伏
    - 深度学习
  body: |-
    ## 模型结构

    模型输入周边建筑的高度图和太阳位置，预测一年中每个小时每个屋顶上的遮挡；时间分支再把逐时遮挡和天气转换为光伏出力。

    ## 为什么快

    光线追踪的遮挡计算需要对每个小时、每栋建筑重新计算。学习模型替代了这一步，使城市级计算比模拟快约 158 倍。

    ## 输入与输出

    - **输入：** 建筑高度、屋顶几何、太阳位置、逐时天气。
    - **输出：** 逐时遮挡掩膜和每栋建筑的屋顶光伏潜力。
---
## Model structure

The model takes a height map of the surrounding buildings and the sun position, and predicts the shading on each roof for every hour of the year. A temporal branch then turns hourly shading and weather into PV output.

## Why it is fast

Ray-traced shading has to be recomputed for every hour and every building. The learned model replaces that step, which is what makes city-wide runs about 158 times faster than simulation.

## Inputs and outputs

- **Inputs:** building heights, roof geometry, sun position, hourly weather.
- **Outputs:** hourly shading masks and rooftop PV potential per building.
