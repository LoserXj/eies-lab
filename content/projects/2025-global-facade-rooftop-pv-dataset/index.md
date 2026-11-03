---
title: Global facade & rooftop PV potential dataset
authors: [dong-kechuan]
date: 2025-06-01
tag: Dataset
summary: Building-level facade and rooftop PV potential for 120 cities, from 3D footprints and meteorology.
cover: media/members/dong-kechuan-bipv.jpg
tags: [Dataset, Facade PV, Rooftop PV]
sample: true
zh:
  title: 全球建筑立面与屋顶光伏潜力数据集
  tag: 数据集
  summary: 基于三维建筑轮廓与气象数据，给出 120 座城市逐栋建筑的立面与屋顶光伏潜力。
  tags:
    - 数据集
    - 立面光伏
    - 屋顶光伏
  body: |-
    ## 数据内容

    对每座城市的每栋建筑，给出屋顶和各个立面的年度与逐时太阳辐照、扣除窗户和遮挡后的可用面积，以及由此得到的光伏发电潜力。

    ## 构建方法

    - 建筑轮廓与高度来自开放的三维城市模型。
    - 立面元素（窗户、墙面）从街景图像中解析得到。
    - 逐时辐照结合当地气象数据和周边建筑的遮挡计算。

    ## 研究用途

    可用于城市级建筑光伏规划、城市之间的比较，也可作为训练更快的学习模型的数据。
---
## What it contains

For every building in each city, the dataset gives annual and hourly solar irradiation on the roof and on each facade, the usable area after windows and obstructions are removed, and the resulting PV generation potential.

## How it is built

- Building footprints and heights come from open 3D city models.
- Facade elements (windows, walls) are parsed from street-view images.
- Hourly irradiation uses local meteorology and the shading cast by neighbouring buildings.

## Research uses

The dataset supports city-level planning of building-integrated PV, comparisons between cities, and training data for faster learned models.
